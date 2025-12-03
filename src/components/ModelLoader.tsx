"use client";

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Download, Trash2, Box, User } from 'lucide-react';
import { Button } from "@/components/ui/button";

const DB_NAME = 'AIHealthAssets';
const STORE_NAME = 'models';

const MODELS = {
  male: {
    key: 'human_body_male_glb',
    path: 'https://models.zrxarchit.workers.dev/human_body_male.glb'
  },
  female: {
    key: 'human_body_female_glb',
    path: 'https://models.zrxarchit.workers.dev/human_body_female.glb'
  }
};

export type Gender = 'male' | 'female';

export function useModelLoader(gender: Gender = 'male') {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true); 
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
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

  const startDownload = useCallback(async () => {
    setDownloading(true);
    setError(null);
    try {
      const db = await openDB();
      console.log(`Downloading ${gender} model...`);
      const blob = await downloadModelWithProgress(MODELS[gender].path, (p) => setProgress(p));
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

  return { modelUrl, progress, loading, downloading, error, startDownload, deleteModel };
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
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as Blob || null);
    request.onerror = () => reject(request.error);
  });
}

function saveModel(db: IDBDatabase, blob: Blob, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(blob, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function clearModel(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function downloadModelWithProgress(url: string, onProgress: (percent: number) => void): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch model: ${response.statusText}`);

  const contentLength = response.headers.get('content-length');
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
  setGender
}: { 
  onDownload: () => void, 
  onSkip: () => void,
  gender: Gender,
  setGender: (g: Gender) => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Box className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Enhance Your Experience</h2>
          <p className="text-muted-foreground">
            Download the 3D human model (~150MB) for interactive body impact visualization. 
            This is a one-time download.
          </p>
        </div>

        <div className="space-y-3">
          <span className="text-center block text-sm font-medium text-muted-foreground">Select Model Gender</span>
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => setGender('male')}
              className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all
                ${gender === 'male' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
            >
              <User className="w-8 h-8" />
              <span className="font-medium">Male</span>
            </div>
            <div 
              onClick={() => setGender('female')}
              className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all
                ${gender === 'female' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
            >
              <User className="w-8 h-8" />
              <span className="font-medium">Female</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button onClick={onDownload} size="lg" className="w-full gap-2">
            <Download className="w-4 h-4" /> Download {gender === 'male' ? 'Male' : 'Female'} Model
          </Button>
          <Button variant="ghost" onClick={onSkip} className="w-full">
            Continue without 3D
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ModelDownloading({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
          <div 
            className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"
            style={{ animationDuration: '2s' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Download className="w-8 h-8 text-primary animate-bounce" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Downloading Assets</h2>
          <p className="text-muted-foreground">Please wait while we set things up...</p>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{progress}%</p>
        </div>
      </div>
    </div>
  );
}
