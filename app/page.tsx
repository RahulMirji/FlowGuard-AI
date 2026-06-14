import "./landing.css";
import { MapPanel } from "@/components/map-panel";

export default function LandingPage() {
  return (
    <div className="dashboard-container">
      {/* ═══ HEADER ═══ */}
      <header>
        <div className="logo-area">
          <div className="logo-icon">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <div className="logo-text">
            <h1>FlowGuard <span>AI</span></h1>
            <p>Bengaluru Flood Intelligence</p>
          </div>
        </div>

        <div className="nav-center">
          <a href="/planner" className="nav-item"><i className="fa-solid fa-map-location-dot" /> Planner</a>
          <a href="/assistant" className="nav-item active"><i className="fa-solid fa-user-shield" /> Assistant</a>
          <a href="/dashboard" className="nav-item"><i className="fa-solid fa-chart-line" /> City Dashboard</a>
        </div>

        <div className="header-actions">
          <a href="/planner" className="btn-orange">Plan a Route <i className="fa-solid fa-arrow-right" /></a>
          <div className="live-rainfall-widget">
            <i className="fa-solid fa-cloud-showers-heavy" style={{ color: "#0284c7", fontSize: "18px" }} />
            <div className="weather-info">
              <div className="val">18.5 <span style={{ fontSize: "10px", fontWeight: 600 }}>mm/h</span></div>
              <div className="label"><span className="dot-live" /> Live Rainfall</div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ HERO SECTION ═══ */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="tag-monsoon">
            <span style={{ color: "#64748b", fontWeight: 500 }}>•</span> Bengaluru Flood Intelligence <span style={{ color: "#64748b", fontWeight: 500, margin: "0 4px" }}>•</span> Monsoon 2026
          </div>
          <h2>Bengaluru <span>floods.</span><br />Your commute doesn&apos;t have to.</h2>
          <p>FlowGuard AI tracks live rainfall, scores flood-risk across 15 chronic waterlogging hotspots, and routes you around them — <span>before</span> you hit the jam.</p>
          <div className="panel-actions">
            <a href="/planner" className="btn-orange" style={{ padding: "14px 28px" }}><i className="fa-solid fa-arrow-right" /> Plan a Route</a>
            <a href="/dashboard" className="btn-secondary">View City Dashboard <i className="fa-solid fa-chart-simple" style={{ color: "var(--brand-blue)" }} /></a>
          </div>
          <div className="brand-attribution">
            <span>Powered by</span>
            <span className="engine-name"><i className="fa-solid fa-sparkles" style={{ color: "#2563eb" }} /> Gemini</span>
            <span className="engine-name"><i className="fa-solid fa-map" style={{ color: "#000" }} /> mapbox</span>
            <span className="engine-name"><i className="fa-solid fa-cloud" style={{ color: "#ea580c" }} /> OpenWeather</span>
            <span className="engine-name"><i className="fa-solid fa-bolt" style={{ color: "#10b981" }} /> Supabase</span>
          </div>
        </div>

        {/* MAP */}
        <div className="map-sandbox">
          {/* Real Google Map layer */}
          <div className="map-real-layer">
            <MapPanel />
          </div>

          {/* Floating UI overlays */}
          <div className="map-top-bar">
            <div className="search-and-status">
              <div className="map-live-status">
                <span className="dot-live" /> Live <span style={{ opacity: 0.5, margin: "0 4px" }}>•</span> Updated 4 min ago
              </div>
              <div className="map-search-box">
                <i className="fa-solid fa-magnifying-glass" />
                <input type="text" placeholder="Search location..." readOnly />
              </div>
            </div>
            <div className="map-right-stats">
              <div className="map-stat-item"><span className="m-label">Rainfall</span><span className="m-val blue">18.5 mm/h</span></div>
              <div className="map-stat-item"><span className="m-label">3H Forecast</span><span className="m-val" style={{ color: "#1e293b" }}>32 mm</span></div>
              <div className="map-stat-item"><span className="m-label">Severe Zones</span><span className="m-val" style={{ color: "var(--risk-severe)" }}>2</span></div>
              <div className="map-stat-item"><span className="m-label">Status</span><span className="status-alert-tag">Alert</span></div>
            </div>
          </div>

          <div className="legend-box">
            <div className="legend-title">Risk Level</div>
            <div className="legend-row"><div className="legend-dot" style={{ background: "var(--risk-severe)" }} /> Severe</div>
            <div className="legend-row"><div className="legend-dot" style={{ background: "var(--risk-high)" }} /> High</div>
            <div className="legend-row"><div className="legend-dot" style={{ background: "var(--risk-medium)" }} /> Medium</div>
            <div className="legend-row"><div className="legend-dot" style={{ background: "var(--risk-low)" }} /> Low</div>
          </div>

          <div className="mapbox-attribution">
            <i className="fa-solid fa-location-dot" /> Google Maps 3D
          </div>
        </div>
      </section>

      {/* ═══ KPI SECTION ═══ */}
      <section className="kpi-section">
        <div className="kpi-section-header">
          <h3>City Impact Metrics</h3>
          <p>Real-time performance indicators powered by AI analysis</p>
        </div>
        <div className="quick-stats-row">
          <div className="mini-stat-card">
            <div className="stat-icon-wrap si-blue"><i className="fa-solid fa-bullseye" /></div>
            <div className="stat-body">
              <div className="stat-header">
                <span className="stat-val">86.7</span>
                <span className="stat-unit">%</span>
                <span className="stat-trend trend-up"><i className="fa-solid fa-caret-up" /> 4.3%</span>
              </div>
              <div className="stat-label">Prediction Accuracy</div>
            </div>
          </div>
          <div className="mini-stat-card">
            <div className="stat-icon-wrap si-green"><i className="fa-solid fa-clock-rotate-left" /></div>
            <div className="stat-body">
              <div className="stat-header">
                <span className="stat-val">24.3</span>
                <span className="stat-unit">%</span>
                <span className="stat-trend trend-up"><i className="fa-solid fa-caret-up" /> 3.1%</span>
              </div>
              <div className="stat-label">Avg. Commute Reduction</div>
            </div>
          </div>
          <div className="mini-stat-card">
            <div className="stat-icon-wrap si-red"><i className="fa-solid fa-triangle-exclamation" /></div>
            <div className="stat-body">
              <div className="stat-header">
                <span className="stat-val">4</span>
                <span className="stat-trend trend-up" style={{ color: "#64748b" }}><i className="fa-solid fa-caret-up" /> 1</span>
              </div>
              <div className="stat-label">High-Risk Zones Flagged</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="features-section">
        <div className="features-section-header">
          <h3>How It Works</h3>
          <p>AI-powered intelligence across the full monsoon commute lifecycle</p>
        </div>
        <div className="features-footer-row">
          <div className="feature-showcase-card">
            <div className="f-icon-wrap fi-blue"><i className="fa-solid fa-cloud-sun-rain" /></div>
            <div className="f-content"><h4>Live Weather</h4><p>Real-time rainfall and forecasts from OpenWeatherMap.</p></div>
          </div>
          <div className="feature-showcase-card">
            <div className="f-icon-wrap fi-orange"><i className="fa-solid fa-shield-heart" /></div>
            <div className="f-content"><h4>AI Risk Engine</h4><p>Gemini AI scores flood-risk zones using live data and historical patterns.</p></div>
          </div>
          <div className="feature-showcase-card">
            <div className="f-icon-wrap fi-purple"><i className="fa-solid fa-route" /></div>
            <div className="f-content"><h4>Smart Routes</h4><p>AI ranks routes to avoid high-risk zones and save your time.</p></div>
          </div>
          <div className="feature-showcase-card">
            <div className="f-icon-wrap fi-green"><i className="fa-solid fa-bell" /></div>
            <div className="f-content"><h4>Early Alerts</h4><p>Get notified before flooding turns into gridlock.</p></div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="page-footer">
        <div className="footer-left">
          <span>CODEX 2026</span>
          <span className="footer-dot" />
          <span>SDG 11 · SDG 13</span>
        </div>
        <p>Synthetic data disclosed · Built for hackathon demonstration</p>
      </footer>
    </div>
  );
}
