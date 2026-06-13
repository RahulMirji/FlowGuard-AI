"use client";

import { useEffect, useRef } from "react";

export default function LandingPage() {
  const countersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const counters = countersRef.current?.querySelectorAll<HTMLSpanElement>(".counter");
    if (!counters) return;
    const animate = (el: HTMLSpanElement) => {
      const target = parseFloat(el.dataset.target || "0");
      const dec = parseInt(el.dataset.dec || "0");
      let step = 0;
      const steps = 40;
      const interval = setInterval(() => {
        step++;
        el.textContent = Math.min(target, (target / steps) * step).toFixed(dec);
        if (step >= steps) { el.textContent = target.toFixed(dec); clearInterval(interval); }
      }, 16);
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animate(e.target as HTMLSpanElement); obs.unobserve(e.target); } });
    }, { threshold: 0.3 });
    counters.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--surface-dark)] starfield">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-[200] h-16 flex items-center justify-between px-6 lg:px-10 bg-[rgba(31,22,51,0.92)] backdrop-blur-[16px] border-b border-[var(--hairline-violet)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-violet-deep)] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 22V12m0 0L3 7m9 5l9-5" stroke="var(--accent-lime)" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <div>
            <span className="text-[14px] font-bold tracking-[0.08em] uppercase text-white">FlowGuard AI</span>
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--on-dark-muted)]">Flood Intelligence</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Planner", "Assistant", "Dashboard"].map((l) => (
            <a key={l} href={`/${l.toLowerCase()}`} className="text-[13px] font-medium text-[var(--on-dark-muted)] hover:text-white transition-colors uppercase tracking-[0.05em]">
              {l}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a href="/planner" className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[var(--ink-deep)] text-[14px] font-bold tracking-[0.02em] uppercase hover:bg-[#f0f0f0] transition-colors">
            Plan a Route
          </a>
          <div className="flex items-center gap-2 pl-4 border-l border-[var(--hairline-violet)]">
            <span className="w-2 h-2 rounded-full bg-[var(--flood-low)]" />
            <span className="text-[13px] font-medium text-[var(--on-dark-muted)]">18.5 mm/h</span>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-16 min-h-screen grid grid-cols-1 lg:grid-cols-[520px_1fr]">
        {/* ─── LEFT PANEL ─── */}
        <div className="flex flex-col justify-center px-8 lg:px-12 py-16 relative z-[2]">
          {/* Eyebrow */}
          <p className="text-[15px] font-medium text-[var(--accent-violet)] uppercase tracking-[0.02em] mb-6">
            Bengaluru Flood Intelligence · Monsoon 2026
          </p>

          {/* Headline */}
          <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[1.05] tracking-tight text-white mb-2">
            Bengaluru{" "}
            <span className="lime-chip">floods.</span>
            <br />
            Your commute
            <br />
            doesn&apos;t have to.
          </h1>

          {/* Subtitle */}
          <p className="text-[16px] font-normal leading-[2] text-[var(--on-dark-muted)] max-w-[420px] mt-6 mb-10">
            FlowGuard AI tracks live rainfall, scores flood-risk across 15 chronic waterlogging hotspots, and routes you around them —{" "}
            <strong className="text-[var(--accent-lime)] font-medium">before</strong> you hit the jam.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-14">
            <a href="/planner" className="flex items-center gap-2.5 px-5 py-3 rounded-lg bg-white text-[var(--ink-deep)] text-[14px] font-bold uppercase tracking-[0.02em] hover:bg-[#f0f0f0] transition-colors shadow-[0_0_8px_6px_rgb(21,15,35)]">
              → Plan a Route
            </a>
            <a href="/dashboard" className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[var(--on-dark-faint)] text-white text-[14px] font-bold uppercase tracking-[0.02em] hover:bg-[rgba(255,255,255,0.12)] transition-colors">
              City Dashboard
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="7" width="3" height="6" fill="currentColor" opacity="0.7" />
                <rect x="5.5" y="4" width="3" height="9" fill="currentColor" />
                <rect x="10" y="1" width="3" height="12" fill="currentColor" opacity="0.7" />
              </svg>
            </a>
          </div>

          {/* KPIs */}
          <div ref={countersRef} className="flex gap-8 pt-8 border-t border-[var(--hairline-violet)]">
            {[
              { target: "86.7", dec: "1", unit: "%", label: "Prediction Accuracy" },
              { target: "24.3", dec: "1", unit: "%", label: "Commute Reduction" },
              { target: "4", dec: "0", unit: "", label: "Zones Flagged" },
            ].map((kpi) => (
              <div key={kpi.label}>
                <div className="text-[2.2rem] font-bold text-white leading-none flex items-baseline">
                  <span className="counter" data-target={kpi.target} data-dec={kpi.dec}>0</span>
                  {kpi.unit && <span className="text-[1rem] font-normal ml-0.5">{kpi.unit}</span>}
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--on-dark-faint)] mt-2">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Powered by */}
          <div className="flex items-center gap-4 mt-10 flex-wrap">
            <span className="text-[12px] text-[var(--on-dark-faint)] uppercase tracking-wider">Powered by</span>
            {[
              { name: "Gemini", color: "#8B8BFF" },
              { name: "Mapbox", color: "#4264fb" },
              { name: "OpenWeather", color: "#EB6E4B" },
              { name: "Supabase", color: "#3ECF8E" },
            ].map((t) => (
              <span key={t.name} className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: t.color, opacity: 0.7 }}>
                {t.name}
              </span>
            ))}
          </div>
        </div>

        {/* ─── RIGHT MAP PANEL ─── */}
        <div className="relative overflow-hidden hidden lg:block bg-[var(--surface-night)]">
          {/* Map BG */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,#1a1235_0%,#0d0919_100%)]" />

          {/* Road network SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="mglow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2a1f4a" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0d0919" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="350" cy="400" rx="320" ry="350" fill="url(#mglow)" />
            <g stroke="rgba(106,95,193,0.15)" strokeWidth="0.6" fill="none">
              <line x1="0" y1="80" x2="700" y2="100" />
              <line x1="0" y1="160" x2="700" y2="175" />
              <line x1="0" y1="240" x2="700" y2="255" />
              <line x1="0" y1="320" x2="700" y2="330" />
              <line x1="0" y1="410" x2="700" y2="415" />
              <line x1="0" y1="510" x2="700" y2="505" />
              <line x1="0" y1="620" x2="700" y2="610" />
              <line x1="70" y1="0" x2="80" y2="800" />
              <line x1="160" y1="0" x2="155" y2="800" />
              <line x1="260" y1="0" x2="255" y2="800" />
              <line x1="370" y1="0" x2="365" y2="800" />
              <line x1="470" y1="0" x2="462" y2="800" />
              <line x1="570" y1="0" x2="565" y2="800" />
              <line x1="0" y1="500" x2="300" y2="100" />
              <line x1="400" y1="0" x2="700" y2="500" />
              <line x1="100" y1="800" x2="600" y2="200" />
            </g>
            <g stroke="rgba(106,95,193,0.25)" strokeWidth="1.2" fill="none">
              <ellipse cx="350" cy="400" rx="280" ry="310" />
              <ellipse cx="350" cy="400" rx="170" ry="190" />
              <line x1="350" y1="0" x2="355" y2="800" />
              <line x1="0" y1="400" x2="700" y2="400" />
            </g>
            {/* Recommended route */}
            <path d="M 155 640 Q 200 580 240 520 Q 270 470 285 420 Q 300 360 320 300 Q 345 240 375 180 Q 400 130 440 100" stroke="rgba(106,95,193,0.8)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 155 640 Q 200 580 240 520 Q 270 470 285 420 Q 300 360 320 300 Q 345 240 375 180 Q 400 130 440 100" stroke="rgba(106,95,193,0.15)" strokeWidth="10" fill="none" strokeLinecap="round" />
            {/* Avoided route */}
            <path d="M 155 640 Q 175 610 190 580 Q 220 530 245 495 Q 270 455 268 430" stroke="rgba(226,70,47,0.45)" strokeWidth="1.5" fill="none" strokeDasharray="5,4" strokeLinecap="round" />
          </svg>

          {/* Zone markers */}
          <ZoneMarker left="37%" top="22%" level="high" score={68} name="Hebbal" />
          <ZoneMarker left="22%" top="50%" level="high" score={71} name="Koramangala" />
          <ZoneMarker left="38%" top="65%" level="severe" score={92} name="Silk Board" />
          <ZoneMarker left="50%" top="78%" level="severe" score={88} name="Bellandur" />
          <ZoneMarker left="68%" top="34%" level="medium" score={44} name="KR Puram" />
          <ZoneMarker left="65%" top="50%" level="medium" score={47} name="Marathahalli" />
          <ZoneMarker left="72%" top="68%" level="medium" score={51} name="Sarjapur Rd" />

          {/* Live badge */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--on-dark-muted)] bg-[rgba(21,15,35,0.8)] border border-[var(--hairline-violet)] rounded-full px-4 py-1.5 backdrop-blur-[8px]">
            <span className="w-2 h-2 rounded-full bg-[var(--flood-low)]" />
            Live · Updated 4 min ago
          </div>

          {/* Conditions card */}
          <div className="absolute top-5 right-5 z-10 bg-[rgba(21,15,35,0.9)] border border-[var(--hairline-violet)] rounded-lg p-4 backdrop-blur-[12px] min-w-[155px] space-y-2.5">
            <CondRow label="Rainfall" value="18.5 mm/h" color="lime" />
            <CondRow label="3H Forecast" value="32 mm" color="pink" />
            <CondRow label="Severe Zones" value="2" color="pink" />
            <CondRow label="Status" value="Alert" color="lime" />
          </div>

          {/* Risk legend */}
          <div className="absolute bottom-6 right-5 z-10 bg-[rgba(21,15,35,0.9)] border border-[var(--hairline-violet)] rounded-lg p-4 backdrop-blur-[12px]">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--on-dark-muted)] mb-2.5">Risk Level</p>
            {[
              { color: "var(--flood-severe)", label: "Severe" },
              { color: "var(--flood-high)", label: "High" },
              { color: "var(--flood-medium)", label: "Medium" },
              { color: "var(--flood-low)", label: "Low" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 mb-1.5 last:mb-0 text-[11px] font-medium text-[var(--on-dark-muted)]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURE STRIP ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-t border-[var(--hairline-violet)] bg-[var(--surface-night)]">
        {[
          { icon: "☁", title: "Live Weather", desc: "Real-time rainfall and forecasts from OpenWeatherMap.", bg: "rgba(106,95,193,0.15)" },
          { icon: "⚡", title: "AI Risk Engine", desc: "Gemini AI scores flood-risk zones using live data and historical patterns.", bg: "rgba(194,239,78,0.08)" },
          { icon: "→", title: "Smart Routes", desc: "AI ranks routes to avoid high-risk zones and save your time.", bg: "rgba(106,95,193,0.15)" },
          { icon: "🔔", title: "Early Alerts", desc: "Get notified before flooding turns into gridlock.", bg: "rgba(250,127,170,0.1)" },
        ].map((f, i) => (
          <div key={f.title} className={`flex gap-4 items-start p-7 hover:bg-[rgba(255,255,255,0.02)] transition-colors ${i < 3 ? "md:border-r border-[var(--hairline-violet)]" : ""}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: f.bg }}>
              {f.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--on-dark-muted)] mb-1">{f.title}</p>
              <p className="text-[13px] font-normal text-[var(--on-dark-faint)] leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ SQUIGGLE + FOOTER ═══ */}
      <div className="squiggle-divider mt-12" />
      <footer className="max-w-6xl mx-auto px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-[12px] text-[var(--on-dark-faint)]">
          <span className="font-semibold uppercase tracking-wider">CODEX 2026</span>
          <span className="w-1 h-1 rounded-full bg-[var(--hairline-violet)]" />
          <span>SDG 11 · SDG 13</span>
        </div>
        <p className="text-[12px] text-[var(--on-dark-faint)]">
          Synthetic data disclosed · Built for hackathon demonstration
        </p>
      </footer>
    </div>
  );
}

function ZoneMarker({ left, top, level, score, name }: { left: string; top: string; level: "severe" | "high" | "medium"; score: number; name: string }) {
  const cfg = {
    severe: {
      size: "w-[60px] h-[60px]",
      bg: "radial-gradient(circle, rgba(226,70,47,0.5) 0%, rgba(226,70,47,0.12) 60%, transparent 100%)",
      border: "1.5px solid rgba(226,70,47,0.7)",
      shadow: "0 0 0 12px rgba(226,70,47,0.08), 0 0 40px rgba(226,70,47,0.4)",
      anim: "pulse-severe 2.5s ease-in-out infinite",
      text: "text-[17px] text-white",
    },
    high: {
      size: "w-[50px] h-[50px]",
      bg: "radial-gradient(circle, rgba(255,140,66,0.4) 0%, rgba(255,140,66,0.1) 60%, transparent 100%)",
      border: "1.5px solid rgba(255,140,66,0.6)",
      shadow: "0 0 0 10px rgba(255,140,66,0.07), 0 0 30px rgba(255,140,66,0.35)",
      anim: "pulse-high 3s ease-in-out infinite",
      text: "text-[15px] text-white",
    },
    medium: {
      size: "w-[42px] h-[42px]",
      bg: "radial-gradient(circle, rgba(245,200,66,0.3) 0%, rgba(245,200,66,0.06) 60%, transparent 100%)",
      border: "1.5px solid rgba(245,200,66,0.5)",
      shadow: "0 0 0 8px rgba(245,200,66,0.05), 0 0 20px rgba(245,200,66,0.25)",
      anim: undefined,
      text: "text-[13px] text-[#F5C842]",
    },
  };
  const s = cfg[level];

  return (
    <div className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-[5]" style={{ left, top }}>
      <div
        className={`${s.size} rounded-full flex items-center justify-center`}
        style={{ background: s.bg, border: s.border, boxShadow: s.shadow, animation: s.anim }}
      >
        <span className={`font-bold ${s.text} leading-none`}>{score}</span>
      </div>
      <span className="text-[10px] font-medium tracking-[0.05em] uppercase text-[rgba(255,255,255,0.6)] mt-1.5 whitespace-nowrap [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
        {name}
      </span>
    </div>
  );
}

function CondRow({ label, value, color }: { label: string; value: string; color: "lime" | "pink" }) {
  const c = color === "lime" ? "text-[var(--accent-lime)]" : "text-[var(--accent-pink)]";
  return (
    <div className="flex justify-between items-baseline gap-5">
      <span className="text-[9px] font-medium tracking-[0.1em] uppercase text-[var(--on-dark-muted)]">{label}</span>
      <span className={`text-[13px] font-semibold ${c}`}>{value}</span>
    </div>
  );
}
