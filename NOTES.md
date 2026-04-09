# NOTES — Design Decisions and Trade-offs

## Chosen Strategy: Semantic (with keyword fallback)

**Strategy:** Semantic matching using `sentence-transformers/all-MiniLM-L6-v2` embeddings with cosine similarity, falling back to keyword matching on provider failure.

**Why semantic over keyword:**
- Keyword matching is brittle — it fails when the user's query uses different words than the candidate's keywords (e.g., "reset my password" vs. keywords containing "credentials" or "authentication").
- Semantic matching captures meaning, not just lexical overlap. A query about "resetting a password" will match a candidate labeled "Member Portal" with description "account management and password reset" even if the exact words differ.
- The HuggingFace model runs locally with zero cost and no API key, so there is no practical downside to using it as the default path.

**Why keyword as fallback (not the other way around):**
- Keyword matching is deterministic and requires no external dependency. If the embedding model fails to load or an API times out, keyword matching still produces a reasonable result.
- This means the endpoint never crashes due to ML failures — it degrades gracefully.

## One Trade-off Accepted

**Ambiguity margin logic may skip valid matches.**

When two candidates have similarity scores within 0.05 of each other, the engine returns `skipped_no_match` rather than picking one. This is intentional: injecting the wrong citation is worse than injecting none. In a production system, this could be tuned per-domain, or the margin could be narrowed as confidence in the embedding model grows. The trade-off is: we sacrifice some recall (valid citations skipped) to gain precision (fewer wrong citations injected).

## One Limitation

**In-memory health counters reset on server restart.**

The `/health` endpoint uses a Python `defaultdict` in memory. When the server restarts, all counters go to zero. This is acceptable for a local dev/demo solution, but a production system would need persistent counters (Redis, Prometheus, or a database). I chose simplicity here because the brief explicitly says "no database" and the counters are for observability demonstration, not production alerting.

## Assumptions

1. **Rule evaluation order is R1 → R2 → empty candidates → match → R3 → R4/R5.** The brief lists R1-R5 but doesn't specify precedence explicitly. I assumed chitchat and grounding checks take priority over any matching logic, which avoids unnecessary LLM calls on obviously skippable cases.

2. **The `llm_calls` metric counts embedding API calls, not LLM text generation calls.** The engine doesn't generate text — it only embeds. One batch embedding call = 1 `llm_call`. Keyword-only paths report 0.

3. **"Already present" detection (R3) checks the raw URL string in `llm_answer`.** If the URL appears as plain text or inside a markdown link, both are caught. We normalize URLs by lowercasing and stripping trailing slashes for robust comparison.

4. **Threshold values (semantic: 0.35, keyword: 0.3) are tuned to the seed cases.** These are reasonable starting points but would need calibration on real production data.

## Most Dangerous Failure Mode

**Silent false injection — injecting the wrong citation with high confidence.**

This happens when:
- The embedding model assigns high similarity between unrelated concepts (domain drift, or a query that superficially resembles a candidate's description).
- The engine confidently injects a citation that points the user to irrelevant or misleading content.

**Why it's dangerous:** The user sees a citation and trusts it. Unlike a missing citation (which is merely unhelpful), a wrong citation actively misleads. In a domain like healthcare or legal, this could cause real harm.

**How to detect it in production:**
1. **Log every decision** with the full context (query, answer, candidates, scores, chosen citation). This creates an audit trail.
2. **Sample-based human review**: periodically review a random sample of `injected` decisions. Measure precision: what % of injected citations were actually correct?
3. **User feedback signal**: if users click a citation and immediately bounce back, that's a negative signal. Track citation click-through and engagement.
4. **Confidence distribution monitoring**: if the average similarity score of injected citations drifts downward over time, the model may be degrading or the candidate set may need updating.
5. **A/B testing**: compare user satisfaction with and without the guardrail engine.

## What I Would Add First With One More Week

**A hybrid matching strategy with re-ranking.**

Currently the engine uses either semantic or keyword matching. With more time, I would:

1. **Run both strategies in parallel** and combine scores with configurable weights (e.g., 0.7 * semantic + 0.3 * keyword).
2. **Add a lightweight LLM re-ranker** — after the top-2 candidates are identified by embedding similarity, ask a small LLM (e.g., a local Phi-3 or a single HF inference call) to judge which candidate is more relevant to the query + answer context. This adds a second opinion that catches embedding false positives.
3. **Add confidence calibration** — instead of a fixed threshold, use a calibrated probability (e.g., Platt scaling on a labeled dataset) so the engine can express "I'm 92% sure this is the right citation" rather than "the cosine similarity is 0.78."

This would significantly reduce the false injection rate while maintaining high recall, and the cost would remain low since the re-ranker only runs on the top-2 candidates (not the full list).
