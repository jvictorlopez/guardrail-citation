# Design Notes

Technical decisions, trade-offs, and rationale behind the Citation Guardrail Engine.

---

## 1. Overall Architecture: Strategy Pattern with Provider Abstraction

The engine separates **what** to match (strategies) from **how** to embed (providers) using two abstract base classes:

```
app/strategies/base.py  →  MatchStrategy ABC    → match(request) → MatchResult
app/providers/base.py   →  EmbeddingProvider ABC → embed(texts)  → list[list[float]]
```

This lets the engine swap strategies (semantic, hybrid, keyword) and providers (HuggingFace, OpenAI) independently. The decision to use an ABC rather than a protocol was deliberate: `MatchStrategy` and `EmbeddingProvider` carry semantic weight — any implementation *must* provide these methods, and the `abstractmethod` decorator makes that a runtime enforcement, not just a type-checker hint.

**`app/strategies/base.py` — MatchResult dataclass:**

```python
@dataclass
class MatchResult:
    matched: bool
    label: str | None = None
    url: str | None = None
    score: float | None = None
    strategy_used: str = "none"
    llm_calls: int = 0
    reason: str = ""

    # Hybrid score breakdown
    semantic_score: float | None = None
    bm25_score: float | None = None
    hybrid_score: float | None = None
    alpha: float | None = None
```

Every strategy returns a `MatchResult`. The hybrid-specific fields (`semantic_score`, `bm25_score`, `hybrid_score`, `alpha`) are `None` for non-hybrid strategies, avoiding separate result types. A single flat dataclass keeps the engine code (`app/engine.py`) simple — it doesn't need to type-check which kind of result it received.

---

## 2. Rule Evaluation Order in `app/engine.py`

The engine evaluates rules in a strict priority order: **R1 → R2 → empty candidates → strategy match → R5 → R3 → R4**. This ordering is intentional:

```python
# engine.py lines 93-107: R1 fires first, unconditionally
if request.is_chitchat:
    increment("skipped_chitchat")
    return GuardrailResponse(...)

# engine.py lines 109-123: R2 fires second
if not request.grounding.kb_grounded:
    increment("skipped_ungrounded")
    return GuardrailResponse(...)

# engine.py lines 125-139: Empty candidates — early exit, no model call
if not request.candidate_links:
    increment("skipped_no_match")
    return GuardrailResponse(...)
```

**Why R1 before R2:** Chitchat should never produce a citation even if the answer happens to be grounded. This prevents confusing behavior where a casual "hello" gets a citation just because the upstream pipeline marked it grounded.

**Why empty-candidates before strategy:** This avoids wasting an embedding model call when there's nothing to match against. The HuggingFace model loads ~90MB into memory on first call; we shouldn't trigger that for an empty candidate list.

**Why R3 (already_present) after R5 (no_match):** We only check for URL presence if the strategy actually found a match. Checking R3 before R5 would mean we'd need to scan the answer for *every* candidate URL, which is wasteful and semantically wrong — we only care about the *matched* candidate's URL.

```python
# engine.py lines 162-178: R5 — no match above threshold
if not result.matched:
    increment("skipped_no_match")
    return GuardrailResponse(...)

# engine.py lines 180-196: R3 — check URL presence only for the matched candidate
if _url_present_in_answer(result.url, request.llm_answer):
    increment("already_present")
    return GuardrailResponse(...)

# engine.py lines 198-216: R4 — inject
citation = _format_citation(result.label, result.url)
final_answer = request.llm_answer + citation
```

---

## 3. Strategy Cascade and Fallback in `app/engine.py`

The engine always prepares a primary + fallback strategy pair:

```python
# engine.py _get_strategy() — returns (primary, fallback, provider_used)
def _get_strategy(strategy_name=None, provider_name=None, alpha=None):
    strat = strategy_name or settings.MATCH_STRATEGY
    keyword = KeywordStrategy()

    if strat == "keyword":
        return keyword, keyword, "none"

    provider, provider_used = _get_provider(provider_name)

    if strat == "hybrid":
        a = alpha if alpha is not None else 0.7
        hybrid = HybridStrategy(provider, alpha=a)
        return hybrid, keyword, provider_used

    # Default: semantic
    semantic = SemanticStrategy(provider)
    return semantic, keyword, provider_used
```

**The fallback is always `KeywordStrategy`** because it requires zero external dependencies — no model, no API key, no network. If the embedding provider fails (missing OpenAI key, model OOM, network timeout), keyword matching still produces a reasonable result with zero latency cost.

```python
# engine.py lines 149-157: fallback with error context
try:
    result = primary.match(request)
except Exception as e:
    logger.warning("Primary strategy failed, falling back to keyword: %s", e)
    result = fallback.match(request)
    fallback_used = True
    result.reason += f" (fallback from {request.strategy or settings.MATCH_STRATEGY}: {e})"
    result.strategy_used = "keyword_fallback"
    provider_used = "none"
```

The fallback appends the original error to `reason`, so the caller can see *why* the keyword strategy was used. The `strategy_used` field is set to `"keyword_fallback"` (not `"keyword"`) to distinguish intentional keyword usage from degraded mode.

---

## 4. Semantic Strategy: `app/strategies/semantic.py`

**Embedding source text:** The strategy embeds `request.query` (not `request.llm_answer`) as the source text:

```python
# semantic.py — source_text is the user query, not the LLM answer
source_text = request.query
candidate_texts = [build_candidate_text(c) for c in candidates]
all_texts = [source_text] + candidate_texts
embeddings = self.provider.embed(all_texts)
```

**Why query, not llm_answer:** The query represents user intent. The LLM answer is often verbose, includes conversational filler, and may repeat the query content — embedding it would dilute the semantic signal. The candidate links are documentation pages that should match *what the user asked*, not *what the LLM said*.

**Single embed call for all texts:** We batch the query + all candidates into one `embed()` call. This is critical for the OpenAI provider (one API call instead of N+1) and efficient for HuggingFace (batch inference through `model.encode()`).

**Cosine similarity — hand-rolled, not scipy:**

```python
def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)
```

I wrote cosine similarity from scratch rather than pulling in numpy/scipy. For 384-dimensional vectors and 1-10 candidates, the pure-Python loop is fast enough (<1ms) and avoids adding numpy to the dependency tree just for one dot product. The HuggingFace provider already depends on numpy internally, but the engine layer doesn't need to know that.

**Candidate text construction:**

```python
def build_candidate_text(c: CandidateLink) -> str:
    kw = ", ".join(c.keywords)
    return f"{c.label}: {c.description}. Keywords: {kw}"
```

The format `"Label: Description. Keywords: kw1, kw2"` was chosen to put the most semantically dense information (label) first, followed by natural language (description), then structured keywords. Embedding models (especially MiniLM) weight earlier tokens slightly more due to positional encoding, so this order matters.

---

## 5. BM25 Strategy: `app/strategies/bm25.py`

**In-process implementation:** I wrote BM25 from scratch rather than using a library (rank-bm25, Elasticsearch, etc.). The reasons:

1. **Small corpus:** Citation matching deals with 1-10 candidate links per request, not millions of documents. A full search engine is massive overkill.
2. **No persistence needed:** Candidates change every request — there's nothing to index ahead of time.
3. **Fewer dependencies:** The implementation is ~80 lines of pure Python with only `math` and `re` imports.

**Standard BM25 formula with default parameters:**

```python
def bm25_scores(query, documents, k1=1.5, b=0.75):
    # IDF: log((N - df + 0.5) / (df + 0.5) + 1)
    idf = math.log((n - df[term] + 0.5) / (df[term] + 0.5) + 1.0)
    # TF component with saturation and length normalization
    tf_component = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl / avg_dl))
    score += idf * tf_component
```

- **k1=1.5** controls term frequency saturation. Higher values give more weight to repeated terms; 1.5 is the standard default from the BM25 literature.
- **b=0.75** controls document length normalization. At b=1.0, longer documents are heavily penalized; at b=0.0, length is ignored. 0.75 is the conventional default.
- **IDF variant:** I used the `log((N-df+0.5)/(df+0.5) + 1)` form (note the `+ 1` inside the log) to avoid negative IDF values when a term appears in more than half the documents. This is the BM25+ variant that avoids penalizing common-but-relevant terms.

**BM25 query construction differs from semantic:**

```python
# bm25.py — uses query + llm_answer for richer lexical signal
query_text = f"{request.query} {request.llm_answer}"
```

Unlike semantic embedding (which uses only `request.query`), BM25 concatenates query + llm_answer. BM25 relies on exact token overlap, so the additional terms from the LLM answer improve recall without the dilution problem that affects dense embeddings.

**Min-max normalization:**

```python
def normalize_scores(scores: list[float]) -> list[float]:
    if not scores:
        return []
    min_s = min(scores)
    max_s = max(scores)
    if max_s - min_s < 1e-9:
        return [0.5] * len(scores)
    return [(s - min_s) / (max_s - min_s) for s in scores]
```

Raw BM25 scores are unbounded (they can range from 0 to arbitrarily high values depending on document length and term frequency). Cosine similarity is naturally bounded to [-1, 1] (and in practice [0, 1] for embedding models). Before fusing them in hybrid search, BM25 scores must be normalized to the same [0, 1] range.

**Why min-max instead of z-score or softmax:** Min-max preserves the relative ordering and maps directly to [0, 1]. Z-score normalization would center scores around 0 with negative values, which doesn't combine intuitively with cosine similarity. Softmax would normalize to a probability distribution (sum=1), which loses magnitude information.

**Edge case: identical scores → 0.5:** When all candidates score the same (e.g., none share any tokens with the query), min-max would divide by zero. Returning 0.5 for all is a neutral choice — it doesn't favor any candidate and gives the semantic component full control in hybrid fusion.

---

## 6. Hybrid Strategy: `app/strategies/hybrid.py`

The hybrid strategy fuses semantic and BM25 scores using a weighted linear combination:

```python
# hybrid.py — fusion formula
alpha = self.alpha
beta = 1.0 - alpha
hybrid = alpha * sem + beta * bm
```

**`hybrid_score = alpha * semantic_score + (1 - alpha) * bm25_score`**

- **alpha=1.0** → pure semantic (identical to `SemanticStrategy`)
- **alpha=0.7** → 70% semantic, 30% BM25 (default)
- **alpha=0.0** → pure BM25 (identical to `BM25Strategy`)

**Why linear fusion, not reciprocal rank fusion (RRF):** RRF works well when combining ranked lists from different retrieval systems, but it discards score magnitudes — it only uses rank positions. For our use case with 1-10 candidates, rank positions are too coarse (all tied at rank 1-3). Linear score fusion preserves the *confidence* of each component, which feeds directly into the threshold and ambiguity margin checks.

**Why default alpha=0.7:** Semantic embeddings capture meaning ("reset password" ≈ "account recovery") while BM25 captures surface terms ("password" exact match). For citation matching, semantic understanding is more important than lexical overlap, so semantic gets 70% weight. But the 30% BM25 component helps when a candidate has the exact keywords the user typed, which embedding models sometimes miss.

**Ambiguity margin on fused scores:**

```python
# hybrid.py — ambiguity check uses the same margin as semantic/keyword
if len(fused_scores) > 1:
    second_hybrid = fused_scores[1][1]
    if (best_hybrid - second_hybrid < settings.AMBIGUITY_MARGIN
            and best_hybrid > settings.SEMANTIC_THRESHOLD):
        return MatchResult(
            matched=False,
            reason=f"ambiguous: top-2 within margin ({best_hybrid:.3f} vs {second_hybrid:.3f})",
            ...
        )
```

The ambiguity margin (default 0.05) is applied to the fused score, not to individual components. If the top two candidates are within 0.05 of each other after fusion, the engine refuses to match — it's better to skip than to guess wrong. The same `SEMANTIC_THRESHOLD` (default 0.35) is reused as the minimum fused score, which works because both components are normalized to [0, 1].

**Score breakdown in the response:**

```python
return MatchResult(
    ...
    reason=f"hybrid match ({best_hybrid:.3f} = {alpha}*{best_sem:.3f} + {beta:.1f}*{best_bm:.3f})",
    semantic_score=round(best_sem, 4),
    bm25_score=round(best_bm, 4),
    hybrid_score=round(best_hybrid, 4),
    alpha=alpha,
)
```

The `reason` field includes the full equation with actual numbers, so anyone reading the API response can verify the math. The separate score fields are passed through `_build_score_breakdown()` in `engine.py` to populate the `ScoreBreakdown` model, which the frontend uses to render the 4-tile breakdown (Semantic, BM25, Hybrid, Alpha).

---

## 7. Embedding Providers: `app/providers/`

**HuggingFace (`app/providers/hf.py`) — local, free, offline:**

```python
_model = None

def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        if os.path.isdir(_LOCAL_MODEL_DIR):
            _model = SentenceTransformer(_LOCAL_MODEL_DIR)
        else:
            _model = SentenceTransformer(settings.HF_MODEL)
    return _model
```

The model is loaded as a module-level singleton. First call pays the ~2-3 second load time; subsequent calls are instant. The provider checks for a local `models/all-MiniLM-L6-v2` directory first (populated by `setup_model.sh`), falling back to the HuggingFace hub cache. This means the project works fully offline after initial setup.

**OpenAI (`app/providers/openai.py`) — optional, API-key required:**

```python
class OpenAIProvider(EmbeddingProvider):
    MODEL = "text-embedding-3-small"
    URL = "https://api.openai.com/v1/embeddings"

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY is not set")
        response = httpx.post(self.URL, ...)
        return [item["embedding"] for item in data["data"]]
```

The `RuntimeError` for missing API key is caught by the engine's fallback mechanism and triggers keyword matching with a clear error message. I chose `httpx` over the `openai` SDK to avoid pulling in a heavy dependency for a single HTTP call. The `text-embedding-3-small` model was chosen over `text-embedding-3-large` because the small model produces 1536-dimensional vectors (vs 3072) — faster, cheaper, and sufficient for matching against <10 candidates.

**Provider resolution in `app/engine.py`:**

```python
def _get_provider(provider_name: str | None = None):
    name = provider_name or settings.LLM_PROVIDER
    if name == "openai":
        from app.providers.openai import OpenAIProvider
        return OpenAIProvider(), "openai"
    else:
        from app.providers.hf import HuggingFaceProvider
        return HuggingFaceProvider(), "hf"
```

Providers are imported lazily inside the function, not at module level. This prevents the OpenAI httpx import from running when using HuggingFace (and vice versa), and avoids loading the ~90MB sentence-transformers model if the user only wants OpenAI.

---

## 8. Keyword Strategy: `app/strategies/keyword.py`

The keyword strategy is the simplest and serves as the universal fallback:

```python
def keyword_score(query_tokens: set[str], candidate: CandidateLink) -> float:
    candidate_tokens = set()
    for kw in candidate.keywords:
        candidate_tokens |= tokenize(kw)
    candidate_tokens |= tokenize(candidate.label)
    candidate_tokens |= tokenize(candidate.description)

    if not query_tokens:
        return 0.0
    overlap = len(query_tokens & candidate_tokens)
    return overlap / len(query_tokens)
```

The score is `|intersection| / |query_tokens|` — the fraction of query words that appear somewhere in the candidate. This is deliberately asymmetric: a candidate that contains all query terms scores 1.0 even if it has extra terms. The alternative (Jaccard similarity) would penalize candidates with rich descriptions, which is wrong — more metadata should help, not hurt.

**Only query tokens as primary signal:** The strategy uses `tokenize(request.query)` not `tokenize(request.llm_answer)`. The LLM answer often contains common words ("the", "you", "can") that would inflate scores for every candidate. The query is more focused.

---

## 9. Per-Request Overrides: `app/models.py`

```python
class GuardrailRequest(BaseModel):
    # ... core fields ...
    strategy: str | None = Field(None, pattern=r"^(semantic|hybrid)$")
    provider: str | None = Field(None, pattern=r"^(hf|openai)$")
    alpha: float | None = Field(None, ge=0.0, le=1.0)
```

The overrides are optional — `None` means "use the server default from environment variables." The Pydantic `pattern` validators reject invalid values at the API boundary rather than deep inside the engine. The `alpha` field is constrained to [0.0, 1.0] by `ge`/`le` validators.

**Config precedence** in `_get_strategy()`:

```
request.strategy > settings.MATCH_STRATEGY > "semantic" (hardcoded default)
request.provider > settings.LLM_PROVIDER   > "hf" (hardcoded default)
request.alpha    > 0.7 (hardcoded default)
```

This means the frontend can override any setting per-request without changing server configuration. The eval suite (`eval.py`) sends bare requests without overrides, so it always tests against the server's default configuration.

---

## 10. Metrics: `model_calls` vs `llm_calls`

```python
class Metrics(BaseModel):
    latency_ms: int
    llm_calls: int       # kept for backward compatibility with eval.py
    model_calls: int = 0  # clearer name: counts embedding provider invocations
```

The original field was `llm_calls`, but the engine doesn't call an LLM — it calls an embedding model. The name was misleading. I added `model_calls` as the canonical field and kept `llm_calls` populated with the same value so that `eval.py` (which reads `llm_calls`) continues to pass without changes:

```python
# engine.py — both fields get the same value
model_calls = result.llm_calls  # semantic/hybrid = 1, keyword = 0
metrics=Metrics(latency_ms=elapsed, llm_calls=result.llm_calls, model_calls=model_calls)
```

The frontend displays "Model Calls" (not "LLM Calls") to avoid confusion.

---

## 11. Ambiguity Margin

All three strategies (semantic, keyword, hybrid) share the same ambiguity margin logic:

```python
# semantic.py, keyword.py, hybrid.py — same pattern
if len(scores) > 1:
    second_score = scores[1][1]
    if best_score - second_score < settings.AMBIGUITY_MARGIN and best_score > threshold:
        return MatchResult(matched=False, reason="ambiguous: top-2 within margin ...")
```

**Default margin: 0.05** (configurable via `AMBIGUITY_MARGIN` env var). When the top two candidates score within 0.05 of each other, the engine refuses to pick one — it returns `skipped_no_match` instead. This prevents the guardrail from injecting the wrong citation when two candidates are nearly tied.

The additional guard `best_score > threshold` prevents the ambiguity margin from triggering when both candidates score poorly. If both score 0.1 and 0.08 (within margin), we don't want to report "ambiguous" — we want to report "below threshold."

---

## 12. Thresholds: `app/config.py`

```python
class Settings:
    SEMANTIC_THRESHOLD: float = float(os.getenv("SEMANTIC_THRESHOLD", "0.35"))
    KEYWORD_THRESHOLD: float = float(os.getenv("KEYWORD_THRESHOLD", "0.3"))
    AMBIGUITY_MARGIN: float = float(os.getenv("AMBIGUITY_MARGIN", "0.05"))
```

- **SEMANTIC_THRESHOLD=0.35:** Cosine similarity below 0.35 means the query and candidate are not meaningfully related. This is intentionally low — MiniLM embeddings rarely produce similarities above 0.7 for non-identical texts. A higher threshold (e.g., 0.6) would miss valid matches.
- **KEYWORD_THRESHOLD=0.3:** At least 30% of query tokens must appear in the candidate. Lower than semantic because keyword matching is coarser.
- **AMBIGUITY_MARGIN=0.05:** See section 11 above.

These are env-configurable but not per-request configurable — they're system-level safety knobs, not user-facing features.

---

## 13. URL Presence Detection: `app/engine.py`

```python
def _normalize_url(url: str) -> str:
    return url.lower().rstrip("/")

def _url_present_in_answer(url: str, llm_answer: str) -> bool:
    answer_lower = llm_answer.lower()
    return _normalize_url(url) in answer_lower or url in llm_answer
```

The check normalizes both the URL and the answer to lowercase, and strips trailing slashes. The dual check (`normalized in lowered` OR `original in original`) catches edge cases where the URL contains case-sensitive path segments that matter (rare but possible).

This intentionally catches URLs in any form — plain text, markdown links, or partial matches. A URL like `https://example.com/members` is detected whether the answer contains `[Member Portal](https://example.com/members)` or just `https://example.com/members` as plain text.

---

## 14. Health Counters: `app/state.py`

```python
counters: dict[str, int] = defaultdict(int)

def increment(status: str) -> None:
    counters[status] += 1
```

In-memory `defaultdict` — counters reset on server restart. I chose this over a database or file because:

1. The counters are observability aids, not business data — losing them on restart is acceptable.
2. No external dependency (Redis, SQLite, etc.) — keeps the project dependency-light.
3. Thread-safe for the default FastAPI deployment (single-process uvicorn with asyncio). For multi-worker deployments, counters would need to be moved to shared storage — but that's a deployment concern, not an engine concern.

---

## 15. CORS Configuration: `app/main.py`

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",  # Vite dev server
        "http://localhost:3000", "http://127.0.0.1:3000",  # Next.js dev server
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
```

CORS is locked to specific localhost origins, not `*`. Both Vite (port 5173, original frontend) and Next.js (port 3000, premium frontend) are allowed. Only `GET` and `POST` methods are permitted — the API has no `PUT`, `DELETE`, or `PATCH` endpoints. Only `Content-Type` header is allowed — no auth headers because the API has no authentication (acceptable for a local demo service).

---

## 16. Assumptions

1. **Upstream signals are trustworthy.** The engine trusts `is_chitchat`, `is_grounded`, and `kb_grounded` from the caller. It doesn't re-evaluate whether the answer is actually grounded or whether the query is really chitchat. In production, these would come from upstream classifiers.

2. **Small candidate sets.** The engine assumes 1-10 candidates per request. The BM25 implementation, cosine similarity loop, and embed-all-at-once approach all scale linearly with candidate count, but none use indexing structures that would help at 1000+ candidates.

3. **Single-process deployment.** Health counters use an in-memory dict. Model singletons use module-level globals. Both assume a single uvicorn process.

4. **Local model availability.** The HuggingFace provider expects the model at `models/all-MiniLM-L6-v2` after running `setup_model.sh`. Without it, it falls back to HuggingFace hub download (requires internet on first run).

---

## 17. Known Limitations and Future Work

- **No caching of embeddings.** Every request re-embeds all candidates. For repeated queries with the same candidate set, an LRU cache on `embed()` would eliminate redundant computation.
- **No authentication.** The API is wide open. Fine for a demo; not for production.
- **No persistent storage.** Health counters and no request logging. Add a database or structured logging for production observability.
- **No batch evaluation with hybrid.** The eval suite (`eval.py`) runs against whatever strategy the server is configured with. To evaluate hybrid vs semantic systematically, you'd need to run eval twice with different `MATCH_STRATEGY` settings or add per-request override support to the eval script.
- **BM25 doesn't remove stop words.** The tokenizer splits on non-alphanumeric characters but doesn't remove common words ("the", "a", "is"). For the small candidate texts we deal with, stop word removal didn't improve results in testing and added complexity.
