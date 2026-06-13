"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm FlowGuard AI 👋 Ask me about flood risk, travel safety, or commute conditions anywhere in Bengaluru." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
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
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.role === "assistant" && <div className="bubble-avatar"><i className="fa-solid fa-shield-halved" /></div>}
            <div className="bubble-content">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant">
            <div className="bubble-avatar"><i className="fa-solid fa-shield-halved" /></div>
            <div className="bubble-content typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="chat-input-bar">
        <input
          type="text"
          placeholder="Ask about flood risk, routes, or safety..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()}>
          <i className="fa-solid fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}
