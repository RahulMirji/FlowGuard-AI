# Project Rules — FlowGuard AI

## 1. Coding Conventions

### TypeScript
- **Strict mode** enabled (`"strict": true` in tsconfig)
- No `any` types — use proper interfaces from `lib/types.ts`
- Prefer `interface` over `type` for object shapes
- Use `const` by default, `let` only when reassignment is needed

### Naming
| Element | Convention | Example |
|---------|-----------|---------|
| Variables/functions | camelCase | `getRiskZones`, `currentRainfall` |
| Components | PascalCase | `RouteCard`, `ChatPanel` |
| Files (components) | PascalCase.tsx | `KpiCard.tsx` |
| Files (lib/utils) | camelCase.ts | `supabaseClient.ts` |
| Files (API routes) | `route.ts` inside named folder | `app/api/risk-zones/route.ts` |
| Constants | UPPER_SNAKE_CASE | `RISK_COLORS`, `GEMINI_URL` |
| Interfaces | PascalCase, no `I` prefix | `RiskSnapshot`, not `IRiskSnapshot` |
| DB columns | snake_case | `risk_score`, `zone_id` |

### Imports
Order (enforced manually):
1. React/Next.js imports
2. Third-party libraries
3. Internal `@/components/*`
4. Internal `@/lib/*`
5. Types (with `type` keyword)

### Tailwind CSS
- Use utility classes directly in JSX
- Extract repeated patterns into components, not `@apply`
- Color palette: use the specific hex values from design.md for risk levels
- Responsive: mobile-first (`sm:`, `md:`, `lg:` breakpoints)

## 2. Folder Structure Rules

```
/app                    → Pages and API routes ONLY (no shared logic)
/components             → Reusable UI components (no data fetching inside)
/lib                    → Utilities, clients, helpers, types
/supabase/functions     → Edge Functions (one folder per function)
/docs                   → Project documentation
/public                 → Static assets
```

**Rules:**
- Components do NOT call APIs directly — they receive data as props
- Pages handle data fetching (server components) or coordinate client-side fetches
- All shared TypeScript types live in `lib/types.ts`
- No business logic in components — move to lib or API routes

## 3. Git Workflow

### Branching Strategy
```
main (protected — deploy target)
├── feat/landing-page
├── feat/route-planner
├── feat/chat-assistant
├── feat/dashboard
├── fix/mapbox-overlay-colors
└── chore/seed-data
```

**Branch naming:** `<type>/<short-description>`
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`

### Commit Messages (Conventional Commits)
```
<type>(<scope>): <description>

feat(planner): add risk zone overlay to map
fix(chat): handle empty response from Gemini
chore(db): seed flood_zones with 15 entries
docs(readme): add setup instructions
```

### PR Process
1. Create feature branch from `main`
2. Make changes, commit with conventional format
3. Push branch, open PR
4. At least 1 team member reviews
5. Squash merge into `main`

**PR title:** Same format as commit message
**PR body:** What changed + how to test

## 4. AI/Agent Rules

When an AI assistant works on this codebase, it MUST follow:

### DO:
- Use the exact interfaces from `lib/types.ts`
- Follow the Edge Function template from implementation.md §3.2
- Use `@supabase/supabase-js` for all Supabase interactions
- Use `mapbox-gl` (not react-map-gl) for map rendering
- Use Recharts for dashboard charts
- Return structured JSON from Gemini with `responseMimeType: "application/json"`
- Keep Edge Functions focused — one responsibility per function
- Use the exact Gemini prompts from PRD Section 5 as the source of truth

### DO NOT:
- Install additional UI libraries (no Material UI, Chakra, shadcn — Tailwind only)
- Add authentication (not in MVP scope)
- Use `react-map-gl` wrapper (use raw `mapbox-gl` for full control)
- Call Gemini or OpenWeatherMap from the client side
- Store API keys in `.env.local` (only Supabase URL, anon key, and Mapbox token go there)
- Add a state management library (React state + props is sufficient)
- Over-engineer — this is a 36-hour hackathon build

### PREFER:
- Server Components for pages that only fetch data
- Client Components (`'use client'`) only when interactivity is needed (map, chat, forms)
- `fetch` over axios
- Inline Tailwind over CSS modules or styled-components

## 5. Environment & Secrets

### Rules:
- **NEVER** commit `.env.local` — it's in `.gitignore`
- **NEVER** expose `GEMINI_API_KEY` or `OPENWEATHER_API_KEY` to the browser
- Only 3 env vars are `NEXT_PUBLIC_*` (safe for client):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_MAPBOX_TOKEN`
- Supabase secrets are set via CLI: `supabase secrets set KEY=value`
- For local Edge Function testing, use `.env` inside `supabase/` directory

### `.gitignore` must include:
```
.env.local
.env
node_modules/
.next/
supabase/.env
```

## 6. Code Review Checklist

Before merging any PR, verify:

- [ ] TypeScript compiles without errors (`pnpm build`)
- [ ] No `any` types introduced
- [ ] New interfaces added to `lib/types.ts` (not inline)
- [ ] API routes handle errors and return proper status codes
- [ ] No API keys or secrets in client-side code
- [ ] Components are properly typed (props interface defined)
- [ ] Tailwind classes are responsive (mobile-first)
- [ ] Gemini prompts match PRD Section 5 exactly
- [ ] Edge Functions return the expected JSON schema
- [ ] Loading and error states handled in UI
