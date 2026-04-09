# Final Release Summary

## Status: Complete

All deliverables have been implemented and validated locally on macOS.

## Eval Results

```
TOTAL: 11/11 passed
correct_decision_rate: 100.00%
```

All 5 seed cases and 6 edge cases pass at 100% accuracy.

## What Was Built

A lightweight Citation Guardrail Engine — an HTTP service that decides whether to inject a canonical citation into a RAG LLM answer based on grounding context and candidate link matching.

### Core Features
- **POST /guardrail** — full JSON contract matching the spec
- **GET /health** — decision counters by status
- **Rules R1–R5** — implemented with correct precedence
- **Semantic matching** — cosine similarity using `sentence-transformers/all-MiniLM-L6-v2` (local, free)
- **Keyword matching** — lexical token overlap as fallback
- **Provider fallback** — if embeddings fail, keyword mode activates automatically
- **Swappable strategy** — via `MATCH_STRATEGY` env var
- **HF/OpenAI switch** — via `LLM_PROVIDER` env var

### Golden Set
11 test cases covering:
- 5 seed cases (inject, already present, chitchat skip, ungrounded skip, no match)
- Ambiguous keyword (semantic disambiguates)
- Empty candidate list
- Match below threshold
- Two candidates within ambiguity margin
- URL as plain text in answer
- Chitchat overriding grounded=true

### Deliverables
| Deliverable | Status |
|------------|--------|
| Functional code | Done |
| POST /guardrail | Done |
| GET /health | Done |
| Rules R1–R5 | Done |
| Semantic matching (HF) | Done |
| Keyword fallback | Done |
| OpenAI optional provider | Done |
| Golden set (11 cases) | Done |
| eval.py | Done |
| eval_output.txt | Done |
| README.md | Done |
| NOTES.md | Done |
| setup_model.sh | Done |
| 5 TODO plan files | Done |
| Incremental commits | Done (5 commits) |

## Stack
- Python 3.12, FastAPI, Pydantic v2
- sentence-transformers/all-MiniLM-L6-v2 (local, 87 MB)
- httpx (for optional OpenAI provider)

## Remaining
- Video walkthrough (to be recorded separately)
