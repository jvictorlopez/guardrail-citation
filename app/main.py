"""FastAPI application — Citation Guardrail Engine."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.engine import run_guardrail
from app.models import GuardrailRequest, GuardrailResponse
from app.state import get_counters

app = FastAPI(
    title="Citation Guardrail Engine",
    description="RAG post-processing guardrail that decides whether to inject a canonical citation into an LLM answer.",
    version="1.0.0",
)

# CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.post("/guardrail", response_model=GuardrailResponse)
def guardrail(request: GuardrailRequest) -> GuardrailResponse:
    """Run the citation guardrail over an LLM response."""
    return run_guardrail(request)


@app.get("/health")
def health() -> dict:
    """Return basic health info and decision counters."""
    return {
        "status": "ok",
        "counters": get_counters(),
    }
