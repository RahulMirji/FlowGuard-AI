export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Severe';

export interface FloodZone {
  zone_id: string;
  zone_name: string;
  lat: number;
  lng: number;
  ward_number: string;
  historical_incidents_per_season: number;
  drainage_notes: string;
  ground_truth_risk_level: RiskLevel;
}

export interface RiskSnapshot {
  id: string;
  generated_at: string;
  zone_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  reasoning: string;
  current_rainfall_mm: number;
  forecast_rainfall_mm: number;
}

export interface RiskZonesResponse {
  generated_at: string;
  rainfall_context: { current_mm_per_hour: number; forecast_3h_mm: number };
  zones: {
    zone_id: string;
    zone_name: string;
    risk_score: number;
    risk_level: RiskLevel;
    reasoning: string;
  }[];
}

export interface RouteOption {
  route_id: string;
  distance_km: number;
  duration_min: number;
  geometry: string;
}

export interface RankedRoute {
  route_id: string;
  rank: number;
  adjusted_duration_min: number;
  risk_zones_crossed: string[];
  verdict: 'Recommended' | 'Use with caution' | 'Avoid';
  explanation: string;
}

export interface RankRoutesResponse {
  recommended_route_id: string;
  routes: RankedRoute[];
  summary: string;
}

export interface InfraReport {
  id: string;
  zone_id: string;
  generated_at: string;
  priority: number;
  recommended_action: string;
  estimated_impact: string;
  justification: string;
}

export interface KpiSummary {
  prediction_accuracy_pct: number;
  avg_commute_reduction_pct: number;
  high_risk_zones_flagged: number;
  response_time_improvement_note: string;
  computed_at: string;
}
