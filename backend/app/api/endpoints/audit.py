from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import random
import os
import re
from pydantic import BaseModel
from app.core.config import settings

from app.core.database import get_db
from app.repositories.audit_repository import audit_log_repository
from app.schemas.audit_log import AuditLogCreate

router = APIRouter()

@router.get("/audit-logs")
def get_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Fetch all audit logs for compliance tracking."""
    try:
        logs = audit_log_repository.get_multi(db, skip=skip, limit=limit)
        
        # Format response
        formatted_logs = []
        for log in logs:
            formatted_logs.append({
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "target_type": log.target_type,
                "target_id": log.target_id,
                "details": log.details,
                "created_at": log.created_at
            })
            
        # Sort logs by created_at descending (newest first)
        formatted_logs.sort(key=lambda x: x["created_at"], reverse=True)
        
        return {"logs": formatted_logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audit-logs/mock")
def create_mock_audit_log(db: Session = Depends(get_db)):
    """Generate a mock audit log event for demo and verification purposes."""
    try:
        actions = [
            ("COMPLIANCE_CHECK_SUBMITTED", "compliance_request", "User submitted a new API Gateway integration draft."),
            ("AUTO_APPROVED", "compliance_request", "System auto-approved project 'AWS RDS Encryption' with risk score 25."),
            ("REVIEW_TICKET_CREATED", "review_ticket", "AI flagged violation in 'Payment Vault'. Risk score: 85. Human review required."),
            ("REVIEW_TICKET_APPROVED", "review_ticket", "Bob Compliance manually approved ticket after security patching."),
            ("REVIEW_TICKET_REJECTED", "review_ticket", "Bob Compliance rejected ticket. Insecure CORS policy confirmed.")
        ]
        action, target_type, details = random.choice(actions)
        obj_in = AuditLogCreate(
            user_id=random.choice([1, 2, None]),
            action=action,
            target_type=target_type,
            target_id=random.randint(10, 99),
            details=details
        )
        log = audit_log_repository.create(db, obj_in=obj_in)
        return {
            "status": "success", 
            "log": {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "target_type": log.target_type,
                "target_id": log.target_id,
                "details": log.details,
                "created_at": log.created_at
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.models.audit_log import AuditLog
from app.models.rag_evaluation import RagEvaluation
from app.models.review_ticket import ReviewTicket
from app.models.compliance import ComplianceRequest
from app.models.policy import Policy, PolicySection
from app.models.llm_log import LlmLog

@router.post("/system/reset")
def reset_system(db: Session = Depends(get_db)):
    """Reset all demo data (Audit logs, evaluations, tickets, requests)."""
    try:
        db.query(AuditLog).delete()
        db.query(RagEvaluation).delete()
        db.query(ReviewTicket).delete()
        db.query(ComplianceRequest).delete()
        db.query(PolicySection).delete()
        db.query(Policy).delete()
        db.query(LlmLog).delete()
        db.commit()
        
        # Clear ChromaDB to prevent phantom vectors
        from app.repositories.policy_repository import policy_section_repository
        collection = policy_section_repository._get_chroma_collection()
        if collection and collection.count() > 0:
            # Delete all items by fetching their IDs
            existing_data = collection.get()
            if existing_data and existing_data["ids"]:
                collection.delete(ids=existing_data["ids"])
                
        return {"status": "success", "message": "All demo data has been cleared."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

class SystemConfigUpdate(BaseModel):
    gemini_api_key: str
    gemini_model: str = "gemini-3.5-flash"

@router.get("/system/config")
def get_system_config():
    """Retrieve system configuration (e.g., API keys)."""
    return {
        "gemini_api_key": settings.GEMINI_API_KEY,
        "gemini_model": settings.GEMINI_MODEL
    }

@router.post("/system/config")
def update_system_config(config: SystemConfigUpdate):
    """Update system configuration in memory and save to .env file."""
    try:
        # Update in-memory settings so it works immediately
        settings.GEMINI_API_KEY = config.gemini_api_key
        settings.GEMINI_MODEL = config.gemini_model
        
        # Determine path to .env (usually in the backend root directory)
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        env_path = os.path.join(backend_dir, ".env")
        
        env_content = ""
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                env_content = f.read()
                
        # Use regex to replace the existing key or append it
        if "GEMINI_API_KEY" in env_content:
            env_content = re.sub(r'GEMINI_API_KEY\s*=\s*[^\n]*', f'GEMINI_API_KEY="{config.gemini_api_key}"', env_content)
        else:
            env_content += f'\nGEMINI_API_KEY="{config.gemini_api_key}"\n'
            
        if "GEMINI_MODEL" in env_content:
            env_content = re.sub(r'GEMINI_MODEL\s*=\s*[^\n]*', f'GEMINI_MODEL="{config.gemini_model}"', env_content)
        else:
            env_content += f'\nGEMINI_MODEL="{config.gemini_model}"\n'
            
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(env_content)
            
        return {"status": "success", "message": "Configuration updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
