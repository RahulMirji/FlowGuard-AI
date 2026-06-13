import { NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY;
const LAT = 12.9716;
const LNG = 77.5946;

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ current_mm_per_hour: 0, forecast_3h_mm: 0, error: "No API key" });
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LNG}&appid=${API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LNG}&appid=${API_KEY}&units=metric&cnt=1`),
    ]);

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    const currentRain = current.rain?.["1h"] || current.rain?.["3h"] || 0;
    const forecastRain = forecast.list?.[0]?.rain?.["3h"] || 0;

    return NextResponse.json({
      current_mm_per_hour: Math.round(currentRain * 10) / 10,
      forecast_3h_mm: Math.round(forecastRain * 10) / 10,
      description: current.weather?.[0]?.description || "clear",
      temp: current.main?.temp,
    });
  } catch {
    return NextResponse.json({ current_mm_per_hour: 0, forecast_3h_mm: 0, error: "fetch failed" });
  }
}
