"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Box, Utensils, ArrowLeft, RotateCcw } from "lucide-react";
import { useModelLoader, ModelDownloading, ModelDownloadPrompt } from "@/components/ModelLoader";
import { ModeToggle } from "@/components/mode-toggle";
import HumanModel from "@/components/3d/HumanModel";
import { FileUploader } from "@/components/dashboard/FileUploader";
import { AnalysisResult } from "@/components/dashboard/AnalysisResult";
import { ScanHistory } from "@/components/dashboard/ScanHistory";
import { ChatBot } from "@/components/dashboard/ChatBot";

interface Scan {
  id: string;
  foodName: string;
  nutritionJson: string;
  createdAt: string;
  imageUrl?: string | null;
}

export default function Dashboard() {
  const [gender, setGender] = useState<'male' | 'female'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selectedGender') as 'male' | 'female') || 'male';
    }
    return 'male';
  });

  useEffect(() => {
    localStorage.setItem('selectedGender', gender);
  }, [gender]);
  const { modelUrl, progress, loading: modelLoading, downloading, startDownload, deleteModel, serverStatus, checkServerStatus } = useModelLoader(gender);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Failed to fetch user:", err));
  }, []);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Scan[]>([]);
  const [hasSkippedModel, setHasSkippedModel] = useState(false);
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const fetchHistory = async () => {
    try {
      let res = await fetch("/api/history");
      
      if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
           res = await fetch("/api/history");
        } else {
           router.push("/");
           return;
        }
      }

      if (res.ok) {
        const data = await res.json();
        setHistory(data.scans);
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);



  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
      if (!refreshRes.ok) {
        router.push("/");
        return;
      }
      const { token } = await refreshRes.json();

      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("gender", gender);
      formData.append("imageUrl", imageUrl);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(data.error || "Analysis failed");

      setResult(data.nutrition);
      fetchHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    router.push("/");
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (document.querySelector('input[type="file"]')) {
      (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
    }
  };

  if (downloading) {
    return <ModelDownloading progress={progress} />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {!modelUrl && !modelLoading && !hasSkippedModel && (
          <ModelDownloadPrompt 
            onDownload={startDownload} 
            onSkip={() => setHasSkippedModel(true)}
            gender={gender}
            setGender={setGender}
            serverStatus={serverStatus}
            checkServerStatus={checkServerStatus}
          />
        )}

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Utensils className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Health Analysis</h1>
              <p className="text-muted-foreground">Upload food images for instant nutritional breakdown</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </header>

        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <FileUploader 
              onAnalyze={handleAnalyze} 
              loading={loading} 
              modelUrl={modelUrl}
              deleteModel={deleteModel}
              setHasSkippedModel={setHasSkippedModel}
              file={file}
              setFile={setFile}
              preview={preview}
              setPreview={setPreview}
            />

            {(preview || result) && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleClear} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Clear Analysis
                </Button>
              </div>
            )}

            <AnalysisResult result={result} preview={preview} />
          </div>

          <div className="space-y-6">
            {}
            <div 
              onClick={() => router.push("/profile")}
              className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-4">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-full border-2 border-blue-500/50 object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                    {user?.name?.[0] || "U"}
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {user?.name || "Loading..."}
                  </h3>
                  <p className="text-sm text-gray-400">View Profile & Settings</p>
                </div>
                
                <div className="bg-white/10 p-2 rounded-full group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

             <div className="w-full relative group">
               {modelUrl ? (
                 <>
                   <HumanModel affectedOrgans={result?.affected_organs || []} modelUrl={modelUrl} hasAnalyzed={!!result} gender={gender} serverStatus={serverStatus} />
                   <Button 
                     variant="destructive" 
                     size="icon" 
                     className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                     onClick={() => {
                       if (confirm("Delete 3D model from storage? You will need to download it again.")) {
                         deleteModel();
                       }
                     }}
                     title="Delete 3D Model"
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </>
               ) : (
                 <div className="w-full h-[400px] bg-muted/30 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-4">
                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                     <Box className="w-8 h-8 text-muted-foreground" />
                   </div>
                   <div className="space-y-2">
                     <h3 className="font-semibold text-lg">3D Model Not Loaded</h3>
                     <p className="text-sm text-muted-foreground">
                       Download the 3D model to visualize how food affects your body interactively.
                     </p>
                   </div>
                   <Button onClick={() => setHasSkippedModel(false)} className="gap-2">
                     <Download className="w-4 h-4" /> Download Model
                   </Button>
                 </div>
               )}
             </div>
             
             <ScanHistory 
               history={history} 
               onSelectScan={(scan) => {
                 try {
                   const data = JSON.parse(scan.nutritionJson);
                   setResult(data);
                   setFile(null); 
                   setPreview(scan.imageUrl || null);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                 } catch (e) {
                   console.error("Failed to parse history item", e);
                 }
               }}
               onClearHistory={async () => {
                 await fetch("/api/history", { method: "DELETE" });
                 setHistory([]);
               }}
             />

             <ChatBot foodContext={result} />
          </div>
        </main>
      </div>
    </div>
  );
}

function NutritionStat({ label, value, unit, color }: { label: string, value: string | number, unit: string, color: string }) {
  return (
    <div className="bg-muted/30 p-3 rounded-xl text-center border">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value}<span className="text-sm text-muted-foreground font-normal ml-1">{unit}</span>
      </p>
    </div>
  )
}
