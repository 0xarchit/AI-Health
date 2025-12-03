"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, AlertCircle, History, Zap, Image as ImageIcon, Utensils, LogOut, Trash2, Box, Activity, Download } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useModelLoader, ModelDownloading, ModelDownloadPrompt } from "@/components/ModelLoader";
import { ModeToggle } from "@/components/mode-toggle";
import HumanModel from "@/components/3d/HumanModel";

interface Scan {
  id: string;
  foodName: string;
  nutritionJson: string;
  createdAt: string;
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
  const { modelUrl, progress, loading: modelLoading, downloading, startDownload, deleteModel } = useModelLoader(gender);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Scan[]>([]);
  const [hasSkippedModel, setHasSkippedModel] = useState(false);
  const router = useRouter();

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

  const onDrop = (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError("Image is too large. Maximum size is 5MB.");
        setFile(null);
        setPreview(null);
        return;
      }

      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError(null);
      setResult(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".webp"] },
    maxFiles: 1,
  });

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

      const formData = new FormData();
      formData.append("file", file);
      formData.append("gender", gender);

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
          />
        )}

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                {!file ? (
                  <div 
                    {...getRootProps()} 
                    className={`flex flex-col items-center justify-center gap-4 cursor-pointer transition-all
                      ${isDragActive ? "scale-105" : ""}`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      {loading ? (
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      ) : (
                        <Upload className="w-10 h-10 text-primary" />
                      )}
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold">
                        {loading ? "Analyzing Food..." : "Drop your food image here"}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Support for JPG, PNG and WebP. AI will identify ingredients and nutritional value.
                      </p>
                    </div>
                    <Button disabled={loading} variant="secondary" className="mt-4">
                      {loading ? "Processing..." : "Select Image"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={preview!} 
                        alt="Selected food" 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-4 w-full max-w-md">
                      <Button 
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
                        variant="outline" 
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAnalyze} 
                        disabled={loading} 
                        className="flex-1 gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" /> Analyze Food
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card className="overflow-hidden border-primary/20 shadow-lg">
                  <div className="relative h-48 bg-muted">
                    {preview && (
                      <img 
                        src={preview} 
                        alt="Food preview" 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <h2 className="text-3xl font-bold text-foreground">{result.food_name}</h2>
                      <p className="text-muted-foreground">{result.description}</p>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-primary/5 p-4 rounded-xl text-center border border-primary/10">
                        <div className="text-2xl font-bold text-primary">{result.nutrition.calories}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Calories</div>
                      </div>
                      <div className="bg-blue-500/5 p-4 rounded-xl text-center border border-blue-500/10">
                        <div className="text-2xl font-bold text-blue-500">{result.nutrition.protein}g</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Protein</div>
                      </div>
                      <div className="bg-orange-500/5 p-4 rounded-xl text-center border border-orange-500/10">
                        <div className="text-2xl font-bold text-orange-500">{result.nutrition.carbs}g</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Carbs</div>
                      </div>
                      <div className="bg-green-500/5 p-4 rounded-xl text-center border border-green-500/10">
                        <div className="text-2xl font-bold text-green-500">{result.nutrition.fat}g</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Fats</div>
                      </div>
                      {result.nutrition.sugar !== undefined && (
                        <div className="bg-pink-500/5 p-4 rounded-xl text-center border border-pink-500/10">
                          <div className="text-2xl font-bold text-pink-500">{result.nutrition.sugar}g</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Sugar</div>
                        </div>
                      )}
                      {result.nutrition.sodium !== undefined && (
                        <div className="bg-purple-500/5 p-4 rounded-xl text-center border border-purple-500/10">
                          <div className="text-2xl font-bold text-purple-500">{result.nutrition.sodium}mg</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Sodium</div>
                        </div>
                      )}
                      {result.nutrition.fiber !== undefined && (
                        <div className="bg-emerald-500/5 p-4 rounded-xl text-center border border-emerald-500/10">
                          <div className="text-2xl font-bold text-emerald-500">{result.nutrition.fiber}g</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Fiber</div>
                        </div>
                      )}
                    </div>

                    {result.ingredients && result.ingredients.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                          <Utensils className="w-5 h-5 text-primary" /> Ingredients
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.ingredients.map((ing: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium border">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                       <h3 className="font-semibold flex items-center gap-2 text-lg">
                         <Activity className="w-5 h-5 text-primary" /> Health Assessment
                       </h3>
                       <div className="bg-muted/30 p-4 rounded-xl border">
                         <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-primary">Verdict:</span>
                            <span className="font-medium">{result.health_assessment}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary">Confidence:</span>
                            <span className="font-medium">{(result.confidence_score * 100).toFixed(0)}%</span>
                         </div>
                       </div>
                    </div>

                    {result.affected_organs && result.affected_organs.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                          <Activity className="w-5 h-5 text-primary" /> Body Impact
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {result.affected_organs.map((organ: any, i: number) => (
                            <div key={i} className="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold capitalize flex items-center gap-2">
                                  {organ.organ}
                                </span>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                                  organ.risk === 'High' ? 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900' : 
                                  organ.risk === 'Moderate' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900' : 
                                  'bg-green-500/10 text-green-600 border-green-200 dark:border-green-900'
                                }`}>
                                  {organ.risk} Risk
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {organ.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.warnings && result.warnings.length > 0 && (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                        <h4 className="font-semibold text-yellow-600 dark:text-yellow-500 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" /> Warnings
                        </h4>
                        <ul className="space-y-2">
                          {result.warnings.map((warning: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
           <div className="w-full relative group">
             {modelUrl ? (
               <>
                 <HumanModel affectedOrgans={result?.affected_organs || []} modelUrl={modelUrl} hasAnalyzed={!!result} gender={gender} />
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
           <Card>
             <CardHeader className="pb-3 flex flex-row items-center justify-between">
               <CardTitle className="text-lg flex items-center gap-2">
                 <History className="w-5 h-5 text-muted-foreground" />
                 Recent Scans
               </CardTitle>
               {history.length > 0 && (
                 <Button variant="ghost" size="sm" onClick={async () => {
                    if (confirm("Are you sure you want to clear your scan history?")) {
                      await fetch("/api/history", { method: "DELETE" });
                      setHistory([]);
                    }
                 }} className="text-xs text-muted-foreground hover:text-destructive h-8">
                   Clear
                 </Button>
               )}
             </CardHeader>
             <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
               {history.length === 0 ? (
                 <p className="text-sm text-muted-foreground text-center py-8">No scans yet.</p>
               ) : (
                 history.map((scan) => (
                   <div 
                     key={scan.id} 
                     onClick={() => {
                       try {
                         const data = JSON.parse(scan.nutritionJson);
                         setResult(data);
                         setFile(null); 
                         setPreview(null);
                         window.scrollTo({ top: 0, behavior: 'smooth' });
                       } catch (e) {
                         console.error("Failed to parse history item", e);
                       }
                     }}
                     className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer active:scale-[0.98]"
                   >
                     <div className="bg-primary/10 p-2 rounded-md">
                        <ImageIcon className="w-4 h-4 text-primary" />
                     </div>
                     <div>
                       <p className="font-medium text-sm">{scan.foodName}</p>
                       <p className="text-xs text-muted-foreground">{new Date(scan.createdAt).toLocaleDateString()}</p>
                     </div>
                   </div>
                 ))
               )}
             </CardContent>
           </Card>

           {}
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
