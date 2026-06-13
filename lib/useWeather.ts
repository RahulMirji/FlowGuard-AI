"use client";
import { useEffect, useState } from "react";

interface WeatherData {
  current_mm_per_hour: number;
  forecast_3h_mm: number;
  description: string;
  temp: number;
}

export function useWeather() {
  const [data, setData] = useState<WeatherData>({ current_mm_per_hour: 0, forecast_3h_mm: 0, description: "loading", temp: 0 });

  useEffect(() => {
    fetch("/api/weather").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  return data;
}
