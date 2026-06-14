import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch zones from database
    const { data: zones, error } = await supabase
      .from("flood_zones")
      .select("zone_id, zone_name, lat, lng, ground_truth_risk_level");

    if (error || !zones) {
      return Response.json({ error: "Failed to fetch flood zones from database" }, { status: 500 });
    }

    // 2. Fetch traffic details in parallel
    const trafficData = await Promise.all(
      zones.map(async (z) => {
        let congestionFactor = 1.0;
        let isRealTraffic = false;

        if (GOOGLE_MAPS_API_KEY) {
          try {
            // Define a short segment around the zone coordinate (~500m offset)
            const origin = `${z.lat},${z.lng}`;
            const dest = `${z.lat + 0.004},${z.lng + 0.004}`;
            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&departure_time=now&key=${GOOGLE_MAPS_API_KEY}`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.status === "OK" && data.routes && data.routes.length > 0) {
              const leg = data.routes[0].legs[0];
              const duration = leg.duration?.value;
              const durationInTraffic = leg.duration_in_traffic?.value;

              if (duration && durationInTraffic) {
                congestionFactor = parseFloat((durationInTraffic / duration).toFixed(2));
                isRealTraffic = true;
              }
            }
          } catch (err) {
            console.error(`Failed to fetch traffic for zone ${z.zone_id}:`, err);
          }
        }

        // Fallback or simulation if real traffic API is not available or doesn't return traffic duration
        if (!isRealTraffic) {
          const baseRisk = (z.ground_truth_risk_level || "low").toLowerCase();
          // Generate a realistic, slightly varying traffic factor
          if (baseRisk === "severe") {
            congestionFactor = parseFloat((1.5 + Math.random() * 0.4).toFixed(2));
          } else if (baseRisk === "high") {
            congestionFactor = parseFloat((1.3 + Math.random() * 0.3).toFixed(2));
          } else if (baseRisk === "medium") {
            congestionFactor = parseFloat((1.1 + Math.random() * 0.25).toFixed(2));
          } else {
            congestionFactor = parseFloat((0.95 + Math.random() * 0.15).toFixed(2));
          }
        }

        // Determine new dynamic score and level from congestion factor
        let calculatedLevel = "low";
        let calculatedScore = Math.round(congestionFactor * 40); // base factor mapping

        if (congestionFactor >= 1.6) {
          calculatedLevel = "severe";
          calculatedScore = Math.min(100, Math.round(85 + (congestionFactor - 1.6) * 25));
        } else if (congestionFactor >= 1.3) {
          calculatedLevel = "high";
          calculatedScore = Math.round(65 + (congestionFactor - 1.3) * 60);
        } else if (congestionFactor >= 1.1) {
          calculatedLevel = "medium";
          calculatedScore = Math.round(40 + (congestionFactor - 1.1) * 125);
        } else {
          calculatedLevel = "low";
          calculatedScore = Math.max(10, Math.round(congestionFactor * 25));
        }

        return {
          zone_id: z.zone_id,
          congestion_factor: congestionFactor,
          level: calculatedLevel,
          score: calculatedScore,
          is_real: isRealTraffic,
        };
      })
    );

    return Response.json({ success: true, traffic: trafficData });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
