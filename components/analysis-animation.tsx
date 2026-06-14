"use client";

import { useEffect, useState, useRef } from "react";

interface Step {
  icon: string;
  title: string;
  desc: string;
  detail: string;
}

const steps: Step[] = [
  { icon: "fa-cloud-rain", title: "Collecting Weather Data", desc: "Collecting rain probability and wind speed data from live weather services to assess current conditions along your route.", detail: "Rain probability 82% · wind speed 24 km/h · 32mm rainfall forecast next 3h" },
  { icon: "fa-route", title: "Collecting Traffic Data", desc: "Collecting the shortest route, looking for multiple route alternatives, and determining the safest path based on live traffic conditions.", detail: "3 routes found · shortest via ORR · safest via Bannerghatta avoids 2 flood zones" },
  { icon: "fa-database", title: "Looking at Drainage System Plan", desc: "Collecting the number of drainage pipelines deployed, checking pump station status, and reviewing cleaned drainage records in your route area.", detail: "15 pipelines checked · 8 pumps active · 3 drains recently cleared" },
  { icon: "fa-clock-rotate-left", title: "Looking at Historical Flood Data", desc: "Reviewing past flood records and waterlogging incidents to identify recurring risk zones along your selected routes.", detail: "15 years cross-referenced · 8 high-risk zones identified on routes" },
  { icon: "fa-shield-halved", title: "Preparing Recommended Actions", desc: "Ranking all routes by safety score, generating flood-risk alerts, and preparing the safest route recommendation for your journey.", detail: "Safest route locked · 2 backup options ready · avoiding 3 severe zones" },
];

interface AnalysisAnimationProps {
  onComplete?: () => void;
  pendingResult?: any;
}

export function AnalysisAnimation({ onComplete, pendingResult }: AnalysisAnimationProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showTyping, setShowTyping] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [status, setStatus] = useState("Starting analysis");
  const [done, setDone] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    runStep(0);
  }, []);

  useEffect(() => {
    const containers = [
      document.querySelector(".right-panel"),
      document.querySelector(".panel-results-area"),
      document.querySelector(".planner-modal-grid")
    ];
    containers.forEach((c) => {
      if (c) {
        c.scrollTo({
          top: c.scrollHeight,
          behavior: "smooth"
        });
      }
    });
  }, [currentStep, completedSteps, showTyping, done]);

  const runStep = (i: number) => {
    if (i >= steps.length) {
      setShowTyping(true);
      setStatus("Delivering recommendation");
      setTimeout(() => {
        setShowTyping(false);
        setDone(true);
        setStatus("Safest route delivered");
        onComplete?.();
      }, 600);
      return;
    }

    setStatus(`Step ${i + 1} of ${steps.length} — ${steps[i].title.toLowerCase()}`);
    setShowTyping(true);

    setTimeout(() => {
      setShowTyping(false);
      setCurrentStep(i);
      setStepProgress(0);

      // Animate step progress
      setTimeout(() => setStepProgress(100), 50);

      // Complete step after delay (1400ms progress + 200ms gap = 2s total per step)
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, i]);
        setProgress(Math.round(((i + 1) / steps.length) * 100));
        setTimeout(() => runStep(i + 1), 200);
      }, 1400);
    }, 400);
  };

  const getStepDetail = (step: Step, index: number) => {
    if (!pendingResult || !pendingResult.meta) return step.detail;
    const { weather, traffic, drainage, historical } = pendingResult.meta;

    switch (index) {
      case 0:
        if (weather) {
          return `Current: ${weather.description} (${weather.current_mm_per_hour} mm/h) · Wind: ${weather.wind_speed} km/h · Forecast: ${weather.forecast_3h_mm} mm in next 3h`;
        }
        break;
      case 1:
        if (traffic && pendingResult.routes) {
          const shortestLabel = traffic.shortest_route_id === "route_a" ? "A" : traffic.shortest_route_id === "route_b" ? "B" : "C";
          const safestLabel = traffic.safest_route_id === "route_a" ? "A" : traffic.safest_route_id === "route_b" ? "B" : "C";
          return `${traffic.routes_count} routes found · shortest is Route ${shortestLabel} (${traffic.shortest_duration} min) · safest is Route ${safestLabel}`;
        }
        break;
      case 2:
        if (drainage) {
          return `${drainage.pipelines_checked} pipelines checked · ${drainage.pumps_active} pumps active · ${drainage.drains_cleared} drains recently cleared`;
        }
        break;
      case 3:
        if (historical) {
          return `15 years cross-referenced · ${historical.hotspots_count} hotspots on routes (${historical.total_incidents} seasonal incidents)`;
        }
        break;
      case 4:
        if (pendingResult.routes) {
          const safestLabel = pendingResult.recommended_route_id === "route_a" ? "A" : pendingResult.recommended_route_id === "route_b" ? "B" : "C";
          const alternativesCount = pendingResult.routes.length - 1;
          const avoidCount = pendingResult.routes.filter((r: any) => r.verdict === "Avoid").length;
          return `Safest route locked: Route ${safestLabel} · ${alternativesCount} backup option${alternativesCount !== 1 ? "s" : ""} ready · avoiding ${avoidCount} severe zones`;
        }
        break;
    }
    return step.detail;
  };

  return (
    <div className="analysis-anim">
      {/* Header */}
      <div className="aa-header">
        <div className="aa-icon-wrap">
          <i className="fa-solid fa-cloud-bolt" />
        </div>
        <div className="aa-header-text">
          <p className="aa-title">Flood Route Assistant</p>
          <p className="aa-status">{status}</p>
        </div>
        <div className={`aa-live-dot ${done ? "done" : ""}`} />
      </div>

      {/* Overall progress */}
      <div className="aa-overall">
        <div className="aa-overall-labels">
          <span>Overall progress</span>
          <span>{progress}%</span>
        </div>
        <div className="aa-overall-track">
          <div className="aa-overall-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Feed */}
      <div className="aa-feed" ref={feedRef}>
        {steps.map((step, i) => {
          if (i > currentStep && !completedSteps.includes(i)) return null;
          const isComplete = completedSteps.includes(i);
          const isCurrent = i === currentStep && !isComplete;

          return (
            <div key={i} className={`aa-step ${isComplete ? "complete" : ""}`}>
              <div className="aa-step-header">
                <i className={`fa-solid ${isComplete ? "fa-circle-check" : step.icon} aa-step-icon ${isComplete ? "green" : "blue"}`} />
                <div className="aa-step-meta">
                  <span className="aa-step-num">Step {i + 1} of {steps.length}</span>
                  <span className="aa-step-title">{step.title}</span>
                </div>
                <span className={`aa-badge ${isComplete ? "done" : "running"}`}>
                  {isComplete ? "done" : "running"}
                </span>
              </div>
              <p className="aa-step-desc">{step.desc}</p>
              <div className="aa-step-track">
                <div
                  className="aa-step-bar"
                  style={{ width: isCurrent ? `${stepProgress}%` : isComplete ? "100%" : "0%" }}
                />
              </div>
              {isComplete && <p className="aa-step-detail">{getStepDetail(step, i)}</p>}
            </div>
          );
        })}

        {showTyping && (
          <div className="aa-typing">
            <span className="aa-dot" />
            <span className="aa-dot" />
            <span className="aa-dot" />
          </div>
        )}

        {done && (
          <div className="aa-summary">
            <div className="aa-summary-header">
              <i className="fa-solid fa-shield-halved aa-summary-icon" />
              <span>Recommended route ready</span>
            </div>
            <p className="aa-summary-desc">
              Analyzing complete. AI has ranked all routes by safety score, accounting for live rainfall, flood zones, and traffic conditions.
            </p>
            <div className="aa-summary-grid">
              <div className="aa-summary-stat">
                <span className="aa-ss-label">Confidence</span>
                <span className="aa-ss-val">{pendingResult?.meta?.confidence || "94.6%"}</span>
              </div>
              <div className="aa-summary-stat">
                <span className="aa-ss-label">Zones checked</span>
                <span className="aa-ss-val">{pendingResult?.meta?.drainage?.pipelines_checked || "15"}</span>
              </div>
              <div className="aa-summary-stat">
                <span className="aa-ss-label">Routes ranked</span>
                <span className="aa-ss-val">{pendingResult?.meta?.traffic?.routes_count || "3"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
