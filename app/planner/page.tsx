"use client";

import { useState } from "react";
import { PlannerMap } from "@/components/planner-map";
import { useWeather } from "@/lib/useWeather";
import { AnalysisAnimation } from "@/components/analysis-animation";
import "./planner.css";

interface RankedRoute {
  route_id: string;
  rank: number;
  adjusted_duration_min: number;
  risk_zones_crossed: string[];
  verdict: "Recommended" | "Use with caution" | "Avoid";
  explanation: string;
}

interface RankResult {
  recommended_route_id: string;
  routes: RankedRoute[];
  summary: string;
}

export default function PlannerPage() {
  const [origin, setOrigin] = useState("Koramangala, Bengaluru");
  const [destination, setDestination] = useState("Whitefield, Bengaluru");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RankResult | null>(null);
  const weather = useWeather();

  const analyze = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    try {
      const routes = [
        { route_id: "route_a", duration_min: 55, distance_km: 18.9, path: [{ lat: 12.935, lng: 77.624 }, { lat: 12.917, lng: 77.623 }, { lat: 12.926, lng: 77.676 }, { lat: 12.956, lng: 77.701 }] },
        { route_id: "route_b", duration_min: 51, distance_km: 17.2, path: [{ lat: 12.935, lng: 77.624 }, { lat: 13.001, lng: 77.665 }, { lat: 12.999, lng: 77.687 }, { lat: 12.956, lng: 77.701 }] },
        { route_id: "route_c", duration_min: 48, distance_km: 16.5, path: [{ lat: 12.935, lng: 77.624 }, { lat: 12.917, lng: 77.623 }, { lat: 12.926, lng: 77.676 }, { lat: 12.934, lng: 77.678 }, { lat: 12.956, lng: 77.701 }] },
      ];
      const res = await fetch("/api/rank-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routes, origin, destination }),
      });
      const data = await res.json();
      if (!data.error) setResult(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const getRouteLabel = (id: string) => id === "route_a" ? "A" : id === "route_b" ? "B" : "C";
  const getVerdictStyle = (v: string) => {
    if (v === "Recommended") return { bg: "var(--green-bg)", border: "#bbf7d0", color: "var(--green-success)", icon: "✓" };
    if (v === "Avoid") return { bg: "var(--red-bg)", border: "#fecaca", color: "var(--red-danger)", icon: "❌" };
    return { bg: "var(--yellow-bg)", border: "#fef08a", color: "#d97706", icon: "⚠️" };
  };

  return (
    <div className="planner-page">
      {/* HEADER */}
      <header className="planner-nav">
        <div className="logo-area">
          <div className="logo-icon">🛡️</div>
          <div className="logo-text"><h1>FLOWGUARD AI</h1><span>Bengaluru Flood Intelligence</span></div>
        </div>
        <nav>
          <a href="/planner" className="active"><span className="material-symbols-outlined">map</span> Planner</a>
          <a href="/assistant"><span className="material-symbols-outlined">smart_toy</span> Assistant</a>
          <a href="/dashboard"><span className="material-symbols-outlined">dashboard</span> City Dashboard</a>
        </nav>
        <div className="header-right">
          <div className="live-rain-widget">⛈️ <strong>{weather.current_mm_per_hour} mm/h</strong> <span className="live-dot" /> Live Rainfall</div>
        </div>
      </header>

      {/* MAIN */}
      <div className="main-container">
        {/* MAP */}
        <div className="map-wrapper">
          <PlannerMap />

          {/* Routing overlay */}
          <div className="routing-overlay">
            <div className="search-inputs">
              <div className="input-box">
                <span className="dot-icon" style={{ background: "var(--green-success)" }} />
                <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origin" />
              </div>
              <span className="material-symbols-outlined swap-icon">swap_horiz</span>
              <div className="input-box">
                <span className="dot-icon" style={{ background: "var(--red-danger)" }} />
                <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination" />
              </div>
            </div>
            <button className="btn-analyze" onClick={analyze} disabled={loading}>
              {loading ? "Analyzing..." : "✨ Analyze Route"}
            </button>
          </div>

          {/* Map sidebar */}
          <div className="map-sidebar">
            <button className="sidebar-btn"><span className="material-symbols-outlined">layers</span>Layers</button>
            <button className="sidebar-btn"><span className="material-symbols-outlined">traffic</span>Traffic</button>
            <button className="sidebar-btn active"><span className="material-symbols-outlined">warning</span>Flood</button>
          </div>

          {/* Legend */}
          <div className="legend-overlay">
            <span>Flood Risk Level</span>
            <div className="legend-items">
              <div className="legend-item"><span className="dot-icon" style={{ background: "var(--red-danger)" }} /> Severe</div>
              <div className="legend-item"><span className="dot-icon" style={{ background: "var(--primary-orange)" }} /> High</div>
              <div className="legend-item"><span className="dot-icon" style={{ background: "var(--yellow-warning)" }} /> Medium</div>
              <div className="legend-item"><span className="dot-icon" style={{ background: "var(--green-success)" }} /> Low</div>
            </div>
          </div>

          {/* Map controls */}
          <div className="map-controls-right">
            <button className="map-ctrl-btn">+</button>
            <button className="map-ctrl-btn">-</button>
            <button className="map-ctrl-btn">🎯</button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          {!result && !loading && (
            <div className="empty-state">
              <span className="material-symbols-outlined">route</span>
              <p>Enter origin & destination, then click <strong>Analyze Route</strong> to get AI-powered safe routing recommendations.</p>
            </div>
          )}

          {loading && (
            <AnalysisAnimation />
          )}

          {result && (
            <>
              {/* AI Recommendation */}
              <div className="ai-rec-box">
                <div className="ai-header"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>psychology</span> AI Recommendation</div>
                <div className="route-title-row">
                  <div>
                    <div className="route-name" style={{ color: "#15803d" }}>
                      Route {getRouteLabel(result.recommended_route_id)}
                    </div>
                    <div className="route-meta-sub">{result.summary}</div>
                  </div>
                  <div className="route-eta-big" style={{ color: "#15803d" }}>
                    {Math.round(result.routes.find(r => r.route_id === result.recommended_route_id)?.adjusted_duration_min || 0)} <span>min</span>
                  </div>
                </div>
              </div>

              {/* Route cards */}
              <div>
                <div className="all-routes-header">
                  <span>All Route Options</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: "normal" }}>Sort by: <strong>Recommended</strong></span>
                </div>
                {result.routes.sort((a, b) => a.rank - b.rank).map((route) => {
                  const s = getVerdictStyle(route.verdict);
                  const label = getRouteLabel(route.route_id);
                  const isRec = route.route_id === result.recommended_route_id;
                  return (
                    <div key={route.route_id} className={`route-card ${isRec ? "selected" : ""}`} style={{ backgroundColor: s.bg, borderColor: s.border }}>
                      <div className="card-left">
                        <div className={`letter-badge ${label}`}>{label}</div>
                        <div>
                          <span className="card-status-tag" style={{ color: s.color }}>{s.icon} {route.verdict}</span>
                          <div className="card-time">{Math.round(route.adjusted_duration_min)} <span>min</span></div>
                          <div className="card-subtext">{route.explanation}</div>
                          {route.risk_zones_crossed.length > 0 && (
                            <div className="card-subtext" style={{ color: s.color, fontWeight: 500, marginTop: 4 }}>
                              {route.risk_zones_crossed.length} risk zone{route.risk_zones_crossed.length > 1 ? "s" : ""} on route
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bottom-bar">
        <div className="status-items-left">
          <div className="status-block"><div className="status-icon-box">🌧️</div><div className="status-info"><label>Live Rainfall</label><span className="status-value">{weather.current_mm_per_hour} mm/h</span></div></div>
          <div className="status-block"><div className="status-icon-box">⏱️</div><div className="status-info"><label>Next 3 Hours</label><span className="status-value">{weather.forecast_3h_mm} mm</span></div></div>
          <div className="status-block"><div className="status-icon-box">🛡️</div><div className="status-info"><label>Severe Zones</label><span className="status-value">2 Active</span></div></div>
          <div className="status-block"><div className="status-icon-box">🔔</div><div className="status-info"><label>Alerts</label><span className="status-value">3 Active</span></div></div>
        </div>
        <div className="alert-toast-banner">
          <span>🔊 Stay updated: Enable notifications for real-time alerts</span>
          <button className="btn-alert-action">🔔 Enable Alerts</button>
        </div>
      </div>
    </div>
  );
}
