# TODO 05: E2E Polish, Release, and Video Readiness

## Objective
Run the backend and frontend together locally, validate all major demo cases, improve visual polish, update README with frontend instructions, ensure video-readiness, and finalize documentation.

## Why This Matters
The final mile separates good from great. This phase ensures the app actually works end-to-end, looks flawless during screen recording, and has clear documentation for anyone who needs to run it.

## Product / UX Principles
- **Zero broken flows**: every demo path must work perfectly
- **Documentation as product**: README should be clear and inviting
- **Video-first polish**: optimize for what looks good on camera
- **Clean delivery**: no loose ends, no TODO comments, no console errors

## Scope

### In Scope
- Start backend (uvicorn) and frontend (next dev) together
- Run all 6 demo cases through the UI
- Verify correct response for each status type
- Verify health counters increment correctly
- Fix any visual issues discovered during testing
- Verify desktop layout at 1440px and 1920px
- Update README.md with frontend instructions
- Update FINAL_STATUS.md with frontend completion notes
- Mark all TODO files as Done
- Ensure clean git status
- Push to origin/main

### Out of Scope
- Automated E2E tests (manual validation is sufficient)
- Performance optimization
- Mobile/tablet testing

## Detailed Checklist
- [ ] Start backend: `cd guardrail-citation && uvicorn app.main:app --reload`
- [ ] Start frontend: `cd guardrail-citation/frontend && npm run dev`
- [ ] Test: Grounded Inject → verify "injected" status, citation appended
- [ ] Test: Already Present → verify "already_present" status
- [ ] Test: Chitchat Skip → verify "skipped_chitchat" status
- [ ] Test: Ungrounded Skip → verify "skipped_ungrounded" status
- [ ] Test: No Match → verify "skipped_no_match" status
- [ ] Test: Empty Candidates → verify "skipped_no_match" status
- [ ] Verify health counters show correct counts after tests
- [ ] Verify refresh button updates health counters
- [ ] Verify empty state before first run
- [ ] Verify loading state during API call
- [ ] Test with malformed JSON → verify error handling
- [ ] Check layout at 1440x900 resolution
- [ ] Check layout at 1920x1080 resolution
- [ ] Fix any visual inconsistencies found
- [ ] Remove any console.log statements
- [ ] Verify no TypeScript errors: `npm run build`
- [ ] Update README.md:
  - Frontend stack description
  - Install instructions (`npm install`)
  - Run instructions (`npm run dev`)
  - Environment variables (NEXT_PUBLIC_API_URL)
  - How to run backend + frontend together
  - Recommended demo sequence for video
- [ ] Update FINAL_STATUS.md with frontend notes
- [ ] Mark TODO 01-05 as Done
- [ ] Verify clean git status
- [ ] Push to origin/main

## Demo Sequence for Video
1. Show the empty console — premium first impression
2. Click "Grounded Inject" — show citation injection
3. Click "Already Present" — show detection
4. Click "Chitchat Skip" — show rule R1
5. Click "Ungrounded Skip" — show rule R2
6. Click "No Match" — show threshold behavior
7. Show health counters — operational visibility
8. Edit payload manually — show playground flexibility
9. Run with custom payload — show real-time processing

## Acceptance Criteria
- [ ] All 6 demo cases produce correct results
- [ ] No visual bugs or layout issues
- [ ] Health counters work correctly
- [ ] README has complete frontend instructions
- [ ] TypeScript build succeeds with no errors
- [ ] Git working tree is clean
- [ ] Push to origin/main succeeds

## Files Expected to Modify
- `README.md` — add frontend section
- `FINAL_STATUS.md` — add frontend completion notes
- `frontend/docs/todos/TODO_01_*.md` — mark Done
- `frontend/docs/todos/TODO_02_*.md` — mark Done
- `frontend/docs/todos/TODO_03_*.md` — mark Done
- `frontend/docs/todos/TODO_04_*.md` — mark Done
- `frontend/docs/todos/TODO_05_*.md` — mark Done

## Risks / Pitfalls
- Backend not running when testing frontend
- CORS issues between Next.js dev server and FastAPI
- Port conflicts (3000 for Next.js, 8000 for FastAPI)
- Forgetting to update CORS for port 3000 in backend

## Validation Plan
- Manual walkthrough of all 6 demo cases
- Visual inspection at multiple resolutions
- TypeScript build verification
- Git status check before push

## Commit Checkpoint
`chore: validate e2e flows, finalize docs, and push polished frontend`

## Final Status
- **Status**: Not started
- **Completion Notes**: —
