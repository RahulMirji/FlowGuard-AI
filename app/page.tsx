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
      const steps = 45;
      const duration = 650;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const val = Math.min(target, (target / steps) * step);
        el.textContent = val.toFixed(dec);
        if (step >= steps) {
          el.textContent = target.toFixed(dec);
          clearInterval(interval);
        }
      }, duration / steps);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target as HTMLSpanElement);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    counters.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-[200] h-16 flex items-center justify-between px-8 bg-[rgba(10,14,20,0.92)] backdrop-blur-[16px] border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] bg-[var(--signal-amber)] rounded-md flex items-center justify-center text-base shrink-0">
            🛡
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold tracking-[0.12em] uppercase leading-tight">
              FlowGuard AI
            </span>
            <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-muted)] leading-tight">
              Bengaluru Flood Intelligence
            </span>
          </div>
        </div>

        <ul className="hidden md:flex items-center gap-10 list-none">
          {["Planner", "Assistant", "City Dashboard"].map((link) => (
            <li key={link}>
              <a
                href={`/${link.toLowerCase().replace(" ", "")}`}
                className="text-xs font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)] hover:text-[var(--text)] transition-colors no-underline"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-6">
          <a
            href="/planner"
            className="hidden md:flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase text-[var(--ink)] bg-[var(--signal-amber)] px-5 py-2.5 rounded no-underline hover:bg-[#ffb060] transition-colors"
          >
            Plan a Route →
          </a>
          <div className="flex items-center gap-2 pl-6 border-l border-[var(--border)]">
            <span className="text-xl opacity-80">🌧</span>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-lg font-semibold text-[var(--text)]">18.5</span>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">mm/h</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--flood-low)] ml-1" />
              </div>
              <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-muted)]">
                Live Rainfall
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-16 min-h-screen grid grid-cols-1 lg:grid-cols-[480px_1fr]">
        {/* ─── LEFT PANEL ─── */}
        <div className="flex flex-col justify-center px-8 lg:px-10 py-12 bg-[var(--ink)] relative z-[2]">
          {/* Eyebrow */}
          <div className="flex items-center gap-2.5 mb-7">
            <span className="w-6 h-0.5 bg-[var(--signal-amber)] rounded-sm" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--signal-amber)]">
              Bengaluru Flood Intelligence · Monsoon 2026
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[3.5rem] lg:text-[4.2rem] font-black leading-none tracking-tight text-white mb-2 font-serif">
            Bengaluru{" "}
            <span className="text-[var(--signal-amber)] italic">floods.</span>
            <br />
            <span>Your commute</span>
            <br />
            <span>doesn&apos;t have to.</span>
          </h1>

          {/* Underline */}
          <div className="w-[60px] h-[3px] bg-[var(--rain-blue)] rounded-sm mt-5 mb-6" />

          {/* Sub */}
          <p className="text-[14.5px] text-[var(--text-muted)] leading-[1.75] max-w-[380px] mb-9">
            FlowGuard AI tracks live rainfall, scores flood-risk across 15
            chronic waterlogging hotspots, and routes you around them —{" "}
            <strong className="text-[var(--signal-amber)] font-medium">before</strong> you
            hit the jam.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 mb-12">
            <a
              href="/planner"
              className="flex items-center gap-2 text-xs font-bold tracking-[0.08em] uppercase bg-[var(--signal-amber)] text-[var(--ink)] px-6 py-3.5 rounded no-underline hover:bg-[#ffb060] hover:-translate-y-px transition-all"
            >
              → Plan a Route
            </a>
            <a
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-semibold tracking-[0.08em] uppercase text-[var(--text-muted)] border border-[rgba(255,255,255,0.15)] px-5 py-3.5 rounded no-underline hover:text-[var(--text)] hover:border-[rgba(255,255,255,0.3)] transition-all"
            >
              View City Dashboard
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="7" width="3" height="6" fill="currentColor" opacity="0.7" />
                <rect x="5.5" y="4" width="3" height="9" fill="currentColor" />
                <rect x="10" y="1" width="3" height="12" fill="currentColor" opacity="0.7" />
              </svg>
            </a>
          </div>

          {/* KPIs */}
          <div ref={countersRef} className="flex gap-10 pt-10 border-t border-[var(--border)] mb-10">
            {[
              { target: "86.7", dec: "1", unit: "%", trend: "▲ 4.3%", label: "Prediction Accuracy" },
              { target: "24.3", dec: "1", unit: "%", trend: "▲ 3.1%", label: "Avg. Commute Reduction" },
              { target: "4", dec: "0", unit: "", trend: "▲ 1", label: "High-Risk Zones Flagged" },
            ].map((kpi) => (
              <div key={kpi.label}>
                <div className="font-mono text-[2.4rem] font-semibold text-white leading-none flex items-baseline gap-px">
                  <span className="counter" data-target={kpi.target} data-dec={kpi.dec}>
                    0
                  </span>
                  {kpi.unit && <span className="text-[1.1rem] font-normal">{kpi.unit}</span>}
                </div>
                <div className="text-[11px] text-[var(--flood-low)] mt-1 font-mono flex items-center gap-1">
                  {kpi.trend}
                </div>
                <div className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[var(--text-dim)] mt-1">
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>

          {/* Powered by */}
          <div className="flex items-center gap-5 flex-wrap">
            <span className="text-xs text-[var(--text-dim)]">Powered by</span>
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#8B8BFF] opacity-80">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#8B8BFF" />
              </svg>
              Gemini
            </span>
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4264fb] opacity-80">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#4264fb" opacity="0.2" stroke="#4264fb" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="4" fill="#4264fb" />
              </svg>
              Mapbox
            </span>
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#EB6E4B] opacity-80">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#EB6E4B" opacity="0.9" />
                <path d="M4 16 Q8 13 12 15 Q16 17 20 14" stroke="#EB6E4B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
              OpenWeather
            </span>
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#3ECF8E] opacity-80">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 20L13 4V13H20L11 20V11H4Z" fill="#3ECF8E" />
              </svg>
              Supabase
            </span>
          </div>
        </div>

        {/* ─── RIGHT MAP PANEL ─── */}
        <div className="relative bg-[var(--ink2)] overflow-hidden hidden lg:block">
          {/* Map background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_50%,#0d1825_0%,#080c12_100%)]" />

          {/* Road network SVG */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 700 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1a2d45" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#080c12" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="350" cy="400" rx="320" ry="350" fill="url(#mapGlow)" />
            {/* Road grid */}
            <g stroke="rgba(80,120,170,0.25)" strokeWidth="0.6" fill="none">
              <line x1="0" y1="80" x2="700" y2="100" />
              <line x1="0" y1="160" x2="700" y2="175" />
              <line x1="0" y1="240" x2="700" y2="255" />
              <line x1="0" y1="320" x2="700" y2="330" />
              <line x1="0" y1="410" x2="700" y2="415" />
              <line x1="0" y1="510" x2="700" y2="505" />
              <line x1="0" y1="620" x2="700" y2="610" />
              <line x1="0" y1="720" x2="700" y2="710" />
              <line x1="70" y1="0" x2="80" y2="800" />
              <line x1="160" y1="0" x2="155" y2="800" />
              <line x1="260" y1="0" x2="255" y2="800" />
              <line x1="370" y1="0" x2="365" y2="800" />
              <line x1="470" y1="0" x2="462" y2="800" />
              <line x1="570" y1="0" x2="565" y2="800" />
              <line x1="640" y1="0" x2="635" y2="800" />
              <line x1="0" y1="500" x2="300" y2="100" />
              <line x1="400" y1="0" x2="700" y2="500" />
              <line x1="100" y1="800" x2="600" y2="200" />
              <line x1="0" y1="200" x2="500" y2="800" />
            </g>
            {/* Arteries */}
            <g stroke="rgba(100,150,200,0.35)" strokeWidth="1.2" fill="none">
              <ellipse cx="350" cy="400" rx="280" ry="310" />
              <ellipse cx="350" cy="400" rx="170" ry="190" />
              <line x1="350" y1="0" x2="355" y2="800" />
              <line x1="0" y1="400" x2="700" y2="400" />
            </g>
            {/* Building blocks */}
            <g fill="rgba(25,40,65,0.5)">
              {[90, 170, 250, 340, 430, 530].map((y) =>
                [85, 170, 270, 375, 475].map((x) => (
                  <rect key={`${x}-${y}`} x={x} y={y} width={x === 85 ? 65 : x === 270 ? 85 : 80} height={y >= 430 ? 65 : 60} rx={1} />
                ))
              )}
            </g>
            {/* Recommended route (blue) */}
            <path
              d="M 155 640 Q 200 580 240 520 Q 270 470 285 420 Q 300 360 320 300 Q 345 240 375 180 Q 400 130 440 100"
              stroke="rgba(91,143,190,0.9)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 155 640 Q 200 580 240 520 Q 270 470 285 420 Q 300 360 320 300 Q 345 240 375 180 Q 400 130 440 100"
              stroke="rgba(91,143,190,0.2)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Avoided route (red dashed) */}
            <path
              d="M 155 640 Q 175 610 190 580 Q 220 530 245 495 Q 270 455 268 430"
              stroke="rgba(226,70,47,0.5)"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="5,4"
              strokeLinecap="round"
            />
          </svg>

          {/* Zone markers */}
          {/* Hebbal - High */}
          <ZoneMarker left="37%" top="22%" level="high" score={68} name="Hebbal" />
          {/* Koramangala - High */}
          <ZoneMarker left="22%" top="50%" level="high" score={71} name="Koramangala" />
          {/* Silk Board - Severe */}
          <ZoneMarker left="38%" top="65%" level="severe" score={92} name="Silk Board" />
          {/* Bellandur - Severe */}
          <ZoneMarker left="50%" top="78%" level="severe" score={88} name="Bellandur" />
          {/* KR Puram - Medium */}
          <ZoneMarker left="68%" top="34%" level="medium" score={44} name="KR Puram" />
          {/* Marathahalli - Medium */}
          <ZoneMarker left="65%" top="50%" level="medium" score={47} name="Marathahalli" />
          {/* Sarjapur - Medium */}
          <ZoneMarker left="72%" top="68%" level="medium" score={51} name="Sarjapur Rd" />

          {/* Live badge */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)] bg-[rgba(10,14,20,0.75)] border border-[rgba(255,255,255,0.1)] rounded-full px-3.5 py-1.5 backdrop-blur-[8px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--flood-low)]" />
            Live · Updated 4 min ago
          </div>

          {/* Conditions card */}
          <div className="absolute top-5 right-5 z-10 bg-[rgba(12,18,28,0.9)] border border-[rgba(255,255,255,0.1)] rounded-md p-4 backdrop-blur-[12px] min-w-[150px] space-y-2">
            <CondRow label="Rainfall" value="18.5 mm/h" color="amber" />
            <CondRow label="3H Forecast" value="32 mm" color="red" />
            <CondRow label="Severe Zones" value="2" color="red" />
            <CondRow label="Status" value="Alert" color="amber" />
          </div>

          {/* Risk legend */}
          <div className="absolute bottom-6 right-5 z-10 bg-[rgba(12,18,28,0.9)] border border-[rgba(255,255,255,0.1)] rounded-md p-4 backdrop-blur-[12px]">
            <div className="font-mono text-[9px] font-semibold tracking-[0.12em] uppercase text-[var(--text-muted)] mb-2.5">
              Risk Level
            </div>
            {[
              { color: "var(--flood-severe)", label: "Severe" },
              { color: "var(--flood-high)", label: "High" },
              { color: "var(--flood-medium)", label: "Medium" },
              { color: "var(--flood-low)", label: "Low" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 mb-1.5 last:mb-0 text-[11px] font-medium text-[var(--text-muted)]">
                <span
                  className="w-[9px] h-[9px] rounded-full shrink-0"
                  style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }}
                />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURE STRIP ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-t border-[var(--border)] bg-[var(--ink2)]">
        {[
          { icon: "🌧", title: "Live Weather", desc: "Real-time rainfall and forecasts from OpenWeatherMap.", bg: "rgba(61,107,140,0.2)" },
          { icon: "🛡", title: "AI Risk Engine", desc: "Gemini AI scores flood-risk zones using live data and historical patterns.", bg: "rgba(255,154,60,0.15)" },
          { icon: "↔", title: "Smart Routes", desc: "AI ranks routes to avoid high-risk zones and save your time.", bg: "rgba(76,175,130,0.15)" },
          { icon: "🔔", title: "Early Alerts", desc: "Get notified before flooding turns into gridlock.", bg: "rgba(139,91,186,0.15)" },
        ].map((f, i) => (
          <div
            key={f.title}
            className={`flex gap-4 items-start p-7 hover:bg-[rgba(255,255,255,0.02)] transition-colors ${i < 3 ? "border-r border-[var(--border)]" : ""}`}
          >
            <div
              className="w-[42px] h-[42px] rounded-lg flex items-center justify-center text-xl shrink-0"
              style={{ background: f.bg }}
            >
              {f.icon}
            </div>
            <div>
              <div className="font-mono text-[10px] font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-1">
                {f.title}
              </div>
              <div className="text-[12.5px] text-[var(--text-dim)] leading-relaxed">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ SCROLL CTA ═══ */}
      <div className="flex flex-col items-center gap-2 py-5 border-t border-[var(--border)] bg-[var(--ink)]">
        <span className="text-lg text-[var(--text-dim)] animate-[bounce-arrow_2s_ease-in-out_infinite]">⌄</span>
        <span className="font-mono text-[9.5px] tracking-[0.15em] uppercase text-[var(--text-dim)]">
          Scroll to explore
        </span>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function ZoneMarker({
  left,
  top,
  level,
  score,
  name,
}: {
  left: string;
  top: string;
  level: "severe" | "high" | "medium";
  score: number;
  name: string;
}) {
  const styles: Record<string, { size: string; bg: string; border: string; shadow: string; animation?: string; fontSize: string; textColor: string }> = {
    severe: {
      size: "w-[62px] h-[62px]",
      bg: "radial-gradient(circle, rgba(226,70,47,0.5) 0%, rgba(226,70,47,0.15) 60%, transparent 100%)",
      border: "1.5px solid rgba(226,70,47,0.7)",
      shadow: "0 0 0 12px rgba(226,70,47,0.08), 0 0 0 24px rgba(226,70,47,0.04), 0 0 40px rgba(226,70,47,0.4)",
      animation: "pulse-severe 2.5s ease-in-out infinite",
      fontSize: "text-lg",
      textColor: "text-white",
    },
    high: {
      size: "w-[52px] h-[52px]",
      bg: "radial-gradient(circle, rgba(255,140,66,0.45) 0%, rgba(255,140,66,0.12) 60%, transparent 100%)",
      border: "1.5px solid rgba(255,140,66,0.65)",
      shadow: "0 0 0 10px rgba(255,140,66,0.07), 0 0 30px rgba(255,140,66,0.35)",
      animation: "pulse-high 3s ease-in-out infinite",
      fontSize: "text-[15px]",
      textColor: "text-white",
    },
    medium: {
      size: "w-[44px] h-[44px]",
      bg: "radial-gradient(circle, rgba(245,200,66,0.35) 0%, rgba(245,200,66,0.08) 60%, transparent 100%)",
      border: "1.5px solid rgba(245,200,66,0.55)",
      shadow: "0 0 0 8px rgba(245,200,66,0.05), 0 0 22px rgba(245,200,66,0.25)",
      fontSize: "text-[13px]",
      textColor: "text-[#F5C842]",
    },
  };

  const s = styles[level];

  return (
    <div
      className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-[5]"
      style={{ left, top }}
    >
      <div
        className={`${s.size} rounded-full flex items-center justify-center relative`}
        style={{
          background: s.bg,
          border: s.border,
          boxShadow: s.shadow,
          animation: s.animation,
        }}
      >
        <span className={`font-mono font-semibold ${s.fontSize} ${s.textColor} relative z-[2] leading-none`}>
          {score}
        </span>
      </div>
      <span className="text-[10px] font-medium tracking-[0.04em] uppercase text-[rgba(255,255,255,0.65)] mt-1.5 whitespace-nowrap [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
        {name}
      </span>
    </div>
  );
}

function CondRow({ label, value, color }: { label: string; value: string; color: "amber" | "red" }) {
  const colorClass = color === "amber" ? "text-[var(--signal-amber)]" : "text-[var(--flood-severe)]";
  return (
    <div className="flex justify-between items-baseline gap-6">
      <span className="font-mono text-[9px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
        {label}
      </span>
      <span className={`font-mono text-sm font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}
