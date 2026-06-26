"""
RagEvaluation — stores per-query RAG quality scores.
"""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class RagEvaluation(Base):
    __tablename__ = "rag_evaluations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    query = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

    # RAG quality metrics  (0.0 – 1.0)
    faithfulness = Column(Float, nullable=True)       # claims grounded in sources?
    answer_relevance = Column(Float, nullable=True)    # answer on-topic?
    context_relevance = Column(Float, nullable=True)   # retrieved chunks relevant?

    sources_count = Column(Integer, default=0)
    eval_model = Column(String, default="gemini-3.5-flash")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
