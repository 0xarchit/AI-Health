"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  variant?: "destructive" | "default";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant = "destructive"
}: ConfirmDialogProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl z-10 p-6"
          >
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                     <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                   <Button variant="outline" onClick={onClose}>
                     Cancel
                   </Button>
                   <Button 
                      variant={variant} 
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                   >
                     Confirm Action
                   </Button>
                </div>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
