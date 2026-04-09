# TODO 01: Premium Product Direction

## Objective
Inspect the current repo and backend, define the premium product narrative, lock scope and non-goals, choose the exact frontend stack, define information architecture, and set screen-recording optimization principles.

## Why This Matters
The frontend must feel like a premium AI platform console — not a toy dashboard. This planning step ensures every subsequent decision aligns with a cohesive product vision that maximizes demo impact and signals senior engineering taste.

## Product / UX Principles
- **Intentional luxury**: every pixel should look deliberate, not accidental
- **Stripe x Vercel x Linear x AI console** level taste
- **Dark-first**: layered surfaces with soft glows and subtle depth
- **Information density without noise**: show what matters, hide what doesn't
- **Demo-first**: optimized for screen recording at common laptop resolutions
- **Honest visualization**: never fake data or mislead about backend behavior

## Scope

### In Scope
- Repo and backend inspection to understand API contract
- Premium product narrative definition
- Exact frontend stack selection and justification
- Information architecture (layout, panels, flow)
- Screen-recording optimization guidelines
- Non-goals and overbuild prevention rules

### Out of Scope
- Actual implementation code
- Component development
- API integration code

## Detailed Checklist
- [x] Read README.md, NOTES.md, FINAL_STATUS.md
- [x] Read app/main.py, app/models.py, app/engine.py
- [x] Read golden_set.json and eval.py
- [x] Read existing frontend code (App.tsx, components, styles)
- [x] Understand POST /guardrail request/response schema
- [x] Understand GET /health response schema
- [x] Identify all 5 possible citation statuses and their meanings
- [x] Define premium product narrative
- [x] Lock frontend stack: Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui + Motion + Lucide
- [x] Define information architecture (two-column console layout)
- [x] Define screen-recording optimization rules
- [x] Document non-goals and overbuild prevention

## Stack Decision
| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | Best-in-class React framework, excellent DX |
| Language | TypeScript (strict) | Type safety for API contracts |
| Styling | Tailwind CSS v4 | Utility-first, design-token friendly |
| Components | shadcn/ui | Premium primitives, fully customizable |
| Motion | Framer Motion | Smooth, declarative animations |
| Icons | Lucide React | Clean, consistent icon set |
| Editor | Monaco Editor (@monaco-editor/react) | Best JSON editing experience |
| Toasts | Sonner | Premium notification feedback |
| Validation | Zod | Schema validation for payloads |

## Information Architecture
```
+----------------------------------------------------------+
|  TopBar: Logo | "Citation Guardrail Console" | Status     |
+----------------------------------------------------------+
|  Left Column (40%)        |  Right Column (60%)          |
|  +-----------------------+|  +--------------------------+ |
|  | Demo Cases Panel      ||  | Response Panel           | |
|  | - Grouped by category ||  | - Final Answer Card      | |
|  | - Status badges       ||  | - Citation Decision Card | |
|  | - One-click load      ||  | - Metrics Tiles          | |
|  +-----------------------+|  +--------------------------+ |
|  | Request Playground    ||  | Health / Observability   | |
|  | - Monaco Editor       ||  | - Status counters        | |
|  | - Format/Reset/Load   ||  | - Refresh controls       | |
|  | - Run Guardrail CTA   ||  |                          | |
|  +-----------------------+|  +--------------------------+ |
+----------------------------------------------------------+
```

## Screen-Recording Optimization
- Desktop-first: optimize for 1440x900 and 1920x1080
- No awkward dead space — fill the viewport meaningfully
- All critical content above the fold
- Clear left-to-right narrative: select case -> edit payload -> run -> see results
- Smooth state transitions that look great at 30fps capture
- High contrast text for readability in compressed video

## Non-Goals / Overbuild Prevention
- No database
- No authentication
- No Docker
- No SSR for API calls (client-side fetch to FastAPI backend)
- No complex state management (useState + fetch is sufficient)
- No test suite for the frontend (not required by brief)
- No mobile responsiveness (desktop demo only)
- No real-time WebSocket connections
- No caching layer beyond simple React state

## Acceptance Criteria
- [x] Premium design direction documented
- [x] Stack locked with justifications
- [x] Information architecture documented
- [x] No-overbuild rules documented
- [x] Screen-recording optimization principles defined

## Files Expected
- `frontend/docs/todos/TODO_01_PREMIUM_PRODUCT_DIRECTION.md` (this file)

## Risks / Pitfalls
- Over-engineering the frontend at the expense of shipping
- Choosing a stack that creates build complexity
- Spending time on mobile when demo is desktop-only

## Validation Plan
- Review this document for completeness before proceeding
- Ensure stack choices are compatible with each other

## Commit Checkpoint
`docs: add premium frontend product direction and todo plan`

## Final Status
- **Status**: Done
- **Completion Notes**: Product direction, stack, IA, and constraints fully defined. Ready to proceed with implementation.
