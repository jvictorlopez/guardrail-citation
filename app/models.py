"""Pydantic models matching the fixed JSON contract."""

from pydantic import BaseModel, Field


class Grounding(BaseModel):
    is_grounded: bool
    kb_grounded: bool


class CandidateLink(BaseModel):
    label: str
    url: str
    keywords: list[str]
    description: str


class GuardrailRequest(BaseModel):
    query: str
    llm_answer: str
    grounding: Grounding
    is_chitchat: bool
    candidate_links: list[CandidateLink]

    # Per-request overrides (optional — fall back to env/defaults)
    strategy: str | None = Field(None, pattern=r"^(semantic|hybrid)$")
    provider: str | None = Field(None, pattern=r"^(hf|openai)$")
    alpha: float | None = Field(None, ge=0.0, le=1.0)


class ScoreBreakdown(BaseModel):
    """Detailed score breakdown for hybrid search results."""
    semantic_score: float | None = None
    bm25_score: float | None = None
    hybrid_score: float | None = None
    alpha: float | None = None


class CitationDecision(BaseModel):
    status: str
    matched_label: str | None
    strategy_used: str
    similarity_score: float | None
    reason: str
    provider_used: str | None = None
    score_breakdown: ScoreBreakdown | None = None


class Metrics(BaseModel):
    latency_ms: int
    llm_calls: int  # kept for backward compatibility
    model_calls: int = 0  # clearer: counts embedding provider invocations


class GuardrailResponse(BaseModel):
    final_answer: str
    citation_decision: CitationDecision
    metrics: Metrics
