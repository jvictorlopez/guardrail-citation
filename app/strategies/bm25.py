"""BM25 lexical scoring for candidate link matching.

Lightweight in-process implementation — no external search engine needed.
Suitable for small candidate sets typical in RAG guardrail scenarios.
"""

import math
import re

from app.models import CandidateLink, GuardrailRequest
from app.strategies.base import MatchResult, MatchStrategy


def _tokenize(text: str) -> list[str]:
    """Lowercase and split on non-alphanumeric characters."""
    return re.findall(r"[a-z0-9]+", text.lower())


def _build_candidate_text(c: CandidateLink) -> str:
    """Build searchable text from a candidate link."""
    kw = " ".join(c.keywords)
    return f"{c.label} {kw} {c.description}"


def bm25_scores(
    query: str,
    documents: list[str],
    k1: float = 1.5,
    b: float = 0.75,
) -> list[float]:
    """Compute BM25 scores for a query against a list of documents.

    Args:
        query: The search query text.
        documents: List of document texts to score.
        k1: Term frequency saturation parameter (default 1.5).
        b: Length normalization parameter (default 0.75).

    Returns:
        List of BM25 scores (one per document). Scores are non-negative
        but unbounded — normalize before fusion with other score types.
    """
    if not documents:
        return []

    # Tokenize
    query_terms = _tokenize(query)
    doc_tokens = [_tokenize(d) for d in documents]

    if not query_terms:
        return [0.0] * len(documents)

    n = len(documents)
    avg_dl = sum(len(dt) for dt in doc_tokens) / n if n > 0 else 1.0

    # Document frequency for each query term
    df: dict[str, int] = {}
    for term in set(query_terms):
        df[term] = sum(1 for dt in doc_tokens if term in dt)

    scores = []
    for dt in doc_tokens:
        dl = len(dt)
        term_freq: dict[str, int] = {}
        for t in dt:
            term_freq[t] = term_freq.get(t, 0) + 1

        score = 0.0
        for term in query_terms:
            if term not in df or df[term] == 0:
                continue
            tf = term_freq.get(term, 0)
            # IDF: log((N - df + 0.5) / (df + 0.5) + 1)
            idf = math.log((n - df[term] + 0.5) / (df[term] + 0.5) + 1.0)
            # TF component with saturation and length normalization
            tf_component = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl / avg_dl))
            score += idf * tf_component

        scores.append(score)

    return scores


def normalize_scores(scores: list[float]) -> list[float]:
    """Min-max normalize scores to [0, 1] range.

    If all scores are identical, returns 0.5 for all to avoid division by zero.
    """
    if not scores:
        return []
    min_s = min(scores)
    max_s = max(scores)
    if max_s - min_s < 1e-9:
        return [0.5] * len(scores)
    return [(s - min_s) / (max_s - min_s) for s in scores]


class BM25Strategy(MatchStrategy):
    """Matches candidates using BM25 lexical scoring."""

    def match(self, request: GuardrailRequest) -> MatchResult:
        candidates = request.candidate_links
        if not candidates:
            return MatchResult(matched=False, strategy_used="bm25", reason="no candidates")

        # Build query from query + llm_answer for richer topic signal
        query_text = f"{request.query} {request.llm_answer}"
        doc_texts = [_build_candidate_text(c) for c in candidates]

        raw_scores = bm25_scores(query_text, doc_texts)
        norm_scores = normalize_scores(raw_scores)

        scored = list(zip(candidates, norm_scores))
        scored.sort(key=lambda x: x[1], reverse=True)

        best_candidate, best_score = scored[0]

        if best_score < 0.3:  # use keyword threshold as baseline
            return MatchResult(
                matched=False,
                strategy_used="bm25",
                score=round(best_score, 4),
                reason=f"best BM25 score {best_score:.3f} below threshold",
            )

        return MatchResult(
            matched=True,
            label=best_candidate.label,
            url=best_candidate.url,
            score=round(best_score, 4),
            strategy_used="bm25",
            llm_calls=0,
            reason=f"BM25 match ({best_score:.3f})",
        )
