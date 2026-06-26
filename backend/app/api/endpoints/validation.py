from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any

from app.core.database import get_db
from app.services.agent_service import AgentService
from app.repositories.compliance_repository import compliance_repository

router = APIRouter()

class ValidateRequestPayload(BaseModel):
    project_name: str
    description: str
    user_id: int
    active_skills: list[str] = []

@router.post("/validate-request")
def validate_request(payload: ValidateRequestPayload, db: Session = Depends(get_db)):
    """Handles compliance architecture validation."""
    agent = AgentService(db)
    
    try:
        result = agent.process_request(
            user_id=payload.user_id, 
            request_text=payload.description, 
            project_name=payload.project_name,
            active_skills=payload.active_skills
        )
        
        # Find the compliance request ID from traces
        request_id = None
        risk_score = 0
        flagged = []
        for trace in result.get("traces", []):
            if trace["step"] == "Create Request":
                request_id = trace["details"].get("request_id")
            if trace["step"] == "Risk Assessment":
                risk_score = trace["details"].get("risk_score")
            if trace["step"] == "Process MCP Response" and "validation_response" in trace["details"]:
                findings = trace["details"]["validation_response"].get("data", {}).get("findings", [])
                for f in findings:
                    if f.get("violation_detected"):
                        flagged.append(f)
        
        # Fetch the real status from DB
        status = "pending"
        if request_id:
            req_db = compliance_repository.get(db, id=request_id)
            if req_db:
                status = req_db.status

        return {
            "compliance_request_id": request_id,
            "status": status,
            "overall_assessment": result.get("answer"),
            "risk_score": risk_score,
            "flagged_sections": flagged
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
