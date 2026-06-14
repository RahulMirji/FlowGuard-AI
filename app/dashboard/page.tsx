"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { MapPanel, type MapZone } from "@/components/map-panel";
import { downloadAuthorityPDF, downloadAuthorityExcel } from "@/lib/authorityReport";
import "./dashboard.css";

interface DashboardData {
  rainfall: { current_mm_per_hour: number; forecast_3h_mm: number; description: string; temp: number };
  rainfall_series: { time: string; rainfall: number }[];
  stats: {
    overall_risk_index: number;
    overall_risk_level: string;
    rainfall_now: number;
    forecast_3h_mm: number;
    critical_zones: number;
    total_zones: number;
    people_affected: number;
    early_alert_min: number;
  };
  zones: MapZone[];
  distribution: { level: string; range: string; count: number; pct: number; fill: string }[];
  alerts: { sev: string; title: string; time: string }[];
  infra_actions: { priority: number; location: string; issue: string; action: string; eta: string; status: string }[];
}

type ActionType = "Clean Blocked Drains" | "Deploy Mobile Pumps" | "Upgrade Drainage Capacity";

interface AuthorityAction {
  action_type: ActionType;
  zone_id: string;
  zone_name: string;
  ward_number: string;
  lat: number;
  lng: number;
  risk_level: string;
  authority: string;
  directive: string;
  urgency: "Immediate" | "High" | "Planned";
  rationale: string;
}

interface AuthorityData {
  generated_at: string;
  rainfall_context: { current_mm_per_hour: number; forecast_3h_mm: number; description: string };
  actions: AuthorityAction[];
}

const ACTION_META: Record<ActionType, { icon: string; tone: string; blurb: string }> = {
  "Clean Blocked Drains": {
    icon: "cleaning_services",
    tone: "blue",
    blurb: "Coordinates where litter & silt build-up cause stormwater backup — alert local sanitary staff.",
  },
  "Deploy Mobile Pumps": {
    icon: "water_pump",
    tone: "orange",
    blurb: "Location alerts for ward engineers to position pump units at low-elevation underpasses before heavy rain.",
  },
  "Upgrade Drainage Capacity": {
    icon: "engineering",
    tone: "purple",
    blurb: "Chronic areas needing culvert widening or stormwater expansion based on monsoon volumes.",
  },
};

const ACTION_ORDER: ActionType[] = ["Clean Blocked Drains", "Deploy Mobile Pumps", "Upgrade Drainage Capacity"];

const levelTone: Record<string, string> = { Severe: "red", High: "orange", Medium: "yellow", Low: "green" };

function formatPeople(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authority, setAuthority] = useState<AuthorityData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "xlsx" | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadAuthority = useCallback(() => {
    setRegenerating(true);
    fetch("/api/authority-actions?refresh=1")
      .then((r) => r.json())
      .then((d) => { setAuthority(d); })
      .catch(() => {})
      .finally(() => { setAuthLoading(false); setRegenerating(false); });
  }, []);

  useEffect(() => {
    fetch("/api/authority-actions")
      .then((r) => r.json())
      .then((d) => { setAuthority(d); })
      .catch(() => {})
      .finally(() => { setAuthLoading(false); });
  }, []);

  const handleDownload = useCallback(async (kind: "pdf" | "xlsx") => {
    if (!authority || authority.actions.length === 0) return;
    setDownloading(kind);
    try {
      if (kind === "pdf") await downloadAuthorityPDF(authority);
      else await downloadAuthorityExcel(authority);
    } catch (e) {
      console.error("Report export failed", e);
    } finally {
      setDownloading(null);
    }
  }, [authority]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const s = data?.stats;
  const distTotal = data?.distribution.reduce((acc, d) => acc + d.count, 0) ?? 0;

  return (
    <div className="dashboard-page">

      {/* ─── GREETING BAR ─── */}
      <section className="dash-greeting">
        <div>
          <h2>{greeting}, Rahul <span className="wave">👋</span></h2>
          <p>Here&apos;s what&apos;s happening in Bengaluru today.</p>
        </div>
        <div className="greeting-meta">
          <span className="live-pill"><span className="live-dot" /> Live</span>
          <span className="date-chip">
            <span className="material-symbols-outlined">calendar_today</span>
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
      </section>

      {/* ─── KPI STAT ROW ─── */}
      <section className="stat-grid">
        <StatCard
          label="Overall Risk Index" icon="speed" tone={levelTone[s?.overall_risk_level ?? "Medium"] ?? "orange"}
          value={loading ? "—" : String(s?.overall_risk_index ?? 0)} unit="/100"
          badge={s?.overall_risk_level}
          sub={`${s?.critical_zones ?? 0} critical zones active`}
          spark={data?.rainfall_series} color="#ef4444"
        />
        <StatCard
          label="Rainfall (Now)" icon="rainy" tone="blue"
          value={loading ? "—" : (s?.rainfall_now ?? 0).toFixed(1)} unit="mm/h"
          sub={`3H forecast · ${s?.forecast_3h_mm ?? 0} mm`}
          spark={data?.rainfall_series} color="#0284c7"
        />
        <StatCard
          label="Critical Zones" icon="warning" tone="orange"
          value={loading ? "—" : String(s?.critical_zones ?? 0)} unit=""
          sub={`of ${s?.total_zones ?? 0} monitored`}
        />
        <StatCard
          label="People Affected" icon="groups" tone="purple"
          value={loading ? "—" : formatPeople(s?.people_affected ?? 0)} unit=""
          sub="est. exposure in risk zones"
        />
        <StatCard
          label="Early Alerts" icon="notifications_active" tone="green"
          value={loading ? "—" : String(s?.early_alert_min ?? 0)} unit="min"
          sub="avg warning lead time"
        />
      </section>

      {/* ─── MAIN GRID ─── */}
      <section className="main-grid">

        {/* CITY RISK MAP */}
        <div className="panel map-panel-card">
          <div className="panel-head">
            <h3>City Risk Map</h3>
            <span className="view-chip">Risk View <span className="material-symbols-outlined">expand_more</span></span>
          </div>
          <div className="map-holder">
            <MapPanel zones={data?.zones} />
          </div>
          <div className="map-legend">
            <span><i style={{ background: "#22c55e" }} /> Low (0-30)</span>
            <span><i style={{ background: "#eab308" }} /> Medium (31-60)</span>
            <span><i style={{ background: "#f97316" }} /> High (61-80)</span>
            <span><i style={{ background: "#ef4444" }} /> Severe (81-100)</span>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="side-col">

          {/* ACTIVE ALERTS */}
          <div className="panel">
            <div className="panel-head">
              <h3>Active Alerts</h3>
              <a className="view-link">View all</a>
            </div>
            <ul className="alert-list">
              {(data?.alerts ?? []).map((a, i) => (
                <li key={i} className={`alert-item ${a.sev}`}>
                  <span className="alert-icon material-symbols-outlined">
                    {a.sev === "severe" ? "error" : "warning"}
                  </span>
                  <div className="alert-body">
                    <span className="alert-sev">{a.sev === "severe" ? "Severe" : a.sev === "high" ? "High" : "Moderate"}</span>
                    <span className="alert-title">{a.title}</span>
                  </div>
                  <span className="alert-time">{a.time}</span>
                </li>
              ))}
              {!loading && (data?.alerts ?? []).length === 0 && (
                <li className="alert-empty">No active alerts right now.</li>
              )}
            </ul>
          </div>

          {/* RAINFALL TREND */}
          <div className="panel">
            <div className="panel-head">
              <h3>Rainfall Trend</h3>
              <span className="view-chip">Forecast <span className="material-symbols-outlined">expand_more</span></span>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={data?.rainfall_series ?? []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Area type="monotone" dataKey="rainfall" stroke="#3b82f6" strokeWidth={2.5} fill="url(#rainGrad)" name="Rainfall (mm/3h)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>
      </section>

      {/* ─── BOTTOM GRID (moved down to reduce clutter) ─── */}
      <section className="bottom-grid">

        {/* INFRASTRUCTURE ACTIONS */}
        <div className="panel">
          <div className="panel-head">
            <h3>Infrastructure Actions <span className="count-chip">{data?.infra_actions.length ?? 0}</span></h3>
            <a className="view-link">View all</a>
          </div>
          <div className="table-wrap">
            <table className="infra-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Location</th>
                  <th>Issue</th>
                  <th>Action</th>
                  <th>ETA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.infra_actions ?? []).map((r, i) => (
                  <tr key={i}>
                    <td><span className={`pri-badge p${r.priority}`}>{r.priority}</span></td>
                    <td className="loc-cell">{r.location}</td>
                    <td>{r.issue}</td>
                    <td className="muted">{r.action}</td>
                    <td className="muted">{r.eta}</td>
                    <td>
                      <span className={`status-badge ${r.status.toLowerCase().replace(/\s/g, "-")}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <div className="table-loading">Loading live infrastructure data…</div>}
          </div>
        </div>

        {/* RISK LEVEL DISTRIBUTION */}
        <div className="panel">
          <div className="panel-head">
            <h3>Risk Level Distribution</h3>
          </div>
          <div className="donut-row">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={data?.distribution ?? []}
                    dataKey="count"
                    innerRadius={58}
                    outerRadius={80}
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {(data?.distribution ?? []).map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span className="donut-total">{distTotal}</span>
                <span className="donut-label">Total Zones</span>
              </div>
            </div>
            <ul className="dist-legend">
              {(data?.distribution ?? []).map((d, i) => (
                <li key={i}>
                  <span className="dist-dot" style={{ background: d.fill }} />
                  <span className="dist-name">{d.level} <em>({d.range})</em></span>
                  <span className="dist-count">{d.count} <em>({d.pct}%)</em></span>
                </li>
              ))}
            </ul>
          </div>
          <a className="view-link block">View all zone details →</a>
        </div>

      </section>

      {/* ─── AUTHORITY ACTION CENTER (Gemini → Government Authorities) ─── */}
      <section className="panel authority-panel">
        <div className="panel-head">
          <div>
            <h3>
              <span className="material-symbols-outlined auth-head-icon">account_balance</span>
              Authority Action Center
              <span className="count-chip">{authority?.actions.length ?? 0}</span>
            </h3>
            <p className="auth-sub">
              AI-generated directives for BBMP &amp; ward teams across high-risk zones
              {authority?.rainfall_context && (
                <> · live: {authority.rainfall_context.current_mm_per_hour} mm/h, {authority.rainfall_context.forecast_3h_mm} mm forecast</>
              )}
            </p>
          </div>
          <div className="auth-head-actions">
            {authority?.generated_at && !regenerating && (
              <span className="auth-updated">
                Updated {new Date(authority.generated_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </span>
            )}
            <span className="gemini-chip"><span className="material-symbols-outlined">auto_awesome</span> Gemini</span>
            <div className="download-group">
              <button
                className="dl-btn pdf"
                onClick={() => handleDownload("pdf")}
                disabled={downloading !== null || authLoading || regenerating || (authority?.actions.length ?? 0) === 0}
                title="Download report as PDF"
              >
                <span className={`material-symbols-outlined ${downloading === "pdf" ? "spin" : ""}`}>
                  {downloading === "pdf" ? "progress_activity" : "picture_as_pdf"}
                </span>
                PDF
              </button>
              <button
                className="dl-btn xls"
                onClick={() => handleDownload("xlsx")}
                disabled={downloading !== null || authLoading || regenerating || (authority?.actions.length ?? 0) === 0}
                title="Download report as Excel"
              >
                <span className={`material-symbols-outlined ${downloading === "xlsx" ? "spin" : ""}`}>
                  {downloading === "xlsx" ? "progress_activity" : "table_view"}
                </span>
                Excel
              </button>
            </div>
            <button
              className="regen-btn"
              onClick={() => loadAuthority()}
              disabled={regenerating || authLoading}
            >
              <span className={`material-symbols-outlined ${regenerating ? "spin" : ""}`}>refresh</span>
              {regenerating ? "Generating…" : "Regenerate"}
            </button>
          </div>
        </div>

        {(authLoading || regenerating) && <div className="table-loading">Generating recommendations for civic authorities…</div>}

        {!authLoading && !regenerating && (authority?.actions ?? []).length === 0 && (
          <div className="table-loading">No authority action required — no zones at High or Severe risk right now.</div>
        )}

        {!authLoading && !regenerating && (authority?.actions ?? []).length > 0 && (
          <div className="auth-columns">
            {ACTION_ORDER.map((type) => {
              const items = (authority?.actions ?? []).filter((a) => a.action_type === type);
              const meta = ACTION_META[type];
              return (
                <div key={type} className="auth-col">
                  <div className="auth-col-head">
                    <span className={`stat-icon ${meta.tone}`}>
                      <span className="material-symbols-outlined">{meta.icon}</span>
                    </span>
                    <div>
                      <h4>{type} <span className="auth-col-count">{items.length}</span></h4>
                      <p>{meta.blurb}</p>
                    </div>
                  </div>
                  <ul className="auth-list">
                    {items.length === 0 && <li className="auth-none">No locations flagged.</li>}
                    {items.map((a) => (
                      <li key={a.zone_id} className="auth-card">
                        <div className="auth-card-top">
                          <span className="auth-zone">{a.zone_name}</span>
                          <span className={`urgency-badge ${a.urgency.toLowerCase()}`}>{a.urgency}</span>
                        </div>
                        <p className="auth-directive">{a.directive}</p>
                        <div className="auth-meta">
                          <span className="auth-tag">
                            <span className="material-symbols-outlined">groups</span>{a.authority}
                          </span>
                          <span className="auth-tag">
                            <span className="material-symbols-outlined">place</span>
                            {a.ward_number !== "—" ? `Ward ${a.ward_number} · ` : ""}{a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                          </span>
                        </div>
                        <p className="auth-rationale">{a.rationale}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── KPI Stat Card ── */
function StatCard({
  label, icon, tone, value, unit, badge, sub, spark, color,
}: {
  label: string; icon: string; tone: string;
  value: string; unit: string; badge?: string; sub: string;
  spark?: { time: string; rainfall: number }[]; color?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon ${tone}`}><span className="material-symbols-outlined">{icon}</span></span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-mid">
        <span className="stat-value">{value}<small>{unit}</small></span>
        {badge && <span className={`stat-badge ${tone}`}>{badge}</span>}
      </div>
      <div className="stat-bottom">
        <span className="stat-sub">{sub}</span>
        {spark && spark.length > 0 && (
          <div className="stat-spark">
            <ResponsiveContainer width="100%" height={32}>
              <AreaChart data={spark}>
                <defs>
                  <linearGradient id={`sg-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="rainfall" stroke={color} strokeWidth={2} fill={`url(#sg-${label.replace(/\s/g, "")})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
