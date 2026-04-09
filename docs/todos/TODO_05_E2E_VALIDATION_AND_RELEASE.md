# TODO 05 — E2E Validation and Release

## Objective
Run complete end-to-end validation on macOS terminal, update all TODO statuses, create a release summary, make the final commit, and push to origin/main.

## Why This Matters
The brief says "we read the commit history" and "functional code that runs locally." This step proves the solution works as a whole, not just in pieces. It's the difference between a demo and a deliverable.

## Scope
- Create/activate Python virtual environment
- Install all dependencies
- Start the API server
- Test GET /health
- Test POST /guardrail with representative cases
- Run eval.py and capture output
- Update all TODO files to Done
- Create FINAL_STATUS.md release summary
- Ensure repo is clean
- Final commit
- Push to origin/main

## Detailed Tasks

- [ ] Create venv and install dependencies
- [ ] Start app with `uvicorn app.main:app`
- [ ] curl GET /health → verify counters JSON
- [ ] curl POST /guardrail with injected case → verify response
- [ ] curl POST /guardrail with already_present case → verify response
- [ ] curl POST /guardrail with skipped_chitchat case → verify response
- [ ] Run `python eval.py` → verify output
- [ ] Save eval output to `eval_output.txt`
- [ ] Update TODO_01 final status → Done
- [ ] Update TODO_02 final status → Done
- [ ] Update TODO_03 final status → Done
- [ ] Update TODO_04 final status → Done
- [ ] Update TODO_05 final status → Done
- [ ] Create `FINAL_STATUS.md` with release summary
- [ ] Run `git status` → confirm clean tree
- [ ] Final commit
- [ ] Push to origin/main

## Acceptance Criteria
- [ ] Server starts without errors
- [ ] /health returns valid JSON with counter keys
- [ ] /guardrail returns correct responses for all tested cases
- [ ] eval.py passes all seed cases (100%)
- [ ] eval.py passes all edge cases (aiming for 100%)
- [ ] All TODO files marked Done
- [ ] FINAL_STATUS.md exists with summary
- [ ] No uncommitted changes
- [ ] Push to origin/main succeeds
- [ ] README steps verified against actual terminal commands

## Files Created/Modified
- `eval_output.txt` (final output)
- `FINAL_STATUS.md`
- All TODO files (status updates)

## Risks / Pitfalls
- Server port already in use — kill any existing process on 8000
- HuggingFace model not cached — first run will download (~90MB)
- Git push auth issues — verify credentials before final push
- Forgetting to add new files to git

## Validation Steps
This entire TODO IS the validation — follow the checklist above sequentially.

## Commit Checkpoint
`chore: run e2e validation, finalize release summary, and push ready state`

## Final Status
- **Status:** Done
- **Completion Notes:** Full E2E validation completed on macOS. Server starts, all endpoints work, eval passes 11/11 at 100%. FINAL_STATUS.md created. Pushed to origin/main.
