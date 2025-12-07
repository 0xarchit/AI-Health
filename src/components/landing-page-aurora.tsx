"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import {
  Zap,
  Shield,
  Activity,
  ArrowRight,
  Dna,
  ScanLine,
  Brain,
  Lock,
  Database,
  Smartphone,
  FileText,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

import Aurora from "@/components/Aurora";
import BlurText from "@/components/BlurText";
import LogoLoop from "@/components/LogoLoop";

export default function LandingPageAurora() {
  const { isAuthenticated } = useAuthStatus(false);
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || theme === "dark";

  const techStackLogos = [
    {
      node: (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
          alt="React"
          className="h-10 w-auto"
        />
      ),
      title: "React 19",
    },
    {
      node: (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg"
          alt="Next.js"
          className="h-10 w-auto dark:invert"
        />
      ),
      title: "Next.js 16",
    },
    {
      node: (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"
          alt="Postgres"
          className="h-10 w-auto"
        />
      ),
      title: "Postgres",
    },
    {
      node: (
        <img
          src="https://orm.drizzle.team/svg/drizzle.svg"
          alt="Drizzle"
          className="h-10 w-auto drop-shadow-[0_0_10px_rgba(192,255,0,0.6)]"
        />
      ),
      title: "Drizzle",
    },
    {
      node: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Google_Favicon_2025.svg"
          alt="Google"
          className="h-10 w-auto"
        />
      ),
      title: "Google OAuth2",
    },
    {
      node: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg"
          alt="Gemini"
          className="h-10 w-auto"
        />
      ),
      title: "Gemini 2.0",
    },
    {
      node: (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg"
          alt="Tailwind"
          className="h-10 w-auto"
        />
      ),
      title: "Tailwind CSS",
    },
    {
      node: (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
          alt="TypeScript"
          className="h-10 w-auto"
        />
      ),
      title: "TypeScript",
    },
    {
      node: (
        <img
          src="https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png"
          alt="Vercel"
          className="h-10 w-auto dark:invert"
        />
      ),
      title: "Vercel",
    },
    {
      node: (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg"
          alt="Three.js"
          className="h-10 w-auto dark:invert"
        />
      ),
      title: "Three.js",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-foreground overflow-hidden relative selection:bg-emerald-500/30">
      <nav className="relative z-50 flex items-center justify-between p-6 max-w-7xl mx-auto border-b border-border/10 backdrop-blur-sm">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tighter cursor-default group">
          <div className="relative transition-transform duration-500 group-hover:rotate-360">
            <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full" />
            <img
              src="/logo.png"
              alt="AI Health Logo"
              className="relative w-9 h-9 drop-shadow-2xl"
            />
          </div>
          <span className="text-foreground/90 group-hover:text-emerald-400 transition-colors duration-300">
            AI Health
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {isAuthenticated ? (
            <Button
              asChild
              variant="outline"
              className="h-10 text-sm rounded-full border-emerald-500/20 bg-background/20 backdrop-blur-md hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-foreground"
            >
              <Link href="/dashboard">Enter Dashboard</Link>
            </Button>
          ) : (
            <form action="/api/auth/login" method="POST">
              <Button
                type="submit"
                variant="default"
                className="h-10 text-sm rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all"
              >
                Sign In
              </Button>
            </form>
          )}
        </div>
      </nav>
      <main className="relative z-10 flex flex-col items-center">
        <div className="max-w-5xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
          <div className="mb-8">
            <span className="relative px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-widest uppercase shadow-sm backdrop-blur-md">
              Open Source AI Nutrition WebApp
            </span>
          </div>

          <div className="mb-6">
            <BlurText
              text="Smart Nutrition Analysis"
              className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-2"
              delay={100}
              animateBy="words"
              direction="top"
            />
            <BlurText
              text="Powered by Your AI Quota"
              className="text-5xl md:text-7xl font-bold tracking-tight text-emerald-500 dark:text-emerald-400"
              delay={300}
              animateBy="words"
              direction="bottom"
            />
          </div>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Secure, private, and free. Bring your own Google Gemini API key via
            OAuth and get medical-grade nutrition insights instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto">
            {isAuthenticated ? (
              <Button
                size="lg"
                className="w-full text-lg h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all group duration-300"
                asChild
              >
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <form action="/api/auth/login" method="POST" className="w-full">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all group duration-300"
                >
                  Get Started with Google
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="w-full py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-foreground mb-16 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <StepCard
                number="01"
                title="Secure Login"
                description="Sign in with your Google Account. We only request necessary scopes."
                icon={<User className="w-6 h-6 text-emerald-400" />}
              />
              <StepCard
                number="02"
                title="Grant Access"
                description="Authorize the app to use your free Gemini API quota for analysis."
                icon={<Lock className="w-6 h-6 text-emerald-400" />}
              />
              <StepCard
                number="03"
                title="Encrypted Storage"
                description="Your session tokens are AES-256-GCM encrypted and stored securely."
                icon={<Database className="w-6 h-6 text-emerald-400" />}
              />
              <StepCard
                number="04"
                title="Instant Analysis"
                description="Upload food images and get detailed nutrition breakdowns instantly."
                icon={<Brain className="w-6 h-6 text-emerald-400" />}
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-32">
          <h2 className="text-3xl font-bold text-foreground mb-16 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-emerald-400" />}
              title="Smart Nutrition Analysis"
              description="Get calories, macros, and micros via intuitive gauges. Identifies ingredients and assesses healthiness."
            />
            <FeatureCard
              icon={<Activity className="w-8 h-8 text-emerald-400" />}
              title="Interactive 3D Analysis"
              description="Visualize the impact of food on your body with a high-fidelity 3D human model and organ risk mapping."
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-emerald-400" />}
              title="AI Health Assistant"
              description="Context-aware chatbot that knows your recent scans and answers your nutrition queries."
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8 text-emerald-400" />}
              title="Comprehensive Dashboard"
              description="Track scan history, medications, and generate insights based on your eating habits."
            />
            <FeatureCard
              icon={<User className="w-8 h-8 text-emerald-400" />}
              title="User Profile Context"
              description="Define allergies and conditions. The AI uses this to tailor its nutrition advice specifically for you."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-emerald-400" />}
              title="Privacy First"
              description="All health data is encrypted. Duplicate images are cached to save your API quota."
            />
          </div>
        </div>

        <div className="w-full py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-12">
              Built With Modern Tech
            </h2>
            <div className="w-full overflow-hidden">
              <LogoLoop
                logos={techStackLogos}
                speed={50}
                direction="left"
                pauseOnHover={true}
                gap={60}
                logoHeight={50}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative p-6 rounded-2xl bg-card/30 border border-border/10 hover:bg-card/50 transition-colors group">
      <div className="absolute -top-4 -left-4 w-10 h-10 bg-background border border-border/10 rounded-full flex items-center justify-center text-emerald-500 font-mono font-bold shadow-lg z-10">
        {number}
      </div>
      <div className="mb-4 p-3 bg-background/50 rounded-xl w-fit border border-border/5 group-hover:border-emerald-500/30 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-transparent border border-border/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
      <div className="mb-4 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300 origin-left">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
