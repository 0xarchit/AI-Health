"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Box, Utensils, ArrowLeft, RotateCcw, Activity, Info, LogOut } from "lucide-react";
import { useModelLoader, ModelDownloading, ModelDownloadPrompt } from "@/components/ModelLoader";
import { ModeToggle } from "@/components/mode-toggle";
import { ErrorToast } from "@/components/ui/error-toast";
import HumanModel from "@/components/3d/HumanModel";
import { FileUploader } from "@/components/dashboard/FileUploader";
import { AnalysisResult } from "@/components/dashboard/AnalysisResult";
import { ScanHistory } from "@/components/dashboard/ScanHistory";
import { ChatBot } from "@/components/dashboard/ChatBot";
import { SurfacePanel, GlassPanel, NeonSeparator, GlowingButton } from "@/components/ui/design-system";
import { AtmosphericBackground } from "@/components/ui/atmospheric-background";
import { useCachedFetch, clearApiCache } from "@/hooks/use-fetch-cache";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { fetchWithAuth } from "@/lib/api-client";
import { AppLogo } from "@/components/ui/app-logo";
import Link from "next/link";

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
  
  const { isAuthenticated } = useAuthStatus(true);
  const router = useRouter();

  const { data: userData } = useCachedFetch<{ user: any }>(isAuthenticated ? "/api/user" : "");
  const user = userData?.user;

  const { data: historyData, refresh: refreshHistory } = useCachedFetch<{ scans: Scan[] }>(user ? "/api/history" : "");
  const [history, setHistory] = useState<Scan[]>([]);

  useEffect(() => {
    if (historyData?.scans) {
      setHistory(historyData.scans);
    }
  }, [historyData]);

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSkippedModel, setHasSkippedModel] = useState(false);

  const handleAnalyze = async (uploadedFile: File) => {
    if (!uploadedFile) return;

    setLoading(true);
    setError(null);
    setFile(uploadedFile); 

    try {
      
      const uploadFormData = new FormData();
      uploadFormData.append("image", uploadedFile);

      
      const uploadRes = await fetchWithAuth("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("gender", gender);
      formData.append("imageUrl", imageUrl);

      const analyzeRes = await fetchWithAuth("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(data.error || "Analysis failed");

      setResult(data.nutrition);
      refreshHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const handleLogout = async () => {
    clearApiCache();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (downloading) {
    return <ModelDownloading progress={progress} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 font-sans selection:bg-primary/20 relative overflow-hidden">
      <AtmosphericBackground />
      <div className="max-w-[1600px] mx-auto space-y-6 relative z-10">
        {}
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

        {}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-b border-border/40 pb-6">
          <div className="flex items-center gap-6 w-full md:w-auto">
             <Link href="/">
               <AppLogo />
             </Link>
             <div className="hidden md:block w-px h-8 bg-border/50" />
             <div className="flex items-center gap-4">
                <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                   <span className="font-semibold text-foreground">Command Center</span>
                   <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">System Online</span>
                </nav>
             </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
             <div 
               onClick={() => router.push("/profile")}
               className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/50 border border-white/5 cursor-pointer hover:bg-primary/10 transition-colors group ml-auto"
             >
                {user?.picture ? (
                   <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-primary/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                    {user?.name?.[0] || "U"}
                  </div>
                )}
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold leading-none group-hover:text-primary transition-colors">{user?.name || "User"}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Authenticated</p>
                </div>
             </div>
             <ModeToggle />
             <GlowingButton variant="outline" size="icon" onClick={handleLogout} className="h-10 w-10 border-destructive/30 text-destructive hover:bg-destructive/10">
                <LogOut className="w-5 h-5" />
             </GlowingButton>
          </div>
        </header>

        {}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">
          
          {}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {}
            <SurfacePanel className="p-1 overflow-hidden">
               <div className="bg-background/40 rounded-[22px] p-6 lg:p-8 space-y-6">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-primary tracking-tight">
                      <ScanIcon className="w-5 h-5" /> Input Source
                    </h2>
                    {(preview || result) && (
                      <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs h-8 gap-2 text-muted-foreground hover:text-foreground">
                        <RotateCcw className="w-3.5 h-3.5" /> Reset System
                      </Button>
                    )}
                 </div>
                 
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
                    onReset={handleClear}
                 />
               </div>
            </SurfacePanel>

            {}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <AnalysisResult result={result} preview={preview} />
            </div>

            {}
            <div className="pt-4">
              <NeonSeparator className="opacity-30 mb-8" />
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
                   refreshHistory();
                 }}
                 onRefresh={refreshHistory}
              />
            </div>
          </div>

          {}
          <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6 h-fit">
             <GlassPanel className="min-h-[600px] flex flex-col relative overflow-visible border-primary/10 bg-gradient-to-b from-background/50 to-transparent">
               
               <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
               <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-30" />

               <div className="p-4 flex items-center justify-between border-b border-white/5">
                 <div className="flex items-center gap-2">
                   <Activity className="w-4 h-4 text-primary animate-pulse" />
                   <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Biometric Projection</span>
                 </div>
                 {modelUrl && (
                   <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors hidden lg:flex"
                      onClick={() => {
                        if (confirm("Purge 3D model data?")) deleteModel();
                      }}
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </Button>
                 )}
               </div>

               <div className="flex-1 relative min-h-[500px] flex items-center justify-center">
                 {modelUrl ? (
                   <>
                     {}
                     <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                     <HumanModel 
                        affectedOrgans={result?.affected_organs || []} 
                        modelUrl={modelUrl} 
                        hasAnalyzed={!!result} 
                        gender={gender} 
                        serverStatus={serverStatus} 
                     />
                   </>
                 ) : (
                   <div className="text-center p-8 space-y-4 max-w-[280px]">
                     <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto border border-white/5">
                        <Box className="w-8 h-8 text-muted-foreground opacity-50" />
                     </div>
                     <p className="text-sm text-muted-foreground">
                        Biometric model offline.<br/>Please download to visualize organic impact.
                     </p>
                     <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setHasSkippedModel(false)}
                        className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                     >
                       <Download className="w-3.5 h-3.5 mr-2" />
                       Initialize Download
                     </Button>
                   </div>
                 )}
               </div>
               
               {}
               {result && (
                 <div className="p-4 border-t border-white/5 bg-background/40 backdrop-blur-md">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-muted-foreground">Analysis Confidence</span>
                       <span className="text-primary font-mono">{(result.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1 w-full bg-secondary mt-2 rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${(result.confidence_score * 100)}%` }} />
                    </div>
                 </div>
               )}
             </GlassPanel>

             {}
             <div className="hidden lg:block">
                {}
                {}
             </div>
          </div>

        </main>
        
        {}
        <ChatBot foodContext={result} />
        <ErrorToast message={error} onClose={() => setError(null)} />
      </div>
    </div>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    </svg>
  )
}

