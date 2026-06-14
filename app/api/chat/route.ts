import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const SCORE: Record<string, number> = { Severe: 92, High: 71, Medium: 47, Low: 22 };

// Common Bengaluru landmarks (origin/destination resolution for routing)
const LANDMARKS: Record<string, { name: string; lat: number; lng: number }> = {
  koramangala: { name: "Koramangala", lat: 12.9352, lng: 77.6245 },
  whitefield: { name: "Whitefield", lat: 12.9698, lng: 77.75 },
  silkboard: { name: "Silk Board Junction", lat: 12.9172, lng: 77.6227 },
  bellandur: { name: "Bellandur", lat: 12.926, lng: 77.6762 },
  hebbal: { name: "Hebbal", lat: 13.0358, lng: 77.597 },
  manyata: { name: "Manyata Tech Park", lat: 13.044, lng: 77.6206 },
  majestic: { name: "Majestic", lat: 12.9767, lng: 77.5713 },
  indiranagar: { name: "Indiranagar", lat: 12.9719, lng: 77.6412 },
  electroniccity: { name: "Electronic City", lat: 12.8456, lng: 77.6603 },
  hsr: { name: "HSR Layout", lat: 12.9116, lng: 77.6389 },
  marathahalli: { name: "Marathahalli", lat: 12.9562, lng: 77.701 },
  malleswaram: { name: "Malleswaram", lat: 13.0035, lng: 77.5647 },
  jayanagar: { name: "Jayanagar", lat: 12.925, lng: 77.5938 },
  mgroad: { name: "MG Road", lat: 12.9756, lng: 77.6068 },
  bannerghatta: { name: "Bannerghatta Road", lat: 12.89, lng: 77.597 },
  sarjapur: { name: "Sarjapur Road", lat: 12.91, lng: 77.684 },
  krpuram: { name: "KR Puram", lat: 13.0012, lng: 77.6868 },
  btm: { name: "BTM Layout", lat: 12.9166, lng: 77.6101 },
  jpnagar: { name: "JP Nagar", lat: 12.9063, lng: 77.5857 },
  ecity: { name: "Electronic City", lat: 12.8456, lng: 77.6603 },
};

interface ZoneRow {
  zone_id: string;
  zone_name: string;
  lat: number;
  lng: number;
  historical_incidents_per_season: number;
  drainage_notes: string;
  ground_truth_risk_level: string;
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchLocation(query: string, zones: ZoneRow[]) {
  const q = normalize(query);
  // landmark dictionary first
  for (const key of Object.keys(LANDMARKS)) {
    if (q.includes(key) || key.includes(q)) return LANDMARKS[key];
  }
  // flood zones
  let best: { name: string; lat: number; lng: number } | null = null;
  let bestScore = 0;
  for (const z of zones) {
    const zn = normalize(z.zone_name);
    const zid = normalize(z.zone_id);
    let score = 0;
    if (zn === q || zid === q) score = 100;
    else if (zn.includes(q) || q.includes(zid) || zid.includes(q)) score = 60;
    else {
      const words = z.zone_name.toLowerCase().split(/[^a-z0-9]+/);
      if (words.some((w) => w.length > 2 && q.includes(normalize(w)))) score = 40;
    }
    if (score > bestScore) { bestScore = score; best = { name: z.zone_name, lat: z.lat, lng: z.lng }; }
  }
  return bestScore >= 40 ? best : null;
}

function matchZone(query: string, zones: ZoneRow[]): ZoneRow | null {
  const q = normalize(query);
  let best: ZoneRow | null = null;
  let bestScore = 0;
  for (const z of zones) {
    const zn = normalize(z.zone_name);
    const zid = normalize(z.zone_id);
    let score = 0;
    if (zn === q || zid === q) score = 100;
    else if (zn.includes(q) || zid.includes(q) || q.includes(zid)) score = 70;
    else {
      const words = z.zone_name.toLowerCase().split(/[^a-z0-9]+/);
      if (words.some((w) => w.length > 2 && q.includes(normalize(w)))) score = 50;
    }
    if (score > bestScore) { bestScore = score; best = z; }
  }
  return bestScore >= 50 ? best : null;
}

async function getWeather() {
  if (!OPENWEATHER_API_KEY) return { current_mm_per_hour: 18.5, forecast_3h_mm: 32, description: "moderate rain", temp: 24 };
  try {
    const [c, f] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=12.9716&lon=77.5946&appid=${OPENWEATHER_API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=12.9716&lon=77.5946&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=1`),
    ]);
    const cj = await c.json();
    const fj = await f.json();
    return {
      current_mm_per_hour: Math.round((cj.rain?.["1h"] || cj.rain?.["3h"] || 0) * 10) / 10,
      forecast_3h_mm: Math.round((fj.list?.[0]?.rain?.["3h"] || 0) * 10) / 10,
      description: cj.weather?.[0]?.description || "clear",
      temp: cj.main?.temp ?? 24,
    };
  } catch {
    return { current_mm_per_hour: 18.5, forecast_3h_mm: 32, description: "moderate rain", temp: 24 };
  }
}

// ── Tool declarations for Gemini ──
const toolDeclarations = [
  {
    name: "get_zone_risk",
    description: "Get the current flood risk level, score, history and drainage status for a specific area/zone/junction in Bengaluru. Use whenever the user asks about flood risk or safety of a place.",
    parameters: {
      type: "object",
      properties: { zone: { type: "string", description: "Area or junction name, e.g. 'Marathahalli', 'Silk Board', 'Koramangala'" } },
      required: ["zone"],
    },
  },
  {
    name: "find_safe_route",
    description: "Find and assess the safest commute route between two Bengaluru locations, accounting for flood-risk zones along the way. Use when the user asks for directions, routes, or how to travel between places.",
    parameters: {
      type: "object",
      properties: {
        origin: { type: "string", description: "Starting location" },
        destination: { type: "string", description: "Destination location" },
      },
      required: ["origin", "destination"],
    },
  },
  {
    name: "get_current_weather",
    description: "Get live rainfall (mm/h), 3-hour rainfall forecast, temperature and conditions for Bengaluru. Use for rain/weather questions.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "list_high_risk_zones",
    description: "List the current high and severe flood-risk zones across Bengaluru, ranked by risk score. Use when the user asks about dangerous areas, hotspots, or which zones to avoid.",
    parameters: { type: "object", properties: {} },
  },
];

const SYSTEM_PROMPT = `You are FlowGuard AI, a friendly, sharp assistant for Bengaluru commuters during monsoon season.

Behaviour rules:
- ALWAYS call the most relevant tool(s) to gather live data before answering questions about flood risk, routes, weather, or risk zones. Do not guess numbers.
- You may call multiple tools when useful (e.g. weather + zone risk).
- The UI already shows rich cards/maps for the tool data, so DON'T repeat long tables of raw numbers — interpret them and give a clear, practical recommendation.
- Only mention the specific zone or place names that the tools actually returned. Never invent area names, junctions, or statistics that the tools did not provide.
- If a zone is High or Severe risk, advise caution and mention checking an alternate route.
- Be warm and practical, like a local who knows the roads.

Response format (IMPORTANT — keep it scannable and attractive):
- Start with ONE short bold headline line summarising the verdict (e.g. "**Silk Board is high risk right now.**").
- Then give 2 to 4 short bullet points starting with "- ". Make the key term in each bullet bold (e.g. "- **Rainfall:** 18 mm/h, rising").
- Keep each bullet to one line, plain and specific.
- End with a single line starting with "Tip:" giving one practical next step.
- Use only this lightweight markdown: **bold** and "- " bullets. No headings (#), tables, or long paragraphs.`;

// ── Tool executors → return { result (for model), component (for UI), detail (for step) } ──
async function executeTool(name: string, args: Record<string, unknown>, zones: ZoneRow[]) {
  if (name === "get_zone_risk") {
    const z = matchZone(String(args.zone || ""), zones);
    if (!z) {
      return { result: { found: false, message: `No flood data for "${args.zone}". Known zones include Silk Board, Bellandur, Marathahalli, Koramangala, Hebbal, HSR Layout.` }, component: null, detail: "No matching zone found" };
    }
    const score = SCORE[z.ground_truth_risk_level] ?? 40;
    const data = {
      zone_id: z.zone_id, zone_name: z.zone_name, lat: z.lat, lng: z.lng,
      risk_level: z.ground_truth_risk_level, risk_score: score,
      incidents: z.historical_incidents_per_season, drainage_notes: z.drainage_notes,
    };
    return { result: { found: true, ...data }, component: { kind: "risk", data }, detail: `${z.zone_name}: ${z.ground_truth_risk_level} (${score}/100)` };
  }

  if (name === "get_current_weather") {
    const w = await getWeather();
    return { result: w, component: { kind: "weather", data: w }, detail: `${w.current_mm_per_hour} mm/h now, ${w.forecast_3h_mm} mm forecast` };
  }

  if (name === "list_high_risk_zones") {
    const list = zones
      .map((z) => ({ zone_id: z.zone_id, zone_name: z.zone_name, lat: z.lat, lng: z.lng, risk_level: z.ground_truth_risk_level, risk_score: SCORE[z.ground_truth_risk_level] ?? 40, drainage_notes: z.drainage_notes }))
      .filter((z) => z.risk_level === "High" || z.risk_level === "Severe")
      .sort((a, b) => b.risk_score - a.risk_score);
    return { result: { count: list.length, zones: list.map((z) => ({ zone_name: z.zone_name, risk_level: z.risk_level, risk_score: z.risk_score })) }, component: { kind: "zoneList", data: { zones: list } }, detail: `${list.length} high/severe zones` };
  }

  if (name === "find_safe_route") {
    const o = matchLocation(String(args.origin || ""), zones);
    const d = matchLocation(String(args.destination || ""), zones);
    if (!o || !d) {
      return { result: { found: false, message: `Couldn't resolve ${!o ? "origin" : "destination"}. Try a known area like Koramangala, Whitefield, Silk Board, Electronic City.` }, component: null, detail: "Location not resolved" };
    }
    const minLat = Math.min(o.lat, d.lat) - 0.015, maxLat = Math.max(o.lat, d.lat) + 0.015;
    const minLng = Math.min(o.lng, d.lng) - 0.015, maxLng = Math.max(o.lng, d.lng) + 0.015;
    const corridor = zones
      .filter((z) => z.lat >= minLat && z.lat <= maxLat && z.lng >= minLng && z.lng <= maxLng)
      .map((z) => ({ zone_name: z.zone_name, lat: z.lat, lng: z.lng, risk_level: z.ground_truth_risk_level, risk_score: SCORE[z.ground_truth_risk_level] ?? 40 }))
      .sort((a, b) => b.risk_score - a.risk_score);
    const risky = corridor.filter((z) => z.risk_level === "High" || z.risk_level === "Severe");
    const hasSevere = risky.some((z) => z.risk_level === "Severe");
    const verdict = hasSevere ? "Use with caution" : risky.length > 0 ? "Mostly clear" : "Clear";

    // Estimate distance & drive time (fallback when client-side Directions is unavailable)
    const R = 6371;
    const dLat = ((d.lat - o.lat) * Math.PI) / 180;
    const dLng = ((d.lng - o.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((o.lat * Math.PI) / 180) * Math.cos((d.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const straightKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const roadKm = straightKm * 1.35; // city detour factor
    const avgSpeed = hasSevere ? 16 : risky.length > 0 ? 20 : 24; // km/h, slower through risk zones
    const estMinutes = Math.max(4, Math.round((roadKm / avgSpeed) * 60));
    const est_distance = `${roadKm.toFixed(1)} km`;
    const est_duration = estMinutes >= 60 ? `${Math.floor(estMinutes / 60)}h ${estMinutes % 60}m` : `${estMinutes} min`;

    const data = { origin: o, destination: d, risk_zones: risky, all_zones: corridor, verdict, severe_count: risky.filter((z) => z.risk_level === "Severe").length, est_distance, est_duration };
    return { result: { found: true, origin: o.name, destination: d.name, verdict, distance: est_distance, duration: est_duration, risk_zones_on_route: risky.map((z) => `${z.zone_name} (${z.risk_level})`) }, component: { kind: "route", data }, detail: `${o.name} → ${d.name}: ${risky.length} risk zone(s)` };
  }

  return { result: { error: "unknown tool" }, component: null, detail: "unknown tool" };
}

function stepLabel(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case "get_zone_risk": return `Analyzing flood risk for ${args.zone || "zone"}`;
    case "find_safe_route": return `Mapping a safe route from ${args.origin} to ${args.destination}`;
    case "get_current_weather": return "Fetching live rainfall & forecast";
    case "list_high_risk_zones": return "Scanning city-wide high-risk zones";
    default: return "Gathering intelligence";
  }
}

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      if (!GEMINI_API_KEY) {
        send({ type: "text", content: "The AI service isn't configured (missing GEMINI_API_KEY)." });
        send({ type: "done" });
        controller.close();
        return;
      }

      try {
        // load zones once
        const { data: zoneData } = await supabase
          .from("flood_zones")
          .select("zone_id, zone_name, lat, lng, historical_incidents_per_season, drainage_notes, ground_truth_risk_level");
        const zones = (zoneData as ZoneRow[]) || [];

        type Part = { text?: string; functionCall?: { name: string; args: Record<string, unknown>; id?: string }; functionResponse?: unknown; thoughtSignature?: string };
        type Content = { role: string; parts: Part[] };

        const contents: Content[] = [
          { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
          { role: "model", parts: [{ text: "Understood. I'm FlowGuard AI and I'll use my live tools to help Bengaluru commuters." }] },
          ...((history || []) as { role: string; content: string }[]).map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }] as Part[],
          })),
          { role: "user", parts: [{ text: message }] },
        ];

        let finalText = "";
        const MAX_TURNS = 4;

        for (let turn = 0; turn < MAX_TURNS; turn++) {
          const res = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              tools: [{ functionDeclarations: toolDeclarations }],
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
            }),
          });

          if (!res.ok) {
            const err = await res.text();
            send({ type: "text", content: "Sorry, I hit a snag reaching my reasoning engine. Please try again." });
            send({ type: "done", error: err.slice(0, 200) });
            controller.close();
            return;
          }

          const data = await res.json();
          const cand = data.candidates?.[0];
          const parts: Part[] = cand?.content?.parts || [];
          const calls = parts.filter((p) => p.functionCall);

          if (calls.length === 0) {
            finalText = parts.map((p) => p.text || "").join("").trim();
            break;
          }

          // keep model turn (preserves thoughtSignature for Gemini 3.x)
          contents.push(cand.content);

          const responseParts: Part[] = [];
          for (const p of calls) {
            const fc = p.functionCall!;
            const stepId = `${fc.name}_${turn}_${Math.random().toString(36).slice(2, 6)}`;
            send({ type: "step", id: stepId, tool: fc.name, label: stepLabel(fc.name, fc.args), status: "running" });
            const exec = await executeTool(fc.name, fc.args, zones);
            // small delay so the animation reads naturally
            await new Promise((r) => setTimeout(r, 450));
            send({ type: "step", id: stepId, tool: fc.name, label: stepLabel(fc.name, fc.args), status: "done", detail: exec.detail });
            if (exec.component) send({ type: "component", component: exec.component });
            responseParts.push({ functionResponse: { name: fc.name, response: { result: exec.result } } } as Part);
          }
          contents.push({ role: "user", parts: responseParts });
        }

        if (!finalText) finalText = "Here's what I found based on the latest data.";
        finalText = finalText
          .replace(/\*\*(.+?)\*\*/g, "$1")
          .replace(/__(.+?)__/g, "$1")
          .replace(/(^|\n)\s*#{1,6}\s*/g, "$1")
          .replace(/(^|\n)\s*[-*]\s+/g, "$1• ")
          .trim();
        send({ type: "text", content: finalText });
        send({ type: "done" });
        controller.close();
      } catch (e) {
        send({ type: "text", content: "Something went wrong while analyzing. Please try again." });
        send({ type: "done", error: String(e).slice(0, 200) });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
