"use client";

import { useEffect, useState } from "react";
import { Map, AdvancedMarker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { CloudRain, Droplets, Thermometer, Wind, AlertTriangle, ShieldCheck, MapPin, Navigation, ArrowRight } from "lucide-react";

const RISK_COLOR: Record<string, string> = { Severe: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" };

interface LatLng { lat: number; lng: number }

export interface RiskData { zone_id: string; zone_name: string; lat: number; lng: number; risk_level: string; risk_score: number; incidents: number; drainage_notes: string }
export interface WeatherData { current_mm_per_hour: number; forecast_3h_mm: number; description: string; temp: number }
export interface ZoneItem { zone_id: string; zone_name: string; lat: number; lng: number; risk_level: string; risk_score: number; drainage_notes?: string }
export interface RouteData { origin: { name: string; lat: number; lng: number }; destination: { name: string; lat: number; lng: number }; risk_zones: ZoneItem[]; all_zones: ZoneItem[]; verdict: string; severe_count: number; est_distance?: string; est_duration?: string }

export type ChatComponent =
  | { kind: "risk"; data: RiskData }
  | { kind: "weather"; data: WeatherData }
  | { kind: "zoneList"; data: { zones: ZoneItem[] } }
  | { kind: "route"; data: RouteData };

function ScoreBadge({ score, level, size = 44 }: { score: number; level: string; size?: number }) {
  return (
    <div
      className="aw-badge"
      style={{ width: size, height: size, background: RISK_COLOR[level] || "#94a3b8", boxShadow: `0 0 0 6px ${(RISK_COLOR[level] || "#94a3b8")}22` }}
    >
      {score}
    </div>
  );
}

/* ───────── RISK CARD ───────── */
export function RiskCard({ data, onAsk }: { data: RiskData; onAsk?: (q: string) => void }) {
  const color = RISK_COLOR[data.risk_level] || "#94a3b8";
  return (
    <div className="aw-card">
      <div className="aw-card-head">
        <div className="aw-head-icon" style={{ background: `${color}1a`, color }}>
          <AlertTriangle size={16} strokeWidth={2.4} />
        </div>
        <div>
          <span className="aw-kicker">Flood Risk Assessment</span>
          <h4>{data.zone_name}</h4>
        </div>
        <span className="aw-pill" style={{ background: `${color}1a`, color }}>{data.risk_level}</span>
      </div>

      <div className="aw-map-sm">
        <Map defaultCenter={{ lat: data.lat, lng: data.lng }} defaultZoom={14} mapId="fg-risk" disableDefaultUI gestureHandling="greedy" style={{ width: "100%", height: "100%" }}>
          <AdvancedMarker position={{ lat: data.lat, lng: data.lng }}>
            <div className="aw-marker" style={{ background: color, boxShadow: `0 0 0 8px ${color}33` }}>{data.risk_score}</div>
          </AdvancedMarker>
        </Map>
      </div>

      <div className="aw-stats">
        <div><b style={{ color }}>{data.risk_score}</b><small>Risk Score</small></div>
        <div><b>{data.incidents}</b><small>Incidents/season</small></div>
        <div><b style={{ color }}>{data.risk_level}</b><small>Level</small></div>
      </div>

      <p className="aw-note"><MapPin size={12} strokeWidth={2.4} /> {data.drainage_notes}</p>

      {onAsk && (
        <button className="aw-action" onClick={() => onAsk(`Suggest a safe route avoiding ${data.zone_name}`)}>
          <Navigation size={13} strokeWidth={2.4} /> Find a safe route around this zone
        </button>
      )}
    </div>
  );
}

/* ───────── WEATHER CARD ───────── */
export function WeatherCard({ data }: { data: WeatherData }) {
  const heavy = data.current_mm_per_hour >= 10;
  return (
    <div className="aw-card aw-weather" style={{ borderColor: heavy ? "#bfdbfe" : undefined }}>
      <div className="aw-card-head">
        <div className="aw-head-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
          <CloudRain size={16} strokeWidth={2.4} />
        </div>
        <div>
          <span className="aw-kicker">Live Weather · Bengaluru</span>
          <h4 style={{ textTransform: "capitalize" }}>{data.description}</h4>
        </div>
      </div>
      <div className="aw-weather-grid">
        <div className="aw-w-stat"><Droplets size={18} color="#2563eb" /><b>{data.current_mm_per_hour}</b><small>mm/h now</small></div>
        <div className="aw-w-stat"><Wind size={18} color="#0891b2" /><b>{data.forecast_3h_mm}</b><small>mm next 3h</small></div>
        <div className="aw-w-stat"><Thermometer size={18} color="#f97316" /><b>{Math.round(data.temp)}°</b><small>temp</small></div>
      </div>
      {heavy && <p className="aw-warn"><AlertTriangle size={12} strokeWidth={2.4} /> Heavy rainfall — expect waterlogging at low-lying junctions.</p>}
    </div>
  );
}

/* ───────── ZONE LIST CARD ───────── */
export function ZoneListCard({ zones, onAsk }: { zones: ZoneItem[]; onAsk?: (q: string) => void }) {
  const center = { lat: 12.952, lng: 77.647 };
  return (
    <div className="aw-card">
      <div className="aw-card-head">
        <div className="aw-head-icon" style={{ background: "#fef2f2", color: "#ef4444" }}><AlertTriangle size={16} strokeWidth={2.4} /></div>
        <div>
          <span className="aw-kicker">High-Risk Zones</span>
          <h4>{zones.length} zones need caution</h4>
        </div>
      </div>
      <div className="aw-map-sm">
        <Map defaultCenter={center} defaultZoom={11} mapId="fg-zones" disableDefaultUI gestureHandling="greedy" style={{ width: "100%", height: "100%" }}>
          {zones.map((z) => (
            <AdvancedMarker key={z.zone_id} position={{ lat: z.lat, lng: z.lng }}>
              <div className="aw-marker" style={{ background: RISK_COLOR[z.risk_level], boxShadow: `0 0 0 6px ${RISK_COLOR[z.risk_level]}33`, width: 30, height: 30, fontSize: 11 }}>{z.risk_score}</div>
            </AdvancedMarker>
          ))}
        </Map>
      </div>
      <div className="aw-zone-rows">
        {zones.map((z) => (
          <button key={z.zone_id} className="aw-zone-row" onClick={() => onAsk?.(`What's the flood risk in ${z.zone_name}?`)}>
            <ScoreBadge score={z.risk_score} level={z.risk_level} size={30} />
            <span className="aw-zone-name">{z.zone_name}</span>
            <span className="aw-zone-level" style={{ color: RISK_COLOR[z.risk_level] }}>{z.risk_level}</span>
            <ArrowRight size={14} className="aw-zone-arrow" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────── ROUTE CARD (real Google Directions) ───────── */
function RouteLine({ origin, destination, onMeta }: { origin: LatLng; destination: LatLng; onMeta?: (m: { distance: string; duration: string }) => void }) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const [renderer, setRenderer] = useState<any>(null);

  useEffect(() => {
    if (!routesLib || !map) return;
    const r = new (routesLib as any).DirectionsRenderer({ map, suppressMarkers: true, polylineOptions: { strokeColor: "#2563eb", strokeWeight: 5, strokeOpacity: 0.85 } });
    setRenderer(r);
    return () => r.setMap(null);
  }, [routesLib, map]);

  useEffect(() => {
    if (!routesLib || !renderer) return;
    const svc = new (routesLib as any).DirectionsService();
    svc.route(
      { origin, destination, travelMode: "DRIVING" },
      (res: any, status: string) => {
        if (status === "OK" && res) {
          renderer.setDirections(res);
          const leg = res.routes?.[0]?.legs?.[0];
          if (leg && onMeta) onMeta({ distance: leg.distance?.text || "", duration: leg.duration?.text || "" });
        }
      }
    );
  }, [routesLib, renderer, origin, destination, onMeta]);

  return null;
}

export function RouteCard({ data }: { data: RouteData }) {
  const [meta, setMeta] = useState<{ distance: string; duration: string } | null>(null);
  const center = { lat: (data.origin.lat + data.destination.lat) / 2, lng: (data.origin.lng + data.destination.lng) / 2 };
  const verdictColor = data.verdict === "Clear" ? "#16a34a" : data.verdict === "Mostly clear" ? "#0891b2" : "#d97706";

  return (
    <div className="aw-card">
      <div className="aw-card-head">
        <div className="aw-head-icon" style={{ background: "#eff6ff", color: "#2563eb" }}><Navigation size={16} strokeWidth={2.4} /></div>
        <div>
          <span className="aw-kicker">Safe Route</span>
          <h4>{data.origin.name} <ArrowRight size={13} style={{ verticalAlign: "-1px" }} /> {data.destination.name}</h4>
        </div>
        <span className="aw-pill" style={{ background: `${verdictColor}1a`, color: verdictColor }}>{data.verdict}</span>
      </div>

      <div className="aw-map-md">
        <Map defaultCenter={center} defaultZoom={12} mapId="fg-route" disableDefaultUI gestureHandling="greedy" style={{ width: "100%", height: "100%" }}>
          <RouteLine origin={data.origin} destination={data.destination} onMeta={setMeta} />
          <AdvancedMarker position={data.origin}><div className="aw-pin aw-pin-start">A</div></AdvancedMarker>
          <AdvancedMarker position={data.destination}><div className="aw-pin aw-pin-end">B</div></AdvancedMarker>
          {data.risk_zones.map((z, i) => (
            <AdvancedMarker key={`${z.zone_name}-${i}`} position={{ lat: z.lat, lng: z.lng }}>
              <div className="aw-marker" style={{ background: RISK_COLOR[z.risk_level], boxShadow: `0 0 0 6px ${RISK_COLOR[z.risk_level]}33`, width: 28, height: 28, fontSize: 10 }}>{z.risk_score}</div>
            </AdvancedMarker>
          ))}
        </Map>
      </div>

      <div className="aw-stats">
        <div><b>{meta?.duration || data.est_duration || "—"}</b><small>Drive time</small></div>
        <div><b>{meta?.distance || data.est_distance || "—"}</b><small>Distance</small></div>
        <div><b style={{ color: data.severe_count ? "#ef4444" : "#16a34a" }}>{data.risk_zones.length}</b><small>Risk zones</small></div>
      </div>

      {data.risk_zones.length > 0 ? (
        <p className="aw-note"><AlertTriangle size={12} strokeWidth={2.4} color="#d97706" /> Passes near: {data.risk_zones.map((z) => z.zone_name).join(", ")}</p>
      ) : (
        <p className="aw-note"><ShieldCheck size={12} strokeWidth={2.4} color="#16a34a" /> No high-risk flood zones detected on this corridor.</p>
      )}
    </div>
  );
}

/* ───────── RICH TEXT (lightweight markdown: **bold** + "- " bullets) ───────── */
function renderInline(s: string, keyPrefix: string): React.ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
      : <span key={`${keyPrefix}-${i}`}>{part}</span>
  );
}

export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flush = () => {
    if (bullets.length) {
      const items = [...bullets];
      blocks.push(
        <ul className="rt-list" key={`ul-${blocks.length}`}>
          {items.map((it, i) => <li key={i}>{renderInline(it, `li-${blocks.length}-${i}`)}</li>)}
        </ul>
      );
      bullets = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const bullet = line.match(/^[-*•]\s+(.*)/);
    if (bullet) { bullets.push(bullet[1]); continue; }
    flush();
    const isTip = /^tip:/i.test(line);
    blocks.push(
      <p className={isTip ? "rt-tip" : "rt-p"} key={`p-${blocks.length}`}>
        {renderInline(line, `p-${blocks.length}`)}
      </p>
    );
  }
  flush();
  return <>{blocks}</>;
}

/* ───────── dispatcher ───────── */
export function ChatWidget({ component, onAsk }: { component: ChatComponent; onAsk?: (q: string) => void }) {
  switch (component.kind) {
    case "risk": return <RiskCard data={component.data} onAsk={onAsk} />;
    case "weather": return <WeatherCard data={component.data} />;
    case "zoneList": return <ZoneListCard zones={component.data.zones} onAsk={onAsk} />;
    case "route": return <RouteCard data={component.data} />;
    default: return null;
  }
}
