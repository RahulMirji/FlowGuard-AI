"use client";

import { useWeather } from "@/lib/useWeather";
import { MapPanel } from "@/components/map-panel";
import "./landing.css";

export default function LandingPage() {
  const weather = useWeather();
  const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* ── HEADER ── */}
      <header className="land-header">
        <a href="/" className="land-logo">
          <div className="land-logo-icon"><i className="fa-solid fa-shield-halved" /></div>
          <div>
            <div className="land-logo-name">FLOWGUARD AI</div>
            <div className="land-logo-sub">Bengaluru Flood Intelligence</div>
          </div>
        </a>

        <nav className="land-nav">
          <a href="/planner">Planner</a>
          <a href="/assistant">Assistant</a>
          <a href="/dashboard">City Dashboard</a>
          <a href="/planner" style={{ color: "#0284c7" }}>Alerts</a>
        </nav>

        <a href="/planner" className="btn-plan">Plan a Route</a>
      </header>

      {/* ── HERO ── */}
      <main className="land-hero">
        {/* LEFT */}
        <div className="hero-left">
          <h1 className="hero-headline">
            Bengaluru floods.<br />
            <span className="orange">Your commute</span><br />
            doesn&apos;t.
          </h1>

          {/* LIVE CONDITIONS CARD */}
          <div className="live-card">
            <div className="live-card-header">
              <span className="live-card-title">Live Conditions</span>
              <span className="live-badge">
                <span className="live-dot" />LIVE
              </span>
            </div>
            <div className="live-card-row">
              <div className="live-metric">
                <div className="live-metric-val blue">{weather.current_mm_per_hour || "18.5"}</div>
                <div className="live-metric-label">mm/h Rainfall</div>
              </div>
              <div className="live-metric">
                <div className="live-metric-val">{weather.forecast_3h_mm || "32"}</div>
                <div className="live-metric-label">Forecast 3h</div>
              </div>
              <div className="live-metric">
                <div className="live-metric-val red">4</div>
                <div className="live-metric-label">Critical Zones</div>
              </div>
              <div className="live-metric">
                <div className="live-metric-val orange">{weather.temp || "26"}°</div>
                <div className="live-metric-label">Temp °C</div>
              </div>
            </div>
            <div className="live-card-ts">Last updated {now}</div>
          </div>

          {/* KPI ROW */}
          <div className="kpi-strip">
            <div className="kpi-chip">
              <div className="kpi-chip-icon blue"><i className="fa-solid fa-bullseye" /></div>
              <div>
                <div className="kpi-chip-val">86.7%</div>
                <div className="kpi-chip-label">Accuracy</div>
                <div className="kpi-chip-trend">▲4.3%</div>
              </div>
            </div>
            <div className="kpi-chip">
              <div className="kpi-chip-icon green"><i className="fa-solid fa-clock-rotate-left" /></div>
              <div>
                <div className="kpi-chip-val">24.3%</div>
                <div className="kpi-chip-label">Commute↓</div>
                <div className="kpi-chip-trend">▲3.1%</div>
              </div>
            </div>
            <div className="kpi-chip">
              <div className="kpi-chip-icon red"><i className="fa-solid fa-triangle-exclamation" /></div>
              <div>
                <div className="kpi-chip-val">4</div>
                <div className="kpi-chip-label">High-Risk</div>
                <div className="kpi-chip-trend">▲1</div>
              </div>
            </div>
            <div className="kpi-chip">
              <div className="kpi-chip-icon yellow"><i className="fa-solid fa-bell" /></div>
              <div>
                <div className="kpi-chip-val">22 min</div>
                <div className="kpi-chip-label">Early Alert</div>
                <div className="kpi-chip-trend">▲6 min</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — MAP */}
        <div className="hero-right">
          <div className="hero-map-wrap">
            <MapPanel />
          </div>
        </div>
      </main>
    </>
  );
}
