# TODO 02 — API Contract and Rules

## Objective
Implement the FastAPI application skeleton with the fixed JSON contract, /guardrail and /health endpoints, Pydantic models, and deterministic short-circuit logic for rules R1, R2, R3, and empty candidate handling.

## Why This Matters
The JSON contract is fixed and non-negotiable. Getting the request/response models right first ensures all downstream logic conforms to the spec. The deterministic rules (R1, R2, R3) can be implemented without any ML — they are pure conditionals and should be rock-solid.

## Scope
- Create FastAPI app entry point
- Define all Pydantic models matching the brief exactly
- Implement POST /guardrail endpoint skeleton
- Implement GET /health endpoint with in-memory counters
- Implement R1 (chitchat skip), R2 (ungrounded skip), R3 (already present)
- Implement empty candidate_links short-circuit
- Implement URL normalization for duplicate detection
- Implement in-memory counters (state.py)
- Implement config.py with env var support

## Detailed Tasks

- [ ] Create `app/__init__.py`
- [ ] Create `app/models.py` — Pydantic models for request and response
- [ ] Create `app/config.py` — Settings class with env var support
- [ ] Create `app/state.py` — In-memory counter dict
- [ ] Create `app/engine.py` — Core guardrail logic with R1/R2/R3/empty-candidates handling
- [ ] Create `app/main.py` — FastAPI app with /guardrail and /health
- [ ] Create `requirements.txt` with initial dependencies
- [ ] Test endpoints manually: health returns counters, guardrail handles R1/R2 cases

## Request Model (exact)
```python
class Grounding(BaseModel):
    is_grounded: bool
    kb_grounded: bool

class CandidateLink(BaseModel):
    label: str
    url: str
    keywords: list[str]
    description: str

class GuardrailRequest(BaseModel):
    query: str
    llm_answer: str
    grounding: Grounding
    is_chitchat: bool
    candidate_links: list[CandidateLink]
```

## Response Model (exact)
```python
class CitationDecision(BaseModel):
    status: str
    matched_label: str | None
    strategy_used: str
    similarity_score: float | None
    reason: str

class Metrics(BaseModel):
    latency_ms: int
    llm_calls: int

class GuardrailResponse(BaseModel):
    final_answer: str
    citation_decision: CitationDecision
    metrics: Metrics
```

## Acceptance Criteria
- [ ] App runs locally with `uvicorn app.main:app`
- [ ] GET /health returns JSON with status counters
- [ ] POST /guardrail with is_chitchat=true returns skipped_chitchat
- [ ] POST /guardrail with kb_grounded=false returns skipped_ungrounded
- [ ] POST /guardrail with empty candidate_links returns skipped_no_match
- [ ] POST /guardrail with URL already in llm_answer returns already_present
- [ ] final_answer never modifies llm_answer semantics
- [ ] Health counters increment correctly

## Files Created/Modified
- `app/__init__.py`
- `app/main.py`
- `app/models.py`
- `app/engine.py`
- `app/config.py`
- `app/state.py`
- `requirements.txt`

## Risks / Pitfalls
- Pydantic v1 vs v2 syntax differences — use v2
- Forgetting to count metrics correctly
- URL normalization edge cases

## Validation Steps
- Start server: `uvicorn app.main:app --reload`
- curl GET /health → valid JSON
- curl POST /guardrail with chitchat payload → skipped_chitchat
- curl POST /guardrail with ungrounded payload → skipped_ungrounded

## Commit Checkpoint
`feat: scaffold FastAPI contract, health endpoint, and core rules`

## Final Status
- **Status:** Done
- **Completion Notes:** All models, endpoints, and deterministic rules implemented and tested. Health counters working.
