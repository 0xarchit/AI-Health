import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github, Globe, Heart } from "lucide-react";

export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span>AI Health</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-6 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Credits & Copyright</h1>
          <p className="text-muted-foreground text-lg">
            Acknowledging the tools and people that make this project possible.
          </p>
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-2xl font-semibold">
            <Github className="w-6 h-6" />
            <h2>Open Source</h2>
          </div>
          <div className="bg-card/50 border rounded-xl p-6 space-y-4">
            <p className="text-muted-foreground">
              AI Health is an open-source project. You can view the source code,
              contribute, or report issues on GitHub.
            </p>
            <Button asChild variant="outline" className="gap-2">
              <Link
                href="https://github.com/0xarchit/AI-Health"
                target="_blank"
              >
                <Github className="w-4 h-4" /> View on GitHub
              </Link>
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-2xl font-semibold">
            <Heart className="w-6 h-6 text-red-500" />
            <h2>Developer</h2>
          </div>
          <div className="bg-card/50 border rounded-xl p-6 space-y-4">
            <p className="text-muted-foreground">
              Developed by <strong>0xarchit</strong>. Check out my portfolio for
              more projects.
            </p>
            <Button asChild variant="outline" className="gap-2">
              <Link href="https://0xarchit.is-a.dev" target="_blank">
                <Globe className="w-4 h-4" /> Visit Portfolio
              </Link>
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Technology Stack & Credits</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-card/50 border rounded-xl p-6">
              <h3 className="font-semibold mb-2">Image Hosting</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Powered by <strong>ImageKit.io</strong> for fast and secure
                image delivery.
              </p>
              <Link
                href="https://imagekit.io"
                target="_blank"
                className="text-primary hover:underline text-sm"
              >
                Visit ImageKit.io
              </Link>
            </div>

            <div className="bg-card/50 border rounded-xl p-6">
              <h3 className="font-semibold mb-2">3D Models</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Human anatomy models sourced from{" "}
                <strong>NIH 3D Print Exchange</strong>.
              </p>
              <Link
                href="https://3d.nih.gov/"
                target="_blank"
                className="text-primary hover:underline text-sm"
              >
                Visit NIH 3D
              </Link>
            </div>

            <div className="bg-card/50 border rounded-xl p-6">
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Powered by <strong>Google Gemini API</strong> for advanced
                multimodal understanding.
              </p>
            </div>

            <div className="bg-card/50 border rounded-xl p-6">
              <h3 className="font-semibold mb-2">Framework</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Built with <strong>Next.js 16</strong>,{" "}
                <strong>Tailwind CSS</strong>, and <strong>Drizzle ORM</strong>.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
