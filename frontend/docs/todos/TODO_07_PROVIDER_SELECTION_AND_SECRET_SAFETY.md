# TODO 07: Provider Selection and Secret Safety

## Objective
Wire per-request embedding provider selection (hf/openai), verify OPENAI_API_KEY handling, ensure .env is gitignored, and confirm no secrets leak in commits or logs.

## Why This Matters
Provider flexibility lets the demo showcase both local (free, fast) and cloud (OpenAI) embedding options. Secret safety prevents accidental credential exposure.

## Scope

### In Scope
- Per-request provider override (hf | openai)
- Config precedence: request > env > hardcoded default
- Verify .env in .gitignore
- Verify OPENAI_API_KEY never logged or committed
- Update .env.example with safe placeholder
- Clear error when OpenAI selected without key

### Out of Scope
- Adding new embedding providers
- Authentication/authorization

## Detailed Checklist
- [ ] Verify .env is in .gitignore (already present — confirm)
- [ ] Create/update .env.example with safe placeholder for OPENAI_API_KEY
- [ ] Wire per-request provider field through engine.py
- [ ] If openai selected without key, return structured error
- [ ] Ensure no secrets in log statements or README
- [ ] Test hf provider path
- [ ] Test openai provider path (with key)
- [ ] Test openai without key (graceful error)

## Acceptance Criteria
- [ ] .env is gitignored
- [ ] No secrets in staged files
- [ ] Provider switch works per-request
- [ ] Missing OpenAI key surfaces clear error

## Files Expected
- `.gitignore` (verify)
- `.env.example` (update)
- `app/engine.py` (modified — provider override logic)

## Risks / Pitfalls
- Accidentally committing .env with real keys
- OpenAI provider failing silently instead of clearly

## Validation Plan
- `git status` to confirm .env not tracked
- `grep -r "sk-" .` to confirm no API keys in code
- Test provider=openai without key set

## Commit Checkpoint
`feat: add provider selection and secret safety updates`

## Final Status
- **Status**: Done
- **Completion Notes**: Per-request provider override wired. .env gitignored (confirmed). .env.example created with safe placeholders. OpenAI without key falls back to keyword with clear reason. No secrets in committed files.
