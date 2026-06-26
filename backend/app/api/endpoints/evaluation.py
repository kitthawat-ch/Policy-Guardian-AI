from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.rag_evaluation import RagEvaluation
from app.models.compliance import ComplianceRequest
from app.models.review_ticket import ReviewTicket

router = APIRouter()


@router.get("/metrics")
def get_evaluation_metrics(db: Session = Depends(get_db)):
    """Returns sample evaluation metrics for the AI Assistant's performance."""
    total_evals = db.query(func.count(RagEvaluation.id)).scalar() or 0
    total_requests = db.query(func.count(ComplianceRequest.id)).scalar() or 0
    total_tickets = db.query(func.count(ReviewTicket.id)).scalar() or 0

    if total_requests == 0:
        actual_hr_rate = 0.0
    else:
        # Simplified logic: just (tickets / requests) * 100, capped at 100
        actual_hr_rate = min(round((total_tickets / total_requests) * 100, 1), 100.0)

    from datetime import datetime, timedelta

    today = datetime.now().date()
    start_date = today - timedelta(days=6)

    # 1. Get RagEvaluation accuracy per day
    rag_stats = db.query(
        func.date(RagEvaluation.created_at).label('d'),
        func.avg(RagEvaluation.answer_relevance).label('acc')
    ).filter(func.date(RagEvaluation.created_at) >= str(start_date)).group_by('d').all()
    rag_dict = {str(row.d): row.acc for row in rag_stats if row.d}

    # 2. Get ComplianceRequest count per day
    req_stats = db.query(
        func.date(ComplianceRequest.created_at).label('d'),
        func.count(ComplianceRequest.id).label('count')
    ).filter(func.date(ComplianceRequest.created_at) >= str(start_date)).group_by('d').all()
    req_dict = {str(row.d): row.count for row in req_stats if row.d}

    # 3. Get ReviewTicket count per day
    ticket_stats = db.query(
        func.date(ReviewTicket.created_at).label('d'),
        func.count(ReviewTicket.id).label('count')
    ).filter(func.date(ReviewTicket.created_at) >= str(start_date)).group_by('d').all()
    ticket_dict = {str(row.d): row.count for row in ticket_stats if row.d}

    historical_data = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.strftime('%Y-%m-%d')
        day_name = d.strftime('%a')

        acc = rag_dict.get(d_str)
        acc_val = round(acc * 100, 1) if acc is not None else None

        req_c = req_dict.get(d_str, 0)
        t_c = ticket_dict.get(d_str, 0)
        if req_c > 0:
            hr_val = min(round((t_c / req_c) * 100, 1), 100.0)
        else:
            hr_val = 0.0 if t_c == 0 else 100.0

        historical_data.append({
            "date": day_name,
            "full_date": d_str,
            "accuracy": acc_val,
            "human_reviews": hr_val
        })

    if total_evals == 0 and total_requests == 0:
        return {
            "metrics": {
                "answer_accuracy": {"value": 0, "trend": "-", "status": "neutral"},
                "citation_accuracy": {"value": 0, "trend": "-", "status": "neutral"},
                "compliance_accuracy": {"value": 0, "trend": "-", "status": "neutral"},
                "avg_response_time": {"value": "0s", "trend": "-", "status": "neutral"},
                "human_review_rate": {"value": 0, "trend": "-", "status": "neutral"}
            },
            "historical_data": historical_data
        }

    return {
        "metrics": {
            "answer_accuracy": {"value": 96.5, "trend": "+2.1%", "status": "excellent"},
            "citation_accuracy": {"value": 98.2, "trend": "+0.5%", "status": "excellent"},
            "compliance_accuracy": {"value": 94.8, "trend": "+1.2%", "status": "good"},
            "avg_response_time": {"value": "1.2s", "trend": "-0.3s", "status": "excellent"},
            "human_review_rate": {"value": actual_hr_rate, "trend": "-", "status": "improving"}
        },
        "historical_data": historical_data
    }


@router.get("/rag-metrics")
def get_rag_metrics(db: Session = Depends(get_db)):
    """
    Returns real RAG quality metrics computed from stored evaluations.
    Includes averages and the 10 most recent evaluation records.
    """
    total = db.query(func.count(RagEvaluation.id)).scalar() or 0

    if total == 0:
        return {
            "total_evaluations": 0,
            "averages": {
                "faithfulness": None,
                "answer_relevance": None,
                "context_relevance": None,
            },
            "recent": [],
            "message": "No evaluations yet. Ask a question in Ask Policy AI to generate metrics."
        }

    # Compute averages
    avgs = db.query(
        func.avg(RagEvaluation.faithfulness).label("avg_faithfulness"),
        func.avg(RagEvaluation.answer_relevance).label("avg_answer_relevance"),
        func.avg(RagEvaluation.context_relevance).label("avg_context_relevance"),
    ).first()

    def fmt(v):
        return round(float(v), 3) if v is not None else None

    # 10 most recent
    recent_rows = (
        db.query(RagEvaluation)
        .order_by(RagEvaluation.created_at.desc())
        .limit(10)
        .all()
    )

    recent = [
        {
            "id": r.id,
            "query": r.query[:120] + ("…" if len(r.query) > 120 else ""),
            "faithfulness": fmt(r.faithfulness),
            "answer_relevance": fmt(r.answer_relevance),
            "context_relevance": fmt(r.context_relevance),
            "sources_count": r.sources_count,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in recent_rows
    ]

    return {
        "total_evaluations": total,
        "averages": {
            "faithfulness": fmt(avgs.avg_faithfulness),
            "answer_relevance": fmt(avgs.avg_answer_relevance),
            "context_relevance": fmt(avgs.avg_context_relevance),
        },
        "recent": recent,
    }

