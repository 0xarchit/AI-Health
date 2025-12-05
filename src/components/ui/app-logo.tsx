"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface AppLogoProps {
  className?: string;
  showText?: boolean;
}

export function AppLogo({ className, showText = true }: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-3 font-bold text-xl tracking-tighter cursor-pointer group", className)}>
      <div className="relative transition-transform duration-500 group-hover:rotate-[360deg]">
        <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full" />
        <img src="/logo.png" alt="AI Health Logo" className="relative w-9 h-9 drop-shadow-2xl" />
      </div>
      {showText && (
        <span className="text-foreground/90 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300">
          AI Health
        </span>
      )}
    </div>
  );
}
