# Application Flow — FlowGuard AI

## 1. User Journey Overview

```
Landing Page → Route Risk Planner → AI Chat Assistant
     ↓                                      ↓
City Impact Dashboard ←────────────────────┘
```

**Primary flow:** User lands → checks route safety → gets AI advice → views city-wide impact.

---

## 2. Screen 1 — Landing Page

**Flow:**
1. Page loads → fetches KPI summary from `/api/kpis`
2. Renders hero, 3 KPI teaser cards, CTAs
3. User clicks "Check My Route" → navigates to `/planner`
4. User clicks "View City Dashboard" → navigates to `/dashboard`

**Data:** Single API call on mount → `calc-kpis` Edge Function → returns 4 KPI values.

---

## 3. Screen 2 — Route Risk Planner (Core)

### User Flow
1. User enters source + destination (text input or geolocation)
2. System fetches route alternatives from Mapbox
3. System fetches current flood-risk zones
4. System determines which routes pass near high-risk zones
5. System calls Gemini to rank routes with explanations
6. UI renders map + route cards + AI recommendation

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Next.js Frontend
    participant API as /api/rank-routes
    participant MB as Mapbox Directions
    participant SF as Supabase Edge Functions
    participant GM as Gemini API
    participant DB as Supabase DB

    U->>FE: Enter source & destination
    FE->>MB: GET /directions/v5 (alternatives=true)
    MB-->>FE: 2-3 route options (polylines, durations)
    FE->>API: POST {routes, source, destination}
    API->>DB: SELECT * FROM risk_snapshots (latest)
    DB-->>API: Current risk zones with scores
    API->>SF: invoke rank-routes({routes, risk_zones})
    SF->>GM: Gemini prompt (5.2) with routes + risk context
    GM-->>SF: JSON ranked routes with explanations
    SF-->>API: Ranked routes response
    API-->>FE: {recommended_route_id, routes[], summary}
    FE->>U: Render map + color-coded routes + risk overlays + cards
```

### Geo-Proximity Check
- For each route polyline, check if any point is within ~500m of a risk zone's coordinates
- Uses haversine distance: `d = 2R × arcsin(√(sin²(Δlat/2) + cos(lat1)cos(lat2)sin²(Δlng/2)))`
- Zones within threshold are flagged as "crossed" for that route

---

## 4. Screen 3 — AI Chat Assistant

### User Flow
1. User opens chat → system loads current context (weather + risk zones)
2. User types a question about travel safety
3. System sends message + context to Gemini
4. AI responds with actionable, concise advice
5. Conversation continues with maintained context

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Chat UI
    participant API as /api/chat
    participant SF as chat-assistant Edge Function
    participant GM as Gemini API
    participant DB as Supabase DB

    U->>FE: Opens chat
    FE->>API: GET current context
    API->>DB: SELECT latest risk_snapshots
    DB-->>API: Current zones + risk levels
    Note over API: Builds system prompt with live context

    U->>FE: "Is Silk Board safe right now?"
    FE->>API: POST {message, history[]}
    API->>SF: invoke chat-assistant({message, context, history})
    SF->>GM: System prompt (5.3) + user message
    GM-->>SF: Natural language response (streamed)
    SF-->>API: Response text
    API-->>FE: Streamed response
    FE->>U: Display AI response
```

---

## 5. Screen 4 — City Impact Dashboard

### Data Flow

```mermaid
sequenceDiagram
    participant FE as Dashboard UI
    participant API1 as /api/kpis
    participant API2 as /api/risk-zones
    participant API3 as /api/infra-reports
    participant DB as Supabase DB
    participant SF as Edge Functions

    FE->>API1: GET /api/kpis
    API1->>DB: Aggregate from risk_snapshots, route_queries, flood_zones
    DB-->>API1: KPI summary JSON
    API1-->>FE: 4 KPI cards data

    FE->>API2: GET /api/risk-zones
    API2->>DB: SELECT latest risk_snapshots
    DB-->>API2: All zones with risk levels
    API2-->>FE: Bar chart data (risk distribution)

    FE->>API3: GET /api/infra-reports
    API3->>DB: SELECT from infra_reports WHERE risk_level IN (High, Severe)
    DB-->>API3: Priority action list
    API3-->>FE: Table data (top 5 zones with interventions)
```

### Dashboard Components
- **KPI Cards:** 4 metrics (accuracy, commute reduction, zones flagged, response time)
- **Bar Chart:** Risk level distribution (Low/Medium/High/Severe counts)
- **Line Chart:** Rainfall vs. commute delay (last 24h)
- **Table:** Priority Infrastructure Action List (sortable by priority)

---

## 6. Edge Function Caching Strategy

| Function | Cache Location | Refresh Trigger | TTL |
|----------|---------------|-----------------|-----|
| `get-flood-risk-zones` | `risk_snapshots` table | Scheduled (every 15 min) | 15 min |
| `rank-routes` | None (per-request) | Each user query | N/A |
| `chat-assistant` | None | Each message | N/A |
| `generate-infra-report` | `infra_reports` table | When risk_level changes | Until next change |
| `calc-kpis` | None (computed on-demand) | Each request | N/A |

### Refresh Flow (Background)
```
Every 15 min:
  1. Call OpenWeatherMap → get current + forecast rainfall
  2. Read flood_zones from DB
  3. Call Gemini (prompt 5.1) → get risk scores
  4. UPSERT into risk_snapshots
  5. For any zone where risk_level changed to High/Severe:
     → Call generate-infra-report → UPSERT into infra_reports
```
