"""HuggingFace sentence-transformers embedding provider (local, no API key needed)."""

from sentence_transformers import SentenceTransformer

from app.config import settings
from app.providers.base import EmbeddingProvider

_model = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.HF_MODEL)
    return _model


class HuggingFaceProvider(EmbeddingProvider):
    """Local sentence-transformers embeddings."""

    def embed(self, texts: list[str]) -> list[list[float]]:
        model = _get_model()
        embeddings = model.encode(texts, convert_to_numpy=True)
        return [e.tolist() for e in embeddings]
