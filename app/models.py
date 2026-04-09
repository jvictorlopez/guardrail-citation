"""Pydantic models matching the fixed JSON contract."""

from pydantic import BaseModel


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


class CitationDecision(BaseModel):
    status: str
    matched_label: str | None
    strategy_used: str
    similarity_score: float | None
    reason: str


class Metrics(BaseModel):
    latency_ms: int
    llm_calls: int


class GuardrailResponse(BaseModel):
    final_answer: str
    citation_decision: CitationDecision
    metrics: Metrics
