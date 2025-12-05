"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Shield, Activity, ArrowRight, Dna, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GlowingButton, NeonSeparator } from "@/components/ui/design-system";
import { AtmosphericBackground } from "@/components/ui/atmospheric-background";

interface LandingPageProps {
  isLoggedIn: boolean;
}

export default function LandingPage({ isLoggedIn }: LandingPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      const hasAuthStatus = document.cookie.includes("auth_status=true");
      if (hasAuthStatus) {
        router.refresh();
      }
    }
  }, [isLoggedIn, router]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-emerald-500/30 relative">
      <AtmosphericBackground />

      <nav className="relative z-50 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tighter cursor-default group">
          <div className="relative transition-transform duration-500 group-hover:rotate-[360deg]">
            <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full" />
            <img src="/logo.png" alt="AI Health Logo" className="relative w-9 h-9 drop-shadow-2xl" />
          </div>
          <span className="text-foreground/90 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300">
            AI Health
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {isLoggedIn ? (
            <Button asChild variant="outline" className="h-10 text-sm rounded-full border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">
              <Link href="/dashboard">Enter Dashboard</Link>
            </Button>
          ) : (
            <form action="/api/auth/login" method="POST">
              <Button type="submit" variant="default" className="h-10 text-sm rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all">
                Sign In
              </Button>
            </form>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        
        {}
        <div className="absolute top-40 left-10 hidden lg:block opacity-10">
          <ScanLine className="w-24 h-24 text-emerald-600 dark:text-emerald-400 animate-pulse-slow" />
        </div>
        <div className="absolute bottom-40 right-10 hidden lg:block opacity-10">
          <Dna className="w-32 h-32 text-teal-600 dark:text-teal-400 animate-float" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative mb-10"
        >
          <span className="relative px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-widest uppercase shadow-sm backdrop-blur-md">
            AI-Powered Nutrition
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-bold tracking-tight text-foreground mb-8 leading-[1.1] md:leading-[1]"
        >
          Analyze Food. <br />
          <span className="transparent-text bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-200 dark:to-emerald-400 animate-gradient pb-2 bg-[length:200%_auto] text-transparent">
            Quantify Health.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed font-light"
        >
          Medical-grade nutrition analysis powered by your own AI.
          <br className="hidden md:block" />
          Secure. Private. Instant.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto"
        >
          {isLoggedIn ? (
             <Button size="lg" className="w-full text-lg h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all group duration-300" asChild>
               <Link href="/dashboard">
                 Initialize Scan 
                 <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
               </Link>
             </Button>
          ) : (
            <form action="/api/auth/login" method="POST" className="w-full">
              <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all group duration-300">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          )}
        </motion.div>

        <NeonSeparator className="max-w-4xl mx-auto my-32 opacity-10" />

        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          <FeatureBlock 
            icon={<Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            title="Instant Analysis"
            description="Zero-latency connection to best-in-class AI models for real-time results."
            delay={0.8}
          />
          <FeatureBlock 
            icon={<Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
            title="Private & Secure"
            description="Your biometric data is processed locally and never stored without consent."
            delay={0.9}
          />
          <FeatureBlock 
            icon={<Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            title="Clinical Accuracy"
            description="99% precision in macro calculation and ingredient verification."
            delay={1.0}
          />
        </div>
      </main>
    </div>
  );
}

function FeatureBlock({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl bg-card/40 border border-border/50 backdrop-blur-md hover:bg-card/60 hover:border-emerald-500/20 transition-all group shadow-sm hover:shadow-md"
    >
      <div className="bg-background/80 p-4 w-fit rounded-2xl border border-border/10 mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 tracking-tight text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  )
}

