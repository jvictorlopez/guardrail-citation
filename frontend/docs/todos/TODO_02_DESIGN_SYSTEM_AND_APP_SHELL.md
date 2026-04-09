# TODO 02: Design System and App Shell

## Objective
Establish the premium design system (theme, typography, spacing, colors, motion language), create the app shell/layout, implement the top navigation bar, set up environment configuration, API client layer, and shared UI primitives.

## Why This Matters
The design system is the foundation of every visual decision. A cohesive shell with consistent tokens and primitives ensures the entire app feels intentional and expensive. This phase creates the skeleton that all feature components plug into.

## Product / UX Principles
- **Layered dark surfaces**: background -> surface -> elevated -> overlay
- **Accent color system**: each status gets a distinct, meaningful color
- **Generous spacing**: premium apps breathe — never cramped
- **Crisp typography**: clear hierarchy with Inter or system font stack
- **Subtle depth**: borders, shadows, and glows create visual layers
- **Glass morphism sparingly**: only where it genuinely helps readability

## Scope

### In Scope
- Next.js project scaffolding with App Router
- Tailwind CSS configuration with custom design tokens
- shadcn/ui installation and theme customization
- Premium dark color palette definition
- Typography scale (headings, body, mono, labels)
- Spacing rhythm (4px base grid)
- AppShell layout component (two-column console)
- TopBar / ProductHeader component
- StatusBadge component with all 5 status variants
- Environment configuration (.env.local for API URL)
- Typed API client (postGuardrail, getHealth)
- Shared TypeScript types matching backend schema
- EmptyState, LoadingState, ErrorState primitives
- Motion configuration (Framer Motion defaults)

### Out of Scope
- Feature components (demo cases, editor, response panel)
- Actual API calls in components
- Data flow / state management

## Detailed Checklist
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Install shadcn/ui and configure dark theme
- [ ] Define color palette (surfaces, accents, status colors)
- [ ] Define typography scale
- [ ] Define spacing tokens
- [ ] Create AppShell layout component
- [ ] Create TopBar with product name, subtitle, version badge, connectivity indicator
- [ ] Create StatusBadge component (injected, already_present, skipped_chitchat, skipped_ungrounded, skipped_no_match)
- [ ] Set up .env.local with NEXT_PUBLIC_API_URL
- [ ] Create typed API client (lib/api.ts)
- [ ] Create shared TypeScript types (lib/types.ts)
- [ ] Create EmptyState component
- [ ] Create LoadingState component
- [ ] Create ErrorState component
- [ ] Install Framer Motion and set up motion defaults
- [ ] Install Lucide React icons
- [ ] Install Sonner for toast notifications
- [ ] Verify shell renders with placeholder content

## Color Palette
```
Surfaces:
  --bg-base:      hsl(225, 25%, 6%)     # deepest background
  --bg-surface:   hsl(225, 20%, 9%)     # card/panel background
  --bg-elevated:  hsl(225, 18%, 12%)    # elevated cards
  --bg-overlay:   hsl(225, 15%, 15%)    # hover/overlay states

Borders:
  --border-subtle:  hsl(225, 15%, 15%)  # default borders
  --border-accent:  hsl(225, 15%, 20%)  # focus/active borders

Text:
  --text-primary:   hsl(220, 20%, 95%)  # main text
  --text-secondary: hsl(220, 15%, 60%)  # secondary text
  --text-muted:     hsl(220, 10%, 40%)  # muted/placeholder

Status Colors:
  --status-injected:          hsl(142, 70%, 50%)  # green
  --status-already-present:   hsl(210, 80%, 60%)  # blue
  --status-chitchat:          hsl(280, 60%, 60%)  # purple
  --status-ungrounded:        hsl(40, 80%, 55%)   # amber
  --status-no-match:          hsl(220, 15%, 45%)  # gray

Accent:
  --accent-primary:  hsl(210, 100%, 60%) # primary actions
  --accent-glow:     hsl(210, 100%, 50%) # glow effects
```

## Acceptance Criteria
- [ ] Shell looks premium with dark theme
- [ ] TopBar displays product name and version
- [ ] API client path exists and is typed
- [ ] Reusable UI foundation created (StatusBadge, Empty/Loading/Error states)
- [ ] Two-column layout renders correctly at 1440px+ width

## Files Expected
- `frontend/` — New Next.js project root
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/app-shell.tsx`
- `frontend/src/components/top-bar.tsx`
- `frontend/src/components/status-badge.tsx`
- `frontend/src/components/empty-state.tsx`
- `frontend/src/components/loading-state.tsx`
- `frontend/src/components/error-state.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/types.ts`
- `frontend/tailwind.config.ts`
- `frontend/.env.local`
- `frontend/.env.example`

## Risks / Pitfalls
- shadcn/ui setup complexity with latest Next.js
- Tailwind v4 breaking changes from v3
- Over-designing the shell before seeing real content
- Monaco Editor SSR issues (must be client-only)

## Validation Plan
- Run `npm run dev` and verify shell renders
- Check dark theme looks correct
- Verify TopBar displays properly
- Confirm API client compiles without errors

## Commit Checkpoint
`feat: create premium app shell and design system foundation`

## Final Status
- **Status**: Not started
- **Completion Notes**: —
