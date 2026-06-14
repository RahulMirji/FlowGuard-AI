"use client";

import { useState } from "react";
import { PlannerMap } from "@/components/planner-map";
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

const DUMMY_ROUTES = [
  { route_id: "route_a", duration_min: 55, distance_km: 18.9, path: [{ lat: 12.935, lng: 77.624 }, { lat: 12.917, lng: 77.623 }, { lat: 12.926, lng: 77.676 }, { lat: 12.956, lng: 77.701 }] },
  { route_id: "route_b", duration_min: 51, distance_km: 17.2, path: [{ lat: 12.935, lng: 77.624 }, { lat: 13.001, lng: 77.665 }, { lat: 12.999, lng: 77.687 }, { lat: 12.956, lng: 77.701 }] },
  { route_id: "route_c", duration_min: 48, distance_km: 16.5, path: [{ lat: 12.935, lng: 77.624 }, { lat: 12.917, lng: 77.623 }, { lat: 12.926, lng: 77.676 }, { lat: 12.934, lng: 77.678 }, { lat: 12.956, lng: 77.701 }] },
];

const label = (id: string) => id === "route_a" ? "A" : id === "route_b" ? "B" : "C";

const riskColor = (v: string) =>
  v === "Recommended" ? "var(--green)" : v === "Avoid" ? "var(--red)" : "var(--yellow)";

const riskText = (v: string) =>
  v === "Recommended" ? "Low" : v === "Avoid" ? "High" : "Moderate";

const riskScore: Record<string, string> = { route_a: "24/100", route_b: "18/100", route_c: "42/100" };

export default function PlannerPage() {
  const [origin, setOrigin] = useState("Koramangala");
  const [destination, setDestination] = useState("Whitefield");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RankResult | null>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rank-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routes: DUMMY_ROUTES, origin: origin + ", Bengaluru", destination: destination + ", Bengaluru" }),
      });
      const data = await res.json();
      if (!data.error) setResult(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const recRoute = result?.routes.find(r => r.route_id === result.recommended_route_id);

  return (
    <div className="planner-page">
      {/* TOP BAR */}
      <header className="planner-topbar">
        <a href="/" className="planner-logo">
          <div className="planner-logo-icon"><i className="fa-solid fa-shield-halved" /></div>
          <div className="planner-logo-name">FLOWGUARD AI</div>
        </a>
        <div className="planner-topbar-center">
          <div className="planner-topbar-title">Route Planner</div>
          <div className="planner-topbar-sub">AI-powered safe routing during monsoon</div>
        </div>
        <div className="live-pill">
          <span className="live-pill-dot" />Live
        </div>
      </header>

      {/* INPUT ROW */}
      <div className="planner-input-row">
        <div className="input-field">
          <span className="input-dot" style={{ background: "var(--green)" }} />
          <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="From" />
          {origin && <button className="clear-btn" onClick={() => setOrigin("")}>✕</button>}
        </div>
        <button className="swap-btn" onClick={() => { const t = origin; setOrigin(destination); setDestination(t); }}>
          <span className="material-symbols-outlined">swap_horiz</span>
        </button>
        <div className="input-field">
          <span className="input-dot" style={{ background: "var(--red)" }} />
          <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="To" />
          {destination && <button className="clear-btn" onClick={() => setDestination("")}>✕</button>}
        </div>
        <button className="btn-find-route" onClick={analyze} disabled={loading || !origin || !destination}>
          {loading ? "Analyzing…" : "Find Safe Route"}
        </button>
      </div>

      {/* MAIN */}
      <div className="planner-body">
        {/* MAP */}
        <div className="planner-map-area">
          <PlannerMap />
          <div className="planner-legend">
            <span className="legend-title">Risk Level</span>
            <div className="legend-items">
              <div className="legend-item"><div className="legend-dot" style={{ background: "#ef4444" }} />Severe</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: "#f97316" }} />High</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: "#f59e0b" }} />Medium</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: "#10b981" }} />Low</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="planner-right">
          {!result && !loading && (
            <div className="planner-empty">
              <span className="material-symbols-outlined">route</span>
              <p>Enter your origin and destination, then click <strong>Find Safe Route</strong> to get AI-powered flood-safe routing.</p>
            </div>
          )}

          {loading && (
            <div className="planner-loading">
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28 }} />
              <p>Analyzing flood risk zones…</p>
            </div>
          )}

          {result && recRoute && (
            <>
              {/* AI RECOMMENDATION */}
              <div className="ai-rec-section">
                <div className="ai-rec-header">
                  <span className="material-symbols-outlined">psychology</span>
                  AI RECOMMENDATION
                </div>
                <div className="ai-rec-badge">✓ Route {label(result.recommended_route_id)} RECOMMENDED</div>
                <div className="ai-rec-time">{Math.round(recRoute.adjusted_duration_min)}<span> min</span></div>
                <div className="ai-rec-meta">
                  17.2 km &bull; ETA {(() => {
                    const d = new Date(); d.setMinutes(d.getMinutes() + Math.round(recRoute.adjusted_duration_min));
                    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                  })()}
                </div>
                <div className="ai-rec-explanation">{recRoute.explanation || result.summary}</div>
                <div className="ai-metrics-grid">
                  <div className="ai-metric">
                    <div className="ai-metric-val">{riskScore[result.recommended_route_id] || "24/100"}</div>
                    <div className="ai-metric-label">Avoids Score</div>
                  </div>
                  <div className="ai-metric">
                    <div className="ai-metric-val" style={{ color: riskColor(recRoute.verdict) }}>
                      {riskText(recRoute.verdict)}
                    </div>
                    <div className="ai-metric-label">Flood Risk</div>
                  </div>
                  <div className="ai-metric">
                    <div className="ai-metric-val">Moderate</div>
                    <div className="ai-metric-label">Traffic</div>
                  </div>
                  <div className="ai-metric">
                    <div className="ai-metric-val">+8 min</div>
                    <div className="ai-metric-label">Est. Delay</div>
                  </div>
                </div>
              </div>

              {/* ROUTE CARDS */}
              <div className="routes-section">
                <div className="routes-section-title">All Route Options</div>
                {result.routes.sort((a, b) => a.rank - b.rank).map(route => {
                  const lbl = label(route.route_id);
                  const isRec = route.route_id === result.recommended_route_id;
                  return (
                    <div key={route.route_id} className={`route-card ${isRec ? "rec" : ""}`}>
                      <div className="route-card-left">
                        <div className={`route-letter ${lbl}`}>{lbl}</div>
                        <div>
                          <div className="route-time">{Math.round(route.adjusted_duration_min)}<span> min</span></div>
                          <div className="route-risk" style={{ color: riskColor(route.verdict) }}>
                            Risk {riskScore[route.route_id] || "–"}
                          </div>
                          <div className="route-warn">
                            {route.risk_zones_crossed.length > 0
                              ? `${route.risk_zones_crossed.length} risk zone(s) on route`
                              : route.verdict}
                          </div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined route-chevron">chevron_right</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
