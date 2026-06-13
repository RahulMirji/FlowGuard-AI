import { ChatPanel } from "@/components/chat-panel";
import "./assistant.css";

export default function AssistantPage() {
  return (
    <div className="assistant-container">
      <header className="assistant-header">
        <a href="/" className="back-link"><i className="fa-solid fa-arrow-left" /> Back</a>
        <div className="assistant-title">
          <div className="assistant-icon"><i className="fa-solid fa-shield-halved" /></div>
          <div>
            <h1>FlowGuard AI Assistant</h1>
            <p>Ask about flood risk, routes & safety in Bengaluru</p>
          </div>
        </div>
        <div className="assistant-status">
          <span className="dot-live" /> Online
        </div>
      </header>
      <ChatPanel />
    </div>
  );
}
