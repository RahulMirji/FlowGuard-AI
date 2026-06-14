"use client";

import { useEffect, useState, useRef } from "react";

interface Step {
  icon: string;
  title: string;
  desc: string;
  detail: string;
}

const steps: Step[] = [
  { icon: "fa-cloud-rain", title: "Weather Intelligence", desc: "Monitoring rainfall forecasts, storm activity, and environmental conditions.", detail: "Rainfall at 18.5mm/h · storm alert active · 32mm forecast next 3h" },
  { icon: "fa-route", title: "Traffic & Route Intelligence", desc: "Evaluating traffic patterns, route availability, and road accessibility.", detail: "3 route alternatives scanned · Silk Board showing 2.5x congestion" },
  { icon: "fa-database", title: "Infrastructure Assessment", desc: "Analyzing drainage systems, pumping stations, and water management infrastructure.", detail: "15 pump stations checked · Silk Board drain capacity exceeded" },
  { icon: "fa-clock-rotate-left", title: "Historical Flood Analysis", desc: "Reviewing historical flood records and identifying high-risk zones.", detail: "15 years cross-referenced · 8 high-risk zones identified on routes" },
  { icon: "fa-microchip", title: "Risk Prediction Engine", desc: "Predicting flood impact, waterlogging probability, and route safety scores.", detail: "Risk model confidence 94.6% · 5 zones exceed flood threshold" },
  { icon: "fa-map-location-dot", title: "Smart Route Recommendation", desc: "Delivering the safest route, backup alternatives, and actionable guidance.", detail: "Primary route locked · 2 backup options ready · avoiding 3 severe zones" },
];

interface AnalysisAnimationProps {
  onComplete?: () => void;
}

export function AnalysisAnimation({ onComplete }: AnalysisAnimationProps) {
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
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
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

      // Complete step after delay
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, i]);
        setProgress(Math.round(((i + 1) / steps.length) * 100));
        setTimeout(() => runStep(i + 1), 350);
      }, 1300);
    }, 600);
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
              {isComplete && <p className="aa-step-detail">{step.detail}</p>}
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
                <span className="aa-ss-val">94.6%</span>
              </div>
              <div className="aa-summary-stat">
                <span className="aa-ss-label">Zones checked</span>
                <span className="aa-ss-val">15</span>
              </div>
              <div className="aa-summary-stat">
                <span className="aa-ss-label">Routes ranked</span>
                <span className="aa-ss-val">3</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
