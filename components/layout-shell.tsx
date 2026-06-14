"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useWeather } from "@/lib/useWeather";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const weather = useWeather();

  return (
    <div className="dashboard-container">
      {/* ═══ HEADER ═══ */}
      <header>
        <div className="logo-area">
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src="/logo.png" alt="FlowGuard AI Logo" className="logo-image" />
          </Link>
        </div>

        <div className="nav-center">
          <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
            <i className="fa-solid fa-house" /> Home
          </Link>
          <Link href="/planner" className={`nav-item ${pathname === "/planner" ? "active" : ""}`}>
            <i className="fa-solid fa-map-location-dot" /> Planner
          </Link>
          <Link href="/assistant" className={`nav-item ${pathname === "/assistant" ? "active" : ""}`}>
            <i className="fa-solid fa-user-shield" /> Assistant
          </Link>
          <Link href="/dashboard" className={`nav-item ${pathname === "/dashboard" ? "active" : ""}`}>
            <i className="fa-solid fa-chart-line" /> City Dashboard
          </Link>
        </div>

        <div className="header-actions">
          <div className="user-profile">
            <img src="/profile_rahul.png" alt="Rahul Mirji" className="user-avatar" />
            <span className="user-name">Rahul Mirji</span>
          </div>
        </div>
      </header>

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <main className="main-content-flow" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
        {children}
      </main>

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
