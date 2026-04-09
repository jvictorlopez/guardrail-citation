# TODO 01 — Frontend Scope and Architecture

## Objective
Define the frontend scope, choose a minimal stack, and establish architecture guardrails so the frontend stays small, demo-friendly, and doesn't compromise the backend submission.

## Why This Matters
The technical test does NOT evaluate frontend. This UI exists solely to make the video walkthrough more compelling and to let the reviewer see the guardrail engine in action interactively. Overbuilding here is a negative signal.

## Scope
- Inspect backend endpoints and JSON contract
- Choose minimal frontend stack
- Define frontend directory structure
- Define backend integration approach
- Document non-goals explicitly

## Detailed Tasks
- [x] Review backend API: POST /guardrail, GET /health
- [x] Review golden_set.json structure for demo case loading
- [x] Choose stack: Vite + React + TypeScript (lightest viable SPA)
- [x] Define folder layout under frontend/
- [x] Decide CORS approach: add minimal CORS middleware to FastAPI
- [x] Document: no database, no auth, no Docker, no analytics, no SSR

## Architecture Decisions

### Stack
| Component | Choice | Rationale |
|-----------|--------|-----------|
| Bundler | Vite | Fast, zero-config, lighter than Next.js |
| UI Library | React 18 | Minimal, widely known |
| Language | TypeScript | Type safety for API contract |
| Styling | Plain CSS with CSS modules | No dependency, full control |
| HTTP Client | fetch (native) | Zero dependency |

### Non-Goals
- No routing library (single page is enough)
- No state management library (React state is sufficient)
- No component library (hand-crafted for polish)
- No SSR/SSG
- No testing framework (demo UI only)

### Layout
```
frontend/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── App.css
│   ├── index.css
│   ├── components/
│   │   ├── PayloadEditor.tsx
│   │   ├── ResponsePanel.tsx
│   │   ├── HealthPanel.tsx
│   │   ├── DemoCases.tsx
│   │   └── StatusBadge.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── demoCases.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

## Acceptance Criteria
- [x] Frontend scope locked — demo UI only
- [x] Stack chosen with rationale
- [x] Env/config plan: VITE_API_URL defaults to http://localhost:8000
- [x] No-overbuild guardrails documented
- [x] Commit checkpoint defined

## Commit Checkpoint
`docs: add frontend todo plan and scope`

## Final Status
- **Status:** Done
- **Completion Notes:** Architecture locked. Vite + React + TS, no extras.
