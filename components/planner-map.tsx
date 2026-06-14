"use client";

import React, { useState, useEffect } from "react";
import { Map, AdvancedMarker, Polyline, useMap } from "@vis.gl/react-google-maps";

export interface FloodZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  level: "low" | "medium" | "high" | "severe";
  score: number;
  ward?: string;
  incidents?: number;
  notes?: string;
}

export interface RoutePath {
  route_id: string;
  path: { lat: number; lng: number }[];
  verdict: "Recommended" | "Use with caution" | "Avoid";
}

const CENTER = { lat: 12.9516, lng: 77.6474 };

export const FALLBACK_ZONES: FloodZone[] = [
  {
    id: "silk_board",
    name: "Silk Board Junction",
    lat: 12.9172,
    lng: 77.6227,
    level: "severe",
    score: 92,
    ward: "W-191",
    incidents: 8,
    notes: "Known underpass drainage failure, single outflow pipe for 4-lane underpass"
  },
  {
    id: "bellandur",
    name: "Bellandur Lake Area",
    lat: 12.9260,
    lng: 77.6762,
    level: "severe",
    score: 88,
    ward: "W-150",
    incidents: 7,
    notes: "Lake overflow during heavy rain, blocked raja kaluve (stormwater drain)"
  },
  {
    id: "kr_puram",
    name: "KR Puram Railway Bridge",
    lat: 13.0012,
    lng: 77.6868,
    level: "high",
    score: 70,
    ward: "W-57",
    incidents: 6,
    notes: "Low-lying road under railway bridge, inadequate pump capacity"
  },
  {
    id: "hebbal",
    name: "Hebbal Flyover",
    lat: 13.0358,
    lng: 77.5970,
    level: "high",
    score: 68,
    ward: "W-4",
    incidents: 5,
    notes: "Service road flooding from blocked drain inlets"
  },
  {
    id: "koramangala",
    name: "Koramangala Sony World",
    lat: 12.9352,
    lng: 77.6245,
    level: "high",
    score: 70,
    ward: "W-151",
    incidents: 5,
    notes: "Old drainage system, undersized pipes for current density"
  },
  {
    id: "sarjapur_road",
    name: "Sarjapur Rd Wipro Jn",
    lat: 12.9100,
    lng: 77.6840,
    level: "high",
    score: 70,
    ward: "W-174",
    incidents: 4,
    notes: "Rapid development outpaced drainage infra, no SWD for 2km stretch"
  },
  {
    id: "yemalur",
    name: "Yemalur",
    lat: 12.9580,
    lng: 77.7010,
    level: "medium",
    score: 45,
    ward: "W-149",
    incidents: 4,
    notes: "Low elevation, backflow from Bellandur lake drain"
  },
  {
    id: "marathahalli",
    name: "Marathahalli Bridge",
    lat: 12.9562,
    lng: 77.7010,
    level: "high",
    score: 70,
    ward: "W-84",
    incidents: 5,
    notes: "Bridge underpass pools water, single drain outlet blocked frequently"
  },
  {
    id: "mahadevapura",
    name: "Mahadevapura",
    lat: 12.9988,
    lng: 77.6932,
    level: "medium",
    score: 45,
    ward: "W-82",
    incidents: 3,
    notes: "New layouts with incomplete SWD connections"
  },
  {
    id: "electronic_city",
    name: "Electronic City Underpass",
    lat: 12.8456,
    lng: 77.6603,
    level: "high",
    score: 70,
    ward: "W-198",
    incidents: 4,
    notes: "Underpass design flaw, pumps fail during power cuts"
  },
  {
    id: "tin_factory",
    name: "Tin Factory Junction",
    lat: 12.9988,
    lng: 77.6650,
    level: "medium",
    score: 45,
    ward: "W-59",
    incidents: 3,
    notes: "Moderate flooding at junction, partial drain blockage"
  },
  {
    id: "yeshwanthpur",
    name: "Yeshwanthpur Circle",
    lat: 13.0220,
    lng: 77.5510,
    level: "medium",
    score: 45,
    ward: "W-20",
    incidents: 3,
    notes: "Older drainage, seasonal blockage from construction debris"
  },
  {
    id: "hsr_layout",
    name: "HSR Layout Agara Jn",
    lat: 12.9116,
    lng: 77.6389,
    level: "high",
    score: 70,
    ward: "W-174",
    incidents: 4,
    notes: "Agara lake overflow path crosses road, SWD undersized"
  },
  {
    id: "orr_bellandur",
    name: "Outer Ring Road Bellandur",
    lat: 12.9340,
    lng: 77.6780,
    level: "severe",
    score: 90,
    ward: "W-150",
    incidents: 6,
    notes: "ORR median drains overflow onto service road, chronic issue"
  },
  {
    id: "orr_marathahalli",
    name: "Outer Ring Road Marathahalli",
    lat: 12.9560,
    lng: 77.7000,
    level: "medium",
    score: 45,
    ward: "W-84",
    incidents: 4,
    notes: "Similar to Bellandur stretch, slightly better drainage"
  },
  {
    id: "goraguntepalya",
    name: "Goraguntepalya Junction",
    lat: 13.0285,
    lng: 77.5350,
    level: "high",
    score: 70,
    ward: "W-17",
    incidents: 5,
    notes: "Severe waterlogging under flyover, stormwater drain inlets blocked by debris"
  },
  {
    id: "dairy_circle",
    name: "Dairy Circle Underpass",
    lat: 12.9416,
    lng: 77.5972,
    level: "high",
    score: 70,
    ward: "W-143",
    incidents: 6,
    notes: "Low-lying underpass collects runoff, drainage pump capacity is insufficient"
  },
  {
    id: "kadubeesanahalli",
    name: "Kadubeesanahalli Underpass",
    lat: 12.9365,
    lng: 77.6905,
    level: "severe",
    score: 90,
    ward: "W-150",
    incidents: 7,
    notes: "Major bottleneck on ORR, service road underpass submerged up to 3 feet during heavy rain"
  },
  {
    id: "varthur_road",
    name: "Varthur Lake Road",
    lat: 12.9422,
    lng: 77.7280,
    level: "high",
    score: 70,
    ward: "W-149",
    incidents: 4,
    notes: "Low elevation road near lake runoff channel, floods when lake level rises"
  },
  {
    id: "panathur_rub",
    name: "Panathur Underbridge",
    lat: 12.9342,
    lng: 77.7042,
    level: "severe",
    score: 90,
    ward: "W-85",
    incidents: 8,
    notes: "Chronically flooded low-lying underbridge, storm drains lack proper gravity outfall"
  }
];

const colors: Record<string, string> = { severe: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981" };
const shadows: Record<string, string> = { severe: "rgba(239,68,68,0.3)", high: "rgba(249,115,22,0.3)", medium: "rgba(245,158,11,0.3)", low: "rgba(16,185,129,0.3)" };

function TrafficLayer({ enabled }: { enabled: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const g = (window as any).google;
    if (!g || !g.maps) return;
    const trafficLayer = new g.maps.TrafficLayer();
    if (enabled) {
      trafficLayer.setMap(map);
    } else {
      trafficLayer.setMap(null);
    }
    return () => {
      trafficLayer.setMap(null);
    };
  }, [map, enabled]);

  return null;
}

function MapBoundsController({ routePaths }: { routePaths: RoutePath[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || routePaths.length === 0) return;
    const g = (window as any).google;
    if (!g || !g.maps) return;

    const bounds = new g.maps.LatLngBounds();
    routePaths.forEach((rp) => {
      rp.path.forEach((pt) => {
        bounds.extend(pt);
      });
    });
    map.fitBounds(bounds, {
      top: 80,
      bottom: 80,
      left: 80,
      right: 80
    });
  }, [map, routePaths]);

  return null;
}


const routeColors: Record<string, string> = {
  "Recommended": "#10b981",
  "Use with caution": "#f59e0b",
  "Avoid": "#ef4444",
};

export function PlannerMap({ 
  zones = FALLBACK_ZONES, 
  showTraffic = false,
  routePaths = [],
  selectedRouteId,
  onRouteSelect,
}: { 
  zones?: FloodZone[]; 
  showTraffic?: boolean;
  routePaths?: RoutePath[];
  selectedRouteId?: string | null;
  onRouteSelect?: (routeId: string) => void;
}) {
  const k = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  if (!k) return <div className="map-fallback-msg">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</div>;

  // Sort routes so the selected one renders last (on top)
  const sortedRoutes = [...routePaths].sort((a, b) => {
    if (a.route_id === selectedRouteId) return 1;
    if (b.route_id === selectedRouteId) return -1;
    return 0;
  });

  return (
    <Map 
      defaultCenter={CENTER} 
      defaultZoom={12} 
      mapId="planner" 
      defaultTilt={45} 
      gestureHandling="cooperative" 
      disableDefaultUI 
      style={{ width: "100%", height: "100%" }}
      onClick={() => setActiveZoneId(null)}
    >
      <TrafficLayer enabled={showTraffic} />
      <MapBoundsController routePaths={routePaths} />

      {/* Route polylines */}
      {sortedRoutes.map((rp) => {
        const isSelected = rp.route_id === selectedRouteId;
        const color = routeColors[rp.verdict] || "#6b7280";
        return (
          <Polyline
            key={rp.route_id}
            path={rp.path}
            strokeColor={color}
            strokeOpacity={isSelected ? 1.0 : 0.5}
            strokeWeight={isSelected ? 6 : 3}
            onClick={() => onRouteSelect?.(rp.route_id)}
          />
        );
      })}
      {zones.map((z) => (
        <AdvancedMarker 
          key={z.id} 
          position={{ lat: z.lat, lng: z.lng }}
        >
          <div 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              cursor: "pointer",
              position: "relative"
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveZoneId(activeZoneId === z.id ? null : z.id);
            }}
          >
            {/* Pulsing hazard score marker */}
            <div 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: "50%", 
                background: colors[z.level], 
                color: "#fff", 
                fontWeight: 700, 
                fontSize: 13, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                boxShadow: `0 0 0 6px ${shadows[z.level]}, 0 4px 8px rgba(0,0,0,0.3)`,
                transition: "transform 0.2s ease",
                transform: activeZoneId === z.id ? "scale(1.15)" : "scale(1)"
              }}
            >
              {z.score}
            </div>
            
            {/* Quick label */}
            <div 
              style={{ 
                background: "rgba(15, 23, 42, 0.85)", 
                backdropFilter: "blur(4px)",
                color: "#fff",
                padding: "2px 6px", 
                borderRadius: 4, 
                fontSize: 8, 
                fontWeight: 600, 
                marginTop: 6, 
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                textTransform: "uppercase" as const,
                whiteSpace: "nowrap",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              {z.name}
            </div>

            {/* Interactive Tooltip details card */}
            {activeZoneId === z.id && (
              <div 
                style={{
                  position: "absolute",
                  bottom: 60,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 240,
                  background: "rgba(15, 23, 42, 0.95)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 12,
                  padding: 12,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  zIndex: 9999,
                  pointerEvents: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  color: "#f3f4f6",
                  animation: "fadeInUp 0.15s ease-out"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#ffffff", lineHeight: 1.2 }}>{z.name}</span>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setActiveZoneId(null); 
                    }} 
                    style={{ 
                      background: "rgba(255,255,255,0.1)", 
                      border: "none", 
                      fontSize: 10, 
                      cursor: "pointer", 
                      color: "#9ca3af",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 6, fontSize: 9, alignItems: "center" }}>
                  <span 
                    style={{ 
                      background: colors[z.level], 
                      color: "#fff", 
                      padding: "2px 6px", 
                      borderRadius: 4, 
                      fontWeight: 700, 
                      textTransform: "uppercase" 
                    }}
                  >
                    {z.level} Risk
                  </span>
                  {z.ward && (
                    <span 
                      style={{ 
                        color: "#9ca3af",
                        background: "rgba(255,255,255,0.05)",
                        padding: "2px 6px",
                        borderRadius: 4
                      }}
                    >
                      Ward: {z.ward}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div style={{ fontSize: 10, display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 6, marginTop: 2 }}>
                  {z.incidents !== undefined && (
                    <div style={{ color: "#d1d5db" }}>
                      <strong>Historical Incidents:</strong> <span style={{ color: colors[z.level], fontWeight: 600 }}>{z.incidents} / season</span>
                    </div>
                  )}
                  {z.notes && (
                    <div style={{ color: "#9ca3af", fontSize: 9.5, lineHeight: 1.3, fontStyle: "italic", marginTop: 2 }}>
                      "{z.notes}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </AdvancedMarker>
      ))}
    </Map>
  );
}
