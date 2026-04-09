# TODO 08: Premium Search Controls UI

## Objective
Add premium frontend controls for search strategy, embedding provider, and alpha slider. Show score breakdown for hybrid results. Integrate controls with the API request.

## Why This Matters
These controls make the demo interactive and educational. The viewer can see how different strategies and weights affect citation matching in real time.

## Scope

### In Scope
- Strategy selector (semantic | hybrid)
- Provider selector (hf | openai)
- Alpha slider (0.0 to 1.0, step 0.05)
- Live percentage readout: "70% semantic / 30% BM25"
- Helper copy: "α controls semantic weight. BM25 weight = 1 − α."
- Alpha disabled/de-emphasized when strategy = semantic
- Send strategy/provider/alpha as request overrides
- Score breakdown display in response panel for hybrid
- Provider used display in citation decision card

### Out of Scope
- Backend changes (done in TODO 06/07)
- New demo cases

## Detailed Checklist
- [ ] Create SearchControls component (strategy + provider + alpha)
- [ ] Add strategy segmented control
- [ ] Add provider segmented control
- [ ] Add alpha slider with live readout
- [ ] Add helper copy explaining alpha
- [ ] Disable/dim alpha when strategy = semantic
- [ ] Update API client to send overrides
- [ ] Update TypeScript types for new request/response fields
- [ ] Update response panel to show provider_used
- [ ] Update response panel to show score_breakdown for hybrid
- [ ] Maintain premium visual language throughout

## Acceptance Criteria
- [ ] Controls feel premium and native to existing UI
- [ ] Alpha math is correct in display and request
- [ ] Hybrid results show score breakdown
- [ ] Semantic results hide score breakdown gracefully
- [ ] Provider and strategy reflected in response display

## Files Expected
- `frontend/src/components/search-controls.tsx` (new)
- `frontend/src/app/page.tsx` (modified)
- `frontend/src/lib/types.ts` (modified)
- `frontend/src/lib/api.ts` (modified)
- `frontend/src/components/response-panel.tsx` (modified)

## Risks / Pitfalls
- Cluttering the left column with too many controls
- Alpha slider not feeling premium enough
- Score breakdown being too noisy for simple cases

## Validation Plan
- Switch between strategies and verify correct API calls
- Adjust alpha slider and verify values in request
- Verify score breakdown appears for hybrid, hidden for semantic

## Commit Checkpoint
`feat: add premium frontend search controls and score breakdown`

## Final Status
- **Status**: Not started
- **Completion Notes**: —
