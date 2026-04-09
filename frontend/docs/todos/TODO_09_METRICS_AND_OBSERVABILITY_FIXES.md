# TODO 09: Metrics and Observability Fixes

## Objective
Fix misleading "LLM Calls" metric label, update to "Model Calls", ensure values are correct for all cases, and improve observability display.

## Why This Matters
The current "LLM Calls" label implies text-generation/chat completion calls, but the system only makes embedding/model provider calls. This is misleading and undermines credibility in a technical demo.

## Scope

### In Scope
- Rename frontend metric from "LLM Calls" to "Model Calls"
- Backend: add model_calls field to Metrics (keep llm_calls for compat)
- Ensure model_calls = 0 for shortcut cases (chitchat, ungrounded, empty)
- Ensure model_calls = 1 for semantic search (one embedding batch)
- Ensure model_calls = 1 for hybrid search (semantic component only)
- BM25-only does not count as a model call
- already_present should reflect model usage if matching was performed

### Out of Scope
- Changing backend decision logic
- Breaking eval.py

## Detailed Checklist
- [ ] Add model_calls to Metrics model in backend
- [ ] Set model_calls correctly in engine.py for all paths
- [ ] Update frontend Metrics type to include model_calls
- [ ] Rename "LLM Calls" to "Model Calls" in response-panel.tsx
- [ ] Use model_calls value in display (fallback to llm_calls)
- [ ] Verify shortcut cases show 0
- [ ] Verify semantic shows 1
- [ ] Verify hybrid shows 1

## Acceptance Criteria
- [ ] "Model Calls" label in frontend
- [ ] Values correct for every status type
- [ ] No "LLM" language in the frontend metrics
- [ ] eval.py still passes (llm_calls field preserved)

## Files Expected
- `app/models.py` (modified)
- `app/engine.py` (modified)
- `frontend/src/lib/types.ts` (modified)
- `frontend/src/components/response-panel.tsx` (modified)

## Risks / Pitfalls
- Breaking eval.py if llm_calls field is removed
- Confusing model_calls and llm_calls in backend

## Validation Plan
- Run eval.py — must still pass 11/11
- Verify frontend shows "Model Calls" with correct values

## Commit Checkpoint
`fix: correct model call metrics and observability labels`

## Final Status
- **Status**: Not started
- **Completion Notes**: —
