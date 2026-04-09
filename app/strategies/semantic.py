"""Semantic matching strategy using embedding cosine similarity."""

import math

from app.config import settings
from app.models import CandidateLink, GuardrailRequest
from app.providers.base import EmbeddingProvider
from app.strategies.base import MatchResult, MatchStrategy


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def build_candidate_text(c: CandidateLink) -> str:
    """Build a single text representation of a candidate link."""
    kw = ", ".join(c.keywords)
    return f"{c.label}: {c.description}. Keywords: {kw}"


class SemanticStrategy(MatchStrategy):
    """Matches candidates by embedding cosine similarity."""

    def __init__(self, provider: EmbeddingProvider):
        self.provider = provider

    def match(self, request: GuardrailRequest) -> MatchResult:
        candidates = request.candidate_links
        if not candidates:
            return MatchResult(matched=False, strategy_used="semantic", reason="no candidates")

        # Build texts to embed
        source_text = request.query
        candidate_texts = [build_candidate_text(c) for c in candidates]
        all_texts = [source_text] + candidate_texts

        # Embed
        embeddings = self.provider.embed(all_texts)
        source_embedding = embeddings[0]
        candidate_embeddings = embeddings[1:]

        # Compute similarities
        scores = []
        for i, c in enumerate(candidates):
            sim = cosine_similarity(source_embedding, candidate_embeddings[i])
            scores.append((c, sim))

        scores.sort(key=lambda x: x[1], reverse=True)
        best_candidate, best_score = scores[0]

        # Ambiguity margin check
        if len(scores) > 1:
            second_score = scores[1][1]
            if best_score - second_score < settings.AMBIGUITY_MARGIN and best_score > settings.SEMANTIC_THRESHOLD:
                return MatchResult(
                    matched=False,
                    strategy_used="semantic",
                    score=round(best_score, 4),
                    llm_calls=1,
                    reason=f"ambiguous: top-2 within margin ({best_score:.3f} vs {second_score:.3f})",
                )

        if best_score < settings.SEMANTIC_THRESHOLD:
            return MatchResult(
                matched=False,
                strategy_used="semantic",
                score=round(best_score, 4),
                llm_calls=1,
                reason=f"best score {best_score:.3f} below threshold {settings.SEMANTIC_THRESHOLD}",
            )

        return MatchResult(
            matched=True,
            label=best_candidate.label,
            url=best_candidate.url,
            score=round(best_score, 4),
            strategy_used="semantic",
            llm_calls=1,
            reason=f"semantic match above threshold ({best_score:.3f} >= {settings.SEMANTIC_THRESHOLD})",
        )
