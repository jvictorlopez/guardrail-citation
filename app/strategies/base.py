"""Base classes for matching strategies."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from app.models import CandidateLink, GuardrailRequest


@dataclass
class MatchResult:
    """Result of a matching strategy run."""
    matched: bool
    label: str | None = None
    url: str | None = None
    score: float | None = None
    strategy_used: str = "none"
    llm_calls: int = 0
    reason: str = ""

    # Hybrid score breakdown (populated by HybridStrategy)
    semantic_score: float | None = None
    bm25_score: float | None = None
    hybrid_score: float | None = None
    alpha: float | None = None


class MatchStrategy(ABC):
    """Abstract base for matching strategies."""

    @abstractmethod
    def match(self, request: GuardrailRequest) -> MatchResult:
        """Find the best matching candidate link for the query."""
        ...
