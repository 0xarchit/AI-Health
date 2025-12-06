"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ErrorToastProps {
  message: string | null;
  onClose: () => void;
}

export function ErrorToast({ message, onClose }: ErrorToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 8000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-4 p-4 pr-12 rounded-lg bg-destructive text-destructive-foreground shadow-lg border border-destructive/50 max-w-md backdrop-blur-md"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex flex-col gap-1">
             <span className="font-semibold text-sm">Action Failed</span>
             <p className="text-xs opacity-90 leading-relaxed font-mono">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 p-1 hover:bg-black/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
