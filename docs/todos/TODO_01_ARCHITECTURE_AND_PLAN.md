# TODO 01 — Architecture and Plan

## Objective
Parse the technical brief, lock the architecture, define the project layout, and establish all key design decisions before writing any implementation code.

## Why This Matters
A clear architecture prevents scope creep and wasted effort. The brief explicitly evaluates engineering judgment — getting the plan right means every subsequent commit is purposeful and reviewable.

## Scope
- Parse all requirements from `TECHNICAL_TEST_CITATION_GUARDRAIL.md`
- Lock technology stack
- Define project file structure
- Define guardrail rules R1–R5 decision flow
- Define threshold and margin policy for matching
- Define URL normalization strategy for duplicate detection (R3)
- Define how `llm_calls` metric is counted
- Define commit plan

## Detailed Tasks

- [x] Read and parse the full brief
- [x] Decide stack: Python 3.11+, FastAPI, Pydantic v2, sentence-transformers
- [x] Define project layout (see below)
- [x] Map guardrail rules R1–R5 to decision flow
- [x] Define similarity threshold: 0.35 for semantic, 0.3 for keyword
- [x] Define ambiguity margin: if top-2 scores within 0.05, skip as ambiguous
- [x] Define URL duplicate detection: normalize URL (strip trailing slash, lowercase, strip protocol scheme for comparison) and check if it appears anywhere in `llm_answer`
- [x] Define `llm_calls` counting: 1 per embedding API call batch (0 if short-circuited or keyword-only)
- [x] Define commit plan with 5+ incremental commits

## Architecture Decisions

### Stack
| Component | Choice | Rationale |
|-----------|--------|-----------|
| Language | Python 3.11+ | Matches brief suggestion, rich ML ecosystem |
| Framework | FastAPI | Async, auto-docs, Pydantic native |
| Models | Pydantic v2 | Strict validation, JSON contract |
| Embeddings (default) | sentence-transformers/all-MiniLM-L6-v2 | Free, local, no API key needed, recommended by brief |
| Embeddings (optional) | OpenAI text-embedding-3-small | Behind env var only |
| HTTP client | httpx | For OpenAI provider if needed |

### What We Will NOT Build
- No frontend
- No database or vector store
- No authentication
- No cloud deployment
- No Docker
- No model training

### Project Layout
```
guardrail-citation/
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI app, endpoints
│   ├── models.py           # Pydantic request/response models
│   ├── engine.py           # Core guardrail decision logic
│   ├── config.py           # Settings, thresholds, env vars
│   ├── state.py            # In-memory health counters
│   ├── strategies/
│   │   ├── __init__.py
│   │   ├── base.py         # Strategy ABC
│   │   ├── keyword.py      # Keyword matching
│   │   └── semantic.py     # Semantic matching (embedding-based)
│   └── providers/
│       ├── __init__.py
│       ├── base.py         # Provider ABC
│       ├── hf.py           # HuggingFace sentence-transformers (local)
│       └── openai.py       # OpenAI embeddings (optional)
├── docs/
│   └── todos/              # These TODO files
├── golden_set.json         # 10+ test cases
├── eval.py                 # Eval CLI script
├── requirements.txt        # Dependencies
├── README.md
├── NOTES.md
└── LICENSE
```

### Guardrail Decision Flow
```
1. If is_chitchat=true → skipped_chitchat (R1)
2. If kb_grounded=false → skipped_ungrounded (R2)
3. If candidate_links is empty → skipped_no_match
4. Run matching strategy to find best candidate
5. If no candidate above threshold → skipped_no_match (R5)
6. If winning URL already in llm_answer → already_present (R3)
7. Else → inject citation at end of llm_answer (R4)
```

### Thresholds
| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Semantic similarity threshold | 0.35 | Balances recall vs. precision for short queries against KB descriptions |
| Keyword overlap threshold | 0.3 | Normalized Jaccard-like score, tuned to seed cases |
| Ambiguity margin | 0.05 | If top-2 candidates within this margin, treat as ambiguous and skip |

### llm_calls Counting
- `0` when short-circuited (R1, R2, empty candidates, keyword-only)
- `1` when embeddings are computed (one batch call covers query + all candidates)
- If fallback from semantic to keyword occurs, `llm_calls` stays at the count of attempted calls

### URL Normalization for Duplicate Detection (R3)
- Lowercase the URL
- Strip trailing slashes
- Check if the normalized URL string appears anywhere in `llm_answer`
- Also check the raw URL as-is for safety

## Acceptance Criteria
- [x] Clear project structure defined
- [x] Explicit rules mapping R1–R5
- [x] Explicit note that no frontend/db/auth/cloud deploy will be built
- [x] Implementation order defined
- [x] Commit checkpoint defined

## Files Created/Modified
- `docs/todos/TODO_01_ARCHITECTURE_AND_PLAN.md` (this file)
- All 5 TODO files

## Risks / Pitfalls
- Over-engineering the matching logic — keep it simple
- Spending time on Docker/deploy when it's explicitly out of scope
- Not testing the HF model download — it needs to be downloaded on first run

## Validation Steps
- Review this document for completeness
- Confirm all 5 TODO files exist
- Confirm commit plan is clear

## Commit Checkpoint
`docs: add detailed todo plan and architecture decisions`

## Final Status
- **Status:** Done
- **Completion Notes:** Architecture locked. All decisions documented. Ready for implementation.
