"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Download, Trash2, Box, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const DB_NAME = "AIHealthAssets";
const STORE_NAME = "models";

const MODELS = {
  male: {
    key: "human_body_male_glb",
    path: `${process.env.NEXT_PUBLIC_MODEL_URL}/human_body_male.glb`,
  },
  female: {
    key: "human_body_female_glb",
    path: `${process.env.NEXT_PUBLIC_MODEL_URL}/human_body_female.glb`,
  },
};

export type Gender = "male" | "female";

export function useModelLoader(gender: Gender = "male") {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "available" | "unavailable"
  >("checking");

  useEffect(() => {
    const checkCache = async () => {
      setLoading(true);
      try {
        const db = await openDB();
        const cachedBlob = await getModel(db, MODELS[gender].key);
        if (cachedBlob) {
          console.log(`Model (${gender}) found in cache.`);
          setModelUrl(URL.createObjectURL(cachedBlob));
        } else {
          setModelUrl(null);
        }
      } catch (err) {
        console.error("Cache check failed", err);
      } finally {
        setLoading(false);
      }
    };

    checkCache();
  }, [gender]);

  const checkServerStatus = useCallback(async () => {
    setServerStatus("checking");
    try {
      const response = await fetch(MODELS[gender].path, { method: "HEAD" });
      if (response.ok) {
        setServerStatus("available");
      } else {
        console.warn("Model file not found:", response.status);
        setServerStatus("unavailable");
      }
    } catch (err) {
      console.error("Server health check failed", err);
      setServerStatus("unavailable");
    }
  }, [gender]);

  const startDownload = useCallback(async () => {
    setDownloading(true);
    setError(null);
    try {
      const db = await openDB();
      console.log(`Downloading ${gender} model...`);
      const blob = await downloadModelWithProgress(MODELS[gender].path, (p) =>
        setProgress(p)
      );
      await saveModel(db, blob, MODELS[gender].key);
      console.log(`Model (${gender}) saved to cache.`);
      setModelUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error("Download failed:", err);
      setError(err.message || "Failed to download model.");
    } finally {
      setDownloading(false);
    }
  }, [gender]);

  const deleteModel = useCallback(async () => {
    try {
      const db = await openDB();
      await clearModel(db, MODELS[gender].key);
      setModelUrl(null);
      console.log(`Model (${gender}) deleted from cache.`);
    } catch (err) {
      console.error("Failed to delete model", err);
    }
  }, [gender]);

  return {
    modelUrl,
    progress,
    loading,
    downloading,
    error,
    startDownload,
    deleteModel,
    serverStatus,
    checkServerStatus,
  };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getModel(db: IDBDatabase, key: string): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve((request.result as Blob) || null);
    request.onerror = () => reject(request.error);
  });
}

function saveModel(db: IDBDatabase, blob: Blob, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(blob, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function clearModel(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function downloadModelWithProgress(
  url: string,
  onProgress: (percent: number) => void
): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch model: ${response.statusText}`);

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let loaded = 0;

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Browser does not support stream reading");

  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loaded += value.length;

    if (total) {
      onProgress(Math.round((loaded / total) * 100));
    }
  }

  return new Blob(chunks as unknown as BlobPart[]);
}

export function ModelDownloadPrompt({
  onDownload,
  onSkip,
  gender,
  setGender,
  serverStatus,
  checkServerStatus,
}: {
  onDownload: () => void;
  onSkip: () => void;
  gender: Gender;
  setGender: (g: Gender) => void;
  serverStatus: "checking" | "available" | "unavailable";
  checkServerStatus: () => void;
}) {
  useEffect(() => {
    checkServerStatus();
  }, [checkServerStatus]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center space-y-4 relative z-10">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
            <Box className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-wb from-foreground to-foreground/70">
              Initialize Biometrics
            </h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Download the 3D anatomical model (~150MB) for real-time impact
              visualization.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs font-mono py-2 bg-secondary/30 rounded-lg border border-white/5">
            <span className="text-muted-foreground uppercase tracking-widest">
              Server Grid:
            </span>
            {serverStatus === "checking" && (
              <span className="flex items-center gap-1 text-yellow-500 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> PINGING...
              </span>
            )}
            {serverStatus === "available" && (
              <span className="text-primary font-bold flex items-center gap-1">
                ● ONLINE
              </span>
            )}
            {serverStatus === "unavailable" && (
              <span className="text-destructive font-bold flex items-center gap-1">
                ● OFFLINE
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-center block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Select Physiology
          </span>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setGender("male")}
              className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-3 transition-all duration-300 relative overflow-hidden group
                ${
                  gender === "male"
                    ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]"
                    : "border-border bg-card hover:border-emerald-500/50 hover:bg-muted/50"
                }`}
            >
              <User
                className={`w-8 h-8 ${
                  gender === "male"
                    ? "text-emerald-500"
                    : "text-muted-foreground group-hover:text-emerald-500"
                } transition-colors`}
              />
              <span
                className={`font-medium ${
                  gender === "male"
                    ? "text-emerald-500 font-bold"
                    : "text-muted-foreground"
                }`}
              >
                Male
              </span>
              {gender === "male" && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
              )}
            </div>
            <div
              onClick={() => setGender("female")}
              className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-3 transition-all duration-300 relative overflow-hidden group
                ${
                  gender === "female"
                    ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]"
                    : "border-border bg-card hover:border-emerald-500/50 hover:bg-muted/50"
                }`}
            >
              <User
                className={`w-8 h-8 ${
                  gender === "female"
                    ? "text-emerald-500"
                    : "text-muted-foreground group-hover:text-emerald-500"
                } transition-colors`}
              />
              <span
                className={`font-medium ${
                  gender === "female"
                    ? "text-emerald-500 font-bold"
                    : "text-muted-foreground"
                }`}
              >
                Female
              </span>
              {gender === "female" && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={onDownload}
            size="lg"
            className="w-full gap-2 h-12 text-base shadow-lg shadow-primary/20"
            disabled={serverStatus !== "available"}
          >
            <Download className="w-5 h-5" />
            {serverStatus === "unavailable"
              ? "Server Disconnected"
              : `Initiate Download`}
          </Button>
          <Button
            variant="ghost"
            onClick={onSkip}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            Skip Visualization Setup
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ModelDownloading({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center bg-card p-8 rounded-3xl border border-border shadow-2xl">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
          <div
            className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"
            style={{ animationDuration: "2s" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Download className="w-8 h-8 text-primary animate-bounce" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Downloading Assets
          </h2>
          <p className="text-muted-foreground">
            Please wait while we set things up...
          </p>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
}
