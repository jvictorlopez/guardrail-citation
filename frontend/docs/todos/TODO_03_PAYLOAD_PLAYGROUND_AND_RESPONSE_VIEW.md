# TODO 03 — Payload Playground and Response View

## Objective
Build the core interactive features: a payload editor with demo case loading, submission to /guardrail, and a clean response viewer showing final_answer, citation_decision, and metrics.

## Why This Matters
This is the main demo surface. The reviewer will see cases loaded, submitted, and results displayed. It must feel smooth and obvious.

## Scope
- Payload editor textarea with JSON
- Demo case buttons that pre-fill the editor
- Submit button calling POST /guardrail
- Loading, success, and error states
- Response panel: final_answer, citation_decision details, metrics
- Status badge component for decision status

## Detailed Tasks
- [ ] Create PayloadEditor component with textarea
- [ ] Create DemoCases component with clickable case buttons
- [ ] Wire submit to api.ts POST /guardrail
- [ ] Create ResponsePanel with structured display
- [ ] Create StatusBadge with color-coded status
- [ ] Handle loading spinner, error messages, empty state
- [ ] Validate JSON before submit

## Acceptance Criteria
- [ ] User can click a demo case → editor fills → submit → see result
- [ ] Bad JSON shows error, doesn't crash
- [ ] Response panel shows all fields clearly
- [ ] Status badge visually distinguishes injected/skipped/present

## Commit Checkpoint
`feat: add payload playground and response view`

## Final Status
- **Status:** Not started
- **Completion Notes:** —
