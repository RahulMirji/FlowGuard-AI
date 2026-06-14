"use client";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";

const CENTER = { lat: 12.9516, lng: 77.6474 };
const zones = [
  { id: "silk_board", name: "Silk Board", score: 92, level: "severe", lat: 12.9172, lng: 77.6227 },
  { id: "bellandur", name: "Bellandur", score: 88, level: "severe", lat: 12.9260, lng: 77.6762 },
  { id: "hebbal", name: "Hebbal", score: 68, level: "high", lat: 13.0358, lng: 77.5970 },
  { id: "marathahalli", name: "Marathahalli", score: 47, level: "medium", lat: 12.9562, lng: 77.7010 },
  { id: "sarjapur", name: "Sarjapur Rd", score: 51, level: "medium", lat: 12.9100, lng: 77.6840 },
];
const colors: Record<string, string> = { severe: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981" };
const shadows: Record<string, string> = { severe: "rgba(239,68,68,0.3)", high: "rgba(249,115,22,0.3)", medium: "rgba(245,158,11,0.3)", low: "rgba(16,185,129,0.3)" };

export function PlannerMap() {
  const k = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!k) return <div className="map-fallback-msg">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</div>;
  return (
    <Map defaultCenter={CENTER} defaultZoom={12} mapId="planner" defaultTilt={45} gestureHandling="cooperative" disableDefaultUI style={{ width: "100%", height: "100%" }}>
      {zones.map((z) => (
        <AdvancedMarker key={z.id} position={{ lat: z.lat, lng: z.lng }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: colors[z.level], color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 8px ${shadows[z.level]}, 0 4px 8px rgba(0,0,0,0.2)` }}>{z.score}</div>
            <div style={{ background: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, marginTop: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textTransform: "uppercase" as const }}>{z.name}</div>
          </div>
        </AdvancedMarker>
      ))}
    </Map>
  );
}
