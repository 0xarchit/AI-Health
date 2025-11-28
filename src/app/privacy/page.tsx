import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI Health ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our web application.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Data We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Google Account Information:</strong> When you sign in with Google, we collect your email address and Google ID to authenticate you.</li>
            <li><strong>Uploaded Images:</strong> Images you upload are processed solely for the purpose of nutrition analysis.</li>
            <li><strong>Usage Data:</strong> We may collect anonymous usage statistics to improve our service.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. How We Use Your Data</h2>
          <p className="text-muted-foreground">
            We use your data to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Authenticate your access to the application.</li>
            <li>Process your image analysis requests using the Google Gemini API.</li>
            <li>Maintain your scan history within the application.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Data Sharing</h2>
          <p className="text-muted-foreground">
            We do not sell your personal data. We share data only with:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Google Gemini API:</strong> Your uploaded images and prompts are sent to Google's Gemini API for processing. This is done under your own Google Cloud quota and subject to Google's AI Principles.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures, including encryption of sensitive tokens and secure communication channels (HTTPS).
          </p>
        </section>

        <section className="space-y-4 pt-4 border-t">
          <h2 className="text-xl font-semibold">Contact Us & Data Deletion</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy, want to report a complaint, or request the permanent deletion of your account and data, please contact us.
          </p>
          <Button asChild className="mt-2">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
