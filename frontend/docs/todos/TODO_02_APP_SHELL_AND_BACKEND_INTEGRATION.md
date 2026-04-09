# TODO 02 — App Shell and Backend Integration

## Objective
Create the Vite React app shell, configure the API client, add CORS to the backend, and verify the frontend can talk to the running backend.

## Why This Matters
If the frontend can't call the backend, nothing else works. This step establishes the integration path before building any UI features.

## Scope
- Scaffold Vite React TypeScript project
- Create API client module with base URL from env
- Add CORS middleware to FastAPI (minimal, localhost only)
- Create main layout shell
- Verify fetch to /health works

## Detailed Tasks
- [ ] Run `npm create vite` or create manually
- [ ] Add TypeScript types matching backend contract
- [ ] Create api.ts with fetch wrappers
- [ ] Add CORS to app/main.py (allow localhost origins)
- [ ] Create App.tsx with basic layout grid
- [ ] Create .env.example
- [ ] Verify connection: frontend fetches /health on load

## Acceptance Criteria
- [ ] `npm run dev` starts frontend
- [ ] Frontend connects to backend /health
- [ ] Layout shell renders
- [ ] CORS headers present on backend responses
- [ ] Commit checkpoint defined

## Files Created/Modified
- frontend/ (entire scaffold)
- app/main.py (CORS middleware added)

## Risks / Pitfalls
- CORS misconfiguration blocking requests
- Port conflicts between frontend and backend

## Commit Checkpoint
`feat: scaffold frontend app shell and backend integration`

## Final Status
- **Status:** Done
- **Completion Notes:** Vite+React+TS app shell created. CORS added to FastAPI. API client and types implemented. Frontend connects to backend.
