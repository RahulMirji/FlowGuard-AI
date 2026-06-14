import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const { routes, origin, destination } = await req.json();

  // Fetch risk zones
  const { data: zones } = await supabase
    .from("flood_zones")
    .select("zone_id, zone_name, lat, lng, ground_truth_risk_level, historical_incidents_per_season, drainage_notes");

  // Build risk context
  const riskContext = zones?.map((z) => ({
    zone_id: z.zone_id,
    zone_name: z.zone_name,
    risk_level: z.ground_truth_risk_level,
    risk_score: z.ground_truth_risk_level === "Severe" ? 90 : z.ground_truth_risk_level === "High" ? 70 : z.ground_truth_risk_level === "Medium" ? 45 : 20,
    lat: z.lat,
    lng: z.lng,
  }));

  // Determine which zones each route passes near (simple distance check)
  const routesWithZones = routes.map((route: { route_id: string; duration_min: number; distance_km: number; path: { lat: number; lng: number }[] }) => {
    const nearbyZones = riskContext?.filter((zone) => {
      return route.path?.some((point: { lat: number; lng: number }) => {
        const d = haversine(point.lat, point.lng, zone.lat, zone.lng);
        return d < 0.5; // 500m threshold
      });
    }) || [];
    return {
      route_id: route.route_id,
      distance_km: route.distance_km,
      duration_min: route.duration_min,
      risk_zones_nearby: nearbyZones.map((z) => ({ zone_id: z.zone_id, zone_name: z.zone_name, risk_level: z.risk_level, risk_score: z.risk_score })),
    };
  });

  const prompt = `You are a route recommendation engine for commuters in Bengaluru during rainy season.

You will be given:
1. A list of candidate routes, each with an ID, distance (km), normal duration (minutes), and a list of flood-risk zones the route passes through or near.
2. Current flood-risk scores for those zones (risk_level: Low/Medium/High/Severe, with risk_score 0-100).

Your task:
- Rank the routes from best to worst choice for the commuter right now.
- Penalize routes passing through High or Severe risk zones heavily, even if they are faster under normal conditions.
- Estimate an adjusted duration for each route accounting for likely congestion from flooding (use these multipliers: Severe zone = +60% duration, High = +35%, Medium = +15%, Low = no change; if multiple risk zones, apply highest multiplier only).
- Provide a short, friendly, plain-language explanation a commuter would understand.

Input:
Origin: ${origin}
Destination: ${destination}
Routes: ${JSON.stringify(routesWithZones)}

Return ONLY valid JSON matching this schema:
{
  "recommended_route_id": "string",
  "routes": [
    {
      "route_id": "string",
      "rank": number,
      "adjusted_duration_min": number,
      "risk_zones_crossed": ["zone_id strings"],
      "verdict": "Recommended | Use with caution | Avoid",
      "explanation": "1-2 sentences"
    }
  ],
  "summary": "1-2 sentence overall recommendation"
}`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return Response.json({ error: `Gemini API error: ${err}` }, { status: 502 });
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  try {
    const result = JSON.parse(text);
    // Log to route_queries for KPI tracking
    if (result.routes?.length >= 2) {
      const baseline = Math.min(...result.routes.map((r: { adjusted_duration_min: number }) => r.adjusted_duration_min));
      const recommended = result.routes.find((r: { route_id: string }) => r.route_id === result.recommended_route_id);
      if (recommended) {
        await supabase.from("route_queries").insert({
          baseline_duration_min: routes[0].duration_min,
          recommended_duration_min: recommended.adjusted_duration_min,
        });
      }
    }
    return Response.json(result);
  } catch {
    return Response.json({ error: "Failed to parse Gemini response", raw: text }, { status: 500 });
  }
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
