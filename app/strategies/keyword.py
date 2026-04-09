"""Keyword-based matching strategy using lexical overlap."""

import re

from app.config import settings
from app.models import CandidateLink, GuardrailRequest
from app.strategies.base import MatchResult, MatchStrategy


def tokenize(text: str) -> set[str]:
    """Lowercase and split on non-alphanumeric characters."""
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def keyword_score(query_tokens: set[str], candidate: CandidateLink) -> float:
    """Compute normalized overlap between query tokens and candidate tokens."""
    candidate_tokens = set()
    for kw in candidate.keywords:
        candidate_tokens |= tokenize(kw)
    candidate_tokens |= tokenize(candidate.label)
    candidate_tokens |= tokenize(candidate.description)

    if not query_tokens:
        return 0.0

    overlap = len(query_tokens & candidate_tokens)
    return overlap / len(query_tokens)


class KeywordStrategy(MatchStrategy):
    """Matches candidates by lexical token overlap with the query."""

    def match(self, request: GuardrailRequest) -> MatchResult:
        # Use query tokens as primary signal; llm_answer tokens add noise
        query_tokens = tokenize(request.query)
        candidates = request.candidate_links

        if not candidates:
            return MatchResult(matched=False, strategy_used="keyword", reason="no candidates")

        scores = [(c, keyword_score(query_tokens, c)) for c in candidates]
        scores.sort(key=lambda x: x[1], reverse=True)

        best_candidate, best_score = scores[0]

        # Ambiguity margin check
        if len(scores) > 1:
            second_score = scores[1][1]
            if best_score - second_score < settings.AMBIGUITY_MARGIN and best_score > 0:
                return MatchResult(
                    matched=False,
                    strategy_used="keyword",
                    score=best_score,
                    reason=f"ambiguous: top-2 within margin ({best_score:.3f} vs {second_score:.3f})",
                )

        if best_score < settings.KEYWORD_THRESHOLD:
            return MatchResult(
                matched=False,
                strategy_used="keyword",
                score=best_score,
                reason=f"best score {best_score:.3f} below threshold {settings.KEYWORD_THRESHOLD}",
            )

        return MatchResult(
            matched=True,
            label=best_candidate.label,
            url=best_candidate.url,
            score=round(best_score, 4),
            strategy_used="keyword",
            llm_calls=0,
            reason=f"keyword match above threshold ({best_score:.3f} >= {settings.KEYWORD_THRESHOLD})",
        )
