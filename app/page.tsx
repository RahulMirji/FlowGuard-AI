import "./landing.css";

export default function LandingPage() {
  return (
    <div className="dashboard-container">
      {/* HEADER */}
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

      {/* MAIN WORKSPACE */}
      <main className="main-workspace">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="hero-text-block">
            <div className="tag-monsoon">
              <span style={{ color: "#64748b", fontWeight: 500 }}>•</span> Bengaluru Flood Intelligence <span style={{ color: "#64748b", fontWeight: 500, margin: "0 4px" }}>•</span> Monsoon 2026
            </div>
            <h2>Bengaluru <span>floods.</span><br />Your commute doesn&apos;t have to.</h2>
            <p>FlowGuard AI tracks live rainfall, scores flood-risk across 15 chronic waterlogging hotspots, and routes you around them — <span>before</span> you hit the jam.</p>
            <div className="panel-actions">
              <a href="/planner" className="btn-orange" style={{ padding: "14px 28px" }}>Plan a Route <i className="fa-solid fa-arrow-right" /></a>
              <a href="/dashboard" className="btn-secondary">View City Dashboard <i className="fa-solid fa-chart-simple" style={{ color: "var(--brand-blue)" }} /></a>
            </div>
          </div>

          <div>
            <div className="quick-stats-row">
              <div className="mini-stat-card">
                <div className="stat-header">
                  <span className="stat-val">86.7</span>
                  <span className="stat-unit">%</span>
                  <span className="stat-trend trend-up"><i className="fa-solid fa-caret-up" /> 4.3%</span>
                </div>
                <div className="stat-label">Prediction Accuracy</div>
              </div>
              <div className="mini-stat-card">
                <div className="stat-header">
                  <span className="stat-val">24.3</span>
                  <span className="stat-unit">%</span>
                  <span className="stat-trend trend-up"><i className="fa-solid fa-caret-up" /> 3.1%</span>
                </div>
                <div className="stat-label">Avg. Commute Reduction</div>
              </div>
              <div className="mini-stat-card">
                <div className="stat-header">
                  <span className="stat-val">4</span>
                  <span className="stat-trend trend-up" style={{ color: "#64748b" }}><i className="fa-solid fa-caret-up" /> 1</span>
                </div>
                <div className="stat-label">High-Risk Zones Flagged</div>
              </div>
            </div>

            <div className="brand-attribution">
              <span>Powered by</span>
              <span className="engine-name"><i className="fa-solid fa-sparkles" style={{ color: "#2563eb" }} /> Gemini</span>
              <span className="engine-name"><i className="fa-solid fa-map" style={{ color: "#000" }} /> mapbox</span>
              <span className="engine-name"><i className="fa-solid fa-cloud" style={{ color: "#ea580c" }} /> OpenWeather</span>
              <span className="engine-name"><i className="fa-solid fa-bolt" style={{ color: "#10b981" }} /> Supabase</span>
            </div>
          </div>
        </div>

        {/* MAP SANDBOX */}
        <div className="map-sandbox">
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
              <div className="map-stat-item">
                <span className="m-label">Rainfall</span>
                <span className="m-val blue">18.5 mm/h</span>
              </div>
              <div className="map-stat-item">
                <span className="m-label">3H Forecast</span>
                <span className="m-val" style={{ color: "#1e293b" }}>32 mm</span>
              </div>
              <div className="map-stat-item">
                <span className="m-label">Severe Zones</span>
                <span className="m-val" style={{ color: "var(--risk-severe)" }}>2</span>
              </div>
              <div className="map-stat-item">
                <span className="m-label">Status</span>
                <span className="status-alert-tag">Alert</span>
              </div>
            </div>
          </div>

          <div className="legend-box">
            <div className="legend-title">Risk Level</div>
            <div className="legend-row"><div className="legend-dot" style={{ background: "var(--risk-severe)" }} /> Severe</div>
            <div className="legend-row"><div className="legend-dot" style={{ background: "var(--risk-high)" }} /> High</div>
            <div className="legend-row"><div className="legend-dot" style={{ background: "var(--risk-medium)" }} /> Medium</div>
            <div className="legend-row"><div className="legend-dot" style={{ background: "var(--risk-low)" }} /> Low</div>
          </div>

          <div className="map-node node-hebbal"><div className="node-pulse">68</div><div className="node-label">Hebbal</div></div>
          <div className="map-node node-krpuram"><div className="node-pulse">44</div><div className="node-label">KR Puram</div></div>
          <div className="map-node node-koramangala"><div className="node-pulse">71</div><div className="node-label">Koramangala</div></div>
          <div className="map-node node-marathahalli"><div className="node-pulse">47</div><div className="node-label">Marathahalli</div></div>
          <div className="map-node node-silkboard"><div className="node-pulse">92</div><div className="node-label" style={{ fontWeight: 900, color: "var(--risk-severe)" }}>Silk Board</div></div>
          <div className="map-node node-bellandur"><div className="node-pulse">88</div><div className="node-label">Bellandur</div></div>
          <div className="map-node node-sarjapur"><div className="node-pulse">51</div><div className="node-label">Sarjapur Rd</div></div>

          <div className="map-landmark lake-bellandur">Bellandur Lake</div>
          <div className="city-label lbl-yelahanka">Yelahanka</div>
          <div className="city-label lbl-indiranagar">Indiranagar</div>
          <div className="city-label lbl-jayanagar">Jayanagar</div>
          <div className="city-label lbl-ecity">Electronic City</div>

          <div className="map-hud-controls">
            <div className="hud-btn"><i className="fa-solid fa-plus" /></div>
            <div className="hud-btn"><i className="fa-solid fa-minus" /></div>
            <div className="hud-btn"><i className="fa-solid fa-location-crosshairs" /></div>
          </div>

          <div className="mapbox-attribution">
            <i className="fa-solid fa-map-pin" /> mapbox <span style={{ fontWeight: 400, opacity: 0.6 }}>© OSM</span>
          </div>
        </div>
      </main>

      {/* FEATURES ROW */}
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

      <div className="scroll-explorer-pointer">
        <i className="fa-solid fa-mouse" style={{ fontSize: "11px" }} /> Scroll to explore
      </div>
    </div>
  );
}
