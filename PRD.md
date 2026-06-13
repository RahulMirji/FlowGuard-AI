# PRD: FlowGuard AI — Bengaluru Flood & Traffic Intelligence Platform
**CODEX 2026 | SDG 11 (Sustainable Cities) + SDG 13 (Climate Action)**
**Stack:** Next.js (frontend + API routes) · Supabase (DB, Edge Functions, Auth) · Mapbox GL JS · Gemini API

---

## 1. Problem Statement

Bengaluru's stormwater drainage network is poorly maintained and frequently blocked. During monsoon season, even moderate rainfall causes severe waterlogging at chronic hotspots (Silk Board, Bellandur, KR Puram, Sarjapur Road, Hebbal, Koramangala, etc.), leading to traffic congestion that is roughly 2x normal during rainy periods.

**Sustainability challenge addressed:** Climate-driven extreme rainfall events overwhelm urban drainage infrastructure, causing traffic gridlock, fuel wastage, increased emissions from idling vehicles, and safety hazards for commuters — directly tying SDG 13 (climate adaptation) to SDG 11 (urban resource management and disaster preparedness).

**Target users / beneficiaries:**
- Daily commuters in Bengaluru (primary)
- Civic authorities / BBMP ward officers (secondary — via generated infrastructure reports)

**Data sources:**
- Synthetic dataset of ward-level flood-risk profiles, built from publicly reported chronic waterlogging zones (news reports, BBMP flood-prone spot lists) — disclosed as synthetic/simulated for demonstration
- OpenWeatherMap API — real-time and forecast rainfall data for Bengaluru
- Mapbox Directions API — real route options between two points

**AI methodology:**
- Generative AI (Gemini 2.0/2.5 Flash) used as a reasoning engine for: (1) flood-risk scoring of zones given rainfall + historical context, (2) route ranking/recommendation with natural-language justification, (3) conversational assistant for commuters, (4) automated infrastructure intervention reports for civic stakeholders
- This is prompt-based structured reasoning over contextual data (a Recommendation System + Decision Support pattern), not a trained ML classifier — explicitly disclosed as such

**Expected sustainability impact:**
- Reduced commute time and idling (lower fuel consumption/emissions) via smarter routing during rainfall
- Faster civic response to chronic flooding zones via prioritized intervention reports
- Improved public awareness/preparedness during climate-driven extreme weather

---

## 2. The 3 (+1) Measurable KPIs

| # | KPI | Definition | How Computed |
|---|-----|------------|---------------|
| 1 | **Flood-Risk Prediction Accuracy (%)** | How often Gemini's risk label matches the synthetic dataset's "ground truth" historical outcome label for a zone | `(correct_labels / total_zones) * 100`, computed by comparing Gemini JSON output risk_level against `ground_truth_risk_level` field in synthetic dataset |
| 2 | **Average Commute Time Reduction (%)** | Time saved by taking AI-recommended route vs. the default/fastest-distance route during flood conditions | `((baseline_route_duration - recommended_route_duration) / baseline_route_duration) * 100`, both durations from Mapbox Directions API, baseline = shortest route, recommended = Gemini-reranked route avoiding high-risk zones |
| 3 | **High-Risk Zones Flagged for Intervention** | Count of zones marked High/Severe risk that receive an AI-generated infrastructure action report | Direct count from Gemini risk-scoring output where `risk_level ∈ {High, Severe}` |
| 4 (bonus) | **Response Time Improvement (%)** | Simulated time-to-alert: how much earlier users are warned vs. waiting for an official traffic alert | Framed narratively in pitch using simulated alert timestamps vs. typical news-alert lag (e.g., "Alert generated 22 minutes before peak congestion based on rainfall forecast") |

> Present all 4 on the City Impact Dashboard. KPI #3 doubles as your "scalability" proof — more zones = more reports = more impact, with zero marginal engineering cost.

---

## 3. Free APIs / Tools Used (Disclosure List)

| Tool | Purpose | Free Tier Notes |
|------|---------|------------------|
| **Mapbox GL JS** | Interactive 3D-tilted map, building extrusions, route visualization | Free tier: 50,000 map loads/month — get token at mapbox.com |
| **Mapbox Directions API** | Get 2-3 candidate routes between two points with duration/distance | Included in free tier (100k requests/month) |
| **OpenWeatherMap API** | Real-time + 3-hour forecast rainfall data for Bengaluru | Free tier: 1,000 calls/day, "Current Weather" + "5 day/3 hour forecast" endpoints |
| **Google Gemini API** (`gemini-2.0-flash` or `gemini-2.5-flash`) | All AI reasoning: risk scoring, route ranking, chat assistant, infra reports | Free tier via Google AI Studio — generous rate limits, sufficient for hackathon demo |
| **Supabase** | Postgres DB (synthetic dataset + cached AI outputs), Edge Functions (API proxy/business logic), Auth (optional) | Free tier sufficient |
| **Recharts** | Dashboard charts | Open source, no API key |

---

## 4. Information Architecture / Screens

### Screen 1 — Landing Page
**Purpose:** Explain the problem + solution in <10 seconds.

Content blocks:
- Hero: "FlowGuard AI — Smarter Routes for a Flooded City"
- Subline: "Bengaluru loses 2x commute time during monsoon due to drainage failures. We use AI to predict flood-risk zones and reroute you around them — in real time."
- 3 KPI teaser cards (pulled live from Supabase via Next.js API route)
- CTA: "Check My Route" → Screen 2
- Secondary CTA: "View City Dashboard" → Screen 4
- SDG 11 + SDG 13 badges, "Powered by Gemini, Mapbox & OpenWeatherMap" disclosure footer

---

### Screen 2 — Route Risk Planner (Core Feature)

**User flow:**
1. User enters source + destination (or uses geolocation)
2. Next.js calls Mapbox Directions API → returns 2-3 route alternatives (each with polyline, distance, duration)
3. Next.js calls Supabase Edge Function `get-flood-risk-zones` → returns current risk-scored zones (see Section 5.1)
4. Next.js determines which routes pass through/near High/Severe risk zones (simple geo-distance check between route polyline points and zone coordinates, threshold ~500m)
5. Next.js calls Supabase Edge Function `rank-routes` → Gemini ranks routes + explains reasoning (see Section 5.2)
6. UI renders:
   - Mapbox map with all route options color-coded (green = recommended, amber = risky alternative, red zones = flood-risk overlay circles/polygons)
   - Route cards showing: duration, distance, risk zones crossed, AI recommendation badge
   - "Why this route?" expandable text from Gemini

**Map visualization details (Mapbox):**
- 3D pitch (~45°) with building extrusions (`fill-extrusion` layer) for visual wow factor
- Flood-risk zones rendered as semi-transparent circles, color-coded by `risk_level`:
  - Severe = `#dc2626` (red)
  - High = `#f97316` (orange)
  - Medium = `#facc15` (yellow)
  - Low = `#22c55e` (green)
- Route polylines: recommended route in solid blue, alternatives in dashed grey

---

### Screen 3 — AI Chat Assistant

**Purpose:** Mandatory "AI as core, interactive" component — judges talk to it directly.

UI: Simple chat interface, floating or full panel. Example interactions:
- "Is it safe to drive through Silk Board right now?"
- "I'm leaving from Koramangala to Whitefield in 30 mins, what should I expect?"
- "Why is HSR Layout marked high risk today?"

Backend: Next.js API route → Supabase Edge Function `chat-assistant` → Gemini with conversational system prompt (Section 5.3), given current weather + risk zone context as injected data.

---

### Screen 4 — City Impact Dashboard

**Purpose:** KPI proof + scalability visualization.

Components (using Recharts):
- KPI summary cards (the 4 KPIs from Section 2, live numbers)
- Bar chart: Risk level distribution across all tracked zones (count of Low/Medium/High/Severe)
- Line chart: Rainfall intensity (last 24h, from OpenWeatherMap historical/forecast) vs. average commute delay (simulated/derived)
- Table: "Priority Infrastructure Action List" — top 5 High/Severe zones with Gemini-generated recommended interventions (Section 5.4), sortable by risk score

---

## 5. Gemini System Prompts & JSON Schemas

All Gemini calls go through Supabase Edge Functions (so the API key stays server-side). Use `responseMimeType: "application/json"` with a defined `responseSchema` where possible (Gemini supports structured output) — this avoids parsing failures.

### 5.1 Flood-Risk Zone Scoring

**Edge Function:** `get-flood-risk-zones`

**Input context injected into prompt:**
- Synthetic ward dataset (from Supabase table `flood_zones`, see Section 6.1)
- Current rainfall data from OpenWeatherMap (mm/h, last 1h + 3h forecast)

**System Prompt:**
```
You are a flood-risk analysis engine for Bengaluru's traffic and drainage monitoring system.

You will be given:
1. A list of city zones with their ward name, coordinates, historical waterlogging frequency (incidents per monsoon season), and drainage infrastructure notes.
2. Current rainfall intensity (mm/h) and 3-hour forecast rainfall (mm).

For each zone, analyze the combination of historical flooding frequency, drainage capacity notes, and current/forecast rainfall to assign a flood risk level.

Risk level definitions:
- "Low": minimal historical flooding, current rainfall below 5mm/h
- "Medium": occasional historical flooding OR rainfall 5-15mm/h
- "High": frequent historical flooding (4+ incidents/season) AND rainfall 10-25mm/h
- "Severe": frequent historical flooding AND rainfall above 25mm/h, OR known critical drainage failure point with any rainfall above 10mm/h

Return ONLY valid JSON matching this exact schema, with no markdown formatting, no code fences, and no additional commentary:

{
  "generated_at": "ISO 8601 timestamp",
  "rainfall_context": {
    "current_mm_per_hour": number,
    "forecast_3h_mm": number
  },
  "zones": [
    {
      "zone_id": "string, matches input zone_id",
      "zone_name": "string",
      "risk_score": "integer 0-100",
      "risk_level": "Low | Medium | High | Severe",
      "reasoning": "string, max 2 sentences explaining the score"
    }
  ]
}
```

**Example output:**
```json
{
  "generated_at": "2026-06-13T08:30:00Z",
  "rainfall_context": {
    "current_mm_per_hour": 18.5,
    "forecast_3h_mm": 32
  },
  "zones": [
    {
      "zone_id": "silk_board",
      "zone_name": "Silk Board Junction",
      "risk_score": 92,
      "risk_level": "Severe",
      "reasoning": "Silk Board has 8+ waterlogging incidents per season and a known underpass drainage failure; current rainfall of 18.5mm/h with forecast of 32mm exceeds the critical threshold."
    },
    {
      "zone_id": "hebbal",
      "zone_name": "Hebbal Flyover",
      "risk_score": 68,
      "risk_level": "High",
      "reasoning": "Hebbal has frequent flooding history (5 incidents/season) and current rainfall of 18.5mm/h falls within the high-risk band."
    }
  ]
}
```

---

### 5.2 Route Ranking & Recommendation

**Edge Function:** `rank-routes`

**Input context injected into prompt:**
- 2-3 route options from Mapbox Directions API (each: route_id, distance_km, duration_min, list of zone_ids it passes near)
- Current flood-risk zone scores (output of 5.1)
- User's stated work/commute context (optional)

**System Prompt:**
```
You are a route recommendation engine for commuters in Bengaluru during rainy season.

You will be given:
1. A list of candidate routes, each with an ID, distance (km), normal duration (minutes), and a list of flood-risk zones the route passes through or near.
2. Current flood-risk scores for those zones (risk_level: Low/Medium/High/Severe, with risk_score 0-100).

Your task:
- Rank the routes from best to worst choice for the commuter right now.
- Penalize routes passing through High or Severe risk zones heavily, even if they are faster under normal conditions.
- Estimate an adjusted duration for each route accounting for likely congestion from flooding (use these multipliers as a guideline: Severe zone on route = +60% duration, High = +35%, Medium = +15%, Low = no change; if multiple risk zones on one route, apply the highest multiplier only).
- Provide a short, friendly, plain-language explanation a commuter would understand.

Return ONLY valid JSON matching this exact schema, with no markdown formatting, no code fences, and no additional commentary:

{
  "recommended_route_id": "string, the route_id of the best choice",
  "routes": [
    {
      "route_id": "string",
      "rank": "integer, 1 = best",
      "adjusted_duration_min": "number",
      "risk_zones_crossed": ["array of zone_id strings, can be empty"],
      "verdict": "Recommended | Use with caution | Avoid",
      "explanation": "string, 1-2 sentences in plain commuter-friendly language"
    }
  ],
  "summary": "string, 1-2 sentence overall recommendation summary"
}
```

**Example output:**
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
      "explanation": "This route avoids all flood-risk zones and adds only 6 minutes compared to the fastest option."
    },
    {
      "route_id": "route_a",
      "rank": 2,
      "adjusted_duration_min": 51,
      "risk_zones_crossed": ["silk_board"],
      "verdict": "Avoid",
      "explanation": "This route passes through Silk Board, currently at Severe flood risk, which could add over 30 minutes of delay."
    }
  ],
  "summary": "Take Route B — it's slightly longer but avoids the severe flooding at Silk Board, saving you significant time overall."
}
```

---

### 5.3 Conversational Chat Assistant

**Edge Function:** `chat-assistant`

**Input context injected into prompt (system turn, refreshed each session):**
- Current timestamp, rainfall data, full list of current zone risk scores (output of 5.1)

**System Prompt:**
```
You are FlowGuard AI, a helpful assistant for Bengaluru commuters during monsoon season.

You have access to the following real-time context:
- Current date/time: {timestamp}
- Current rainfall: {current_mm_per_hour} mm/h, forecast next 3h: {forecast_3h_mm} mm
- Flood-risk status of city zones: {zones_json}

Guidelines:
- Answer questions about travel safety, expected delays, and flood risk for specific areas using ONLY the data provided above.
- If asked about a zone not in the provided data, say you don't have data for that specific area but offer the nearest zone you do have data for.
- Keep responses conversational, concise (2-4 sentences), and practical — commuters want quick actionable answers, not long reports.
- If risk is High or Severe in an area the user mentions, proactively suggest checking the Route Planner for alternatives.
- Do not invent rainfall numbers, incident counts, or risk scores beyond what's provided in the context.
- You may give general safety advice (e.g., "avoid driving through standing water deeper than a few inches") as this is common knowledge, not data-dependent.
```

This is a plain conversational system prompt (not JSON-structured) — output is natural language directly rendered in the chat UI.

---

### 5.4 Infrastructure Action Report Generator

**Edge Function:** `generate-infra-report`

**Trigger:** Called for each zone where `risk_level ∈ {High, Severe}` (batch call, or on-demand per zone for the dashboard table)

**Input context injected into prompt:**
- Zone data: name, coordinates, historical incident frequency, drainage notes, current risk_score/risk_level

**System Prompt:**
```
You are an urban infrastructure advisory AI assisting BBMP (Bengaluru's civic body) with stormwater drainage prioritization.

You will be given data for a single city zone currently experiencing High or Severe flood risk, including its historical waterlogging frequency, drainage infrastructure notes, and current risk assessment.

Generate a concise, actionable recommendation for civic authorities. Recommendations should be realistic and proportionate — examples include: stormwater drain desilting, culvert/drain capacity upgrade, installation of additional drain inlets, pump station deployment during peak rainfall, or flagging for detailed engineering survey. Do not recommend large infrastructure projects (e.g. "build a new tunnel") unless the historical incident frequency is severe (6+ per season) and drainage notes indicate a structural bottleneck.

Return ONLY valid JSON matching this exact schema, with no markdown formatting, no code fences, and no additional commentary:

{
  "zone_id": "string, matches input",
  "priority": "integer 1-5, 1 = most urgent",
  "recommended_action": "string, 1 sentence, specific and actionable",
  "estimated_impact": "string, 1 sentence describing expected outcome if implemented",
  "justification": "string, 1 sentence referencing the data that led to this recommendation"
}
```

**Example output:**
```json
{
  "zone_id": "silk_board",
  "priority": 1,
  "recommended_action": "Deploy mobile pump units at the Silk Board underpass during forecast rainfall above 15mm/h and prioritize desilting of the connecting stormwater drain before the next monsoon spell.",
  "estimated_impact": "Could reduce underpass waterlogging duration by an estimated 40-50%, cutting peak congestion time significantly.",
  "justification": "Silk Board recorded 8+ waterlogging incidents this season with a documented underpass drainage failure, and current rainfall exceeds the severe threshold."
}
```

---

## 6. Supabase Schema & Edge Functions

### 6.1 Database Tables

**`flood_zones`** (synthetic seed dataset — disclose in submission as synthetic, based on publicly reported Bengaluru flood hotspots)

| Column | Type | Notes |
|--------|------|-------|
| `zone_id` | text, PK | e.g. `silk_board` |
| `zone_name` | text | e.g. "Silk Board Junction" |
| `lat` | float8 | |
| `lng` | float8 | |
| `ward_number` | text | for civic report framing |
| `historical_incidents_per_season` | int | synthetic, based on news reports |
| `drainage_notes` | text | e.g. "Known underpass drain capacity failure" |
| `ground_truth_risk_level` | text | Low/Medium/High/Severe — used ONLY for KPI #1 accuracy comparison |

Seed with ~12-15 known Bengaluru flood hotspots: Silk Board, Bellandur, KR Puram, Hebbal, Koramangala (Sony World Junction), Sarjapur Road, Yemalur, Marathahalli, Mahadevapura, Electronic City underpass, Tin Factory, Yeshwanthpur, HSR Layout, Outer Ring Road (various stretches).

**`risk_snapshots`** (cache of latest Gemini risk-scoring output, refreshed periodically)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid, PK | |
| `generated_at` | timestamptz | |
| `zone_id` | text, FK → flood_zones | |
| `risk_score` | int | |
| `risk_level` | text | |
| `reasoning` | text | |
| `current_rainfall_mm` | float8 | |
| `forecast_rainfall_mm` | float8 | |

**`infra_reports`** (cache of Gemini infrastructure recommendations)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid, PK | |
| `zone_id` | text, FK → flood_zones | |
| `generated_at` | timestamptz | |
| `priority` | int | |
| `recommended_action` | text | |
| `estimated_impact` | text | |
| `justification` | text | |

**`route_queries`** (optional — log of route requests for KPI #2 aggregate calculation)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid, PK | |
| `created_at` | timestamptz | |
| `baseline_duration_min` | float8 | |
| `recommended_duration_min` | float8 | |
| `reduction_pct` | float8 | computed |

---

### 6.2 Supabase Edge Functions (Deno)

| Function | Calls | Returns | Caching strategy |
|----------|-------|---------|-------------------|
| `get-flood-risk-zones` | OpenWeatherMap → Gemini (5.1) | JSON (5.1 schema) | Cache in `risk_snapshots`, refresh every 15 min via cron (`pg_cron` or Supabase scheduled function) |
| `rank-routes` | Gemini (5.2) | JSON (5.2 schema) | No cache — per-request, but reuses cached risk snapshot |
| `chat-assistant` | Gemini (5.3) | plain text / stream | No cache |
| `generate-infra-report` | Gemini (5.4) | JSON (5.4 schema) | Cache in `infra_reports`, regenerate when risk_level changes |
| `calc-kpis` | Reads from `flood_zones`, `risk_snapshots`, `infra_reports`, `route_queries` | JSON KPI summary (Section 6.3) | Computed on-demand, no cache needed |

All functions read `GEMINI_API_KEY` and `OPENWEATHER_API_KEY` from Supabase Edge Function secrets — never exposed to client.

---

### 6.3 KPI Summary Response (`calc-kpis`)

```json
{
  "prediction_accuracy_pct": 86.7,
  "avg_commute_reduction_pct": 24.3,
  "high_risk_zones_flagged": 4,
  "response_time_improvement_note": "Alerts generated ~22 min ahead of typical news-based traffic alerts based on forecast rainfall data",
  "computed_at": "2026-06-13T09:00:00Z"
}
```

`prediction_accuracy_pct` = compare `risk_snapshots.risk_level` vs `flood_zones.ground_truth_risk_level` across all zones, % matching.
`avg_commute_reduction_pct` = average of `route_queries.reduction_pct` across logged queries (or a single representative demo value if no queries logged yet).
`high_risk_zones_flagged` = `COUNT(*) FROM risk_snapshots WHERE risk_level IN ('High','Severe')` for latest snapshot.

---

## 7. Next.js App Structure

```
/app
  /page.tsx                    → Screen 1: Landing
  /planner/page.tsx            → Screen 2: Route Risk Planner
  /assistant/page.tsx          → Screen 3: AI Chat Assistant
  /dashboard/page.tsx          → Screen 4: City Impact Dashboard
  /api
    /risk-zones/route.ts       → calls Supabase Edge Function get-flood-risk-zones
    /rank-routes/route.ts      → calls Supabase Edge Function rank-routes
    /chat/route.ts             → calls Supabase Edge Function chat-assistant (streaming)
    /infra-reports/route.ts    → calls Supabase Edge Function generate-infra-report
    /kpis/route.ts             → calls Supabase Edge Function calc-kpis
/components
  /Map.tsx                     → Mapbox GL wrapper, 3D pitch + extrusion + risk overlays
  /RouteCard.tsx
  /ChatPanel.tsx
  /KpiCard.tsx
  /RiskZoneTable.tsx
/lib
  /supabaseClient.ts
  /mapbox.ts
  /types.ts                    → shared TS interfaces matching JSON schemas above
```

---

## 8. Environment Variables

```
# .env.local (Next.js)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=

# Supabase Edge Function secrets (set via supabase CLI, NOT in Next.js env)
GEMINI_API_KEY=
OPENWEATHER_API_KEY=
```

---

## 9. Build Priority (36-Hour Plan)

| Phase | Hours | Tasks |
|-------|-------|-------|
| 1 | 0-4 | Supabase project setup, schema + seed `flood_zones` (15 synthetic rows), Mapbox account + token, Next.js scaffold |
| 2 | 4-10 | Edge Function `get-flood-risk-zones` (OpenWeather + Gemini 5.1), test JSON output, Landing page |
| 3 | 10-18 | Route Planner screen: Mapbox 3D map, Directions API integration, risk overlay rendering |
| 4 | 18-24 | Edge Function `rank-routes` (5.2), wire into Route Planner UI with explanations |
| 5 | 24-28 | Chat Assistant screen + `chat-assistant` Edge Function (5.3) |
| 6 | 28-32 | Dashboard screen: `generate-infra-report` (5.4) for top zones, `calc-kpis`, Recharts |
| 7 | 32-36 | Polish, seed demo data for consistent live demo, prep pitch deck with KPI numbers, disclosure slide |

---

## 10. Disclosure & Honesty Notes (for Submission Doc + Judge Q&A)

- **AI methodology:** Gemini (generative AI) used for structured reasoning/recommendation — not a trained ML model. Frame as "LLM-based decision support system" / "Recommendation System" / "Agentic reasoning over real-time + synthetic context data."
- **Dataset:** `flood_zones` table is a synthetic dataset built by the team based on publicly reported Bengaluru waterlogging hotspots (news articles, BBMP flood-prone area lists). Clearly state this is for demonstration purposes per hackathon rules (synthetic datasets explicitly permitted).
- **Real-time data:** Only rainfall (OpenWeatherMap) and route distances/durations (Mapbox) are genuinely live; flood-risk ground truth is synthetic/simulated.
- **Be ready to explain:** why each design decision was made, how the JSON schemas work, and walk through one full Gemini call live if asked (judges may ask technical questions to verify ownership).
