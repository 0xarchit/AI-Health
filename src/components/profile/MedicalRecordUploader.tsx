"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, FileText, AlertCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { fetchWithAuth } from "@/lib/api-client";

export function MedicalRecordUploader({
  onUploadSuccess,
}: {
  onUploadSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError("File is too large. Maximum size is 5MB.");
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".webp"] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetchWithAuth("/api/medical-records/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      setFile(null);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Upload Medical Record
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {file
                ? file.name
                : "Drop medical record image here, or click to select"}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
            </>
          ) : (
            "Upload & Analyze"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
