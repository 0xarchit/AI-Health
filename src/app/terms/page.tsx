import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span>AI Health</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using AI Health, you agree to be bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Use of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree to use the service only for lawful purposes. You are responsible for all activity that occurs under your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. API Usage</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our service utilizes the Google Gemini API. You agree to comply with Google's Generative AI Prohibited Use Policy. You acknowledge that API usage is subject to your own Google Cloud project quotas.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">
            The nutrition information provided by this AI is for informational purposes only and should not be considered medical advice. Always consult a professional for dietary advice.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to terminate or suspend your access to the service at any time, without notice, for any reason.
          </p>
        </section>
      </main>
    </div>
  );
}
