"""HuggingFace sentence-transformers embedding provider (local, no API key needed).

Loads the model from a local directory bundled with the project,
or from the HuggingFace hub cache if available.
"""

import os

from sentence_transformers import SentenceTransformer

from app.config import settings
from app.providers.base import EmbeddingProvider

# Resolve local model path relative to project root
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_LOCAL_MODEL_DIR = os.path.join(_PROJECT_ROOT, "models", "all-MiniLM-L6-v2")

_model = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        # Prefer local directory if it exists (avoids network dependency)
        if os.path.isdir(_LOCAL_MODEL_DIR):
            _model = SentenceTransformer(_LOCAL_MODEL_DIR)
        else:
            _model = SentenceTransformer(settings.HF_MODEL)
    return _model


class HuggingFaceProvider(EmbeddingProvider):
    """Local sentence-transformers embeddings — no API key, no network required."""

    def embed(self, texts: list[str]) -> list[list[float]]:
        model = _get_model()
        embeddings = model.encode(texts, convert_to_numpy=True)
        return [e.tolist() for e in embeddings]
