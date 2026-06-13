export default function LandingPage() {
  return (
    <div className="w-full max-w-[1440px] bg-[rgba(248,250,252,0.4)] backdrop-blur-[20px] rounded-3xl border border-[rgba(255,255,255,0.6)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] p-6 flex flex-col gap-5 relative">
      {/* ═══ HEADER ═══ */}
      <header className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] flex items-center justify-center shadow-[0_4px_12px_rgba(2,132,199,0.3)]">
            <i className="fa-solid fa-droplet text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wide uppercase">
              FLOWGUARD <span className="text-[var(--brand-orange)]">AI</span>
            </h1>
            <p className="text-[10px] font-semibold text-[var(--text-muted)] tracking-[1px] uppercase -mt-0.5">
              Bengaluru Flood Intelligence
            </p>
          </div>
        </div>

        <div className="hidden lg:flex bg-[rgba(255,255,255,0.6)] border border-[rgba(255,255,255,0.7)] rounded-[30px] p-1">
          {[
            { icon: "fa-map-location-dot", label: "Planner", active: false },
            { icon: "fa-user-shield", label: "Assistant", active: true },
            { icon: "fa-chart-line", label: "City Dashboard", active: false },
          ].map((n) => (
            <a
              key={n.label}
              href={`/${n.label.toLowerCase().replace(" ", "")}`}
              className={`px-5 py-2 text-[13px] font-semibold flex items-center gap-2 rounded-[25px] transition-all ${
                n.active
                  ? "bg-white text-[var(--text-main)] shadow-[0_4px_10px_rgba(0,0,0,0.03)]"
                  : "text-[var(--text-muted)] hover:bg-white hover:text-[var(--text-main)]"
              }`}
            >
              <i className={`fa-solid ${n.icon} text-xs`} />
              {n.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a href="/planner" className="hidden md:flex items-center gap-2.5 bg-gradient-to-br from-[#ff7e47] to-[#ff571a] text-white px-6 py-3 rounded-[30px] text-[13px] font-bold shadow-[0_4px_15px_rgba(255,107,53,0.3)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(255,107,53,0.4)] transition-all">
            Plan a Route <i className="fa-solid fa-arrow-right" />
          </a>
          <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-[30px] shadow-[0_4px_10px_rgba(0,0,0,0.02)] border border-[rgba(255,255,255,0.9)]">
            <i className="fa-solid fa-cloud-showers-heavy text-[var(--brand-blue)] text-lg" />
            <div className="text-right">
              <div className="text-sm font-bold">18.5 <span className="text-[10px] font-semibold">mm/h</span></div>
              <div className="text-[9px] text-[var(--text-muted)] uppercase font-semibold flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block" /> Live Rainfall
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ MAIN WORKSPACE ═══ */}
      <main className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 lg:h-[620px]">
        {/* ─── LEFT PANEL ─── */}
        <div className="flex flex-col justify-between">
          <div className="pt-4">
            <div className="inline-block bg-[rgba(255,107,53,0.1)] text-[var(--brand-orange)] text-[11px] font-bold uppercase px-3 py-1 rounded-[20px] tracking-[0.5px] mb-5 border border-[rgba(255,107,53,0.15)]">
              <span className="text-[var(--text-muted)] font-medium">•</span> Bengaluru Flood Intelligence <span className="text-[var(--text-muted)] font-medium mx-1">•</span> Monsoon 2026
            </div>
            <h2 className="text-[clamp(2.5rem,4vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-[#0f172a]">
              Bengaluru <span className="text-[var(--brand-orange)]">floods.</span>
              <br />
              Your commute doesn&apos;t have to.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-[var(--text-muted)] max-w-[90%]">
              FlowGuard AI tracks live rainfall, scores flood-risk across 15 chronic waterlogging hotspots, and routes you around them —{" "}
              <span className="text-[var(--brand-orange)] font-semibold">before</span> you hit the jam.
            </p>
            <div className="flex gap-3 mt-7">
              <a href="/planner" className="flex items-center gap-2.5 bg-gradient-to-br from-[#ff7e47] to-[#ff571a] text-white px-7 py-3.5 rounded-[30px] text-[13px] font-bold shadow-[0_4px_15px_rgba(255,107,53,0.3)] hover:-translate-y-px transition-all">
                <i className="fa-solid fa-arrow-right" /> Plan a Route <i className="fa-solid fa-arrow-right" />
              </a>
              <a href="/dashboard" className="flex items-center gap-2.5 bg-[rgba(255,255,255,0.5)] border border-[rgba(255,255,255,0.8)] text-[#1e293b] px-6 py-3.5 rounded-[30px] text-[13px] font-bold backdrop-blur-[5px]">
                View City Dashboard <i className="fa-solid fa-chart-simple text-[var(--brand-blue)]" />
              </a>
            </div>
          </div>

          <div>
            {/* KPI Stats */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { val: "86.7", unit: "%", trend: "4.3%", label: "Prediction Accuracy" },
                { val: "24.3", unit: "%", trend: "3.1%", label: "Avg. Commute Reduction" },
                { val: "4", unit: "", trend: "1", label: "High-Risk Zones Flagged" },
              ].map((s) => (
                <div key={s.label} className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.7)] rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[#0f172a]">{s.val}</span>
                    {s.unit && <span className="text-xs font-semibold text-[#64748b]">{s.unit}</span>}
                    <span className="text-[10px] font-bold text-[#22c55e] ml-auto flex items-center gap-0.5">
                      <i className="fa-solid fa-caret-up" /> {s.trend}
                    </span>
                  </div>
                  <div className="text-[9px] font-bold text-[#64748b] uppercase mt-3 tracking-[0.3px] leading-tight">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Powered by */}
            <div className="flex items-center gap-3.5 mt-5 text-[11px] text-[#64748b] font-medium">
              <span>Powered by</span>
              <span className="font-bold text-[#334155]"><i className="fa-solid fa-sparkles text-[#2563eb] mr-1" />Gemini</span>
              <span className="font-bold text-[#334155]"><i className="fa-solid fa-map text-black mr-1" />mapbox</span>
              <span className="font-bold text-[#334155]"><i className="fa-solid fa-cloud text-[#ea580c] mr-1" />OpenWeather</span>
              <span className="font-bold text-[#334155]"><i className="fa-solid fa-bolt text-[#10b981] mr-1" />Supabase</span>
            </div>
          </div>
        </div>

        {/* ─── MAP SANDBOX ─── */}
        <div className="relative rounded-[20px] border border-[rgba(255,255,255,0.5)] overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.02)] bg-[#c9e3f1] bg-[radial-gradient(circle_at_40%_20%,rgba(255,255,255,0.6)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(14,165,233,0.15)_0%,transparent_60%)] min-h-[500px] lg:min-h-0">

          {/* Top bar */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <div className="flex flex-col gap-2.5 w-[260px]">
              <div className="bg-[rgba(15,23,42,0.6)] backdrop-blur-[10px] text-white px-3 py-1.5 rounded-[20px] text-[10px] font-bold uppercase tracking-[0.5px] inline-flex items-center gap-1.5 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
                Live <span className="opacity-50 mx-1">•</span> Updated 4 min ago
              </div>
              <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.6)] rounded-[30px] px-4 py-2.5 flex items-center gap-2.5 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                <i className="fa-solid fa-magnifying-glass text-[var(--text-muted)] text-[13px]" />
                <input type="text" placeholder="Search location..." className="bg-transparent border-none outline-none text-[13px] font-medium w-full text-[var(--text-main)]" readOnly />
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-[15px] rounded-2xl p-4 w-[200px] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-[rgba(255,255,255,0.7)]">
              {[
                { label: "Rainfall", val: "18.5 mm/h", cls: "text-[var(--brand-blue)]" },
                { label: "3H Forecast", val: "32 mm", cls: "text-[#1e293b]" },
                { label: "Severe Zones", val: "2", cls: "text-[var(--risk-severe)]" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">{r.label}</span>
                  <span className={`text-[13px] font-bold ${r.cls}`}>{r.val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-[rgba(0,0,0,0.05)]">
                <span className="text-[10px] font-bold text-[#64748b] uppercase">Status</span>
                <span className="text-[15px] font-extrabold text-[var(--risk-severe)]">Alert</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute right-4 top-[190px] z-10 bg-[rgba(255,255,255,0.85)] backdrop-blur-[10px] rounded-[14px] p-3.5 w-[130px] shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-[rgba(255,255,255,0.7)]">
            <div className="text-[9px] font-extrabold uppercase text-[#64748b] mb-2 tracking-[0.3px]">Risk Level</div>
            {[
              { color: "var(--risk-severe)", label: "Severe" },
              { color: "var(--risk-high)", label: "High" },
              { color: "var(--risk-medium)", label: "Medium" },
              { color: "var(--risk-low)", label: "Low" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-[11px] font-semibold text-[#334155] mb-1.5 last:mb-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Zone Nodes */}
          <MapNode top="120px" left="52%" color="var(--risk-high)" score={68} name="Hebbal" />
          <MapNode top="180px" left="72%" color="var(--risk-medium)" score={44} name="KR Puram" />
          <MapNode top="270px" left="38%" color="var(--risk-high)" score={71} name="Koramangala" />
          <MapNode top="300px" left="65%" color="var(--risk-medium)" score={47} name="Marathahalli" />
          <MapNode top="340px" left="50%" color="var(--risk-severe)" score={92} name="Silk Board" size="lg" />
          <MapNode top="460px" left="62%" color="var(--risk-severe)" score={88} name="Bellandur" />
          <MapNode top="440px" left="80%" color="var(--risk-high)" score={51} name="Sarjapur Rd" />

          {/* City labels */}
          <span className="absolute top-[60px] right-[80px] text-[11px] font-semibold text-[#475569] opacity-60 uppercase">Yelahanka</span>
          <span className="absolute top-[230px] left-[46%] text-[11px] font-semibold text-[#475569] opacity-60 uppercase">Indiranagar</span>
          <span className="absolute top-[430px] left-[28%] text-[11px] font-semibold text-[#475569] opacity-60 uppercase">Jayanagar</span>
          <span className="absolute bottom-[30px] right-[120px] text-[11px] font-semibold text-[#475569] opacity-60 uppercase">Electronic City</span>
          <span className="absolute top-[315px] right-[55px] text-[10px] font-bold text-[#0369a1] opacity-40 uppercase -rotate-[5deg]">Bellandur Lake</span>

          {/* Zoom controls */}
          <div className="absolute bottom-5 right-4 flex flex-col gap-1.5">
            {["fa-plus", "fa-minus", "fa-location-crosshairs"].map((ic) => (
              <div key={ic} className="w-9 h-9 bg-white border border-[rgba(0,0,0,0.05)] rounded-lg flex items-center justify-center text-sm text-[var(--text-muted)] shadow-[0_4px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:text-[var(--text-main)]">
                <i className={`fa-solid ${ic}`} />
              </div>
            ))}
          </div>

          {/* Mapbox attribution */}
          <div className="absolute bottom-2.5 left-3 text-[10px] text-[rgba(15,23,42,0.5)] flex items-center gap-0.5 font-bold">
            <i className="fa-solid fa-map-pin" /> mapbox <span className="font-normal opacity-60">© OSM</span>
          </div>
        </div>
      </main>

      {/* ═══ FEATURES ROW ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2.5">
        {[
          { icon: "fa-cloud-sun-rain", bg: "bg-[#e0f2fe]", color: "text-[#0284c7]", title: "Live Weather", desc: "Real-time rainfall and forecasts from OpenWeatherMap." },
          { icon: "fa-shield-heart", bg: "bg-[#ffeded]", color: "text-[#ff6b35]", title: "AI Risk Engine", desc: "Gemini AI scores flood-risk zones using live data and historical patterns." },
          { icon: "fa-route", bg: "bg-[#f3e8ff]", color: "text-[#a855f7]", title: "Smart Routes", desc: "AI ranks routes to avoid high-risk zones and save your time." },
          { icon: "fa-bell", bg: "bg-[#dcfce7]", color: "text-[#22c55e]", title: "Early Alerts", desc: "Get notified before flooding turns into gridlock." },
        ].map((f) => (
          <div key={f.title} className="bg-[rgba(255,255,255,0.45)] border border-[rgba(255,255,255,0.6)] rounded-[18px] p-5 flex gap-4 items-start hover:bg-[rgba(255,255,255,0.6)] transition-colors">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${f.bg} ${f.color}`}>
              <i className={`fa-solid ${f.icon}`} />
            </div>
            <div>
              <h4 className="text-[11px] font-extrabold uppercase text-[#0f172a] tracking-[0.3px] mb-1">{f.title}</h4>
              <p className="text-xs leading-snug text-[var(--text-muted)]">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ SCROLL INDICATOR ═══ */}
      <div className="text-center text-[9px] font-bold uppercase text-[#64748b] tracking-[1px] mt-1 flex justify-center items-center gap-1.5">
        <i className="fa-solid fa-computer-mouse text-[11px]" /> Scroll to explore
      </div>
    </div>
  );
}

function MapNode({ top, left, color, score, name, size }: { top: string; left: string; color: string; score: number; name: string; size?: string }) {
  const dim = size === "lg" ? "w-[52px] h-[52px] text-base" : "w-[44px] h-[44px] text-sm";
  return (
    <div className="absolute flex flex-col items-center z-[5] cursor-pointer" style={{ top, left, transform: "translateX(-50%)" }}>
      <div
        className={`${dim} rounded-full flex items-center justify-center font-extrabold text-white relative shadow-[0_4px_12px_rgba(0,0,0,0.15)]`}
        style={{ background: color }}
      >
        {score}
        <span
          className="absolute inset-0 rounded-full opacity-40"
          style={{ background: color, animation: "pulse-effect 2s infinite ease-in-out" }}
        />
      </div>
      <span className={`bg-[rgba(255,255,255,0.9)] px-2 py-0.5 rounded text-[9px] font-extrabold uppercase mt-1 shadow-[0_2px_6px_rgba(0,0,0,0.05)] tracking-[0.2px] ${name === "Silk Board" ? "text-[var(--risk-severe)] font-black" : ""}`}>
        {name}
      </span>
    </div>
  );
}
