# Technical Specification — FlowGuard AI

## 1. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | 15.x | Frontend + API routes |
| Language | TypeScript | 5.x | Type safety across codebase |
| Styling | Tailwind CSS | 4.x | Utility-first styling |
| Database | Supabase (PostgreSQL) | latest | DB, Edge Functions, Auth |
| Maps | Mapbox GL JS | 3.x | Interactive 3D map rendering |
| AI | Google Gemini API | 2.0/2.5 Flash | Structured reasoning engine |
| Weather | OpenWeatherMap API | 2.5 | Real-time + forecast rainfall |
| Charts | Recharts | 2.x | Dashboard visualizations |
| Routing | Mapbox Directions API | v5 | Route alternatives with geometry |

## 2. API Integrations & Free Tier Limits

| API | Free Tier | Rate Limits | Key Endpoints |
|-----|-----------|-------------|---------------|
| **Mapbox GL JS** | 50,000 map loads/month | N/A | Map rendering |
| **Mapbox Directions** | 100,000 requests/month | 300 req/min | `GET /directions/v5/mapbox/driving/{coords}` |
| **OpenWeatherMap** | 1,000 calls/day | 60 calls/min | `/weather`, `/forecast` (5-day/3-hour) |
| **Gemini API** | Free via Google AI Studio | 15 RPM (flash) | `generateContent` with JSON mode |
| **Supabase** | 500MB DB, 2GB bandwidth | 100 concurrent connections | Edge Functions, REST API |

## 3. Environment Variables

### `.env.local` (Next.js client + server)
```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox-public-token>
```

### Supabase Edge Function Secrets (set via CLI)
```bash
supabase secrets set GEMINI_API_KEY=<key>
supabase secrets set OPENWEATHER_API_KEY=<key>
```

> **Never expose `GEMINI_API_KEY` or `OPENWEATHER_API_KEY` to the client.** All AI and weather calls go through Supabase Edge Functions.

## 4. System Prerequisites

| Requirement | Version | Install |
|-------------|---------|---------|
| Node.js | ≥ 18.x | `brew install node` or nvm |
| pnpm | ≥ 9.x | `npm i -g pnpm` |
| Supabase CLI | ≥ 1.x | `brew install supabase/tap/supabase` |
| Git | ≥ 2.x | Pre-installed on macOS |

## 5. Performance & Rate-Limiting Considerations

- **Risk zone refresh:** Cached in `risk_snapshots` table, refreshed every 15 minutes via scheduled Edge Function. Avoids redundant Gemini + OpenWeatherMap calls.
- **Route ranking:** Per-request (no cache) but reuses cached risk snapshot — single Gemini call per route query.
- **Chat:** Per-message Gemini call with context injection. No streaming cache.
- **Gemini rate limits:** 15 RPM on free tier. Batch risk-zone scoring into a single call (all zones in one prompt) rather than per-zone calls.
- **OpenWeatherMap:** 1 call per 15-min refresh cycle = ~96/day. Well within 1,000/day limit.
- **Mapbox:** Map loads are the constraint (50k/month). Directions calls are generous (100k/month).

## 6. Deployment Target

| Service | Component | Notes |
|---------|-----------|-------|
| **Vercel** | Next.js frontend + API routes | Free tier, auto-deploy from GitHub |
| **Supabase** | PostgreSQL + Edge Functions | Free tier project |
| **GitHub** | Source control | Private repo |
