"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Shield, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

interface LandingPageProps {
  isLoggedIn: boolean;
}

export default function LandingPage({ isLoggedIn }: LandingPageProps) {
  const router = useRouter();


  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="bg-primary/20 p-2 rounded-lg">
          <img src="/logo.png" alt="AI Health Logo" className="w-8 h-8" />
          </div>
          <span>AI Health</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
          <ModeToggle />
          {isLoggedIn ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <form action="/api/auth/login" method="POST">
               <Button type="submit">Sign In</Button>
            </form>
          )}
        </div>
      </nav>

      {}
      <main className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center relative">
        {}
        {}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            Analyze Food with <br />
            <span className="text-primary">
              Your Own AI Power
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Secure, private nutrition analysis using your personal Google Gemini quota.
            No developer keys, no hidden costs.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            {isLoggedIn ? (
               <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" asChild>
                 <Link href="/dashboard">Go to Dashboard</Link>
               </Button>
            ) : (
              <form action="/api/auth/login" method="POST">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                  Get Started Free
                </Button>
              </form>
            )}
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full" asChild>
                <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </motion.div>

        {}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full">
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-foreground" />}
            title="User-Owned AI"
            description="Connect your Google account to use your own free Gemini quota. We don't resell API access."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-foreground" />}
            title="Private & Secure"
            description="Your data is yours. Images are processed securely and never trained on without consent."
          />
          <FeatureCard 
            icon={<Activity className="w-8 h-8 text-foreground" />}
            title="Instant Analysis"
            description="Get detailed macros, ingredients, and health scores in seconds using Gemini Vision."
          />
        </div>
      </main>

      {}
      <footer className="border-t py-12 mt-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            © 2025 AI Health. Built by 0xArchit
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all text-left space-y-4"
    >
      <div className="bg-background p-3 w-fit rounded-xl border shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}
