# Implementation Guide — FlowGuard AI

## 1. Project Scaffolding

```bash
# Create Next.js project
pnpm create next-app@latest . --typescript --tailwind --app --src=false --import-alias="@/*"

# Install dependencies
pnpm add @supabase/supabase-js mapbox-gl recharts @types/mapbox-gl

# Initialize Supabase (local dev)
supabase init
supabase start

# Link to remote project
supabase link --project-ref <your-project-ref>
```

## 2. File-by-File Implementation Order

### Phase 1: Foundation
```
1. lib/types.ts              → Shared interfaces (copy from schema.md §5)
2. lib/supabaseClient.ts     → Browser + server client setup
3. .env.local                → Add environment variables
4. app/layout.tsx            → Root layout with fonts, nav, metadata
```

### Phase 2: Risk Zones + Landing
```
5. supabase/functions/get-flood-risk-zones/index.ts → Edge Function
6. app/api/risk-zones/route.ts                      → API proxy
7. components/KpiCard.tsx                           → Reusable metric card
8. app/page.tsx                                     → Landing page
```

### Phase 3: Route Planner + Map
```
9.  lib/mapbox.ts                → Mapbox helpers (init config, layer defs)
10. components/Map.tsx           → Mapbox GL wrapper component
11. components/RouteCard.tsx     → Route option card
12. app/planner/page.tsx         → Route Planner page (inputs + map + cards)
```

### Phase 4: Route Ranking
```
13. supabase/functions/rank-routes/index.ts → Edge Function
14. app/api/rank-routes/route.ts            → API proxy
15. Wire rank-routes response into planner UI
```

### Phase 5: Chat Assistant
```
16. supabase/functions/chat-assistant/index.ts → Edge Function
17. app/api/chat/route.ts                      → Streaming API proxy
18. components/ChatPanel.tsx                    → Chat UI component
19. app/assistant/page.tsx                      → Chat page
```

### Phase 6: Dashboard
```
20. supabase/functions/generate-infra-report/index.ts → Edge Function
21. supabase/functions/calc-kpis/index.ts             → Edge Function
22. app/api/infra-reports/route.ts                    → API proxy
23. app/api/kpis/route.ts                             → API proxy
24. components/RiskZoneTable.tsx                       → Infra report table
25. app/dashboard/page.tsx                             → Dashboard page
```

### Phase 7: Polish
```
26. Seed demo data for consistent live demo
27. Loading states, error boundaries
28. Responsive design pass
29. Final testing all flows end-to-end
```

## 3. Code Patterns

### 3.1 Supabase Client Setup

```typescript
// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 3.2 Edge Function Template

```typescript
// supabase/functions/<name>/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    // ... logic here ...
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### 3.3 Gemini API Call Pattern

```typescript
// Inside Edge Function
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const response = await fetch(GEMINI_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  }),
});

const data = await response.json();
const result = JSON.parse(data.candidates[0].content.parts[0].text);
```

### 3.4 Mapbox Initialization

```typescript
// components/Map.tsx
'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [77.5946, 12.9716], // Bengaluru
      zoom: 11,
      pitch: 45,
    });

    map.current.on('load', () => {
      // Add 3D building extrusions
      map.current!.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 12,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-opacity': 0.5,
        },
      });
    });
  }, []);

  return <div ref={mapContainer} className="w-full h-full" />;
}
```

### 3.5 Next.js API Route → Edge Function Proxy

```typescript
// app/api/risk-zones/route.ts
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.functions.invoke('get-flood-risk-zones');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
```

## 4. Integration Patterns

### API Routes → Edge Functions → Components

```
Component (client)
  → fetch('/api/risk-zones')
    → Next.js API route (server)
      → supabase.functions.invoke('get-flood-risk-zones')
        → Edge Function (Deno)
          → OpenWeatherMap API
          → Gemini API
          → returns JSON
        ← JSON response
      ← JSON response
    ← JSON response
  ← setState(data)
→ render UI
```

### Why the proxy layer?
- Keeps Supabase service role key server-side
- Adds error handling/transformation
- Allows caching headers
- Single origin for CORS simplicity

## 5. Error Handling Strategy

| Layer | Strategy |
|-------|----------|
| Edge Functions | try/catch, return `{ error: message }` with 500 status |
| API Routes | Check for edge function errors, pass through or transform |
| Components | Loading states, error states with retry buttons |
| Gemini failures | Fallback to cached `risk_snapshots` if fresh call fails |
| Mapbox failures | Show error overlay on map container |

## 6. Testing Approach

For a 36-hour hackathon, testing is manual verification per phase:

| Phase | Verification |
|-------|-------------|
| 1 | Supabase connected, tables created, seed data visible |
| 2 | `/api/risk-zones` returns valid JSON, Landing renders KPIs |
| 3 | Map renders with 3D buildings at Bengaluru, risk circles visible |
| 4 | Route planner returns ranked routes, map shows polylines |
| 5 | Chat responds contextually about flood zones |
| 6 | Dashboard shows charts + table with real data |
| 7 | Full flow: Landing → Plan Route → Chat → Dashboard (no errors) |
