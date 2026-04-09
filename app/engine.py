"""Core guardrail decision engine."""

import logging
import time

from app.config import settings
from app.models import (
    CitationDecision,
    GuardrailRequest,
    GuardrailResponse,
    Metrics,
)
from app.state import increment
from app.strategies.base import MatchResult, MatchStrategy
from app.strategies.keyword import KeywordStrategy
from app.strategies.semantic import SemanticStrategy

logger = logging.getLogger(__name__)


def _get_provider():
    """Get the configured embedding provider."""
    if settings.LLM_PROVIDER == "openai":
        from app.providers.openai import OpenAIProvider
        return OpenAIProvider()
    else:
        from app.providers.hf import HuggingFaceProvider
        return HuggingFaceProvider()


def _get_strategy() -> tuple[MatchStrategy, MatchStrategy]:
    """Return (primary_strategy, fallback_strategy)."""
    keyword = KeywordStrategy()

    if settings.MATCH_STRATEGY == "keyword":
        return keyword, keyword

    provider = _get_provider()
    semantic = SemanticStrategy(provider)
    return semantic, keyword


def _normalize_url(url: str) -> str:
    """Normalize a URL for comparison."""
    return url.lower().rstrip("/")


def _url_present_in_answer(url: str, llm_answer: str) -> bool:
    """Check if a URL (or its normalized form) appears in the LLM answer."""
    answer_lower = llm_answer.lower()
    return _normalize_url(url) in answer_lower or url in llm_answer


def _format_citation(label: str, url: str) -> str:
    """Format a citation as a markdown link."""
    return f"\n\nFor more information, see [{label}]({url})."


def run_guardrail(request: GuardrailRequest) -> GuardrailResponse:
    """Execute the guardrail decision engine."""
    start = time.perf_counter()

    # R1: chitchat → skip
    if request.is_chitchat:
        elapsed = int((time.perf_counter() - start) * 1000)
        increment("skipped_chitchat")
        return GuardrailResponse(
            final_answer=request.llm_answer,
            citation_decision=CitationDecision(
                status="skipped_chitchat",
                matched_label=None,
                strategy_used="none",
                similarity_score=None,
                reason="is_chitchat=true, citation never injected on chitchat (R1)",
            ),
            metrics=Metrics(latency_ms=elapsed, llm_calls=0),
        )

    # R2: not KB-grounded → skip
    if not request.grounding.kb_grounded:
        elapsed = int((time.perf_counter() - start) * 1000)
        increment("skipped_ungrounded")
        return GuardrailResponse(
            final_answer=request.llm_answer,
            citation_decision=CitationDecision(
                status="skipped_ungrounded",
                matched_label=None,
                strategy_used="none",
                similarity_score=None,
                reason="kb_grounded=false, citation never injected on ungrounded answers (R2)",
            ),
            metrics=Metrics(latency_ms=elapsed, llm_calls=0),
        )

    # Empty candidates → skip (no LLM call needed)
    if not request.candidate_links:
        elapsed = int((time.perf_counter() - start) * 1000)
        increment("skipped_no_match")
        return GuardrailResponse(
            final_answer=request.llm_answer,
            citation_decision=CitationDecision(
                status="skipped_no_match",
                matched_label=None,
                strategy_used="none",
                similarity_score=None,
                reason="candidate_links is empty, no citation to match",
            ),
            metrics=Metrics(latency_ms=elapsed, llm_calls=0),
        )

    # Run matching strategy with fallback
    primary, fallback = _get_strategy()
    fallback_used = False

    try:
        result = primary.match(request)
    except Exception as e:
        logger.warning("Primary strategy failed, falling back to keyword: %s", e)
        result = fallback.match(request)
        fallback_used = True
        result.reason += f" (fallback from {settings.MATCH_STRATEGY}: {e})"
        result.strategy_used = "keyword_fallback"

    # R5: no match above threshold
    if not result.matched:
        elapsed = int((time.perf_counter() - start) * 1000)
        increment("skipped_no_match")
        return GuardrailResponse(
            final_answer=request.llm_answer,
            citation_decision=CitationDecision(
                status="skipped_no_match",
                matched_label=None,
                strategy_used=result.strategy_used,
                similarity_score=result.score,
                reason=result.reason,
            ),
            metrics=Metrics(latency_ms=elapsed, llm_calls=result.llm_calls),
        )

    # R3: URL already present → do not duplicate
    if _url_present_in_answer(result.url, request.llm_answer):
        elapsed = int((time.perf_counter() - start) * 1000)
        increment("already_present")
        return GuardrailResponse(
            final_answer=request.llm_answer,
            citation_decision=CitationDecision(
                status="already_present",
                matched_label=result.label,
                strategy_used=result.strategy_used,
                similarity_score=result.score,
                reason=f"kb_grounded=true, citation URL already present in llm_answer (R3)",
            ),
            metrics=Metrics(latency_ms=elapsed, llm_calls=result.llm_calls),
        )

    # R4: inject citation
    citation = _format_citation(result.label, result.url)
    final_answer = request.llm_answer + citation

    elapsed = int((time.perf_counter() - start) * 1000)
    increment("injected")
    return GuardrailResponse(
        final_answer=final_answer,
        citation_decision=CitationDecision(
            status="injected",
            matched_label=result.label,
            strategy_used=result.strategy_used,
            similarity_score=result.score,
            reason=f"kb_grounded=true, no citation present, {result.reason}",
        ),
        metrics=Metrics(latency_ms=elapsed, llm_calls=result.llm_calls),
    )
