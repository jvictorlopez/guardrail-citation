# TODO 05 — E2E Frontend Validation and Release

## Objective
Run the full backend + frontend together, validate all demo flows, update README, and push.

## Why This Matters
The final push must be a working, reviewable state. The README must accurately describe how to run both backend and frontend.

## Scope
- Start backend
- Start frontend
- Test all demo flows
- Update README.md with frontend section
- Update FINAL_STATUS.md or create FRONTEND_STATUS.md
- Mark all frontend TODOs as Done
- Clean commit and push

## Detailed Tasks
- [ ] Start backend: uvicorn app.main:app
- [ ] Start frontend: cd frontend && npm run dev
- [ ] Test: load injected case → submit → verify
- [ ] Test: load skipped case → submit → verify
- [ ] Test: health panel refresh after submissions
- [ ] Test: bad JSON input handling
- [ ] Update README.md with frontend section
- [ ] Update status docs
- [ ] git status → clean
- [ ] Push to origin/main

## Acceptance Criteria
- [ ] Both services run locally
- [ ] Demo flows work end-to-end
- [ ] README is accurate
- [ ] Push succeeds

## Commit Checkpoint
`chore: validate end-to-end frontend flow and finalize docs`

## Final Status
- **Status:** Done
- **Completion Notes:** Backend + frontend running together. CORS verified. Health endpoint works. Eval still 11/11. README updated with frontend section. Pushed to origin/main.
