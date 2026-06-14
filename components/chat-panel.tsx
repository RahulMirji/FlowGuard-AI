"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, User } from "lucide-react";
import { ShiningText } from "@/components/ui/shining-text";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm FlowGuard AI 👋 Ask me about flood risk, travel safety, or commute conditions anywhere in Bengaluru." },
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (message: string) => {
    if (!message.trim() || loading) return;
    const userMsg: Message = { role: "user", content: message.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history: messages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || data.error || "Something went wrong." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-sm"
                    : "bg-white/5 border border-white/8 text-white/85 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-start"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
              <ShiningText text="FlowGuard is thinking..." />
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 pt-2">
        <PromptInputBox
          onSend={(msg) => send(msg)}
          isLoading={loading}
          placeholder="Ask about flood risk, routes, or safety..."
        />
      </div>
    </div>
  );
}
