"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppLogo } from "@/components/ui/app-logo";

interface InitialLoadingScreenProps {
  message?: string;
  className?: string;
}

export function InitialLoadingScreen({
  message = "INITIALIZING SYSTEM...",
  className,
}: InitialLoadingScreenProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm transition-all duration-500 animate-in fade-in">
      <div className="flex flex-col items-center gap-8 relative z-10 p-8 rounded-3xl bg-card/20 border border-white/5 shadow-2xl">
        <div className="scale-150 mb-4 animate-pulse">
            <AppLogo />
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <p className="text-primary font-mono text-sm tracking-widest font-bold">
              {message}{dots}
            </p>
            <div className="flex gap-1 h-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-primary/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
      </div>
    </div>
  );
}
