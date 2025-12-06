"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2, Trash2, Zap, Download, Box } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
  onAnalyze: (file: File) => Promise<void>;
  loading: boolean;
  modelUrl: string | null;
  deleteModel: () => void;
  setHasSkippedModel: (skipped: boolean) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  preview: string | null;
  setPreview: (preview: string | null) => void;
  onReset: () => void;
}

export function FileUploader({ 
  onAnalyze, 
  loading, 
  modelUrl, 
  deleteModel, 
  setHasSkippedModel,
  file,
  setFile,
  preview,
  setPreview,
  onReset
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

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
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".webp"] },
    maxFiles: 1,
  });

  const handleAnalyzeClick = async () => {
    if (file) {
      await onAnalyze(file);
    }
  };

  const handleClear = () => {
    onReset();
    setError(null);
  };

  return (
    <div className="w-full relative group">
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary/50 group-hover:border-primary transition-colors" />
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary/50 group-hover:border-primary transition-colors" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary/50 group-hover:border-primary transition-colors" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary/50 group-hover:border-primary transition-colors" />

      <div className="overflow-hidden rounded-xl bg-black/20 border border-primary/20 hover:border-primary/40 transition-all duration-500 relative">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(var(--primary),0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite] pointer-events-none" />
        
        {!file ? (
          <div 
            {...getRootProps()} 
            className={`flex flex-col items-center justify-center gap-6 p-12 cursor-pointer transition-all duration-300 min-h-[300px]
              ${isDragActive ? "bg-primary/10 scale-[0.99]" : "hover:bg-primary/5"}`}
          >
            <input {...getInputProps()} />
            
            <div className={`
               w-24 h-24 rounded-full flex items-center justify-center mb-2 relative transition-transform duration-500
               ${isDragActive ? "scale-110" : "group-hover:scale-105"}
            `}>
               <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
               <div className="relative w-full h-full bg-background rounded-full border border-primary/30 flex items-center justify-center z-10">
                  {loading ? (
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  ) : (
                    <Upload className="w-10 h-10 text-primary" />
                  )}
               </div>
               
               <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_4s_linear_infinite]" />
               <div className="absolute -inset-2 border border-dashed border-primary/10 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
            </div>

            <div className="text-center space-y-2 relative z-10">
              <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {loading ? "Analyzing Specimen..." : "Initiate Scan"}
              </h3>
              <p className="text-sm text-muted-foreground/80 max-w-xs mx-auto font-mono">
                {isDragActive ? ">> RELEASE TO UPLOAD <<" : "Drag & Drop specimen or Click to Browse"}
              </p>
            </div>

            {error && (
               <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-full border border-destructive/20 animate-in fade-in slide-in-from-bottom-2">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  {error}
               </div>
            )}
            
            <Button disabled={loading} variant="outline" className="mt-4 border-primary/30 hover:bg-primary/20 text-primary hover:text-primary">
              {loading ? "Processing Data..." : "Select File Manually"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 p-8">
            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden shadow-2xl border border-white/10 group/preview">
              <img 
                src={preview!} 
                alt="Selected food" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-4">
                 <Button onClick={handleClear} variant="destructive" size="icon" className="rounded-full">
                    <Trash2 className="w-5 h-5" />
                 </Button>
              </div>
              
              {loading && (
                 <div className="absolute inset-0 bg-primary/10 border-t-2 border-primary animate-[scan_2s_linear_infinite]" />
              )}
            </div>
            
            <div className="flex gap-4 w-full max-w-md relative z-10">
              <Button 
                onClick={handleClear}
                variant="outline" 
                className="flex-1 border-white/10 hover:bg-white/5 hover:text-white"
              >
                Abort
              </Button>
              <Button 
                onClick={handleAnalyzeClick} 
                disabled={loading} 
                className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Run Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
