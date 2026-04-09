# TODO 04: Response, Observability, and Motion Polish

## Objective
Build the final answer presentation, citation decision card, metrics tiles, health counters panel, add motion and micro-interactions, and create polished loading/empty/error states throughout the application.

## Why This Matters
The right column is where value is communicated. The response area must make the guardrail engine's decisions feel important, auditable, and trustworthy. The health panel adds operational credibility. Motion ties everything together into a cohesive, premium experience.

## Product / UX Principles
- **Value visualization**: make the AI decision feel important and transparent
- **Audit trail clarity**: reason field should read like a professional log
- **KPI presentation**: metrics should feel like a real monitoring dashboard
- **Operational visibility**: health counters signal production-readiness
- **Restrained motion**: every animation must increase clarity, never distract
- **Progressive reveal**: results should appear in a satisfying sequence

## Scope

### In Scope
- ResponsePanel container component
- FinalAnswerCard: beautiful reading surface for the processed answer
- CitationDecisionCard: status, matched label, strategy, score, reason
- MetricsTiles: latency_ms, llm_calls as elegant KPI cards
- HealthCountersPanel: live counters from /health with refresh
- EmptyState for response area (before first run)
- LoadingState with premium spinner/skeleton
- ErrorState with helpful message
- Framer Motion transitions:
  - Fade/slide in for response panels
  - Animated status badge changes
  - Card hover states
  - Button press feedback
  - Progressive reveal of result sections
  - Layout transitions
- Status-specific color coding throughout

### Out of Scope
- Fake data or misleading visualizations
- Sparklines with invented data (only if honest)
- WebSocket real-time updates

## Detailed Checklist
- [ ] Create ResponsePanel container
- [ ] Create FinalAnswerCard with markdown-like rendering
- [ ] Create CitationDecisionCard with all fields
- [ ] Create MetricsTiles (latency_ms, llm_calls)
- [ ] Create HealthCountersPanel with auto-refresh
- [ ] Add refresh button with loading feedback
- [ ] Style counters with status-specific colors
- [ ] Add Framer Motion AnimatePresence for response transitions
- [ ] Add fade-in for response sections (staggered)
- [ ] Add card hover elevation effects
- [ ] Add button press scale feedback
- [ ] Add loading skeleton for response area
- [ ] Add empty state illustration/message
- [ ] Add error state with retry affordance
- [ ] Add status-specific color to CitationDecisionCard border/glow
- [ ] Ensure all states transition smoothly
- [ ] Test with each status type for correct visual treatment

## Status Visual Treatment
```
injected:          Green glow, checkmark icon, "Citation Injected"
already_present:   Blue glow, link icon, "Already Present"
skipped_chitchat:  Purple glow, chat icon, "Chitchat Skipped"
skipped_ungrounded: Amber glow, alert icon, "Ungrounded Skipped"
skipped_no_match:  Gray glow, x-circle icon, "No Match Found"
```

## Acceptance Criteria
- [ ] Response area shows all fields clearly
- [ ] Each status type has distinct visual treatment
- [ ] Metrics feel like real KPI tiles
- [ ] Health counters update on refresh
- [ ] Motion is smooth and tasteful (no jank)
- [ ] Empty/loading/error states look premium
- [ ] The right column makes the API feel valuable

## Files Expected
- `frontend/src/components/response-panel.tsx`
- `frontend/src/components/final-answer-card.tsx`
- `frontend/src/components/citation-decision-card.tsx`
- `frontend/src/components/metrics-tiles.tsx`
- `frontend/src/components/health-counters-panel.tsx`

## Risks / Pitfalls
- Over-animating: every animation should serve clarity
- Layout shift during transitions: use AnimatePresence with layout prop
- Health panel polling too aggressively: manual refresh only
- Color accessibility: ensure sufficient contrast on dark backgrounds

## Validation Plan
- Run each demo case and verify response renders correctly
- Verify each status type shows correct color/icon treatment
- Verify metrics display correct values
- Verify health counters increment after API calls
- Verify animations are smooth at 60fps
- Test empty, loading, and error states

## Commit Checkpoint
`feat: add response, observability, and motion polish`

## Final Status
- **Status**: Done
- **Completion Notes**: FinalAnswerCard, CitationDecisionCard with status-specific glows, MetricsTiles (latency + LLM calls), HealthCountersPanel with refresh. Framer Motion staggered reveals, AnimatePresence transitions. Premium empty/loading/error states.
