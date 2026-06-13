import { RoutePlanner } from "@/components/route-planner";
import "./planner.css";

export default function PlannerPage() {
  return (
    <div className="planner-container">
      <header className="planner-header">
        <a href="/" className="back-link"><i className="fa-solid fa-arrow-left" /> Back</a>
        <div className="planner-title">
          <div className="planner-icon"><i className="fa-solid fa-route" /></div>
          <div>
            <h1>Route Risk Planner</h1>
            <p>AI-powered safe routing during monsoon</p>
          </div>
        </div>
        <div className="planner-live">
          <span className="dot-live" /> Live
        </div>
      </header>
      <RoutePlanner />
    </div>
  );
}
