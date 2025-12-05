"use client";

import { cn } from "@/lib/utils";

interface AtmosphericBackgroundProps {
  className?: string; 
  variant?: "default" | "intense" | "subtle";
}

export function AtmosphericBackground({ className, variant = "default" }: AtmosphericBackgroundProps) {
  return (
    <div className={cn("fixed inset-0 pointer-events-none z-0 overflow-hidden", className)}>
      {}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[100px] animate-pulse-slow delay-1000" />
      
      {}
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[50%] rounded-full bg-slate-200/40 dark:bg-slate-800/20 blur-[80px] animate-float" />
      
      {}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    </div>
  );
}
