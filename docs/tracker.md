# Sprint Tracker — FlowGuard AI

> **Total time budget:** 36 hours
> **Start:** Phase 1
> **Status legend:** ⬜ Todo | 🟡 In Progress | ✅ Done | ❌ Blocked

---

## Phase 1 — Setup & Scaffolding (Hours 0–4)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1.1 | Create Next.js project with TypeScript + Tailwind + App Router | | ✅ |
| 1.2 | Install dependencies: `@supabase/supabase-js`, `mapbox-gl`, `recharts` | | ✅ |
| 1.3 | Create Supabase project, get URL + anon key | | ✅ |
| 1.4 | Set up `.env.local` with Supabase + Google Maps tokens | | ✅ |
| 1.5 | Create DB tables via Supabase SQL editor (DDL from schema.md) | | ✅ |
| 1.6 | Seed `flood_zones` table with 15 Bengaluru hotspots | | ✅ |
| 1.7 | Create `lib/types.ts` with all shared interfaces | | ✅ |
| 1.8 | Create `lib/supabaseClient.ts` | | ✅ |
| 1.9 | Set up root `app/layout.tsx` with font + basic nav | | ✅ |
| 1.10 | Get Google Maps API key | | ✅ |
| 1.11 | Get OpenWeatherMap API key | | ⬜ |
| 1.12 | Get Gemini API key from Google AI Studio | | ⬜ |
| 1.13 | Set Supabase Edge Function secrets (`GEMINI_API_KEY`, `OPENWEATHER_API_KEY`) | | ⬜ |
| 1.14 | Initialize `supabase/` directory with `supabase init` | | ✅ |

**Phase 1 exit criteria:** ✅ `pnpm dev` runs, Supabase connected, seed data queryable.

---

## Phase 2 — Risk Zones + Landing Page (Hours 4–10)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 2.1 | Implement Edge Function `get-flood-risk-zones` (OpenWeather + Gemini) | | ⬜ |
| 2.2 | Test Edge Function locally — verify JSON output matches schema | | ⬜ |
| 2.3 | Deploy Edge Function to Supabase | | ⬜ |
| 2.4 | Create `app/api/risk-zones/route.ts` (proxy) | | ⬜ |
| 2.5 | Implement Edge Function `calc-kpis` (DB aggregation) | | ⬜ |
| 2.6 | Create `app/api/kpis/route.ts` (proxy) | | ⬜ |
| 2.7 | Build `components/KpiCard.tsx` | | ✅ |
| 2.8 | Build Landing page (`app/page.tsx`) — hero, KPI cards, CTAs | | ✅ |
| 2.9 | Style Landing page with Tailwind (responsive) | | ✅ |
| 2.10 | Verify: Landing page fetches and displays live KPI data | | ⬜ |

**Phase 2 exit criteria:** Landing page renders with live KPI cards, risk-zones API returns valid Gemini output.

---

## Phase 3 — Route Planner + Mapbox (Hours 10–18)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 3.1 | Create `lib/mapbox.ts` (config constants, layer definitions) | | ⬜ |
| 3.2 | Build `components/Map.tsx` — Mapbox GL with 3D buildings, dark theme | | ✅ |
| 3.3 | Add risk zone overlay layer (circles color-coded by risk_level) | | ✅ |
| 3.4 | Build source/destination input form with geocoding | | ⬜ |
| 3.5 | Integrate Mapbox Directions API — fetch 2-3 route alternatives | | ⬜ |
| 3.6 | Render route polylines on map (solid blue + dashed grey) | | ⬜ |
| 3.7 | Implement geo-proximity check (route points vs zone coords, 500m threshold) | | ⬜ |
| 3.8 | Build `components/RouteCard.tsx` — duration, distance, risk badges | | ⬜ |
| 3.9 | Build `app/planner/page.tsx` — compose Map + form + RouteCards | | ⬜ |
| 3.10 | Verify: Map renders Bengaluru 3D, risk zones visible, routes display | | ⬜ |

**Phase 3 exit criteria:** Route Planner shows map with 3D buildings, risk zone overlays, and raw route polylines from Mapbox.

---

## Phase 4 — Route Ranking + UI Wiring (Hours 18–24)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 4.1 | Implement Edge Function `rank-routes` (Gemini prompt 5.2) | | ⬜ |
| 4.2 | Test Edge Function — verify ranked JSON output | | ⬜ |
| 4.3 | Deploy Edge Function to Supabase | | ⬜ |
| 4.4 | Create `app/api/rank-routes/route.ts` (proxy) | | ⬜ |
| 4.5 | Wire ranking response into RouteCards (verdict badges, explanations) | | ⬜ |
| 4.6 | Highlight recommended route on map (solid blue vs dashed grey) | | ⬜ |
| 4.7 | Add "Why this route?" expandable explanation panel | | ⬜ |
| 4.8 | Log route query to `route_queries` table for KPI tracking | | ⬜ |
| 4.9 | Verify: Full planner flow — input → routes → AI ranking → display | | ⬜ |

**Phase 4 exit criteria:** Complete Route Planner flow works end-to-end with Gemini explanations.

---

## Phase 5 — Chat Assistant (Hours 24–28)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 5.1 | Implement Edge Function `chat-assistant` (Gemini prompt 5.3) | | ⬜ |
| 5.2 | Implement context injection (current weather + risk zones into system prompt) | | ⬜ |
| 5.3 | Test conversational responses for sample queries | | ⬜ |
| 5.4 | Deploy Edge Function | | ⬜ |
| 5.5 | Create `app/api/chat/route.ts` (streaming proxy) | | ⬜ |
| 5.6 | Build `components/ChatPanel.tsx` — message list, input, typing indicator | | ⬜ |
| 5.7 | Build `app/assistant/page.tsx` — full chat page | | ⬜ |
| 5.8 | Verify: Ask "Is Silk Board safe?" → get contextual response | | ⬜ |

**Phase 5 exit criteria:** Chat responds with accurate, contextual flood-safety information.

---

## Phase 6 — Dashboard + KPIs (Hours 28–32)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 6.1 | Implement Edge Function `generate-infra-report` (Gemini prompt 5.4) | | ⬜ |
| 6.2 | Generate reports for all High/Severe zones, cache in `infra_reports` | | ⬜ |
| 6.3 | Deploy Edge Function | | ⬜ |
| 6.4 | Create `app/api/infra-reports/route.ts` (proxy) | | ⬜ |
| 6.5 | Build `components/RiskZoneTable.tsx` — sortable table with priority | | ⬜ |
| 6.6 | Build risk distribution bar chart (Recharts) | | ⬜ |
| 6.7 | Build rainfall vs delay line chart (Recharts) | | ⬜ |
| 6.8 | Build `app/dashboard/page.tsx` — KPI cards + charts + table | | ⬜ |
| 6.9 | Verify: Dashboard displays all 4 KPIs, charts render, table sorts | | ⬜ |

**Phase 6 exit criteria:** Dashboard fully functional with live data, all 4 KPIs displayed.

---

## Phase 7 — Polish + Demo Prep (Hours 32–36)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 7.1 | Seed consistent demo data (fixed risk scores for reliable demo) | | ⬜ |
| 7.2 | Add loading skeletons for all async data | | ⬜ |
| 7.3 | Add error states with retry buttons | | ⬜ |
| 7.4 | Responsive design pass (mobile + tablet) | | ⬜ |
| 7.5 | Add SDG badges + "Powered by" disclosure footer | | ⬜ |
| 7.6 | Test full flow: Landing → Planner → Chat → Dashboard | | ⬜ |
| 7.7 | Deploy to Vercel (production build test) | | ⬜ |
| 7.8 | Prep pitch deck with live KPI screenshots | | ⬜ |
| 7.9 | Write disclosure notes for submission doc | | ⬜ |
| 7.10 | Final rehearsal — demo script with backup plan for API failures | | ⬜ |

**Phase 7 exit criteria:** Deployed, stable, demo-ready. Pitch deck prepared with real screenshots.

---

## Summary

| Phase | Hours | Tasks | Critical Dependency |
|-------|-------|-------|---------------------|
| 1 | 0–4 | 14 | API keys obtained |
| 2 | 4–10 | 10 | Gemini returning valid JSON |
| 3 | 10–18 | 10 | Mapbox token + Directions API working |
| 4 | 18–24 | 9 | Phase 2 + 3 complete |
| 5 | 24–28 | 8 | Risk zones cached for context injection |
| 6 | 28–32 | 9 | All Edge Functions deployed |
| 7 | 32–36 | 10 | All features functional |
| **Total** | **36** | **70** | |
