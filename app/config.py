"""Configuration via environment variables."""

import os


class Settings:
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "hf")  # "hf" | "openai"
    MATCH_STRATEGY: str = os.getenv("MATCH_STRATEGY", "semantic")  # "semantic" | "keyword" | "hybrid"
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")

    # Thresholds
    SEMANTIC_THRESHOLD: float = float(os.getenv("SEMANTIC_THRESHOLD", "0.35"))
    KEYWORD_THRESHOLD: float = float(os.getenv("KEYWORD_THRESHOLD", "0.3"))
    AMBIGUITY_MARGIN: float = float(os.getenv("AMBIGUITY_MARGIN", "0.05"))

    # HuggingFace model
    HF_MODEL: str = os.getenv("HF_MODEL", "sentence-transformers/all-MiniLM-L6-v2")


settings = Settings()
