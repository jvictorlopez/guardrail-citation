# Citation Guardrail Engine

A lightweight HTTP service that acts as a RAG post-processing guardrail. It receives an LLM answer along with grounding context and candidate citations, then decides whether to **inject**, **skip**, or **leave** a citation — correctly, observably, and measurably.

## Stack

| Component | Technology |
|-----------|-----------|
| Language | Python 3.11+ |
| Framework | FastAPI |
| Models | Pydantic v2 |
| Embeddings (default) | `sentence-transformers/all-MiniLM-L6-v2` (local, free) |
| Embeddings (optional) | OpenAI `text-embedding-3-small` |

## Quick Start

### 1. Clone and set up

```bash
git clone https://github.com/jvictorlopez/guardrail-citation.git
cd guardrail-citation
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> **Note:** The first run will download the HuggingFace model (~90 MB). Subsequent runs use the cached model.

### 2. Run the server

```bash
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`.

### 3. Test it

```bash
# Health check
curl http://localhost:8000/health

# Guardrail check
curl -X POST http://localhost:8000/guardrail \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I reset my membership password?",
    "llm_answer": "Go to the member portal and click Forgot Password.",
    "grounding": {"is_grounded": true, "kb_grounded": true},
    "is_chitchat": false,
    "candidate_links": [
      {"label": "Member Portal", "url": "https://example.com/members", "keywords": ["membership", "password"], "description": "Member account management"}
    ]
  }'
```

## Switching HuggingFace / OpenAI

The default path uses a **local** HuggingFace model and requires **no API key**.

To switch to OpenAI embeddings:

```bash
export LLM_PROVIDER=openai
export OPENAI_API_KEY=sk-your-key-here
uvicorn app.main:app --reload
```

If the OpenAI call fails (missing key, timeout, etc.), the engine **automatically falls back** to keyword matching and records the fallback reason in the response.

## Matching Strategy

The matching strategy is configurable via environment variable:

```bash
export MATCH_STRATEGY=semantic   # default — uses embeddings
export MATCH_STRATEGY=keyword    # lexical token overlap, no LLM calls
```

## HuggingFace Model

**Model:** [`sentence-transformers/all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)

This model maps sentences to a 384-dimensional dense vector space. It is lightweight (~90 MB), fast, and specifically designed for semantic similarity tasks. It runs entirely locally — no API key, no network call, no paid tier required.

## Running the Eval

The eval script loads `golden_set.json` and tests each case against the running server.

```bash
# Make sure the server is running first
uvicorn app.main:app &

# Run the eval
python eval.py
```

Output includes per-case pass/fail and an aggregated `correct_decision_rate`.

## Golden Set

Located at [`golden_set.json`](golden_set.json) — contains 11 test cases:

- 5 seed cases from the brief (R1–R5)
- 6 edge cases:
  - Ambiguous keyword requiring semantic disambiguation
  - Empty candidate list
  - Match just below threshold
  - Two candidates with similar scores (ambiguity margin)
  - URL as plain text in answer (not markdown)
  - Chitchat overriding grounded=true (R1 priority)

## API Endpoints

### `POST /guardrail`

Runs the citation guardrail over an LLM response. See the [technical brief](docs/todos/TODO_02_API_CONTRACT_AND_RULES.md) for the full JSON contract.

### `GET /health`

Returns service status and decision counters:

```json
{
  "status": "ok",
  "counters": {
    "injected": 3,
    "skipped_chitchat": 1,
    "skipped_ungrounded": 1,
    "skipped_no_match": 2,
    "already_present": 1
  }
}
```

## Architecture

```
app/
├── main.py            # FastAPI app + endpoints
├── models.py          # Pydantic request/response models
├── engine.py          # Core guardrail decision logic (R1-R5)
├── config.py          # Settings via env vars
├── state.py           # In-memory health counters
├── strategies/
│   ├── base.py        # Strategy ABC + MatchResult
│   ├── keyword.py     # Lexical token overlap
│   └── semantic.py    # Embedding cosine similarity
└── providers/
    ├── base.py        # EmbeddingProvider ABC
    ├── hf.py          # HuggingFace sentence-transformers (local)
    └── openai.py      # OpenAI embeddings (optional)
```

## Guardrail Rules

| # | Condition | Action | Status |
|---|-----------|--------|--------|
| R1 | `is_chitchat=true` | Never inject | `skipped_chitchat` |
| R2 | `kb_grounded=false` | Never inject | `skipped_ungrounded` |
| R3 | URL already in answer | Don't duplicate | `already_present` |
| R4 | Grounded + valid match | Inject at end | `injected` |
| R5 | No match above threshold | Don't invent | `skipped_no_match` |

## Video Walkthrough

> **[Video link placeholder]** — To be added after recording.

## License

See [LICENSE](LICENSE).
