"use client";

import { useState, useEffect, useRef } from "react";
import { PlannerMap, FloodZone, FALLBACK_ZONES, RoutePath } from "@/components/planner-map";
import { useWeather } from "@/lib/useWeather";
import { AnalysisAnimation } from "@/components/analysis-animation";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import "./planner.css";

interface RankedRoute {
  route_id: string;
  rank: number;
  adjusted_duration_min: number;
  risk_zones_crossed: string[];
  verdict: "Recommended" | "Use with caution" | "Avoid";
  explanation: string;
  path?: { lat: number; lng: number }[];
  distance_km?: number;
  duration_min?: number;
}

interface RankResult {
  recommended_route_id: string;
  routes: RankedRoute[];
  summary: string;
  meta?: any;
}

const BENGALURU_LOCATIONS = [
  "Koramangala, Bengaluru",
  "Whitefield, Bengaluru",
  "Silk Board Junction, Bengaluru",
  "Bellandur ORR, Bengaluru",
  "Hebbal Flyover, Bengaluru",
  "Manyata Tech Park, Bengaluru",
  "Majestic, Bengaluru",
  "Indiranagar, Bengaluru",
  "Electronic City, Bengaluru",
  "HSR Layout, Bengaluru",
  "Marathahalli, Bengaluru",
  "Malleswaram, Bengaluru",
  "Jayanagar, Bengaluru",
  "MG Road, Bengaluru",
  "Bannerghatta Road, Bengaluru",
];

function AutocompleteLoader({ 
  onServiceLoaded
}: { 
  onServiceLoaded: (service: any) => void;
}) {
  const placesLibrary = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLibrary) return;
    const service = new placesLibrary.AutocompleteService();
    onServiceLoaded(service);
  }, [placesLibrary, onServiceLoaded]);

  return null;
}

function PlannerContent() {
  const [origin, setOrigin] = useState("Koramangala, Bengaluru");
  const [destination, setDestination] = useState("Whitefield, Bengaluru");
  const [showOriginSug, setShowOriginSug] = useState(false);
  const [showDestSug, setShowDestSug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RankResult | null>(null);
  const [zones, setZones] = useState<FloodZone[]>(FALLBACK_ZONES);
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [navigationMode, setNavigationMode] = useState(false);
  const [navRouteId, setNavRouteId] = useState<string | null>(null);
  
  // Synchronization states
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [pendingResult, setPendingResult] = useState<RankResult | null>(null);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [analysisKey, setAnalysisKey] = useState(0);
  
  // Expanded view state
  const [isExpandedView, setIsExpandedView] = useState(false);

  const pendingResultRef = useRef<RankResult | null>(null);
  const weather = useWeather();

  const severeZonesCount = zones.filter(z => z.level === "severe").length;
  const alertsCount = zones.filter(z => z.level === "severe" || z.level === "high").length;

  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [autocompleteService, setAutocompleteService] = useState<any>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const fetchSuggestions = (query: string, type: "origin" | "destination", serviceInstance = autocompleteService) => {
    if (!query) {
      if (type === "origin") setOriginSuggestions([]);
      else setDestSuggestions([]);
      return;
    }

    if (serviceInstance) {
      serviceInstance.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: "in" },
        },
        (predictions: any, status: any) => {
          if (status === "OK" && predictions) {
            const list = predictions.map((p: any) => p.description);
            if (type === "origin") setOriginSuggestions(list);
            else setDestSuggestions(list);
          }
        }
      );
    } else {
      const filtered = BENGALURU_LOCATIONS.filter(loc =>
        loc.toLowerCase().includes(query.toLowerCase())
      );
      if (type === "origin") setOriginSuggestions(filtered);
      else setDestSuggestions(filtered);
    }
  };

  useEffect(() => {
    fetchSuggestions(origin, "origin");
  }, [origin, autocompleteService]);

  useEffect(() => {
    fetchSuggestions(destination, "destination");
  }, [destination, autocompleteService]);

  useEffect(() => {
    async function loadZones() {
      try {
        const { data, error } = await supabase
          .from("flood_zones")
          .select("zone_id, zone_name, lat, lng, ground_truth_risk_level, historical_incidents_per_season, drainage_notes, ward_number");
        
        if (error) {
          console.error("Error loading flood zones from Supabase:", error);
          return;
        }

        if (data && data.length > 0) {
          const mapped: FloodZone[] = data.map((z) => {
            const level = (z.ground_truth_risk_level || "low").toLowerCase() as FloodZone["level"];
            let score = 20;
            if (level === "severe") score = 90;
            else if (level === "high") score = 70;
            else if (level === "medium") score = 45;

            return {
              id: z.zone_id,
              name: z.zone_name.replace(" Junction", "").replace(" Area", "").replace(" stretch", ""),
              lat: z.lat,
              lng: z.lng,
              level,
              score,
              ward: z.ward_number || undefined,
              incidents: z.historical_incidents_per_season,
              notes: z.drainage_notes || undefined
            };
          });
          setZones(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch flood zones:", err);
      }
    }
    loadZones();
  }, []);

  useEffect(() => {
    async function updateTraffic() {
      try {
        const res = await fetch("/api/traffic-status");
        const data = await res.json();
        if (data.success && data.traffic) {
          setZones((prevZones) =>
            prevZones.map((pz) => {
              const match = data.traffic.find((t: any) => t.zone_id === pz.id);
              if (match) {
                return {
                  ...pz,
                  level: match.level,
                  score: match.score,
                };
              }
              return pz;
            })
          );
        }
      } catch (err) {
        console.error("Failed to poll traffic status:", err);
      }
    }

    // Initial load after 1.5 seconds
    const initialTimer = setTimeout(updateTraffic, 1500);

    // Poll every 2 minutes
    const interval = setInterval(updateTraffic, 120000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const analyze = async () => {
    if (!origin || !destination) return;
    
    // Reset states for a fresh run
    setResult(null);
    setPendingResult(null);
    pendingResultRef.current = null;
    setAnimationCompleted(false);
    setShowAnalysis(true);
    setLoading(true);
    setAnalysisKey((prev) => prev + 1);

    try {
      const res = await fetch("/api/rank-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination }),
      });
      const data = await res.json();
      if (!data.error) {
        setPendingResult(data);
        pendingResultRef.current = data;
        
        // If the animation already completed, show results immediately
        if (animationCompleted) {
          setResult(data);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    setAnimationCompleted(true);
    if (pendingResultRef.current) {
      setResult(pendingResultRef.current);
      setLoading(false);
    }
  };

  // Scroll to bottom when final results are populated
  useEffect(() => {
    if (result) {
      const container = document.querySelector(".panel-results-area");
      if (container) {
        setTimeout(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }, 150);
      }
    }
  }, [result]);

  const getRouteLabel = (id: string) => id === "route_a" ? "A" : id === "route_b" ? "B" : "C";
  const getVerdictStyle = (v: string) => {
    if (v === "Recommended") return { bg: "var(--green-bg)", border: "#bbf7d0", color: "var(--green-success)", icon: "✓" };
    if (v === "Avoid") return { bg: "var(--red-bg)", border: "#fecaca", color: "var(--red-danger)", icon: "❌" };
    return { bg: "var(--yellow-bg)", border: "#fef08a", color: "#d97706", icon: "⚠️" };
  };

  // Sidebar controls render helper to preserve data across states
  const renderInputsCard = () => (
    <div className="route-inputs-card">
      <div className="route-header-row">
        <h3>Route Planner</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-swap" onClick={() => { setOrigin(destination); setDestination(origin); }} title="Swap routes">
            <span className="material-symbols-outlined">swap_vert</span>
          </button>
          {!isExpandedView ? (
            <button className="btn-expand" onClick={() => setIsExpandedView(true)} title="Expand view">
              <span className="material-symbols-outlined">open_in_full</span>
            </button>
          ) : (
            <button className="btn-expand" onClick={() => setIsExpandedView(false)} title="Collapse view">
              <span className="material-symbols-outlined">close_fullscreen</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="input-field" style={{ position: "relative" }}>
        <label>Origin</label>
        <div className="input-box">
          <span className="dot-icon" style={{ background: "var(--green-success)" }} />
          <input 
            value={origin} 
            onChange={(e) => {
              setOrigin(e.target.value);
              setShowOriginSug(true);
            }} 
            onFocus={() => setShowOriginSug(true)}
            onBlur={() => setTimeout(() => setShowOriginSug(false), 200)}
            placeholder="Origin" 
          />
        </div>
        {showOriginSug && originSuggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {originSuggestions.map((loc) => (
              <div 
                key={loc} 
                className="suggestion-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOrigin(loc);
                  setShowOriginSug(false);
                }}
              >
                <span className="material-symbols-outlined suggestion-icon">location_on</span>
                <span>{loc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="input-field" style={{ position: "relative" }}>
        <label>Destination</label>
        <div className="input-box">
          <span className="dot-icon" style={{ background: "var(--red-danger)" }} />
          <input 
            value={destination} 
            onChange={(e) => {
              setDestination(e.target.value);
              setShowDestSug(true);
            }} 
            onFocus={() => setShowDestSug(true)}
            onBlur={() => setTimeout(() => setShowDestSug(false), 200)}
            placeholder="Destination" 
          />
        </div>
        {showDestSug && destSuggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {destSuggestions.map((loc) => (
              <div 
                key={loc} 
                className="suggestion-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setDestination(loc);
                  setShowDestSug(false);
                }}
              >
                <span className="material-symbols-outlined suggestion-icon">location_on</span>
                <span>{loc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="btn-analyze-vertical" onClick={analyze} disabled={loading}>
        {loading ? "Analyzing..." : "✨ Analyze Route"}
      </button>
    </div>
  );

  const renderResultsArea = () => (
    <div className="panel-results-area">
      {!showAnalysis && !loading && (
        <div className="empty-state">
          <span className="material-symbols-outlined">route</span>
          <p>Enter origin & destination, then click <strong>Analyze Route</strong> to get AI-powered safe routing recommendations.</p>
        </div>
      )}

      {showAnalysis && (
        <AnalysisAnimation key={analysisKey} onComplete={handleAnimationComplete} pendingResult={pendingResult} />
      )}

      {result && (
        <>
          {/* AI Recommendation */}
          <div className="ai-rec-box" style={{ marginTop: 16 }}>
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
            <div className="all-routes-header" style={{ marginTop: 16 }}>
              <span>All Route Options</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: "normal" }}>Sort by: <strong>Recommended</strong></span>
            </div>
            {result.routes.sort((a, b) => a.rank - b.rank).map((route) => {
              const s = getVerdictStyle(route.verdict);
              const label = getRouteLabel(route.route_id);
              const isRec = route.route_id === result.recommended_route_id;
              const isSelected = route.route_id === selectedRouteId;
              return (
                <div 
                  key={route.route_id} 
                  className={`route-card ${isRec ? "selected" : ""} ${isSelected ? "highlighted" : ""}`} 
                  style={{ backgroundColor: s.bg, borderColor: isSelected ? s.color : s.border, cursor: "pointer" }}
                  onClick={() => setSelectedRouteId(route.route_id)}
                >
                  <div className="card-left">
                    <div className={`letter-badge ${label}`}>{label}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span className="card-status-tag" style={{ color: s.color }}>{s.icon} {route.verdict}</span>
                        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)" }}>
                          {route.distance_km ? <span>{route.distance_km} km</span> : null}
                          <span>{Math.round(route.adjusted_duration_min)} min</span>
                        </div>
                      </div>
                      <div className="card-subtext" style={{ marginTop: 6, lineHeight: 1.5 }}>{route.explanation}</div>
                      {route.risk_zones_crossed.length > 0 && (
                        <div className="card-subtext" style={{ color: s.color, fontWeight: 500, marginTop: 4 }}>
                          {route.risk_zones_crossed.length} risk zone{route.risk_zones_crossed.length > 1 ? "s" : ""} on route
                        </div>
                      )}
                      <button 
                        className="btn-start-ride" 
                        style={{ 
                          marginTop: 10, 
                          background: isRec ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                          color: "#fff", 
                          border: "none", 
                          padding: "8px 16px", 
                          borderRadius: 8, 
                          fontWeight: 700, 
                          fontSize: 12, 
                          cursor: "pointer", 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 6,
                          fontFamily: "inherit",
                          boxShadow: isRec ? "0 4px 12px rgba(16,185,129,0.3)" : "0 4px 12px rgba(59,130,246,0.2)",
                          transition: "all 0.2s ease",
                          width: "fit-content"
                        }}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setNavRouteId(route.route_id); 
                          setNavigationMode(true); 
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>navigation</span>
                        {isRec ? "Start Ride →" : "Navigate →"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="planner-page">
      {apiKey && <AutocompleteLoader onServiceLoaded={setAutocompleteService} />}
      {/* MAIN */}
      <div className="main-container">
        {/* MAP */}
        <div className="map-wrapper">
          <PlannerMap 
            zones={zones.length > 0 ? zones : undefined} 
            showTraffic={showTrafficLayer}
            routePaths={result ? result.routes.filter((r): r is RankedRoute & { path: { lat: number; lng: number }[] } => !!r.path && r.path.length > 0).map(r => ({ route_id: r.route_id, path: r.path!, verdict: r.verdict })) : []}
            selectedRouteId={selectedRouteId}
            onRouteSelect={(id) => setSelectedRouteId(id)}
          />

          {/* Map sidebar */}
          <div className="map-sidebar">
            <button className="sidebar-btn"><span className="material-symbols-outlined">layers</span>Layers</button>
            <button 
              className={`sidebar-btn ${showTrafficLayer ? "active" : ""}`}
              onClick={() => setShowTrafficLayer(!showTrafficLayer)}
            >
              <span className="material-symbols-outlined">traffic</span>Traffic
            </button>
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
          {renderInputsCard()}
          {renderResultsArea()}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bottom-bar">
        <div className="status-items-left">
          <div className="status-block"><div className="status-icon-box">🌧️</div><div className="status-info"><label>Live Rainfall</label><span className="status-value">{weather.current_mm_per_hour} mm/h</span></div></div>
          <div className="status-block"><div className="status-icon-box">⏱️</div><div className="status-info"><label>Next 3 Hours</label><span className="status-value">{weather.forecast_3h_mm} mm</span></div></div>
          <div className="status-block"><div className="status-icon-box">🛡️</div><div className="status-info"><label>Severe Zones</label><span className="status-value">{severeZonesCount} Active</span></div></div>
          <div className="status-block"><div className="status-icon-box">🔔</div><div className="status-info"><label>Alerts</label><span className="status-value">{alertsCount} Active</span></div></div>
        </div>
      </div>

      {/* EXPANDED MODAL OVERLAY */}
      <AnimatePresence>
        {isExpandedView && (
          <motion.div 
            className="planner-modal-backdrop" 
            onClick={() => setIsExpandedView(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div 
              className="planner-modal-content" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
            >
              <div className="modal-header">
                <h2>Route Safety Analysis</h2>
                <button className="btn-modal-close" onClick={() => setIsExpandedView(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="planner-modal-grid">
                {renderInputsCard()}
                {renderResultsArea()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVIGATION MODE OVERLAY */}
      <AnimatePresence>
        {navigationMode && navRouteId && result && (
          <motion.div 
            className="navigation-mode-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* The Fullscreen Map */}
            <div className="nav-map-container">
              <PlannerMap 
                zones={zones} 
                showTraffic={showTrafficLayer}
                routePaths={result.routes
                  .filter((r): r is RankedRoute & { path: { lat: number; lng: number }[] } => r.route_id === navRouteId && !!r.path && r.path.length > 0)
                  .map(r => ({ route_id: r.route_id, path: r.path!, verdict: r.verdict }))}
                selectedRouteId={navRouteId}
              />
            </div>

            {/* Top Banner (Exit, Title) */}
            <div className="nav-top-banner">
              <button className="btn-exit-nav" onClick={() => setNavigationMode(false)}>
                <span className="material-symbols-outlined">arrow_back</span>
                <span>Exit Navigation</span>
              </button>
              <div className="nav-title-text">
                <h2>Riding to {destination.split(",")[0]}</h2>
                <p>Origin: {origin.split(",")[0]}</p>
              </div>
            </div>

            {/* Bottom Nav Sheet */}
            <motion.div 
              className="nav-bottom-sheet"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {(() => {
                const route = result.routes.find(r => r.route_id === navRouteId);
                if (!route) return null;
                const label = getRouteLabel(route.route_id);
                const s = getVerdictStyle(route.verdict);
                return (
                  <>
                    <div className="nav-sheet-summary">
                      <div className="nav-sheet-time-dist">
                        <span className="nav-time">{Math.round(route.adjusted_duration_min)} min</span>
                        <span className="nav-dist">{route.distance_km ? `${route.distance_km} km` : ""}</span>
                      </div>
                      <div className="nav-status-indicator">
                        <span className="pulse-dot"></span>
                        <span>Live Navigation</span>
                      </div>
                    </div>

                    <div className="nav-sheet-reasoning">
                      <div className="reasoning-header">
                        <span className="material-symbols-outlined">psychology</span>
                        <h3>AI Safe Route Reasoning</h3>
                      </div>
                      <p className="reasoning-text">
                        {route.explanation}
                      </p>
                      {route.risk_zones_crossed.length > 0 ? (
                        <div className="nav-risk-warning" style={{ borderColor: s.color, color: s.color }}>
                          <span className="material-symbols-outlined">warning</span>
                          <span>Crosses {route.risk_zones_crossed.length} active flood risk zones. Drive with extreme caution.</span>
                        </div>
                      ) : (
                        <div className="nav-safe-success">
                          <span className="material-symbols-outlined">verified_user</span>
                          <span>This route is optimized to bypass all active flood risk zones and waterlogged corridors.</span>
                        </div>
                      )}
                    </div>

                    <div className="nav-action-row">
                      <div className="simulated-speed-card">
                        <div className="stat-label">Current Speed</div>
                        <div className="stat-value">35 km/h</div>
                      </div>
                      <div className="simulated-speed-card">
                        <div className="stat-label">Next Turn</div>
                        <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-blue)' }}>turn_right</span>
                          <span>200m</span>
                        </div>
                      </div>
                      <button className="btn-arrived" onClick={() => setNavigationMode(false)}>
                        Arrived
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PlannerPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <PlannerContent />;
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]}>
      <PlannerContent />
    </APIProvider>
  );
}
