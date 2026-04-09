# TODO 03: Request Playground and Demo Cases

## Objective
Build the premium demo case navigator, request payload editor with Monaco, load/format/reset interactions, validation, action controls, and make the left-side interaction flow feel world-class.

## Why This Matters
The left column is where the user drives the demo. It must be intuitive, attractive, and fast. The demo cases should make it obvious what the system does, and the editor should feel like a professional tool — not a textarea.

## Product / UX Principles
- **One-click demo flow**: select case -> payload loads -> click run
- **Grouped cases**: organize by behavior category for narrative clarity
- **Professional editor**: Monaco with syntax highlighting, not a raw textarea
- **Clear affordances**: obvious what is clickable, editable, runnable
- **Validation feedback**: inline JSON errors before submission
- **Premium controls**: format, reset, load sample — compact but discoverable

## Scope

### In Scope
- DemoCasesPanel component with grouped case list
- Case grouping: "Inject", "Detect Existing", "Skip Rules", "Edge Cases"
- StatusBadge integration for expected outcomes
- One-click case loading with animated selection state
- PayloadEditor with Monaco Editor integration
- JSON syntax highlighting and formatting
- Inline validation with error display
- Format / Reset / Load Sample controls
- ActionBar with primary "Run Guardrail" CTA
- Loading state on the CTA during API call
- Keyboard shortcut (Cmd+Enter) to run
- Toast feedback on success/error via Sonner

### Out of Scope
- Response rendering (TODO 04)
- Health panel (TODO 04)
- Motion polish (TODO 04)

## Demo Cases Definition
```
Group: Inject Citation
  - Grounded Inject → injected

Group: Detect Existing
  - Already Present → already_present

Group: Skip Rules
  - Chitchat Skip → skipped_chitchat
  - Ungrounded Skip → skipped_ungrounded

Group: Edge Cases
  - No Match → skipped_no_match
  - Empty Candidates → skipped_no_match
```

## Detailed Checklist
- [ ] Install @monaco-editor/react
- [ ] Create DemoCasesPanel component
- [ ] Define demo case data with grouping metadata
- [ ] Implement grouped case list with category headers
- [ ] Add StatusBadge for expected outcome on each case
- [ ] Add click handler to load case payload into editor
- [ ] Add active/selected state styling
- [ ] Create PayloadEditor component with Monaco
- [ ] Configure Monaco: dark theme, JSON language, minimap off, line numbers
- [ ] Add JSON validation with error message display
- [ ] Create control bar: Format JSON, Reset, Load Sample
- [ ] Create ActionBar with "Run Guardrail" button
- [ ] Add loading spinner to CTA during API call
- [ ] Add Cmd+Enter keyboard shortcut
- [ ] Wire up postGuardrail API call
- [ ] Add Sonner toast on success/error
- [ ] Handle API errors gracefully
- [ ] Test with all 6 demo cases

## Acceptance Criteria
- [ ] Demo cases are visually grouped and intuitive
- [ ] Clicking a case loads its payload in the editor
- [ ] Monaco editor provides syntax highlighting and formatting
- [ ] JSON validation catches malformed payloads
- [ ] "Run Guardrail" triggers API call with loading state
- [ ] API errors show toast notification
- [ ] The left column feels premium and professional

## Files Expected
- `frontend/src/components/demo-cases-panel.tsx`
- `frontend/src/components/payload-editor.tsx`
- `frontend/src/components/action-bar.tsx`
- `frontend/src/lib/demo-cases.ts`

## Risks / Pitfalls
- Monaco Editor is heavy (~2MB) — lazy load it
- Monaco requires client-only rendering in Next.js (use dynamic import)
- Too many cases could clutter the panel — keep it to 6
- Editor height needs careful management for layout stability

## Validation Plan
- Load each demo case and verify JSON appears correctly
- Click "Run Guardrail" and verify API call fires
- Test with malformed JSON and verify validation error shows
- Test Format button restores valid formatting
- Verify Cmd+Enter shortcut works

## Commit Checkpoint
`feat: add demo cases and request playground experience`

## Final Status
- **Status**: Done
- **Completion Notes**: DemoCasesPanel with 4 groups, Monaco editor with lazy loading, JSON validation, Format/Reset/Load controls, Run Guardrail CTA with Cmd+Enter, Sonner toast feedback. All 6 cases load and submit correctly.
