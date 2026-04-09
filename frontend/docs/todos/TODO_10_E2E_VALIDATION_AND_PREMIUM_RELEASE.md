# TODO 10: E2E Validation and Premium Release

## Objective
Validate all strategy/provider/alpha combinations end-to-end, update documentation, mark all TODOs complete, and push to origin/premium.

## Why This Matters
The final validation ensures everything works together before the demo video. Documentation updates make the enhanced features discoverable.

## Scope

### In Scope
- Run backend + frontend locally
- Test semantic + hf (default path)
- Test hybrid + hf with various alpha values
- Test semantic + openai (if key available)
- Test hybrid + openai (if key available)
- Test alpha = 0.0, 0.7, 1.0
- Test shortcut cases show 0 model calls
- Verify eval.py still passes 11/11
- Update README with hybrid/provider docs
- Update FINAL_STATUS with enhancement summary
- Mark TODO 06-10 as Done
- Clean git status
- Push to origin/premium

### Out of Scope
- New golden set cases
- Automated E2E tests

## Detailed Checklist
- [ ] Start backend: uvicorn app.main:app --reload
- [ ] Start frontend: cd frontend && npm run dev
- [ ] Test: Grounded Inject with semantic + hf
- [ ] Test: Grounded Inject with hybrid + hf + alpha=0.7
- [ ] Test: Already Present with hybrid + hf
- [ ] Test: Chitchat Skip → verify 0 model calls
- [ ] Test: Ungrounded Skip → verify 0 model calls
- [ ] Test: Empty Candidates → verify 0 model calls
- [ ] Test: hybrid alpha=0.0 (100% BM25)
- [ ] Test: hybrid alpha=1.0 (100% semantic)
- [ ] Verify score breakdown appears in hybrid results
- [ ] Verify "Model Calls" label shows correctly
- [ ] Run eval.py — 11/11 at 100%
- [ ] Run npm run build — zero errors
- [ ] Update README.md
- [ ] Update FINAL_STATUS.md
- [ ] Mark TODO 06-10 Done
- [ ] Verify clean git status
- [ ] Push to origin/premium

## Acceptance Criteria
- [ ] All manual tests pass
- [ ] eval.py 11/11
- [ ] Frontend build clean
- [ ] Docs updated
- [ ] Push succeeds

## Files Expected to Modify
- `README.md`
- `FINAL_STATUS.md`
- `frontend/docs/todos/TODO_06_*.md` — mark Done
- `frontend/docs/todos/TODO_07_*.md` — mark Done
- `frontend/docs/todos/TODO_08_*.md` — mark Done
- `frontend/docs/todos/TODO_09_*.md` — mark Done
- `frontend/docs/todos/TODO_10_*.md` — mark Done

## Risks / Pitfalls
- Backend not running during frontend tests
- CORS issues with port mismatch
- OpenAI tests require valid API key

## Validation Plan
- Manual walkthrough of all test cases
- eval.py automated validation
- TypeScript build verification

## Commit Checkpoint
`chore: validate e2e flows and push premium branch`

## Final Status
- **Status**: Not started
- **Completion Notes**: —
