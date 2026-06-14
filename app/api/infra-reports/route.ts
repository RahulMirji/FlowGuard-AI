import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function GET() {
  // Check cache: get latest infra reports
  const { data: cached } = await supabase
    .from("infra_reports")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(10);

  const now = Date.now();
  const isFresh = cached && cached.length > 0 && (now - new Date(cached[0].generated_at).getTime()) < TTL_MS;

  if (isFresh) {
    return NextResponse.json({ reports: cached });
  }

  // Get high/severe zones
  const { data: zones } = await supabase
    .from("flood_zones")
    .select("*")
    .in("ground_truth_risk_level", ["High", "Severe"]);

  if (!zones || zones.length === 0) {
    return NextResponse.json({ reports: cached || [] });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ reports: cached || [], error: "No Gemini key" });
  }

  // Generate reports for each high/severe zone
  const prompt = `You are an urban infrastructure advisory AI assisting BBMP (Bengaluru's civic body) with stormwater drainage prioritization.

For each zone below, generate a concise, actionable recommendation. Return ONLY valid JSON array:
[{"zone_id":"string","priority":1-5,"recommended_action":"1 sentence","estimated_impact":"1 sentence","justification":"1 sentence"}]

Zones:
${JSON.stringify(zones.map(z => ({ zone_id: z.zone_id, zone_name: z.zone_name, incidents: z.historical_incidents_per_season, drainage_notes: z.drainage_notes, risk_level: z.ground_truth_risk_level })))}`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ reports: cached || [], error: "Gemini failed" });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const reports = JSON.parse(text);

    // Cache in DB: delete old, insert new
    await supabase.from("infra_reports").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const toInsert = reports.map((r: { zone_id: string; priority: number; recommended_action: string; estimated_impact: string; justification: string }) => ({
      zone_id: r.zone_id,
      priority: r.priority,
      recommended_action: r.recommended_action,
      estimated_impact: r.estimated_impact,
      justification: r.justification,
    }));
    await supabase.from("infra_reports").insert(toInsert);

    // Fetch fresh from DB to get IDs and timestamps
    const { data: fresh } = await supabase.from("infra_reports").select("*").order("priority", { ascending: true });
    return NextResponse.json({ reports: fresh || reports });
  } catch {
    return NextResponse.json({ reports: cached || [] });
  }
}
