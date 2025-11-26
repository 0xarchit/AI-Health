"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, AlertCircle, History, Zap, Image as ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";

interface Scan {
  id: string;
  foodName: string;
  nutritionJson: string;
  createdAt: string;
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Scan[]>([]);
  const router = useRouter();

  
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      let res = await fetch("/api/history");
      
      // If unauthorized (401), try to refresh session
      if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
           // Retry history fetch
           res = await fetch("/api/history");
        } else {
           // Refresh failed, redirect to login
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

  const onDrop = (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
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

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { fileId } = await uploadRes.json();

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileId }),
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

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <header className="flex justify-between items-center max-w-6xl mx-auto bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl">
           <div className="bg-primary/10 p-2 rounded-lg">
             <Zap className="w-5 h-5 text-primary" />
           </div>
           <span>Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="ghost" onClick={handleLogout}>Sign Out</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-dashed border-2 shadow-none hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center h-64 rounded-xl cursor-pointer transition-all
                  ${isDragActive ? "bg-primary/5 scale-[0.99]" : "bg-muted/30 hover:bg-muted/50"}
                  ${preview ? "p-4" : "p-10"}
                `}
              >
                <input {...getInputProps()} />
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full object-contain rounded-lg shadow-md" />
                ) : (
                  <div className="text-center space-y-4">
                    <div className="bg-background p-4 rounded-full shadow-sm inline-block">
                       <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Drag & drop food image</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t bg-muted/10 p-4">
               <p className="text-xs text-muted-foreground">Supports JPEG, PNG, WEBP up to 5MB</p>
               <Button onClick={handleAnalyze} disabled={!file || loading} size="lg" className="rounded-full px-8">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  "Analyze Nutrition"
                )}
              </Button>
            </CardFooter>
          </Card>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <Card className="overflow-hidden border-primary/20 shadow-lg">
                  <div className="h-2 bg-gradient-to-r from-green-400 to-blue-500" />
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                       {result.food_name || "Food Item"}
                    </CardTitle>
                    <CardDescription>
                      {result.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <NutritionStat label="Calories" value={result.nutrition.calories} unit="kcal" color="text-orange-500" />
                      <NutritionStat label="Protein" value={result.nutrition.protein} unit="g" color="text-blue-500" />
                      <NutritionStat label="Carbs" value={result.nutrition.carbs} unit="g" color="text-yellow-500" />
                      <NutritionStat label="Fat" value={result.nutrition.fat} unit="g" color="text-red-500" />
                      <NutritionStat label="Fiber" value={result.nutrition.fiber} unit="g" color="text-green-600" />
                      <NutritionStat label="Sugar" value={result.nutrition.sugar} unit="g" color="text-pink-500" />
                      <NutritionStat label="Sodium" value={result.nutrition.sodium} unit="mg" color="text-gray-500" />
                      <div className="bg-muted/30 p-3 rounded-xl text-center border flex flex-col justify-center items-center">
                         <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Confidence</p>
                         <div className="flex items-center gap-1">
                           <span className="text-xl font-bold">{(result.confidence_score * 100).toFixed(0)}%</span>
                         </div>
                      </div>
                    </div>

                    {}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Ingredients</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.ingredients.map((ing: string, i: number) => (
                          <span key={i} className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-sm">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    {}
                    <div>
                       <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Health Assessment</h4>
                       <p className="text-muted-foreground text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                         {result.health_assessment}
                       </p>
                    </div>

                    {}
                    {result.warnings && result.warnings.length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-600 dark:text-yellow-500 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Warnings
                        </h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {result.warnings.map((warning: string, i: number) => (
                            <li key={i}>{warning}</li>
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

        {}
        <div className="space-y-6">
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
