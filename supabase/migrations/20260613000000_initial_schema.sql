-- FlowGuard AI - Initial Schema
-- Tables: flood_zones, risk_snapshots, infra_reports, route_queries

-- flood_zones (synthetic seed dataset)
CREATE TABLE IF NOT EXISTS flood_zones (
  zone_id TEXT PRIMARY KEY,
  zone_name TEXT NOT NULL,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  ward_number TEXT,
  historical_incidents_per_season INT NOT NULL DEFAULT 0,
  drainage_notes TEXT,
  ground_truth_risk_level TEXT CHECK (ground_truth_risk_level IN ('Low','Medium','High','Severe'))
);

-- risk_snapshots (cached Gemini risk scoring output)
CREATE TABLE IF NOT EXISTS risk_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  zone_id TEXT REFERENCES flood_zones(zone_id),
  risk_score INT CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT CHECK (risk_level IN ('Low','Medium','High','Severe')),
  reasoning TEXT,
  current_rainfall_mm FLOAT8,
  forecast_rainfall_mm FLOAT8
);

-- infra_reports (cached infrastructure recommendations)
CREATE TABLE IF NOT EXISTS infra_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id TEXT REFERENCES flood_zones(zone_id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  priority INT CHECK (priority >= 1 AND priority <= 5),
  recommended_action TEXT NOT NULL,
  estimated_impact TEXT,
  justification TEXT
);

-- route_queries (route request log for KPI #2)
CREATE TABLE IF NOT EXISTS route_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  baseline_duration_min FLOAT8 NOT NULL,
  recommended_duration_min FLOAT8 NOT NULL,
  reduction_pct FLOAT8 GENERATED ALWAYS AS (
    ((baseline_duration_min - recommended_duration_min) / baseline_duration_min) * 100
  ) STORED
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_risk_snapshots_zone ON risk_snapshots(zone_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_snapshots_latest ON risk_snapshots(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_infra_reports_zone ON infra_reports(zone_id, generated_at DESC);

-- Seed flood_zones with 15 Bengaluru hotspots
INSERT INTO flood_zones (zone_id, zone_name, lat, lng, ward_number, historical_incidents_per_season, drainage_notes, ground_truth_risk_level) VALUES
('silk_board', 'Silk Board Junction', 12.9172, 77.6227, 'W-191', 8, 'Known underpass drainage failure, single outflow pipe for 4-lane underpass', 'Severe'),
('bellandur', 'Bellandur Lake Area', 12.9260, 77.6762, 'W-150', 7, 'Lake overflow during heavy rain, blocked raja kaluve (stormwater drain)', 'Severe'),
('kr_puram', 'KR Puram Railway Bridge', 13.0012, 77.6868, 'W-57', 6, 'Low-lying road under railway bridge, inadequate pump capacity', 'High'),
('hebbal', 'Hebbal Flyover', 13.0358, 77.5970, 'W-4', 5, 'Service road flooding from blocked drain inlets', 'High'),
('koramangala', 'Koramangala (Sony World Junction)', 12.9352, 77.6245, 'W-151', 5, 'Old drainage system, undersized pipes for current density', 'High'),
('sarjapur_road', 'Sarjapur Road (Wipro Junction)', 12.9100, 77.6840, 'W-174', 4, 'Rapid development outpaced drainage infra, no SWD for 2km stretch', 'High'),
('yemalur', 'Yemalur', 12.9580, 77.7010, 'W-149', 4, 'Low elevation, backflow from Bellandur lake drain', 'Medium'),
('marathahalli', 'Marathahalli Bridge', 12.9562, 77.7010, 'W-84', 5, 'Bridge underpass pools water, single drain outlet blocked frequently', 'High'),
('mahadevapura', 'Mahadevapura', 12.9988, 77.6932, 'W-82', 3, 'New layouts with incomplete SWD connections', 'Medium'),
('electronic_city', 'Electronic City Underpass', 12.8456, 77.6603, 'W-198', 4, 'Underpass design flaw, pumps fail during power cuts', 'High'),
('tin_factory', 'Tin Factory Junction', 12.9988, 77.6650, 'W-59', 3, 'Moderate flooding at junction, partial drain blockage', 'Medium'),
('yeshwanthpur', 'Yeshwanthpur Circle', 13.0220, 77.5510, 'W-20', 3, 'Older drainage, seasonal blockage from construction debris', 'Medium'),
('hsr_layout', 'HSR Layout (Agara Junction)', 12.9116, 77.6389, 'W-174', 4, 'Agara lake overflow path crosses road, SWD undersized', 'High'),
('orr_bellandur', 'Outer Ring Road (Bellandur stretch)', 12.9340, 77.6780, 'W-150', 6, 'ORR median drains overflow onto service road, chronic issue', 'Severe'),
('orr_marathahalli', 'Outer Ring Road (Marathahalli stretch)', 12.9560, 77.7000, 'W-84', 4, 'Similar to Bellandur stretch, slightly better drainage', 'Medium')
ON CONFLICT (zone_id) DO NOTHING;
