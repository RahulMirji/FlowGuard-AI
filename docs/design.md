# System Design — FlowGuard AI

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph Client["Browser (Next.js Frontend)"]
        LP[Landing Page]
        RP[Route Planner]
        CA[Chat Assistant]
        DB_UI[Dashboard]
        MAP[Mapbox GL JS]
    end

    subgraph NextAPI["Next.js API Routes (Vercel)"]
        A1[/api/risk-zones]
        A2[/api/rank-routes]
        A3[/api/chat]
        A4[/api/infra-reports]
        A5[/api/kpis]
    end

    subgraph Supabase["Supabase"]
        EF1[get-flood-risk-zones]
        EF2[rank-routes]
        EF3[chat-assistant]
        EF4[generate-infra-report]
        EF5[calc-kpis]
        PG[(PostgreSQL)]
    end

    subgraph External["External APIs"]
        OWM[OpenWeatherMap]
        GMN[Gemini API]
        MBD[Mapbox Directions]
    end

    Client --> NextAPI
    RP --> MBD
    MAP --> |"Map tiles"| External
    NextAPI --> Supabase
    EF1 --> OWM
    EF1 --> GMN
    EF2 --> GMN
    EF3 --> GMN
    EF4 --> GMN
    EF5 --> PG
```

## 2. Next.js App Router Structure

```
/app
├── page.tsx                    # Screen 1: Landing
├── layout.tsx                  # Root layout (fonts, metadata, nav)
├── planner/
│   └── page.tsx                # Screen 2: Route Risk Planner
├── assistant/
│   └── page.tsx                # Screen 3: AI Chat Assistant
├── dashboard/
│   └── page.tsx                # Screen 4: City Impact Dashboard
└── api/
    ├── risk-zones/route.ts     # Proxy → get-flood-risk-zones
    ├── rank-routes/route.ts    # Proxy → rank-routes
    ├── chat/route.ts           # Proxy → chat-assistant (streaming)
    ├── infra-reports/route.ts  # Proxy → generate-infra-report
    └── kpis/route.ts           # Proxy → calc-kpis

/components
├── Map.tsx                     # Mapbox GL wrapper
├── RouteCard.tsx               # Route option card with verdict
├── ChatPanel.tsx               # Chat UI with message list + input
├── KpiCard.tsx                 # Single KPI metric card
└── RiskZoneTable.tsx           # Infrastructure action table

/lib
├── supabaseClient.ts           # Supabase browser + server clients
├── mapbox.ts                   # Mapbox helpers (init, layers)
└── types.ts                    # Shared TypeScript interfaces
```

## 3. Component Hierarchy

```
RootLayout
├── Navbar (shared across all pages)
├── Landing Page
│   ├── HeroSection
│   ├── KpiCard × 3
│   └── CTAButtons
├── Route Planner
│   ├── SearchForm (source/destination inputs)
│   ├── Map (Mapbox GL)
│   │   ├── RiskZoneLayer (circles, color-coded)
│   │   ├── RouteLayer (polylines)
│   │   └── BuildingExtrusions (3D)
│   └── RouteCard[] (ranked results)
├── Chat Assistant
│   └── ChatPanel
│       ├── MessageList
│       └── MessageInput
└── Dashboard
    ├── KpiCard × 4
    ├── RiskDistributionChart (Recharts Bar)
    ├── RainfallDelayChart (Recharts Line)
    └── RiskZoneTable (infra reports)
```

## 4. Supabase Edge Function Architecture

Each Edge Function is a Deno runtime with access to secrets:

```
supabase/functions/
├── get-flood-risk-zones/index.ts   # OpenWeather → Gemini → risk scores
├── rank-routes/index.ts            # Gemini route ranking
├── chat-assistant/index.ts         # Gemini conversational
├── generate-infra-report/index.ts  # Gemini infra recommendations
└── calc-kpis/index.ts              # DB aggregation queries
```

**Pattern:** Each function reads secrets via `Deno.env.get()`, calls external APIs, and returns structured JSON.

## 5. Caching Strategy

| Data | Storage | Refresh | Rationale |
|------|---------|---------|-----------|
| Flood risk scores | `risk_snapshots` table | Every 15 min | Weather doesn't change faster; saves Gemini calls |
| Infra reports | `infra_reports` table | On risk_level change | Only regenerate when zone risk changes |
| Route rankings | None | Per-request | Unique per source/destination pair |
| Chat responses | None | Per-message | Conversational, unique each time |
| KPIs | None (computed) | On-demand | Simple DB aggregation, fast |

**Why 15-min refresh:** OpenWeatherMap updates roughly every 10 min. A 15-min cycle ensures fresh data while staying well within API rate limits (96 calls/day vs 1,000 limit).

## 6. Mapbox Visualization Design

### Map Configuration
- **Style:** `mapbox://styles/mapbox/dark-v11` (dark theme for contrast)
- **Center:** Bengaluru `[77.5946, 12.9716]`
- **Zoom:** 11 (city overview), zooms to 14 on route selection
- **Pitch:** 45° (3D perspective)
- **Bearing:** 0° (north-up)

### Layers (render order)
1. **Base map** — dark tiles
2. **Building extrusions** — `fill-extrusion` layer, height from building data, subtle color
3. **Risk zone circles** — `circle` layer, radius proportional to risk_score, color by risk_level:
   - Severe: `#dc2626` (red, opacity 0.4)
   - High: `#f97316` (orange, opacity 0.35)
   - Medium: `#facc15` (yellow, opacity 0.3)
   - Low: `#22c55e` (green, opacity 0.25)
4. **Route polylines** — `line` layer:
   - Recommended: solid blue `#3b82f6`, width 5
   - Alternatives: dashed grey `#6b7280`, width 3
5. **Markers** — source (green pin), destination (red pin)

## 7. AI Prompt Engineering Approach

### Pattern: Context-Injected Structured Reasoning
```
┌─────────────────────────────────┐
│ System Prompt (static template) │
├─────────────────────────────────┤
│ Injected Context (dynamic data) │
│ - Current weather               │
│ - Risk zone scores              │
│ - Route options                 │
├─────────────────────────────────┤
│ User Query / Task               │
├─────────────────────────────────┤
│ Output: Structured JSON         │
│ (responseMimeType: "json")      │
└─────────────────────────────────┘
```

### Key Design Decisions:
- **Structured JSON output** (`responseMimeType: "application/json"` + `responseSchema`) — eliminates parsing failures
- **Single-call batch processing** — all zones scored in one Gemini call, not N calls per zone
- **Context injection over fine-tuning** — works within free tier, no training needed
- **Explicit scoring rubric in prompt** — deterministic-ish behavior (Low/Medium/High/Severe thresholds defined)

## 8. Design Decisions & Tradeoffs

| Decision | Rationale | Tradeoff |
|----------|-----------|----------|
| Next.js API routes as proxy | Keep secrets server-side, add error handling | Extra hop vs direct client→Supabase |
| Supabase Edge Functions for AI | Deno runtime, secrets management, closer to DB | Cold start latency (~200ms) |
| Cached risk snapshots | Reduce API costs, consistent data within window | Up to 15-min stale data |
| Synthetic dataset | Hackathon rules allow it; real BBMP data unavailable | Not ground-truth validated |
| Single Gemini call for all zones | Stays within 15 RPM limit | Larger prompt, slightly slower |
| Mapbox over Google Maps | Better free tier for map loads, superior 3D support | Less familiar to some devs |
| Recharts over D3 | Simpler API, React-native, sufficient for dashboard | Less customization vs D3 |
| No auth for MVP | Faster demo, no login friction for judges | No personalization/history |
