"""
Embedding Service — Singleton that loads the multilingual sentence-transformer model once
and provides embed() and cosine_similarity() helpers.
"""

import json
import logging
import math
from typing import List, Optional

logger = logging.getLogger(__name__)

# Model name — multilingual, supports Thai + English, ~120 MB
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


class EmbeddingService:
    """Singleton wrapper around a sentence-transformers model."""

    def __init__(self):
        self._model = None

    def _load_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading embedding model '{MODEL_NAME}' …")
                self._model = SentenceTransformer(MODEL_NAME)
                logger.info("Embedding model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                self._model = None

    # ──────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────

    def embed(self, text: str) -> Optional[List[float]]:
        """Return a 384-dim embedding vector for *text*, or None on failure."""
        self._load_model()
        if self._model is None:
            return None
        try:
            vector = self._model.encode(text, convert_to_numpy=True)
            return vector.tolist()
        except Exception as e:
            logger.error(f"embed() failed: {e}")
            return None

    def embed_to_json(self, text: str) -> Optional[str]:
        """Return embedding as a compact JSON string for DB storage."""
        vec = self.embed(text)
        return json.dumps(vec, separators=(",", ":")) if vec is not None else None

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Pure-Python cosine similarity between two vectors."""
        dot = sum(a * b for a, b in zip(v1, v2))
        mag1 = math.sqrt(sum(a * a for a in v1))
        mag2 = math.sqrt(sum(b * b for b in v2))
        if mag1 == 0 or mag2 == 0:
            return 0.0
        return dot / (mag1 * mag2)


# Singleton instance — import this everywhere
embedding_service = EmbeddingService()
