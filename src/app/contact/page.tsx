"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Zap,
  Loader2,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const surname = formData.get("surname") as string;
    const email = formData.get("email") as string;
    const telegram = formData.get("telegram") as string;
    const type = formData.get("type") as string;
    const message = formData.get("message") as string;

    if (!email || !email.endsWith("@gmail.com")) {
      setError("Only @gmail.com addresses are allowed.");
      setLoading(false);
      return;
    }

    if (email.includes("+")) {
      setError("Email aliases (using '+') are not allowed.");
      setLoading(false);
      return;
    }

    if (!type) {
      setError("Please select a subject.");
      setLoading(false);
      return;
    }

    if (!message || message.length < 10) {
      setError("Message must be at least 10 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, email, telegram, type, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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

      <main className="max-w-xl mx-auto py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl">Contact Us</CardTitle>
              <CardDescription>
                Have a question, complaint, or want to delete your account?
                We're here to help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John"
                      required
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="surname" className="text-sm font-medium">
                      Surname{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <Input
                      id="surname"
                      name="surname"
                      placeholder="Doe"
                      className="bg-muted/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Gmail Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="yourname@gmail.com"
                    required
                    className="bg-muted/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Only standard @gmail.com addresses allowed.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="telegram" className="text-sm font-medium">
                    Telegram Username{" "}
                    <span className="text-muted-foreground">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      @
                    </span>
                    <Input
                      id="telegram"
                      name="telegram"
                      placeholder="username"
                      className="pl-7 bg-muted/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Subject <span className="text-destructive">*</span>
                  </label>
                  <Select name="type" required>
                    <SelectTrigger className="bg-muted/30">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account_deletion">
                        Account Deletion Request
                      </SelectItem>
                      <SelectItem value="complaint">
                        Complaint / Report Issue
                      </SelectItem>
                      <SelectItem value="feedback">
                        Feedback & Suggestions
                      </SelectItem>
                      <SelectItem value="other">Other Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="How can we help you?"
                    required
                    className="min-h-[120px] bg-muted/30 resize-none"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm p-3 rounded-md flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Message sent successfully! We'll get back to you soon.
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || success}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Sending...
                    </>
                  ) : success ? (
                    "Sent"
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
