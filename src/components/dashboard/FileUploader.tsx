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
  setPreview
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
    setFile(null);
    setPreview(null);
    setError(null);
  };

  return (
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
            {error && <p className="text-sm text-destructive">{error}</p>}
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
                onClick={handleClear}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 w-full max-w-md">
              <Button 
                onClick={handleClear}
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAnalyzeClick} 
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
  );
}
