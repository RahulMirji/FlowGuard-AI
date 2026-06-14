import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const { message, history } = await req.json();

  // Fetch latest risk snapshots for context
  const { data: zones } = await supabase
    .from("risk_snapshots")
    .select("zone_id, risk_score, risk_level, reasoning, current_rainfall_mm, forecast_rainfall_mm")
    .order("generated_at", { ascending: false })
    .limit(15);

  // If no snapshots yet, fetch raw flood_zones
  let contextData;
  if (zones && zones.length > 0) {
    contextData = zones;
  } else {
    const { data: rawZones } = await supabase
      .from("flood_zones")
      .select("zone_id, zone_name, historical_incidents_per_season, drainage_notes, ground_truth_risk_level");
    contextData = rawZones?.map((z) => ({
      zone_id: z.zone_id,
      zone_name: z.zone_name,
      risk_level: z.ground_truth_risk_level,
      risk_score: z.ground_truth_risk_level === "Severe" ? 90 : z.ground_truth_risk_level === "High" ? 70 : z.ground_truth_risk_level === "Medium" ? 45 : 20,
      reasoning: `Historical: ${z.historical_incidents_per_season} incidents/season. ${z.drainage_notes}`,
    }));
  }

  const systemPrompt = `You are FlowGuard AI, a helpful assistant for Bengaluru commuters during monsoon season.

You have access to the following real-time context:
- Current date/time: ${new Date().toISOString()}
- Current rainfall: 18.5 mm/h, forecast next 3h: 32 mm
- Flood-risk status of city zones: ${JSON.stringify(contextData)}

Guidelines:
- Answer questions about travel safety, expected delays, and flood risk for specific areas using ONLY the data provided above.
- If asked about a zone not in the provided data, say you don't have data for that specific area but offer the nearest zone you do have data for.
- Keep responses conversational, concise (2-4 sentences), and practical — commuters want quick actionable answers, not long reports.
- If risk is High or Severe in an area the user mentions, proactively suggest checking the Route Planner for alternatives.
- Do not invent rainfall numbers, incident counts, or risk scores beyond what's provided in the context.
- You may give general safety advice (e.g., "avoid driving through standing water deeper than a few inches") as this is common knowledge, not data-dependent.`;

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "Understood. I'm FlowGuard AI, ready to help Bengaluru commuters navigate monsoon conditions safely. How can I help you?" }] },
    ...history.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return Response.json({ error: `Gemini API error: ${err}` }, { status: 502 });
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

  return Response.json({ reply });
}
