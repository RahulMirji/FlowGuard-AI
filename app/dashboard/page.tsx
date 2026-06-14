"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useWeather } from "@/lib/useWeather";
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

const riskDistribution = [
  { level: "Severe", count: 3, fill: "#ef4444" },
  { level: "High", count: 5, fill: "#f97316" },
  { level: "Medium", count: 5, fill: "#eab308" },
  { level: "Low", count: 2, fill: "#22c55e" },
];

const rainfallTrend = [
  { time: "6AM", rainfall: 2.1, delay: 5 },
  { time: "8AM", rainfall: 8.4, delay: 12 },
  { time: "10AM", rainfall: 15.2, delay: 28 },
  { time: "12PM", rainfall: 18.5, delay: 35 },
  { time: "2PM", rainfall: 12.3, delay: 22 },
  { time: "4PM", rainfall: 22.1, delay: 42 },
  { time: "6PM", rainfall: 9.8, delay: 18 },
];

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [reports, setReports] = useState<InfraReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const weather = useWeather();

  useEffect(() => {
    fetch("/api/kpis").then(r => r.json()).then(setKpis);
    fetch("/api/infra-reports").then(r => r.json()).then(d => { setReports(d.reports || []); setLoadingReports(false); });
  }, []);

  return (
    <div className="dashboard-page">

      {/* HERO */}
      <section className="dash-hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-badge">📊 City Impact Dashboard</div>
          <h2>Real-Time Flood Intelligence</h2>
          <p>Monitoring 15 chronic waterlogging zones across Bengaluru with AI-powered risk analysis</p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><span className="hs-val">{weather.current_mm_per_hour}</span><span className="hs-unit">mm/h</span><span className="hs-label">Rainfall</span></div>
          <div className="hero-stat"><span className="hs-val">{weather.forecast_3h_mm}</span><span className="hs-unit">mm</span><span className="hs-label">3H Forecast</span></div>
          <div className="hero-stat"><span className="hs-val">15</span><span className="hs-unit">zones</span><span className="hs-label">Monitored</span></div>
        </div>
      </section>

      {/* KPI CARDS */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue"><span className="material-symbols-outlined">target</span></div>
          <div className="kpi-body">
            <span className="kpi-val">{kpis?.prediction_accuracy_pct ?? "—"}%</span>
            <span className="kpi-label">Prediction Accuracy</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><span className="material-symbols-outlined">speed</span></div>
          <div className="kpi-body">
            <span className="kpi-val">{kpis?.avg_commute_reduction_pct ?? "—"}%</span>
            <span className="kpi-label">Avg. Commute Reduction</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><span className="material-symbols-outlined">warning</span></div>
          <div className="kpi-body">
            <span className="kpi-val">{kpis?.high_risk_zones_flagged ?? "—"}</span>
            <span className="kpi-label">High-Risk Zones Flagged</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple"><span className="material-symbols-outlined">schedule</span></div>
          <div className="kpi-body">
            <span className="kpi-val">~22 min</span>
            <span className="kpi-label">Early Warning Lead Time</span>
          </div>
        </div>
      </section>

      {/* CHARTS */}
      <section className="charts-grid">
        <div className="chart-card">
          <h3>Risk Level Distribution</h3>
          <p className="chart-sub">Across 15 monitored zones</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="level" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {riskDistribution.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Rainfall vs Commute Delay</h3>
          <p className="chart-sub">Today&apos;s trend (simulated)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={rainfallTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="rainfall" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} name="Rainfall (mm/h)" />
              <Line type="monotone" dataKey="delay" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Delay (min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* INFRA REPORTS */}
      <section className="reports-section">
        <div className="reports-header">
          <h3>Priority Infrastructure Actions</h3>
          <p>AI-generated recommendations for civic authorities (BBMP)</p>
        </div>
        {loadingReports ? (
          <div className="reports-loading"><i className="fa-solid fa-spinner fa-spin" /> Generating reports with AI...</div>
        ) : reports.length === 0 ? (
          <div className="reports-loading">No reports generated yet. Ensure GEMINI_API_KEY is set.</div>
        ) : (
          <div className="reports-table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Zone</th>
                  <th>Recommended Action</th>
                  <th>Expected Impact</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={i}>
                    <td><span className={`priority-badge p${r.priority}`}>{r.priority}</span></td>
                    <td className="zone-name">{r.zone_id.replace(/_/g, " ")}</td>
                    <td>{r.recommended_action}</td>
                    <td className="impact-cell">{r.estimated_impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
