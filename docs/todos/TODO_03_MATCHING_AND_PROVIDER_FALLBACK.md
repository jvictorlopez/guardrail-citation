# TODO 03 — Matching Strategies and Provider Fallback

## Objective
Implement the swappable matching strategy system with keyword and semantic strategies, HuggingFace local embeddings as default, optional OpenAI embeddings, and robust fallback behavior when embedding providers fail.

## Why This Matters
The matching strategy is the core intelligence of the guardrail engine. It must correctly identify which candidate link is most relevant to the query+answer, while being resilient to provider failures. The brief specifically evaluates fallback behavior and provider switching.

## Scope
- Create strategy abstraction (base class)
- Implement keyword matching strategy
- Implement semantic matching strategy
- Create provider abstraction (base class)
- Implement HuggingFace local provider (sentence-transformers/all-MiniLM-L6-v2)
- Implement OpenAI provider (optional, env-based)
- Implement fallback: semantic failure → keyword
- Implement ambiguity margin logic
- Wire strategies into engine.py
- Support `MATCH_STRATEGY` and `LLM_PROVIDER` env vars

## Detailed Tasks

- [ ] Create `app/strategies/__init__.py`
- [ ] Create `app/strategies/base.py` — MatchResult dataclass + Strategy ABC
- [ ] Create `app/strategies/keyword.py` — Keyword overlap matching
- [ ] Create `app/strategies/semantic.py` — Embedding-based cosine similarity matching
- [ ] Create `app/providers/__init__.py`
- [ ] Create `app/providers/base.py` — EmbeddingProvider ABC
- [ ] Create `app/providers/hf.py` — Local sentence-transformers provider
- [ ] Create `app/providers/openai.py` — OpenAI embeddings provider
- [ ] Wire strategy selection into engine.py based on config
- [ ] Implement fallback: if semantic provider raises, catch, fall back to keyword, record reason
- [ ] Implement ambiguity margin: if top-2 within 0.05, return skipped_no_match
- [ ] Test keyword matching with seed cases
- [ ] Test semantic matching with seed cases

## Keyword Strategy Design
```
1. Tokenize query (lowercase, split on whitespace/punctuation)
2. For each candidate:
   a. Build candidate token set from: keywords + label tokens + description tokens
   b. Compute overlap = |query_tokens ∩ candidate_tokens| / |query_tokens|
3. Return best candidate if score > threshold (0.3)
```

## Semantic Strategy Design
```
1. Build source text = query (primary signal for matching)
2. For each candidate:
   a. Build candidate text = "{label}: {description}. Keywords: {keywords joined}"
3. Embed source + all candidate texts
4. Compute cosine similarity between source embedding and each candidate embedding
5. Return best candidate if score > threshold (0.35)
6. Apply ambiguity margin check on top-2
```

## Provider Fallback Flow
```
try:
    result = semantic_strategy.match(request)
except Exception as e:
    # Log the failure
    result = keyword_strategy.match(request)
    result.reason += f" (fallback from semantic: {str(e)})"
    result.strategy_used = "keyword_fallback"
```

## Acceptance Criteria
- [ ] Keyword strategy correctly matches seed case 01 to "Member Portal"
- [ ] Semantic strategy correctly matches seed case 01 to "Member Portal"
- [ ] Seed case 05 (pool question) returns skipped_no_match with both strategies
- [ ] Setting `LLM_PROVIDER=openai` without key causes graceful fallback to keyword
- [ ] `strategy_used` field accurately reflects which strategy actually ran
- [ ] `similarity_score` is populated for the winning match
- [ ] `llm_calls` is 0 for keyword, 1 for semantic
- [ ] No endpoint crash on embedding failure

## Files Created/Modified
- `app/strategies/__init__.py`
- `app/strategies/base.py`
- `app/strategies/keyword.py`
- `app/strategies/semantic.py`
- `app/providers/__init__.py`
- `app/providers/base.py`
- `app/providers/hf.py`
- `app/providers/openai.py`
- `app/engine.py` (updated)
- `app/config.py` (updated if needed)

## Risks / Pitfalls
- HuggingFace model download on first run can be slow — document in README
- sentence-transformers has torch as dependency — ensure requirements.txt is complete
- Cosine similarity threshold tuning — test with seed cases
- OpenAI rate limits or auth errors — must not crash endpoint

## Validation Steps
- Start server with default config (HF)
- POST /guardrail with seed_01 → injected, Member Portal, strategy_used=semantic
- POST /guardrail with seed_05 → skipped_no_match
- Set `LLM_PROVIDER=openai` without key, restart, POST → should fallback to keyword
- Set `MATCH_STRATEGY=keyword`, POST seed_01 → injected, strategy_used=keyword

## Commit Checkpoint
`feat: add matching strategies, HF provider, and fallback behavior`

## Final Status
- **Status:** Done
- **Completion Notes:** Keyword and semantic strategies implemented. HF provider uses local model directory. OpenAI provider available behind env var. Fallback from semantic to keyword on failure confirmed working.
