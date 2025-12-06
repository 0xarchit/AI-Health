"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Aurora from "@/components/Aurora";

export function AppBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || theme === "dark";

  return (
    <>
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={
            isDark
              ? ["#020617", "#10b981", "#3b82f6"]
              : ["#34d399", "#06b6d4", "#3b82f6"]
          }
          speed={0.5}
          amplitude={1.0}
          blend={0.5}
        />
      </div>
      <div
        className={`fixed inset-0 z-0 pointer-events-none ${
          isDark
            ? "bg-gradient-to-b from-black/80 via-black/20 to-black/80"
            : "bg-gradient-to-b from-white/90 via-white/50 to-white/90"
        }`}
      />
    </>
  );
}
