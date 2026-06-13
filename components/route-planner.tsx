"use client";

import { useState } from "react";

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

export function RoutePlanner() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RankResult | null>(null);
  const [error, setError] = useState("");

  const planRoute = async () => {
    if (!origin.trim() || !destination.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Mock routes (Google Directions API requires server-side call)
      const routes = [
        { route_id: "route_a", duration_min: 32, distance_km: 12.3, path: [{ lat: 12.935, lng: 77.624 }, { lat: 12.917, lng: 77.623 }, { lat: 12.956, lng: 77.701 }] },
        { route_id: "route_b", duration_min: 38, distance_km: 15.1, path: [{ lat: 12.935, lng: 77.624 }, { lat: 13.001, lng: 77.687 }, { lat: 12.956, lng: 77.701 }] },
        { route_id: "route_c", duration_min: 41, distance_km: 16.8, path: [{ lat: 12.935, lng: 77.624 }, { lat: 12.846, lng: 77.660 }, { lat: 12.956, lng: 77.701 }] },
      ];

      const res = await fetch("/api/rank-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routes, origin: origin + ", Bengaluru", destination: destination + ", Bengaluru" }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch {
      setError("Failed to plan route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="planner-content">
      <div className="route-form">
        <div className="form-field">
          <label><i className="fa-solid fa-location-dot" style={{ color: "#22c55e" }} /> Origin</label>
          <input type="text" placeholder="e.g. Koramangala" value={origin} onChange={(e) => setOrigin(e.target.value)} />
        </div>
        <div className="form-field">
          <label><i className="fa-solid fa-flag-checkered" style={{ color: "#ef4444" }} /> Destination</label>
          <input type="text" placeholder="e.g. Whitefield" value={destination} onChange={(e) => setDestination(e.target.value)} />
        </div>
        <button className="btn-plan" onClick={planRoute} disabled={loading || !origin || !destination}>
          {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Analyzing...</> : <><i className="fa-solid fa-route" /> Find Safe Route</>}
        </button>
      </div>

      {error && <div className="route-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}

      {result && (
        <div className="route-results">
          <div className="result-summary"><i className="fa-solid fa-lightbulb" /> {result.summary}</div>
          <div className="route-cards">
            {result.routes.sort((a, b) => a.rank - b.rank).map((route) => (
              <div key={route.route_id} className={`route-card ${route.verdict === "Recommended" ? "recommended" : route.verdict === "Avoid" ? "avoid" : ""}`}>
                <div className="route-card-header">
                  <span className={`verdict-badge ${route.verdict.toLowerCase().replace(/ /g, "-")}`}>
                    {route.verdict === "Recommended" && <i className="fa-solid fa-check" />}
                    {route.verdict === "Avoid" && <i className="fa-solid fa-xmark" />}
                    {route.verdict === "Use with caution" && <i className="fa-solid fa-triangle-exclamation" />}
                    {" "}{route.verdict}
                  </span>
                  <span className="route-duration">{Math.round(route.adjusted_duration_min)} min</span>
                </div>
                <p className="route-explanation">{route.explanation}</p>
                {route.risk_zones_crossed.length > 0 && (
                  <div className="risk-tags">
                    {route.risk_zones_crossed.map((z) => (
                      <span key={z} className="risk-tag"><i className="fa-solid fa-triangle-exclamation" /> {z.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
