"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Sparkles,
  Activity,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/design-system";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { fetchWithAuth } from "@/lib/api-client";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotProps {
  foodContext?: any;
}

export function ChatBot({ foodContext }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello. I am your personal health assistant. How can I help you optimize your biometrics today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let res = await fetchWithAuth("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          foodContext,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I encountered a system error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-[400px] z-100 origin-bottom-right"
          >
            <GlassPanel className="flex flex-col h-[600px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-primary/20 backdrop-blur-xl">
              <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 relative">
                    <Bot className="w-5 h-5 text-primary" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      A.I. Assistant
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-primary" />
                      <p className="text-xs text-muted-foreground">
                        Systems Nominal
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4 bg-muted/20" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex w-full items-start gap-3",
                        m.role === "user" ? "flex-row-reverse" : ""
                      )}
                    >
                      <Avatar
                        className={cn(
                          "w-8 h-8 border border-border",
                          m.role === "assistant" ? "bg-primary/20" : "bg-muted"
                        )}
                      >
                        <AvatarFallback className="bg-transparent text-xs">
                          {m.role === "assistant" ? (
                            <Bot className="w-4 h-4 text-primary" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={cn(
                          "rounded-2xl p-3 text-sm max-w-[80%] relative leading-relaxed",
                          m.role === "user"
                            ? "bg-primary text-primary-foreground shadow-sm rounded-tr-none"
                            : "bg-card border border-border text-foreground shadow-sm rounded-tl-none"
                        )}
                      >
                        {m.role === "assistant" ? (
                          <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ node, ...props }: any) => (
                                  <p className="mb-2 last:mb-0" {...props} />
                                ),
                                ul: ({ node, ...props }: any) => (
                                  <ul
                                    className="list-disc pl-4 mb-2 space-y-1"
                                    {...props}
                                  />
                                ),
                                ol: ({ node, ...props }: any) => (
                                  <ol
                                    className="list-decimal pl-4 mb-2 space-y-1"
                                    {...props}
                                  />
                                ),
                                li: ({ node, ...props }: any) => (
                                  <li className="pl-1" {...props} />
                                ),
                                h1: ({ node, ...props }: any) => (
                                  <h1
                                    className="text-base font-bold text-primary mb-2 mt-4"
                                    {...props}
                                  />
                                ),
                                h2: ({ node, ...props }: any) => (
                                  <h2
                                    className="text-sm font-bold text-primary mb-2 mt-3"
                                    {...props}
                                  />
                                ),
                                h3: ({ node, ...props }: any) => (
                                  <h3
                                    className="text-sm font-semibold text-primary/90 mb-1 mt-2"
                                    {...props}
                                  />
                                ),
                                code: ({ node, ...props }: any) => (
                                  <code
                                    className="bg-muted rounded px-1 py-0.5 text-xs font-mono text-primary"
                                    {...props}
                                  />
                                ),
                                strong: ({ node, ...props }: any) => (
                                  <strong
                                    className="font-semibold text-primary"
                                    {...props}
                                  />
                                ),
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                            <div className="absolute -left-2 top-3 w-2 h-2 border-t border-l border-border bg-card transform rotate-45 -z-10" />
                          </div>
                        ) : (
                          m.content
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-xs text-muted-foreground ml-11"
                    >
                      <Sparkles className="w-3 h-3 animate-spin text-primary" />
                      Analyzing...
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 bg-background/50 border-t border-border">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your biometrics..."
                    className="bg-muted/50 border-border focus-visible:ring-primary/50 text-sm h-11"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    size="icon"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] h-11 w-11 rounded-xl shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, textShadow: "0 0 8px rgb(var(--primary))" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-8 right-8 h-14 w-14 rounded-2xl shadow-[0_0_30px_rgba(var(--primary),0.4)] flex items-center justify-center z-[100] transition-all duration-300 border border-primary/20",
          isOpen
            ? "bg-background text-foreground rotate-90"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isOpen ? (
          <Minimize2 className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-primary" />
          </div>
        )}
      </motion.button>
    </>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
