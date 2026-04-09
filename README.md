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

### 2. Download the embedding model

```bash
bash setup_model.sh
```

This downloads `sentence-transformers/all-MiniLM-L6-v2` (~87 MB) into `models/` for fully local, offline inference. No API key needed.

### 3. Run the server

```bash
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`.

### 4. Test it

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

The matching strategy is configurable via environment variable or per-request override:

```bash
export MATCH_STRATEGY=semantic   # default — embedding cosine similarity
export MATCH_STRATEGY=hybrid     # semantic + BM25 lexical fusion
export MATCH_STRATEGY=keyword    # lexical token overlap, no model calls
```

### Hybrid Search

Hybrid search fuses semantic embedding similarity with BM25 lexical scoring:

```
hybrid_score = α × semantic_score + (1 − α) × bm25_score
```

- **α = 1.0** → 100% semantic, 0% BM25
- **α = 0.7** → 70% semantic, 30% BM25 (default)
- **α = 0.0** → 0% semantic, 100% BM25

BM25 scores are min-max normalized to [0, 1] before fusion so they're comparable with cosine similarity scores.

### Per-Request Overrides

The frontend can override strategy, provider, and alpha per request:

```json
{
  "strategy": "hybrid",
  "provider": "hf",
  "alpha": 0.7,
  "query": "...",
  "llm_answer": "...",
  ...
}
```

Config precedence: request override > environment variable > hardcoded default.

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

## Premium Frontend Console

A world-class demo surface for the Citation Guardrail Engine — built as a premium AI console with luxurious dark theme, smooth animations, and intuitive two-column layout.

### Frontend Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui v4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| JSON Editor | Monaco Editor |
| Toasts | Sonner |

### Setup

```bash
cd frontend
npm install
```

### Environment Variables

Copy the example and adjust if needed:

```bash
cp .env.example .env.local
```

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

### Run (backend must be running first)

```bash
# Terminal 1 — backend
cd guardrail-citation
source .venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2 — frontend
cd guardrail-citation/frontend
npm run dev
```

Open `http://localhost:3000`. The frontend connects to the backend at `http://localhost:8000` by default.

### Demo Flow (Recommended Video Sequence)

1. **First impression** — show the empty console with premium dark theme
2. **Grounded Inject** — click the case, then Run Guardrail; show citation appended to answer with green status glow
3. **Already Present** — show detection of existing citation with blue status
4. **Chitchat Skip** — demonstrate rule R1 with purple status
5. **Ungrounded Skip** — demonstrate rule R2 with amber status
6. **No Match** — show threshold behavior with gray status
7. **Health Counters** — click Refresh to show accumulated decision counts
8. **Manual editing** — edit payload in Monaco editor, show JSON validation
9. **Custom payload** — modify a case and re-run to show real-time processing

### Features

- **Demo Cases Panel** — 6 pre-built cases grouped by behavior (Inject, Detect Existing, Skip Rules, Edge Cases)
- **Monaco Editor** — syntax highlighting, JSON validation, format/reset controls
- **Search Controls** — strategy selector (semantic/hybrid), provider selector (hf/openai), alpha slider with live percentage readout
- **Response Panel** — final answer card, citation decision with status-specific glows, score breakdown for hybrid, metrics tiles
- **Health Counters** — live counters from /health with manual refresh
- **Animations** — Framer Motion staggered reveals, AnimatePresence transitions
- **Keyboard shortcut** — Cmd+Enter to run guardrail
- **Connectivity indicator** — real-time backend connection status
- **Toast notifications** — success/error feedback via Sonner
- **Model Calls metric** — accurate count of embedding provider invocations (not "LLM calls")

## Video Walkthrough

> **[Video link placeholder]** — To be added after recording.

## License

See [LICENSE](LICENSE).
