from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.llm_log import LlmLog

router = APIRouter()

@router.get("/llm-logs")
def get_llm_logs(db: Session = Depends(get_db)):
    """Fetch the latest 50 LLM logs."""
    logs = db.query(LlmLog).order_by(LlmLog.created_at.desc()).limit(50).all()
    return {
        "logs": [
            {
                "id": log.id,
                "agent_name": log.agent_name,
                "prompt": log.prompt,
                "response": log.response,
                "created_at": log.created_at.isoformat() if log.created_at else None
            }
            for log in logs
        ]
    }
