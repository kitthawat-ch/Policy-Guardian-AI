"""
RagEvaluatorService — measures Faithfulness, Answer Relevance, and Context Relevance
for every ask-policy response and persists scores to the rag_evaluations table.
"""

import json
import logging
from typing import List, Dict, Any, Optional

import google.generativeai as genai
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.rag_evaluation import RagEvaluation
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)



class RagEvaluatorService:

    def __init__(self):
        pass

    # ─────────────────────────────────────────
    # Internal helpers
    # ─────────────────────────────────────────

    def _ask_gemini_json(self, prompt: str) -> Optional[Dict]:
        """Call Gemini and parse the JSON response. Returns None on any failure."""
        if not settings.GEMINI_API_KEY:
            return None
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            cfg = genai.GenerationConfig(response_mime_type="application/json")
            resp = model.generate_content(prompt, generation_config=cfg)
            return json.loads(resp.text)
        except Exception as e:
            logger.warning(f"RagEvaluator Gemini call failed: {e}")
            return None

    # ─────────────────────────────────────────
    # Metric 1 — Faithfulness
    # ─────────────────────────────────────────

    def score_faithfulness(self, answer: str, sources: List[Dict[str, Any]]) -> float:
        """
        Ask Gemini: 'Are all claims in the answer supported by the sources?'
        Returns a float 0.0–1.0.
        """
        if not sources:
            return 0.0

        context_text = "\n\n".join(
            f"[Source {i+1}] {s.get('content', s.get('snippet', ''))}"
            for i, s in enumerate(sources)
        )

        prompt = f"""You are an objective evaluator.

Given the SOURCES and the AI ANSWER below, determine what fraction of the factual claims
in the answer are directly supported by the sources (not hallucinated).

SOURCES:
{context_text}

AI ANSWER:
{answer}

Respond ONLY with a valid JSON object:
{{
  "faithfulness_score": <float 0.0 to 1.0>,
  "reasoning": "<one-line explanation>"
}}

Where 1.0 = every claim is grounded in the sources, 0.0 = answer is entirely hallucinated."""

        result = self._ask_gemini_json(prompt)
        if result and "faithfulness_score" in result:
            score = float(result["faithfulness_score"])
            return max(0.0, min(1.0, score))
        return 0.5  # neutral fallback

    # ─────────────────────────────────────────
    # Metric 2 — Answer Relevance
    # ─────────────────────────────────────────

    def score_answer_relevance(self, query: str, answer: str) -> float:
        """
        Ask Gemini: 'Does the answer actually address the question?'
        Returns a float 0.0–1.0.
        """
        prompt = f"""You are an objective evaluator.

Rate how well the AI ANSWER addresses the USER QUESTION.

USER QUESTION: {query}

AI ANSWER: {answer}

Respond ONLY with a valid JSON object:
{{
  "answer_relevance_score": <float 0.0 to 1.0>,
  "reasoning": "<one-line explanation>"
}}

Where 1.0 = perfectly on-topic, 0.0 = completely off-topic."""

        result = self._ask_gemini_json(prompt)
        if result and "answer_relevance_score" in result:
            score = float(result["answer_relevance_score"])
            return max(0.0, min(1.0, score))
        return 0.5

    # ─────────────────────────────────────────
    # Metric 3 — Context Relevance (embedding-based)
    # ─────────────────────────────────────────

    def score_context_relevance(self, query: str, sources: List[Dict[str, Any]]) -> float:
        """
        Compute average cosine similarity between the query embedding and each source's content.
        Pure embedding-based — no Gemini call needed.
        """
        if not sources:
            return 0.0

        query_vec = embedding_service.embed(query)
        if query_vec is None:
            return 0.0

        scores = []
        for src in sources:
            text = src.get("content", src.get("snippet", ""))
            if not text:
                continue
            src_vec = embedding_service.embed(text[:500])  # limit for speed
            if src_vec is not None:
                scores.append(embedding_service.cosine_similarity(query_vec, src_vec))

        return round(sum(scores) / len(scores), 4) if scores else 0.0

    # ─────────────────────────────────────────
    # Main entry point
    # ─────────────────────────────────────────

    def evaluate_and_store(
        self,
        db: Session,
        query: str,
        answer: str,
        sources: List[Dict[str, Any]],
    ) -> Optional[RagEvaluation]:
        """
        Compute all three metrics and persist a RagEvaluation row.
        Designed to be called fire-and-forget (errors are swallowed so they
        never break the main ask-policy response).
        """
        try:
            faithfulness = self.score_faithfulness(answer, sources)
            answer_relevance = self.score_answer_relevance(query, answer)
            context_relevance = self.score_context_relevance(query, sources)

            record = RagEvaluation(
                query=query,
                answer=answer,
                faithfulness=faithfulness,
                answer_relevance=answer_relevance,
                context_relevance=context_relevance,
                sources_count=len(sources),
                eval_model=settings.GEMINI_MODEL,
            )
            db.add(record)
            db.commit()
            db.refresh(record)

            logger.info(
                f"RAG Eval stored [id={record.id}]: "
                f"faithfulness={faithfulness:.2f}, "
                f"answer_relevance={answer_relevance:.2f}, "
                f"context_relevance={context_relevance:.2f}"
            )
            return record

        except Exception as e:
            logger.error(f"evaluate_and_store failed (non-fatal): {e}")
            return None


# Singleton
rag_evaluator = RagEvaluatorService()
