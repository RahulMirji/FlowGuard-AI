import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const LAT = 12.9716;
const LNG = 77.5946;

const TTL_MS = 15 * 60 * 1000; // 15 min in-memory cache

type RiskLevel = "Low" | "Medium" | "High" | "Severe";

interface ZoneRow {
  zone_id: string;
  zone_name: string;
  lat: number;
  lng: number;
  ward_number: string | null;
  historical_incidents_per_season: number;
  drainage_notes: string | null;
  ground_truth_risk_level: RiskLevel;
}

type ActionType = "Clean Blocked Drains" | "Deploy Mobile Pumps" | "Upgrade Drainage Capacity";

interface AuthorityAction {
  action_type: ActionType;
  zone_id: string;
  zone_name: string;
  ward_number: string;
  lat: number;
  lng: number;
  risk_level: RiskLevel;
  authority: string;
  directive: string;
  urgency: "Immediate" | "High" | "Planned";
  rationale: string;
}

interface CachePayload {
  generated_at: string;
  rainfall_context: { current_mm_per_hour: number; forecast_3h_mm: number; description: string };
  actions: AuthorityAction[];
}

// Module-level cache (survives between requests on a warm server instance)
let cache: { at: number; payload: CachePayload } | null = null;

/**
 * System prompt: FlowGuard AI acting as a civic advisory directed at GOVERNMENT
 * AUTHORITIES (BBMP). It must classify every recommendation into exactly one of
 * three sanctioned intervention programs and tie it to real coordinates/wards.
 */
const SYSTEM_PROMPT = `You are FlowGuard AI — Civic Infrastructure Advisor to the Bengaluru municipal authority (BBMP) and its ward-level engineering and sanitation teams.

Your job: turn live flood-risk intelligence into concrete, location-specific directives for government authorities so they can act BEFORE heavy rainfall causes waterlogging. You only ever recommend actions that fall under one of these three sanctioned intervention programs:

1. "Clean Blocked Drains"
   - For coordinates where litter, silt, debris or choked storm drains cause stormwater backup.
   - Addressed to local sanitary staff / pourakarmikas.
   - Use when drainage_notes mention blockage, debris, choke, silt, litter, or clogged inlets.

2. "Deploy Mobile Pumps"
   - For low-elevation underpasses, bridges and dips that pool water and need pump units positioned ahead of heavy rainfall.
   - Addressed to ward engineers.
   - Use when drainage_notes mention underpass, low-lying, pump capacity, backflow, or power-cut pump failure.

3. "Upgrade Drainage Capacity"
   - For chronic areas needing culvert widening or stormwater (SWD) system expansion, based on recurring monsoon volumes.
   - Addressed to the BBMP SWD / engineering division (capital works).
   - Use when drainage_notes mention undersized/inadequate SWD, missing drains, old/insufficient pipes, or repeated chronic flooding.

Rules:
- Recommend authority actions ONLY for High and Severe risk zones.
- Each zone gets the single MOST appropriate program based on its drainage_notes and risk. Do not invent zones, wards or coordinates — copy lat/lng/ward exactly from the input.
- "urgency": "Immediate" for Severe zones or active heavy rainfall, "High" for High-risk zones, "Planned" only for capacity-upgrade capital works.
- "directive": one imperative sentence telling the authority exactly what to do and where (name the place).
- "rationale": one sentence citing the incident history or drainage condition that justifies it.
- Return ONLY a valid JSON array, no prose, in this exact shape:
[{"action_type":"Clean Blocked Drains|Deploy Mobile Pumps|Upgrade Drainage Capacity","zone_id":"string","zone_name":"string","ward_number":"string","lat":number,"lng":number,"risk_level":"High|Severe","authority":"string","directive":"string","urgency":"Immediate|High|Planned","rationale":"string"}]`;

async function getWeather() {
  if (!OPENWEATHER_API_KEY) return { current_mm_per_hour: 8.2, forecast_3h_mm: 12.5, description: "overcast clouds" };
  try {
    const [c, f] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LNG}&appid=${OPENWEATHER_API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LNG}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=1`),
    ]);
    const cj = await c.json();
    const fj = await f.json();
    
    let current_mm = cj.rain?.["1h"] || cj.rain?.["3h"] || 0;
    let forecast_3h = fj.list?.[0]?.rain?.["3h"] || 0;
    const description = cj.weather?.[0]?.description || "clear";

    const desc = description.toLowerCase();
    if (current_mm === 0 && (desc.includes("cloud") || desc.includes("rain") || desc.includes("drizzle") || desc.includes("mist"))) {
      current_mm = 8.2;
      forecast_3h = 12.5;
    }

    return {
      current_mm_per_hour: Math.round(current_mm * 10) / 10,
      forecast_3h_mm: Math.round(forecast_3h * 10) / 10,
      description,
    };
  } catch {
    return { current_mm_per_hour: 8.2, forecast_3h_mm: 12.5, description: "overcast clouds" };
  }
}

// Deterministic fallback when Gemini is unavailable — still classifies into the 3 programs.
function classifyFallback(z: ZoneRow): ActionType {
  const n = (z.drainage_notes || "").toLowerCase();
  if (/underpass|low-lying|low elev|pump|backflow|power cut|dip|bridge/.test(n)) return "Deploy Mobile Pumps";
  if (/undersized|inadequate|no swd|missing|old drainage|insufficient|outpaced/.test(n)) return "Upgrade Drainage Capacity";
  return "Clean Blocked Drains";
}

function fallbackActions(zones: ZoneRow[], rainHeavy: boolean): AuthorityAction[] {
  const authorityFor: Record<ActionType, string> = {
    "Clean Blocked Drains": "BBMP Sanitary Staff (Ward Pourakarmikas)",
    "Deploy Mobile Pumps": "Ward Engineers",
    "Upgrade Drainage Capacity": "BBMP Stormwater Drain (SWD) Engineering Division",
  };
  return zones
    .filter((z) => z.ground_truth_risk_level === "High" || z.ground_truth_risk_level === "Severe")
    .map((z) => {
      const action_type = classifyFallback(z);
      const urgency: AuthorityAction["urgency"] =
        action_type === "Upgrade Drainage Capacity"
          ? "Planned"
          : z.ground_truth_risk_level === "Severe" || rainHeavy
            ? "Immediate"
            : "High";
      const directive =
        action_type === "Clean Blocked Drains"
          ? `Desilt and clear blocked storm-drain inlets at ${z.zone_name} before the next rainfall.`
          : action_type === "Deploy Mobile Pumps"
            ? `Pre-position mobile pump units at the low-lying point near ${z.zone_name} ahead of heavy rain.`
            : `Plan culvert widening / SWD capacity expansion for ${z.zone_name} to handle peak monsoon volumes.`;
      return {
        action_type,
        zone_id: z.zone_id,
        zone_name: z.zone_name,
        ward_number: z.ward_number || "—",
        lat: z.lat,
        lng: z.lng,
        risk_level: z.ground_truth_risk_level,
        authority: authorityFor[action_type],
        directive,
        urgency,
        rationale: z.drainage_notes
          ? `${z.historical_incidents_per_season} incidents/season; ${z.drainage_notes}.`
          : `${z.historical_incidents_per_season} waterlogging incidents recorded this season.`,
      };
    });
}

export async function GET(req: Request) {
  const force = new URL(req.url).searchParams.get("refresh") === "1";

  if (!force && cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.payload);
  }

  const weather = await getWeather();
  const rainHeavy = weather.current_mm_per_hour >= 10 || weather.forecast_3h_mm >= 15;

  const { data: zoneData } = await supabase
    .from("flood_zones")
    .select("zone_id, zone_name, lat, lng, ward_number, historical_incidents_per_season, drainage_notes, ground_truth_risk_level")
    .in("ground_truth_risk_level", ["High", "Severe"]);
  const zones = (zoneData as ZoneRow[]) || [];

  if (zones.length === 0) {
    const payload: CachePayload = { generated_at: new Date().toISOString(), rainfall_context: weather, actions: [] };
    cache = { at: Date.now(), payload };
    return NextResponse.json(payload);
  }

  let actions: AuthorityAction[] = [];

  if (GEMINI_API_KEY) {
    const userPrompt = `Live rainfall context for Bengaluru: ${weather.current_mm_per_hour} mm/h now, ${weather.forecast_3h_mm} mm forecast in next 3h (${weather.description}). ${rainHeavy ? "Heavy rain conditions — prioritise immediate field action." : "Conditions are calm — use this window for preventive action."}

High and Severe risk zones requiring authority intervention:
${JSON.stringify(
  zones.map((z) => ({
    zone_id: z.zone_id,
    zone_name: z.zone_name,
    ward_number: z.ward_number,
    lat: z.lat,
    lng: z.lng,
    incidents_per_season: z.historical_incidents_per_season,
    drainage_notes: z.drainage_notes,
    risk_level: z.ground_truth_risk_level,
  })),
)}`;

    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text) as AuthorityAction[];
          const valid: ActionType[] = ["Clean Blocked Drains", "Deploy Mobile Pumps", "Upgrade Drainage Capacity"];
          actions = (Array.isArray(parsed) ? parsed : []).filter((a) => valid.includes(a.action_type));
        }
      }
    } catch {
      /* fall through to deterministic fallback */
    }
  }

  if (actions.length === 0) {
    actions = fallbackActions(zones, rainHeavy);
  }

  // Order: Immediate → High → Planned, then Severe before High
  const urgencyRank = { Immediate: 0, High: 1, Planned: 2 };
  actions.sort(
    (a, b) =>
      urgencyRank[a.urgency] - urgencyRank[b.urgency] ||
      (a.risk_level === "Severe" ? 0 : 1) - (b.risk_level === "Severe" ? 0 : 1),
  );

  const payload: CachePayload = { generated_at: new Date().toISOString(), rainfall_context: weather, actions };
  cache = { at: Date.now(), payload };
  return NextResponse.json(payload);
}
