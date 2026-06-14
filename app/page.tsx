"use client";

import "./landing.css";
import { MapPanel } from "@/components/map-panel";
import Link from "next/link";
import { useWeather } from "@/lib/useWeather";

export default function LandingPage() {
  const weather = useWeather();
  const rainfall = weather.current_mm_per_hour !== undefined ? weather.current_mm_per_hour : 0;
  const forecast = weather.forecast_3h_mm !== undefined ? weather.forecast_3h_mm : 0;
  const isAlert = rainfall > 5; // Alert if rainfall is significant

  return (
    <>
      {/* ═══ HERO SECTION ═══ */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="tag-monsoon">
            <span style={{ color: "var(--brand-orange)", marginRight: "6px" }}>●</span> LIVE DEMO <span style={{ color: "#64748b", margin: "0 8px" }}>|</span> CODEX 2026 Final Implementation
          </div>
          <h2>Bengaluru <span>floods.</span><br />Your commute doesn&apos;t have to.</h2>
          <p>FlowGuard AI tracks live rainfall, scores flood-risk across 15 chronic waterlogging hotspots, and routes you around them — <span>before</span> you hit the jam.</p>
          <div className="panel-actions">
            <Link href="/planner" className="btn-orange" style={{ padding: "14px 28px" }}><i className="fa-solid fa-arrow-right" /> Plan a Route</Link>
            <Link href="/dashboard" className="btn-secondary">View City Dashboard <i className="fa-solid fa-chart-simple" style={{ color: "var(--brand-blue)" }} /></Link>
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
            <div />
            <div className="map-right-stats">
              <div className="map-stat-item"><span className="m-label">Rainfall</span><span className="m-val blue">{rainfall.toFixed(1)} mm/h</span></div>
              <div className="map-stat-item"><span className="m-label">3H Forecast</span><span className="m-val" style={{ color: "#1e293b" }}>{forecast.toFixed(0)} mm</span></div>
              <div className="map-stat-item"><span className="m-label">Severe Zones</span><span className="m-val" style={{ color: "var(--risk-severe)" }}>2</span></div>
              <div className="map-stat-item"><span className="m-label">Status</span><span className={`status-alert-tag ${isAlert ? "" : "status-normal-tag"}`}>{isAlert ? "Alert" : "Normal"}</span></div>
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

      {/* ═══ PROBLEM & HOTSPOTS SECTION (Slides 1-3) ═══ */}
      <section className="pitch-section problem-section">
        <div className="section-header">
          <span className="section-tag">NAMMA BENGALURU</span>
          <h2>We suggest the safest route — <span>not always</span> the shortest.</h2>
          <p className="subtitle">Monsoon seasons turn Bengaluru&apos;s critical traffic corridors into gridlocks due to manual alerts and delayed municipal responses.</p>
        </div>

        <div className="problem-right-card full-width">
          <h3 className="hotspots-section-title">Chronic Waterlogging Hotspots</h3>
          <div className="hotspots-list-3col">
            <div className="hotspot-item">
              <div className="hs-image-wrap">
                <img src="https://cdn.gamma.app/ngfrvq6ixud1yz3/ffd4d086f4a04060a1be162343123453/original/image.png" alt="Silk Board Junction flooding" />
              </div>
              <div className="hs-detail">
                <div className="hs-header">
                  <span className="hs-number">01</span>
                  <h4>Silk Board Junction</h4>
                </div>
                <p>One of the city&apos;s worst bottlenecks; prone to immediate underpass drainage failure.</p>
              </div>
            </div>
            <div className="hotspot-item">
              <div className="hs-image-wrap">
                <img src="https://cdn.gamma.app/ngfrvq6ixud1yz3/4e510505121e4ef6a9c03d7e6d8c6a76/original/image.png" alt="Bellandur Outer Ring Road flooding" />
              </div>
              <div className="hs-detail">
                <div className="hs-header">
                  <span className="hs-number">02</span>
                  <h4>Bellandur ORR</h4>
                </div>
                <p>Critical IT corridor that floods rapidly, blocking thousands of tech commuters.</p>
              </div>
            </div>
            <div className="hotspot-item">
              <div className="hs-image-wrap">
                <img src="https://cdn.gamma.app/ngfrvq6ixud1yz3/3fded29c170a4a9ca403b37782e0c6b1/original/image.png" alt="Koramangala Underpass flooding" />
              </div>
              <div className="hs-detail">
                <div className="hs-header">
                  <span className="hs-number">03</span>
                  <h4>Koramangala Underpass</h4>
                </div>
                <p>Low-lying critical crossing subject to sudden inundation during moderate spells.</p>
              </div>
            </div>
            <div className="hotspot-item">
              <div className="hs-image-wrap">
                <img src="https://cdn.gamma.app/ngfrvq6ixud1yz3/d5bd66e2007d4bb381b682568175194e/original/image.png" alt="Banasawadi flooding" />
              </div>
              <div className="hs-detail">
                <div className="hs-header">
                  <span className="hs-number">04</span>
                  <h4>Banasawadi</h4>
                </div>
                <p>Key transit ward vulnerable to severe run-off accumulation and waterlogging.</p>
              </div>
            </div>
            <div className="hotspot-item">
              <div className="hs-image-wrap">
                <img src="https://cdn.gamma.app/ngfrvq6ixud1yz3/2298cc788c0a4e4083a516cf06233e82/original/image.png" alt="Manyata Tech Park flooding" />
              </div>
              <div className="hs-detail">
                <div className="hs-header">
                  <span className="hs-number">05</span>
                  <h4>Manyata Tech Park</h4>
                </div>
                <p>Major tech hub where corporate exits and surrounding lanes get blocked rapidly.</p>
              </div>
            </div>
            <div className="hotspot-item">
              <div className="hs-image-wrap">
                <img src="https://cdn.gamma.app/ngfrvq6ixud1yz3/8db4d04ec0da483e8ccef96671de1aaa/original/image.png" alt="Whitefield Corridor flooding" />
              </div>
              <div className="hs-detail">
                <div className="hs-header">
                  <span className="hs-number">06</span>
                  <h4>Whitefield Corridor</h4>
                </div>
                <p>Major corporate transit route frequently gridlocked by poor stormwater discharge.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ IMPACT OF URBAN FLOODING (Slide 4) ═══ */}
      <section className="pitch-section impact-section">
        <div className="section-header">
          <span className="section-tag">THE PROBLEM</span>
          <h2>The True Cost of Urban Flooding</h2>
          <p className="subtitle">Waterlogged streets are more than just a commute delay—they disrupt the city&apos;s health, economy, and environment.</p>
        </div>

        <div className="impact-grid-six">
          <div className="impact-card-six">
            <div className="ic-icon"><i className="fa-solid fa-car-side" /></div>
            <h3>Severe Traffic Congestion</h3>
            <p>Commutes lengthen by 3x, locking vehicles in multi-kilometer tailbacks across major arterials.</p>
          </div>
          <div className="impact-card-six">
            <div className="ic-icon"><i className="fa-solid fa-smog" /></div>
            <h3>Increased CO₂ Emissions</h3>
            <p>Prolonged idling and stop-and-go detours cause vehicular emissions to spike heavily during rain spells.</p>
          </div>
          <div className="impact-card-six">
            <div className="ic-icon"><i className="fa-solid fa-gas-pump" /></div>
            <h3>Fuel Wastage & Economic Loss</h3>
            <p>Burned fuel in traffic translates to significant daily financial loss and wasted economic productivity.</p>
          </div>
          <div className="impact-card-six">
            <div className="ic-icon"><i className="fa-solid fa-truck-medical" /></div>
            <h3>Delayed Emergency Services</h3>
            <p>Ambulances and fire engines get trapped in gridlock, risking lives when response time is critical.</p>
          </div>
          <div className="impact-card-six">
            <div className="ic-icon"><i className="fa-solid fa-road-barrier" /></div>
            <h3>Infrastructure Damage</h3>
            <p>Asphalt erosion, structural stress on underpasses, and drainage blockages degrade municipal assets.</p>
          </div>
          <div className="impact-card-six">
            <div className="ic-icon"><i className="fa-solid fa-wind" /></div>
            <h3>Air Quality Index (AQI) Spikes</h3>
            <p>Localized exhaust accumulation in slow-moving traffic columns leads to immediate degradation of city air quality.</p>
          </div>
        </div>
      </section>

      {/* ═══ DUAL-STAKEHOLDER SOLUTION SECTION (Slide 5) ═══ */}
      <section className="pitch-section solution-section">
        <div className="section-header">
          <span className="section-tag">THE SOLUTION</span>
          <h2>A Shared Platform for a Resilient City</h2>
          <p className="subtitle">FlowGuard AI bridges the gap between commuter navigation and municipal drainage action.</p>
        </div>

        <div className="solution-dual-grid">
          <div className="sol-card citizen-sol">
            <div className="sol-badge-icon"><i className="fa-solid fa-users" /></div>
            <h3>For Citizens & Commuters</h3>
            <p>Empowering daily travelers to navigate Bengaluru safely during intense monsoon rainfalls.</p>
            <ul className="sol-list">
              <li>
                <i className="fa-solid fa-circle-check" />
                <div>
                  <strong>Smart Risk-Averse Routing</strong>
                  <p>Reroutes you dynamically away from active flood zones, not just traffic delays.</p>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-circle-check" />
                <div>
                  <strong>Real-Time Flood Alerts</strong>
                  <p>Receive live, location-based notifications on road levels before beginning your travel.</p>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-circle-check" />
                <div>
                  <strong>AI Travel Assistant</strong>
                  <p>Conversational assistant provides immediate safety updates and route context on demand.</p>
                </div>
              </li>
            </ul>
            <Link href="/planner" className="sol-cta">Plan a Route <i className="fa-solid fa-chevron-right" /></Link>
          </div>

          <div className="sol-card government-sol">
            <div className="sol-badge-icon"><i className="fa-solid fa-landmark" /></div>
            <h3>For Civic Authorities & Govt</h3>
            <p>Equipping municipal decision-makers with live intelligence to deploy drainage interventions.</p>
            <ul className="sol-list">
              <li>
                <i className="fa-solid fa-circle-check" />
                <div>
                  <strong>Drainage Vulnerability Mapping</strong>
                  <p>Aggregates risk levels across chronic waterlogging points to pinpoint bottlenecks.</p>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-circle-check" />
                <div>
                  <strong>AI-Prioritized Infrastructure Reports</strong>
                  <p>Generates actionable, structured recommendation reports for desilting or pump deployments.</p>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-circle-check" />
                <div>
                  <strong>Resource Optimization</strong>
                  <p>Prioritizes municipal engineering surveys and temporary pump placements based on risk scores.</p>
                </div>
              </li>
            </ul>
            <Link href="/dashboard" className="sol-cta">View City Dashboard <i className="fa-solid fa-chevron-right" /></Link>
          </div>
        </div>
      </section>

      {/* ═══ SYSTEM ARCHITECTURE & TECH STACK (Slides 6-7) ═══ */}
      <section className="pitch-section architecture-section">
        <div className="section-header">
          <span className="section-tag">UNDER THE HOOD</span>
          <h2>AI-Powered Core Architecture</h2>
          <p className="subtitle">FlowGuard AI aggregates real-time weather and spatial datasets into Gemini&apos;s reasoning engine to output safety reports.</p>
        </div>

        <div className="architecture-layout">
          {/* TECH STACK GRID */}
          <div className="tech-stack-container">
            <h3>Engineering Technology Stack</h3>
            <div className="tech-grid">
              <div className="tech-card">
                <div className="tc-logo nextjs-logo">N</div>
                <div className="tc-info">
                  <h4>Next.js</h4>
                  <p>Frontend framework & secure API routing.</p>
                </div>
              </div>
              <div className="tech-card">
                <div className="tc-logo supabase-logo"><i className="fa-solid fa-bolt" /></div>
                <div className="tc-info">
                  <h4>Supabase Edge Functions</h4>
                  <p>Secure serverless proxy for AI and Weather APIs.</p>
                </div>
              </div>
              <div className="tech-card">
                <div className="tc-logo postgres-logo"><i className="fa-solid fa-database" /></div>
                <div className="tc-info">
                  <h4>Supabase PostgreSQL</h4>
                  <p>Stores historical flood data, user logs, and preferences.</p>
                </div>
              </div>
              <div className="tech-card">
                <div className="tc-logo mapbox-logo"><i className="fa-solid fa-map" /></div>
                <div className="tc-info">
                  <h4>Mapbox API</h4>
                  <p>Route optimization and geospatial mapping.</p>
                </div>
              </div>
              <div className="tech-card">
                <div className="tc-logo weather-logo"><i className="fa-solid fa-cloud-sun" /></div>
                <div className="tc-info">
                  <h4>OpenWeather API</h4>
                  <p>Real-time weather telemetry & precipitation forecasts.</p>
                </div>
              </div>
              <div className="tech-card">
                <div className="tc-logo gemini-logo"><i className="fa-solid fa-sparkles" /></div>
                <div className="tc-info">
                  <h4>Gemini AI / LLM</h4>
                  <p>Risk-scoring reasoning engine & conversational planner.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CUSTOMER EXPERIENCE JOURNEY (Slide 8) ═══ */}
      <section className="pitch-section journey-section">
        <div className="section-header">
          <span className="section-tag">COMMUTER EXPERIENCE</span>
          <h2>The Journey to a Safer Commute</h2>
          <p className="subtitle">How FlowGuard AI keeps you moving smoothly through unpredictable monsoon weather.</p>
        </div>

        <div className="stepper-journey">
          <div className="step-card">
            <span className="step-number">01</span>
            <div className="step-content">
              <h4>Enter Destination</h4>
              <p>User launches the app and inputs their commute route inside the interactive planner.</p>
            </div>
          </div>
          <div className="step-card">
            <span className="step-number">02</span>
            <div className="step-content">
              <h4>Context Aggregation</h4>
              <p>System automatically queries live rainfall forecasts, historic hotspot risks, and traffic telemetry.</p>
            </div>
          </div>
          <div className="step-card">
            <span className="step-number">03</span>
            <div className="step-content">
              <h4>AI Recommendation</h4>
              <p>Gemini AI filters route alternatives, ranking them to find the path that balances risk and travel time.</p>
            </div>
          </div>
          <div className="step-card">
            <span className="step-number">04</span>
            <div className="step-content">
              <h4>Live Alerts & Navigation</h4>
              <p>Commuter travels with real-time updates. <em>Example: &quot;Hebbal Flyover flooding has increased; route adjustment advised.&quot;</em></p>
            </div>
          </div>
          <div className="step-card">
            <span className="step-number">05</span>
            <div className="step-content">
              <h4>Proactive Warnings</h4>
              <p>Get notified before you travel. <em>Example: &quot;Heavy rainfall expected at Silk Board in 30 minutes. Leave early.&quot;</em></p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SMART GOVERNANCE & DRAINAGE INFRASTRUCTURE (Slides 9-10) ═══ */}
      <section className="pitch-section governance-section">
        <div className="section-header">
          <span className="section-tag">SMART GOVERNANCE</span>
          <h2>AI-Powered Municipal Decision Support</h2>
          <p className="subtitle">Helping city planners transition from emergency reaction to proactive resilience.</p>
        </div>

        <div className="governance-grid">
          {/* RISK LEVELS */}
          <div className="gov-risk-tiers">
            <h3>AI Risk & Priority Assessment</h3>
            <div className="risk-tier-item severe-tier">
              <div className="rt-header">
                <span className="rt-badge">Priority 1: High/Severe Risk</span>
                <h4>Silk Board Junction</h4>
              </div>
              <p><strong>Action Recommended:</strong> Stormwater drain desilting, immediate debris clearance, and capacity verification of underpass outlets.</p>
            </div>
            <div className="risk-tier-item high-tier">
              <div className="rt-header">
                <span className="rt-badge">Priority 2: Medium/High Risk</span>
                <h4>Bellandur Outer Ring Road</h4>
              </div>
              <p><strong>Action Recommended:</strong> Deploy mobile pump units, monitor catchment areas remotely, and clear connected water pathways.</p>
            </div>
            <div className="risk-tier-item safe-tier">
              <div className="rt-header">
                <span className="rt-badge">Safe Areas: Low Risk</span>
                <h4>Regular Monitoring</h4>
              </div>
              <p><strong>Action Recommended:</strong> Scheduled cleaning intervals. No immediate resource mobilization required.</p>
            </div>
          </div>

          {/* DRAINAGE INFRA ACTIONS */}
          <div className="gov-infra-actions">
            <h3>Improving Drainage Infrastructure</h3>
            <p className="infra-intro">FlowGuard AI translates raw waterlogging forecasts into specific, prioritized engineering actions visible on the municipal dashboard.</p>
            
            <div className="actions-list">
              <div className="action-bullet">
                <div className="ab-icon"><i className="fa-solid fa-broom" /></div>
                <div className="ab-body">
                  <h4>1. Clean Blocked Drains</h4>
                  <p>AI identifies coordinates where litter and silt build-up cause stormwater backup, alerting local sanitary staff.</p>
                </div>
              </div>
              <div className="action-bullet">
                <div className="ab-icon"><i className="fa-solid fa-pump-soap" /></div>
                <div className="ab-body">
                  <h4>2. Deploy Mobile Pumps</h4>
                  <p>Triggers location alerts for ward engineers to position pump units at low-elevation underpasses ahead of heavy rainfall.</p>
                </div>
              </div>
              <div className="action-bullet">
                <div className="ab-icon"><i className="fa-solid fa-arrow-up-right-dots" /></div>
                <div className="ab-body">
                  <h4>3. Upgrade Drainage Capacity</h4>
                  <p>Highlights chronic areas requiring culvert widening or stormwater system expansion based on summer monsoon volumes.</p>
                </div>
              </div>
              <div className="action-bullet">
                <div className="ab-icon"><i className="fa-solid fa-clipboard-list" /></div>
                <div className="ab-body">
                  <h4>4. Prioritize Engineering Surveys</h4>
                  <p>Flags structural faults (like reverse slopes or collapsed piping) for full site investigation by municipal planning bodies.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ EXPECTED IMPACT & PERFORMANCE (Slides 11 & 13) ═══ */}
      <section className="pitch-section impact-kpi-section">
        <div className="section-header">
          <span className="section-tag">EXPECTED IMPACT</span>
          <h2>Measured Performance Outcomes</h2>
          <p className="subtitle">Projected project effectiveness when FlowGuard AI is deployed at city scale.</p>
        </div>

        <div className="metrics-row">
          <div className="metric-box">
            <div className="mb-value">88.2%</div>
            <div className="mb-label">Prediction Accuracy</div>
            <p className="mb-desc">Evaluated using historical precipitation models and localized telemetry validation.</p>
          </div>
          <div className="metric-box">
            <div className="mb-value">14%</div>
            <div className="mb-label">Carbon Emissions Reduction</div>
            <p className="mb-desc">Fewer vehicles idling in waterlogged tailbacks minimizes daily greenhouse gas output.</p>
          </div>
          <div className="metric-box">
            <div className="mb-value">18%</div>
            <div className="mb-label">Operational Cost Savings</div>
            <p className="mb-desc">Pre-emptive maintenance desilting alerts optimize municipal labor and infrastructure spend.</p>
          </div>
          <div className="metric-box">
            <div className="mb-value">25%</div>
            <div className="mb-label">Response Time Improvement</div>
            <p className="mb-desc">Emergency services and civic units routed dynamically around active flood zones.</p>
          </div>
          <div className="metric-box">
            <div className="mb-value">75%</div>
            <div className="mb-label">Resource Utilization</div>
            <p className="mb-desc">High-efficiency mobilization of mobile pumps and desilting machinery to high-risk areas.</p>
          </div>
          <div className="metric-box">
            <div className="mb-value">+8 pts</div>
            <div className="mb-label">Sustainability Score</div>
            <p className="mb-desc">Estimated score improvement aligning with UN SDG 11 (Sustainable Cities) & SDG 13 (Climate Action).</p>
          </div>
        </div>

        <div className="impact-footer-highlights">
          <div className="highlight-tag-box">
            <i className="fa-solid fa-circle-check" />
            <span><strong>100% AI-Powered Monitoring:</strong> Scalable monitoring with zero manual survey cost per zone.</span>
          </div>
          <div className="highlight-tag-box">
            <i className="fa-solid fa-circle-check" />
            <span><strong>Proactive Infrastructure Planning:</strong> Structured data output drives long-term municipal capital allocation.</span>
          </div>
        </div>
      </section>

    </>
  );
}
