"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useWeather } from "@/lib/useWeather";
import { MapPanel } from "@/components/map-panel";
import "./dashboard.css";

interface KpiData {
  prediction_accuracy_pct: number;
  avg_commute_reduction_pct: number;
  high_risk_zones_flagged: number;
  response_time_improvement_note: string;
}

interface InfraReport {
  zone_id: string;
  priority: number;
  recommended_action: string;
  estimated_impact: string;
  justification: string;
}

const rainfallTrend = [
  { time: "6AM", mm: 2.1 },
  { time: "8AM", mm: 8.4 },
  { time: "10AM", mm: 15.2 },
  { time: "12PM", mm: 18.5 },
  { time: "2PM", mm: 12.3 },
  { time: "4PM", mm: 22.1 },
  { time: "6PM", mm: 9.8 },
];

const ALERTS = [
  { level: "severe", icon: "warning", text: "Silk Board: Critical flooding — avoid until 6 PM", time: "2 min ago" },
  { level: "high", icon: "water_damage", text: "Bellandur: Heavy waterlogging, >60 min delay", time: "8 min ago" },
  { level: "medium", icon: "info", text: "Koramangala: Moderate risk, take inner roads", time: "15 min ago" },
  { level: "high", icon: "directions_car", text: "Hebbal flyover: Slow traffic, 30–45 min extra", time: "22 min ago" },
];

const STATUS = ["In Progress", "Pending", "Scheduled", "In Progress", "Pending"];

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [reports, setReports] = useState<InfraReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [activeTab, setActiveTab] = useState("Now");
  const weather = useWeather();

  useEffect(() => {
    fetch("/api/kpis").then(r => r.json()).then(setKpis).catch(() => {});
    fetch("/api/infra-reports").then(r => r.json()).then(d => {
      setReports(d.reports || []);
      setLoadingReports(false);
    }).catch(() => setLoadingReports(false));
  }, []);

  const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="dash-shell">
      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><i className="fa-solid fa-shield-halved" /></div>
          <div>
            <div className="sidebar-logo-name">FLOWGUARD AI</div>
            <div className="sidebar-logo-sub">Bengaluru Intelligence</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="/dashboard" className="sidebar-item active">
            <span className="material-symbols-outlined">dashboard</span> City Dashboard
          </a>
          <a href="/dashboard" className="sidebar-item">
            <span className="material-symbols-outlined">map</span> Live Map
          </a>
          <a href="/dashboard" className="sidebar-item">
            <span className="material-symbols-outlined">notifications</span> Alerts
          </a>
          <a href="/dashboard" className="sidebar-item">
            <span className="material-symbols-outlined">construction</span> Infrastructure
          </a>
          <a href="/dashboard" className="sidebar-item">
            <span className="material-symbols-outlined">description</span> Reports
          </a>
          <a href="/dashboard" className="sidebar-item">
            <span className="material-symbols-outlined">settings</span> Settings
          </a>
        </nav>

        <div className="sidebar-footer">
          <strong>Last updated</strong><br />{now}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="dash-main">
        {/* HEADER */}
        <div className="dash-header">
          <div className="dash-header-left">
            <h2>City Dashboard</h2>
            <p>Real-time flood intelligence across Bengaluru</p>
          </div>
          <div className="dash-header-right">
            <div className="time-tabs">
              {["Now", "+1 Hour", "+3 Hours"].map(t => (
                <button key={t} className={`time-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
              ))}
            </div>
            <button className="calendar-btn"><span className="material-symbols-outlined">calendar_today</span></button>
          </div>
        </div>

        {/* KPI ROW */}
        <div className="dash-kpi-row">
          <div className="dash-kpi-card">
            <div className="kpi-icon-wrap blue"><span className="material-symbols-outlined">target</span></div>
            <div>
              <div className="kpi-val">{kpis?.prediction_accuracy_pct ?? 86.7}%</div>
              <div className="kpi-label">Prediction Accuracy</div>
              <div className="kpi-trend">▲4.3%</div>
            </div>
          </div>
          <div className="dash-kpi-card">
            <div className="kpi-icon-wrap green"><span className="material-symbols-outlined">directions_car</span></div>
            <div>
              <div className="kpi-val">{kpis?.avg_commute_reduction_pct ?? 24.3}%</div>
              <div className="kpi-label">Commute Reduction</div>
              <div className="kpi-trend">▲3.1%</div>
            </div>
          </div>
          <div className="dash-kpi-card">
            <div className="kpi-icon-wrap red"><span className="material-symbols-outlined">warning</span></div>
            <div>
              <div className="kpi-val">{kpis?.high_risk_zones_flagged ?? 4}</div>
              <div className="kpi-label">Critical Zones</div>
              <div className="kpi-trend">▲1</div>
            </div>
          </div>
          <div className="dash-kpi-card">
            <div className="kpi-icon-wrap yellow"><span className="material-symbols-outlined">schedule</span></div>
            <div>
              <div className="kpi-val">22 min</div>
              <div className="kpi-label">Early Alert Lead</div>
              <div className="kpi-trend">▲6 min</div>
            </div>
          </div>
        </div>

        {/* MAP + TABLE */}
        <div className="dash-content">
          {/* CITY RISK MAP */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>City Risk Map</h3>
              <p>Live flood risk zones across Bengaluru</p>
            </div>
            <div className="map-card-body">
              <MapPanel />
            </div>
          </div>

          {/* INFRA TABLE */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>Infrastructure Actions (Prioritized)</h3>
              <p>AI-generated BBMP recommendations</p>
            </div>
            {loadingReports ? (
              <div className="infra-loading">
                <i className="fa-solid fa-spinner fa-spin" /> Generating with AI…
              </div>
            ) : (
              <div className="infra-table-wrap">
                <table className="infra-table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Location</th>
                      <th>Action</th>
                      <th>ETA</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.slice(0, 5).map((r, i) => {
                      const statusMap = ["in-progress", "pending", "scheduled", "in-progress", "pending"];
                      return (
                        <tr key={i}>
                          <td><div className={`priority-badge p${r.priority}`}>{r.priority}</div></td>
                          <td style={{ fontWeight: 600 }}>{r.zone_id.replace(/_/g, " ")}</td>
                          <td style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.recommended_action}</td>
                          <td style={{ color: "var(--muted)" }}>2h</td>
                          <td><span className={`status-badge ${statusMap[i % 5]}`}>{STATUS[i % 5]}</span></td>
                        </tr>
                      );
                    })}
                    {reports.length === 0 && !loadingReports && (
                      <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "20px 12px" }}>No reports available. Set GEMINI_API_KEY.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RAINFALL CHART + ALERTS */}
        <div className="dash-bottom-row">
          {/* RAINFALL TREND */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>Rainfall Trend</h3>
              <p>Today&apos;s rainfall mm/h — current: {weather.current_mm_per_hour} mm/h</p>
            </div>
            <div className="chart-card-body">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={rainfallTrend} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} mm/h`, "Rainfall"]} />
                  <Line type="monotone" dataKey="mm" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ALERTS */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>Alerts &amp; Notifications</h3>
              <p>{ALERTS.length} active alerts</p>
            </div>
            <div className="alerts-body">
              {ALERTS.map((a, i) => (
                <div key={i} className="alert-item">
                  <div className={`alert-icon ${a.level}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{a.icon}</span>
                  </div>
                  <div>
                    <div className="alert-text">{a.text}</div>
                    <div className="alert-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
