# Database & API Schema — FlowGuard AI

## 1. Database Tables (Supabase PostgreSQL)

### 1.1 `flood_zones` — Synthetic seed dataset

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `zone_id` | `text` | PRIMARY KEY | e.g. `silk_board` |
| `zone_name` | `text` | NOT NULL | e.g. "Silk Board Junction" |
| `lat` | `float8` | NOT NULL | Latitude |
| `lng` | `float8` | NOT NULL | Longitude |
| `ward_number` | `text` | | BBMP ward number |
| `historical_incidents_per_season` | `int` | NOT NULL, DEFAULT 0 | Waterlogging incidents per monsoon |
| `drainage_notes` | `text` | | Infrastructure condition notes |
| `ground_truth_risk_level` | `text` | CHECK IN ('Low','Medium','High','Severe') | For KPI accuracy comparison only |

### 1.2 `risk_snapshots` — Cached Gemini risk scoring output

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | |
| `generated_at` | `timestamptz` | NOT NULL, DEFAULT now() | Snapshot timestamp |
| `zone_id` | `text` | FK → flood_zones(zone_id) | |
| `risk_score` | `int` | CHECK (0-100) | Numerical risk score |
| `risk_level` | `text` | CHECK IN ('Low','Medium','High','Severe') | |
| `reasoning` | `text` | | Gemini's explanation |
| `current_rainfall_mm` | `float8` | | Rainfall at time of scoring |
| `forecast_rainfall_mm` | `float8` | | 3h forecast at time of scoring |

### 1.3 `infra_reports` — Cached infrastructure recommendations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | |
| `zone_id` | `text` | FK → flood_zones(zone_id) | |
| `generated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `priority` | `int` | CHECK (1-5) | 1 = most urgent |
| `recommended_action` | `text` | NOT NULL | |
| `estimated_impact` | `text` | | |
| `justification` | `text` | | |

### 1.4 `route_queries` — Route request log for KPI #2

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `baseline_duration_min` | `float8` | NOT NULL | Fastest route duration |
| `recommended_duration_min` | `float8` | NOT NULL | AI-recommended route duration |
| `reduction_pct` | `float8` | GENERATED ALWAYS AS | Computed % reduction |

---

## 2. SQL DDL

```sql
-- flood_zones
CREATE TABLE flood_zones (
  zone_id TEXT PRIMARY KEY,
  zone_name TEXT NOT NULL,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  ward_number TEXT,
  historical_incidents_per_season INT NOT NULL DEFAULT 0,
  drainage_notes TEXT,
  ground_truth_risk_level TEXT CHECK (ground_truth_risk_level IN ('Low','Medium','High','Severe'))
);

-- risk_snapshots
CREATE TABLE risk_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  zone_id TEXT REFERENCES flood_zones(zone_id),
  risk_score INT CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT CHECK (risk_level IN ('Low','Medium','High','Severe')),
  reasoning TEXT,
  current_rainfall_mm FLOAT8,
  forecast_rainfall_mm FLOAT8
);

-- infra_reports
CREATE TABLE infra_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id TEXT REFERENCES flood_zones(zone_id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  priority INT CHECK (priority >= 1 AND priority <= 5),
  recommended_action TEXT NOT NULL,
  estimated_impact TEXT,
  justification TEXT
);

-- route_queries
CREATE TABLE route_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  baseline_duration_min FLOAT8 NOT NULL,
  recommended_duration_min FLOAT8 NOT NULL,
  reduction_pct FLOAT8 GENERATED ALWAYS AS (
    ((baseline_duration_min - recommended_duration_min) / baseline_duration_min) * 100
  ) STORED
);

-- Indexes
CREATE INDEX idx_risk_snapshots_zone ON risk_snapshots(zone_id, generated_at DESC);
CREATE INDEX idx_risk_snapshots_latest ON risk_snapshots(generated_at DESC);
CREATE INDEX idx_infra_reports_zone ON infra_reports(zone_id, generated_at DESC);
```

---

## 3. Seed Data (flood_zones)

```sql
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
('orr_marathahalli', 'Outer Ring Road (Marathahalli stretch)', 12.9560, 77.7000, 'W-84', 4, 'Similar to Bellandur stretch, slightly better drainage', 'Medium');
```

---

## 4. API Route Contracts

### `GET /api/risk-zones`
**Response:**
```json
{
  "generated_at": "2026-06-13T08:30:00Z",
  "rainfall_context": { "current_mm_per_hour": 18.5, "forecast_3h_mm": 32 },
  "zones": [
    {
      "zone_id": "silk_board",
      "zone_name": "Silk Board Junction",
      "risk_score": 92,
      "risk_level": "Severe",
      "reasoning": "..."
    }
  ]
}
```

### `POST /api/rank-routes`
**Request:**
```json
{
  "routes": [
    { "route_id": "route_a", "distance_km": 12.3, "duration_min": 32, "geometry": "encoded_polyline" }
  ],
  "origin": { "lat": 12.93, "lng": 77.62 },
  "destination": { "lat": 12.98, "lng": 77.69 }
}
```
**Response:**
```json
{
  "recommended_route_id": "route_b",
  "routes": [
    {
      "route_id": "route_b",
      "rank": 1,
      "adjusted_duration_min": 38,
      "risk_zones_crossed": [],
      "verdict": "Recommended",
      "explanation": "This route avoids all flood-risk zones."
    }
  ],
  "summary": "Take Route B to avoid severe flooding at Silk Board."
}
```

### `POST /api/chat`
**Request:**
```json
{ "message": "Is Silk Board safe right now?", "history": [] }
```
**Response:** Streamed text response.

### `GET /api/infra-reports`
**Response:**
```json
{
  "reports": [
    {
      "zone_id": "silk_board",
      "zone_name": "Silk Board Junction",
      "priority": 1,
      "recommended_action": "Deploy mobile pump units...",
      "estimated_impact": "Could reduce waterlogging duration by 40-50%",
      "justification": "8+ incidents this season..."
    }
  ]
}
```

### `GET /api/kpis`
**Response:**
```json
{
  "prediction_accuracy_pct": 86.7,
  "avg_commute_reduction_pct": 24.3,
  "high_risk_zones_flagged": 4,
  "response_time_improvement_note": "Alerts generated ~22 min ahead of typical news-based traffic alerts",
  "computed_at": "2026-06-13T09:00:00Z"
}
```

---

## 5. TypeScript Interfaces

```typescript
// lib/types.ts

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

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Severe';

export interface RiskSnapshot {
  zone_id: string;
  zone_name: string;
  risk_score: number;
  risk_level: RiskLevel;
  reasoning: string;
}

export interface RiskZonesResponse {
  generated_at: string;
  rainfall_context: { current_mm_per_hour: number; forecast_3h_mm: number };
  zones: RiskSnapshot[];
}

export interface RouteOption {
  route_id: string;
  distance_km: number;
  duration_min: number;
  geometry: string; // encoded polyline
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
  zone_id: string;
  zone_name?: string;
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
```
