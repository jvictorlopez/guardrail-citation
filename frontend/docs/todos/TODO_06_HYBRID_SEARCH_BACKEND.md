# TODO 06: Hybrid Search Backend

## Objective
Implement hybrid search strategy combining semantic embeddings with BM25 lexical scoring, expose per-request strategy/provider/alpha overrides, and return score breakdowns in the response.

## Why This Matters
Hybrid search fuses the strengths of semantic understanding (contextual meaning) with lexical precision (exact term matches). This gives the guardrail engine a more robust matching capability and demonstrates advanced search engineering in the demo.

## Scope

### In Scope
- BM25 scoring implementation (lightweight, in-process)
- Hybrid strategy: fuse semantic + BM25 via alpha weighting
- Per-request overrides: strategy, provider, alpha
- Score breakdown in response: semantic_score, bm25_score, hybrid_score, alpha
- model_calls metric (replaces misleading llm_calls)
- provider_used field in CitationDecision
- Backward compatibility for existing eval cases

### Out of Scope
- External search engines (Elasticsearch, etc.)
- New eval golden set cases (existing 11 must still pass)
- Frontend changes (separate TODO)

## Detailed Checklist
- [ ] Create app/strategies/bm25.py with in-process BM25 scoring
- [ ] Create app/strategies/hybrid.py combining semantic + BM25
- [ ] Add optional fields to GuardrailRequest: strategy, provider, alpha
- [ ] Add score_breakdown and provider_used to CitationDecision
- [ ] Add model_calls to Metrics (keep llm_calls for backward compat)
- [ ] Update engine.py to handle per-request overrides
- [ ] Update engine.py to route to hybrid strategy when selected
- [ ] Normalize BM25 scores to [0, 1] before fusion
- [ ] Apply fusion: hybrid_score = alpha * semantic + (1 - alpha) * bm25
- [ ] Verify existing eval still passes 11/11

## Acceptance Criteria
- [ ] semantic strategy still works exactly as before
- [ ] hybrid strategy computes fused scores correctly
- [ ] alpha weighting is mathematically correct
- [ ] score_breakdown returned for hybrid requests
- [ ] model_calls reflects actual embedding provider calls
- [ ] existing eval passes 11/11

## Files Expected
- `app/strategies/bm25.py` (new)
- `app/strategies/hybrid.py` (new)
- `app/models.py` (modified)
- `app/engine.py` (modified)
- `app/config.py` (modified)

## Risks / Pitfalls
- BM25 normalization: raw BM25 scores are unbounded, must normalize to comparable range with cosine similarity
- Alpha=1.0 should produce identical results to pure semantic
- Must not break existing eval golden set

## Validation Plan
- Run eval.py with default settings (semantic + hf)
- Test hybrid + hf manually with curl
- Test alpha extremes (0.0, 0.5, 1.0)

## Commit Checkpoint
`feat: add backend hybrid strategy with bm25 fusion`

## Final Status
- **Status**: Done
- **Completion Notes**: BM25 in-process implementation with min-max normalization. Hybrid strategy fuses semantic + BM25 via alpha. Per-request overrides for strategy/provider/alpha. ScoreBreakdown and model_calls in response. Eval 11/11 at 100%.
