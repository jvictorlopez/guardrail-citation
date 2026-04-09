"""Hybrid search strategy: semantic embeddings + BM25 lexical scoring.

Fuses scores using:
    hybrid_score = alpha * semantic_score + (1 - alpha) * bm25_score

where alpha controls semantic weight (1.0 = pure semantic, 0.0 = pure BM25).
"""

from app.config import settings
from app.models import CandidateLink, GuardrailRequest
from app.providers.base import EmbeddingProvider
from app.strategies.base import MatchResult, MatchStrategy
from app.strategies.bm25 import _build_candidate_text, bm25_scores, normalize_scores
from app.strategies.semantic import build_candidate_text, cosine_similarity


class HybridStrategy(MatchStrategy):
    """Fuses semantic embedding similarity with BM25 lexical scoring."""

    def __init__(self, provider: EmbeddingProvider, alpha: float = 0.7):
        self.provider = provider
        self.alpha = alpha

    def match(self, request: GuardrailRequest) -> MatchResult:
        candidates = request.candidate_links
        if not candidates:
            return MatchResult(matched=False, strategy_used="hybrid", reason="no candidates")

        alpha = self.alpha
        beta = 1.0 - alpha

        # ── Semantic component ──
        query_text = request.query
        candidate_texts = [build_candidate_text(c) for c in candidates]
        all_texts = [query_text] + candidate_texts
        embeddings = self.provider.embed(all_texts)

        source_embedding = embeddings[0]
        candidate_embeddings = embeddings[1:]

        semantic_scores = []
        for i, c in enumerate(candidates):
            sim = cosine_similarity(source_embedding, candidate_embeddings[i])
            semantic_scores.append(sim)

        # ── BM25 component ──
        bm25_query = f"{request.query} {request.llm_answer}"
        bm25_doc_texts = [_build_candidate_text(c) for c in candidates]
        raw_bm25 = bm25_scores(bm25_query, bm25_doc_texts)
        norm_bm25 = normalize_scores(raw_bm25)

        # ── Fusion ──
        fused_scores = []
        for i, c in enumerate(candidates):
            sem = semantic_scores[i]
            bm = norm_bm25[i]
            hybrid = alpha * sem + beta * bm
            fused_scores.append((c, hybrid, sem, bm))

        fused_scores.sort(key=lambda x: x[1], reverse=True)
        best_candidate, best_hybrid, best_sem, best_bm = fused_scores[0]

        # Ambiguity margin check on fused scores
        if len(fused_scores) > 1:
            second_hybrid = fused_scores[1][1]
            if (best_hybrid - second_hybrid < settings.AMBIGUITY_MARGIN
                    and best_hybrid > settings.SEMANTIC_THRESHOLD):
                return MatchResult(
                    matched=False,
                    strategy_used="hybrid",
                    score=round(best_hybrid, 4),
                    llm_calls=1,
                    reason=f"ambiguous: top-2 within margin ({best_hybrid:.3f} vs {second_hybrid:.3f})",
                    semantic_score=round(best_sem, 4),
                    bm25_score=round(best_bm, 4),
                    hybrid_score=round(best_hybrid, 4),
                    alpha=alpha,
                )

        # Threshold check on fused score
        if best_hybrid < settings.SEMANTIC_THRESHOLD:
            return MatchResult(
                matched=False,
                strategy_used="hybrid",
                score=round(best_hybrid, 4),
                llm_calls=1,
                reason=f"best hybrid score {best_hybrid:.3f} below threshold {settings.SEMANTIC_THRESHOLD}",
                semantic_score=round(best_sem, 4),
                bm25_score=round(best_bm, 4),
                hybrid_score=round(best_hybrid, 4),
                alpha=alpha,
            )

        return MatchResult(
            matched=True,
            label=best_candidate.label,
            url=best_candidate.url,
            score=round(best_hybrid, 4),
            strategy_used="hybrid",
            llm_calls=1,
            reason=f"hybrid match ({best_hybrid:.3f} = {alpha}*{best_sem:.3f} + {beta:.1f}*{best_bm:.3f})",
            semantic_score=round(best_sem, 4),
            bm25_score=round(best_bm, 4),
            hybrid_score=round(best_hybrid, 4),
            alpha=alpha,
        )
