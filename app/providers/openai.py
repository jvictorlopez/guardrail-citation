"""OpenAI embedding provider (optional, requires OPENAI_API_KEY)."""

import httpx

from app.config import settings
from app.providers.base import EmbeddingProvider


class OpenAIProvider(EmbeddingProvider):
    """OpenAI text-embedding-3-small embeddings."""

    MODEL = "text-embedding-3-small"
    URL = "https://api.openai.com/v1/embeddings"

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY is not set")

        response = httpx.post(
            self.URL,
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={"input": texts, "model": self.MODEL},
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        return [item["embedding"] for item in data["data"]]
