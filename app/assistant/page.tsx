"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import {
  ShieldCheck, Plus, MessageSquare, CheckCircle, CloudRain,
  AlertTriangle, MapPin, Send, Mic,
  RotateCcw, Navigation, Trash2, ArrowRight, Star,
} from "lucide-react";
import { useWeather } from "@/lib/useWeather";
import { AgentSteps, type AgentStep } from "@/components/assistant/agent-steps";
import { ChatWidget, RichText, type ChatComponent } from "@/components/assistant/chat-widgets";
import { GlowInput } from "@/components/ui/glow-input";
import "./assistant.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
  steps?: AgentStep[];
  components?: ChatComponent[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

interface LiveState {
  steps: AgentStep[];
  components: ChatComponent[];
  fullText: string;
  text: string;
  done: boolean;
}

const STORAGE_KEY = "flowguard.conversations.v2";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const SIDEBAR_ZONES = [
  { id: "silkboard", name: "Silk Board", score: 92, level: "Severe", lat: 12.9172, lng: 77.6227 },
  { id: "bellandur", name: "Bellandur", score: 88, level: "Severe", lat: 12.926, lng: 77.6762 },
  { id: "hebbal", name: "Hebbal", score: 71, level: "High", lat: 13.0358, lng: 77.597 },
  { id: "koramangala", name: "Koramangala", score: 71, level: "High", lat: 12.9352, lng: 77.6245 },
  { id: "marathahalli", name: "Marathahalli", score: 71, level: "High", lat: 12.9562, lng: 77.701 },
];
const RISK_COLOR: Record<string, string> = { Severe: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" };

const suggestions = [
  { icon: MapPin, color: "#9333ea", bg: "#f5f3ff", title: "What's the flood risk in Marathahalli?", desc: "Get current risk level and alerts" },
  { icon: Navigation, color: "#2563eb", bg: "#eff6ff", title: "Safest route from Koramangala to Whitefield", desc: "Live route safety check" },
  { icon: CloudRain, color: "#16a34a", bg: "#f0fdf4", title: "What's the rain forecast for today?", desc: "Live rainfall and prediction" },
  { icon: AlertTriangle, color: "#dc2626", bg: "#fef2f2", title: "Show me the high risk zones", desc: "View severe and active zones" },
];

const quickActions = [
  { label: "Flood Risk Check", query: "Show me the current high-risk flood zones across Bengaluru.", icon: CheckCircle, color: "#2563eb" },
  { label: "Safe Route Finder", query: "Find me a safe route from Silk Board to Hebbal right now.", icon: Navigation, color: "#2563eb" },
  { label: "Live Rain Update", query: "What's the live rainfall and 3-hour forecast for Bengaluru?", icon: CloudRain, color: "#2563eb" },
  { label: "Emergency Alerts", query: "Are there any severe flood zones I should avoid right now?", icon: AlertTriangle, color: "#dc2626" },
];

const tips = [
  "Be specific about location (e.g. Indiranagar, 100 Feet Road)",
  "Ask for a route between two places to see live road safety",
  "Ask about high-risk zones to see them mapped instantly",
];

function newConversation(): Conversation {
  return { id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, title: "New Conversation", messages: [], updatedAt: Date.now() };
}
function relativeTime(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}
function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// Contextual follow-up suggestions based on what the answer showed
function followUps(components?: ChatComponent[]): string[] {
  if (components && components.length) {
    for (const c of components) {
      if (c.kind === "risk") return [`Safe route avoiding ${c.data.zone_name}`, "What's the live rain forecast?"];
      if (c.kind === "route") return ["Show me all high-risk zones", "What's the live rainfall right now?"];
      if (c.kind === "weather") return ["Show me the high-risk zones", "Safest route from Koramangala to Whitefield"];
      if (c.kind === "zoneList") return ["What's the flood risk in Silk Board?", "Safe route from HSR Layout to Whitefield"];
    }
  }
  return ["Show me the high-risk zones", "What's the rain forecast for today?"];
}

function AssistantInner() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [criticalZones, setCriticalZones] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [live, setLive] = useState<LiveState | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const weather = useWeather();

  const active = conversations.find((c) => c.id === activeId);
  const messages = active?.messages ?? [];
  const showWelcome = messages.length === 0 && !live;

  useEffect(() => {
    let loaded: Conversation[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw);
    } catch { /* ignore */ }
    if (loaded.length === 0) loaded = [newConversation()];
    setConversations(loaded);
    setActiveId(loaded[0].id);
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)); } catch { /* quota */ }
  }, [conversations]);

  useEffect(() => {
    fetch("/api/kpis").then((r) => r.json()).then((d) => setCriticalZones(d.high_risk_zones_flagged ?? null)).catch(() => {});
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, live]);

  // ── auto-resize the input as you type (dynamic grow) ──
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // ── typewriter for the live answer ──
  useEffect(() => {
    if (!live || live.text.length >= live.fullText.length) return;
    const t = setTimeout(() => {
      setLive((prev) => (prev ? { ...prev, text: prev.fullText.slice(0, prev.text.length + 3) } : prev));
    }, 12);
    return () => clearTimeout(t);
  }, [live]);

  // ── commit finished live message into the conversation ──
  useEffect(() => {
    if (!live || !live.done || live.text.length < live.fullText.length) return;
    const committed = live;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, { role: "assistant", content: committed.fullText, ts: Date.now(), steps: committed.steps, components: committed.components }], updatedAt: Date.now() }
          : c
      )
    );
    setLive(null);
    setLoading(false);
  }, [live, activeId]);

  const startNewConversation = () => {
    setConversations((prev) => {
      const empty = prev.find((c) => c.messages.length === 0);
      if (empty) { setActiveId(empty.id); return prev; }
      const conv = newConversation();
      setActiveId(conv.id);
      return [conv, ...prev];
    });
    setInput("");
    inputRef.current?.focus();
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      const final = next.length ? next : [newConversation()];
      if (id === activeId) setActiveId(final[0].id);
      return final;
    });
  };

  const send = useCallback(async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || loading || !activeId) return;

    const userMsg: Message = { role: "user", content: query, ts: Date.now() };
    const priorHistory = (conversations.find((c) => c.id === activeId)?.messages ?? []).map((m) => ({ role: m.role, content: m.content }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, title: c.messages.length === 0 ? query.slice(0, 42) : c.title, messages: [...c.messages, userMsg], updatedAt: Date.now() }
          : c
      )
    );
    setInput("");
    setLoading(true);
    setLive({ steps: [], components: [], fullText: "", text: "", done: false });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history: priorHistory }),
      });
      if (!res.body) throw new Error("no stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          let evt: { type: string; [k: string]: unknown };
          try { evt = JSON.parse(line); } catch { continue; }

          if (evt.type === "step") {
            setLive((prev) => {
              if (!prev) return prev;
              const steps = [...prev.steps];
              const i = steps.findIndex((s) => s.id === evt.id);
              const step: AgentStep = { id: evt.id as string, tool: evt.tool as string, label: evt.label as string, status: evt.status as "running" | "done", detail: evt.detail as string | undefined };
              if (i >= 0) steps[i] = step; else steps.push(step);
              return { ...prev, steps };
            });
          } else if (evt.type === "component") {
            setLive((prev) => (prev ? { ...prev, components: [...prev.components, evt.component as ChatComponent] } : prev));
          } else if (evt.type === "text") {
            setLive((prev) => (prev ? { ...prev, fullText: (evt.content as string) || "" } : prev));
          } else if (evt.type === "done") {
            setLive((prev) => (prev ? { ...prev, done: true } : prev));
          }
        }
      }
    } catch {
      setLive({ steps: [], components: [], fullText: "Network error. Please check your connection and try again.", text: "", done: true });
    }
  }, [input, loading, activeId, conversations]);

  const toggleVoice = () => {
    interface VoiceRec {
      lang: string; interimResults: boolean;
      onresult: (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void;
      onend: () => void; onerror: () => void; start: () => void;
    }
    const w = window as unknown as { SpeechRecognition?: new () => VoiceRec; webkitSpeechRecognition?: new () => VoiceRec };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { inputRef.current?.focus(); return; }
    if (recording) { setRecording(false); return; }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    rec.start();
    setRecording(true);
  };

  return (
    <div className="assistant-page">
      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className="a-left">
        <button className="a-new-btn" onClick={startNewConversation}>
          <Plus size={16} strokeWidth={2.8} /> New Conversation
        </button>

        <div>
          <h3 className="a-section-title">Recent Conversations</h3>
          <div className="a-conv-list">
            {conversations.filter((c) => c.messages.length > 0).length === 0 && (
              <p className="a-empty-convs">No conversations yet. Ask something to get started.</p>
            )}
            {conversations.filter((c) => c.messages.length > 0).map((c) => (
              <button key={c.id} className={`a-conv ${c.id === activeId ? "active" : ""}`} onClick={() => setActiveId(c.id)}>
                <span className="a-conv-icon"><MessageSquare size={16} /></span>
                <span className="a-conv-text">
                  <span className="a-conv-title">{c.title}</span>
                  <span className="a-conv-time">{relativeTime(c.updatedAt)}</span>
                </span>
                <span className="a-conv-del" onClick={(e) => deleteConversation(c.id, e)} role="button" aria-label="Delete conversation"><Trash2 size={14} /></span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="a-section-title">Quick Actions</h3>
          <div className="a-qa-list">
            {quickActions.map((a) => (
              <button key={a.label} className="a-qa" onClick={() => send(a.query)} disabled={loading}>
                <a.icon size={15} strokeWidth={2.5} color={a.color} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ═══ CENTER · CHAT ═══ */}
      <main className="a-card a-chat">
        <div className="a-chat-head">
          <div className="a-live-flag"><span className="a-dot-live" /> FlowGuard Live Agent</div>
          <span className="a-chip">Bengaluru Live</span>
        </div>

        <div className="a-scroll">
          {showWelcome ? (
            <div className="a-welcome">
              <div>
                <h2 className="a-hello">
                  Hello Rahul! <span className="a-wave">👋</span><br />
                  How can I <span className="hl">help</span> you today?
                </h2>
                <p className="a-sub">I can help you with flood risk, safe routes, live rainfall updates, and weather insights across Bengaluru — with live maps and data.</p>
              </div>

              <div>
                <div className="a-sug-head">
                  <span>Try asking about</span>
                  <button className="a-sug-refresh" onClick={() => inputRef.current?.focus()}><RotateCcw size={12} strokeWidth={2.5} /> See all suggestions</button>
                </div>
                <div className="a-sug-grid">
                  {suggestions.map((s) => (
                    <button key={s.title} className="a-sug" onClick={() => send(s.title)}>
                      <span className="a-sug-icon" style={{ background: s.bg, color: s.color }}><s.icon size={18} strokeWidth={2.2} /></span>
                      <span><h5>{s.title}</h5><p>{s.desc}</p></span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`a-msg ${m.role === "user" ? "user" : "bot"}`}>
                {m.role === "assistant" && <span className="a-bot-badge"><ShieldCheck size={20} strokeWidth={2.5} /></span>}
                <div className="a-msg-bubble">
                  {m.role === "assistant" && m.steps && m.steps.length > 0 && (
                    <details className="a-steps-done">
                      <summary><CheckCircle size={12} strokeWidth={2.6} /> Used {m.steps.length} live tool{m.steps.length > 1 ? "s" : ""}</summary>
                      <AgentSteps steps={m.steps} />
                    </details>
                  )}
                  {m.components && m.components.map((comp, ci) => (
                    <div className="a-widget" key={ci}><ChatWidget component={comp} onAsk={(q) => send(q)} /></div>
                  ))}
                  {m.content && (
                    <div className="a-bubble">
                      {m.role === "assistant" && (
                        <div className="a-bubble-head"><h4>FlowGuard AI</h4><span className="a-verified">Verified</span></div>
                      )}
                      {m.role === "assistant" ? <RichText text={m.content} /> : m.content}
                    </div>
                  )}
                  {m.role === "assistant" && m.content && (
                    <div className="a-followups">
                      {followUps(m.components).map((q) => (
                        <button key={q} className="a-followup" onClick={() => send(q)} disabled={loading}>
                          {q} <ArrowRight size={12} strokeWidth={2.6} />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="a-msg-time">{relativeTime(m.ts)}</div>
                </div>
                {m.role === "user" && <span className="a-avatar"><img src="/profile_rahul.png" alt="Rahul" /></span>}
              </div>
            ))
          )}

          {/* live streaming message */}
          {live && (
            <div className="a-msg bot">
              <span className="a-bot-badge"><ShieldCheck size={20} strokeWidth={2.5} /></span>
              <div className="a-msg-bubble">
                <AgentSteps steps={live.steps} thinking={!live.done || live.steps.length === 0} />
                {live.components.map((comp, ci) => (
                  <div className="a-widget" key={ci}><ChatWidget component={comp} onAsk={(q) => send(q)} /></div>
                ))}
                {live.text && (
                  <div className="a-bubble">
                    <div className="a-bubble-head"><h4>FlowGuard AI</h4><span className="a-verified">Verified</span></div>
                    <RichText text={live.text} />
                    {live.text.length < live.fullText.length && <span className="a-caret" />}
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="a-input-wrap">
          <div className="a-input-row">
            <GlowInput className="flex-1" radius={26} glowIntensity={0.6}>
              <div className="a-input-box">
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                  placeholder="Ask about flood risk, routes, or safety..."
                  disabled={loading}
                />
                <button className="a-send" onClick={() => send()} disabled={loading || !input.trim()}><Send size={15} strokeWidth={2.5} /></button>
              </div>
            </GlowInput>
            <button className={`a-voice ${recording ? "recording" : ""}`} onClick={toggleVoice} title="Voice input"><Mic size={18} strokeWidth={2.2} /></button>
          </div>
          <p className="a-disclaimer">FlowGuard AI can make mistakes. Please verify critical emergency details.</p>
        </div>
      </main>

      {/* ═══ RIGHT SIDEBAR ═══ */}
      <aside className="a-right">
        <div className="a-card a-cond">
          <div className="a-cond-head">
            <span>Live Conditions</span>
            <span className="a-live-tag"><i /> Live</span>
          </div>
          <div className="a-cond-main">
            <div>
              <div className="a-rain-val"><b>{weather.current_mm_per_hour ?? 0}</b><span>mm/h</span></div>
              <p className="a-rain-label">Live Rainfall</p>
            </div>
            <CloudRain size={46} strokeWidth={1.5} color="#60a5fa" />
          </div>
          <div className="a-cond-stats">
            <div><b>{weather.forecast_3h_mm ?? 0} mm</b><small>Forecast (3h)</small></div>
            <div><b className="red">{criticalZones ?? "—"}</b><small>Critical Zones</small></div>
            <div><b>{now ? formatClock(now) : "—"}</b><small>Last Updated</small></div>
          </div>
        </div>

        <div className="a-card a-map">
          <div className="a-map-head"><span>Flood Risk Map</span><a href="/planner">View full map</a></div>
          <div className="a-map-canvas">
            {API_KEY ? (
              <Map defaultCenter={{ lat: 12.952, lng: 77.647 }} defaultZoom={11} mapId="fg-sidebar" disableDefaultUI gestureHandling="greedy" style={{ width: "100%", height: "100%" }}>
                {SIDEBAR_ZONES.map((z) => (
                  <AdvancedMarker key={z.id} position={{ lat: z.lat, lng: z.lng }}>
                    <div className="aw-marker" style={{ background: RISK_COLOR[z.level], boxShadow: `0 0 0 6px ${RISK_COLOR[z.level]}33`, width: 30, height: 30, fontSize: 11 }}>{z.score}</div>
                  </AdvancedMarker>
                ))}
              </Map>
            ) : (
              <div className="a-map-fallback">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</div>
            )}
          </div>
        </div>

        <div className="a-card a-tips">
          <div className="a-tips-head"><Star size={16} strokeWidth={2.5} color="#2563eb" fill="#2563eb" /><h4>Ask better, get better answers</h4></div>
          <ul>{tips.map((t) => (<li key={t}><ArrowRight size={13} strokeWidth={2.6} /> {t}</li>))}</ul>
        </div>
      </aside>
    </div>
  );
}

export default function AssistantPage() {
  if (!API_KEY) return <AssistantInner />;
  return (
    <APIProvider apiKey={API_KEY} libraries={["routes"]}>
      <AssistantInner />
    </APIProvider>
  );
}
