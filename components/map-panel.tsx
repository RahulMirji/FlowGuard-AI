"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

const BENGALURU_CENTER = { lat: 12.9516, lng: 77.6474 };

export interface MapZone {
  id: string;
  name: string;
  score: number;
  level: string;
  lat: number;
  lng: number;
}

const defaultZones: MapZone[] = [
  { id: "hebbal", name: "Hebbal", score: 68, level: "high", lat: 13.0358, lng: 77.5970 },
  { id: "krpuram", name: "KR Puram", score: 44, level: "medium", lat: 13.0012, lng: 77.6868 },
  { id: "koramangala", name: "Koramangala", score: 71, level: "high", lat: 12.9352, lng: 77.6245 },
  { id: "marathahalli", name: "Marathahalli", score: 47, level: "medium", lat: 12.9562, lng: 77.7010 },
  { id: "silkboard", name: "Silk Board", score: 92, level: "severe", lat: 12.9172, lng: 77.6227 },
  { id: "bellandur", name: "Bellandur", score: 88, level: "severe", lat: 12.9260, lng: 77.6762 },
  { id: "sarjapur", name: "Sarjapur Rd", score: 51, level: "medium", lat: 12.9100, lng: 77.6840 },
];

const riskColors: Record<string, string> = {
  severe: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export function MapPanel({ zones: zonesProp }: { zones?: MapZone[] } = {}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const zones = zonesProp && zonesProp.length > 0 ? zonesProp : defaultZones;

  if (!apiKey) {
    return <MapFallback />;
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={BENGALURU_CENTER}
        defaultZoom={12}
        mapId="flowguard-map"
        defaultTilt={45}
        gestureHandling="cooperative"
        disableDefaultUI={true}
        style={{ width: "100%", height: "100%" }}
      >
        {zones.map((zone) => (
          <AdvancedMarker key={zone.id} position={{ lat: zone.lat, lng: zone.lng }}>
            <div className="zone-marker-3d">
              <div
                className="zone-node"
                style={{
                  background: riskColors[zone.level],
                  boxShadow: `0 4px 12px rgba(0,0,0,0.15), 0 0 20px ${riskColors[zone.level]}40`,
                }}
              >
                {zone.score}
              </div>
              <div className={`zone-label-tag ${zone.level === "severe" ? "severe-label" : ""}`}>
                {zone.name}
              </div>
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}

function MapFallback() {
  return (
    <div className="map-fallback">
      <div className="map-fallback-inner">
        <i className="fa-solid fa-map-location-dot" />
        <p>Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to <code>.env.local</code></p>
      </div>
    </div>
  );
}
