import logging
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.repositories.policy_repository import policy_section_repository
from app.repositories.review_ticket_repository import review_ticket_repository
from app.schemas.review_ticket import ReviewTicketCreate
from app.agents.auditor_agent import AuditorAgent

logger = logging.getLogger(__name__)

def validate_compliance_request(
    db: Session, 
    compliance_request_id: int, 
    project_name: str, 
    description: str, 
    policy_section_ids: List[int],
    active_skills: List[str] = None
) -> Dict[str, Any]:
    """
    Validates a project architecture against specific policy sections.
    Mock implementation: Uses basic keyword scanning.
    """
    logger.info(f"Executing validate_compliance_request for request {compliance_request_id} against {len(policy_section_ids)} policies.")
    try:
        findings = []
        is_compliant = True
        
        evaluator = AuditorAgent()
        
        for sec_id in policy_section_ids:
            section = policy_section_repository.get(db, id=sec_id)
            if not section:
                continue
                
            evaluation_result = evaluator.evaluate_architecture_compliance(description, section.content, active_skills)
            
            violation = evaluation_result.get("violation_detected", False)
            ai_analysis = evaluation_result.get("ai_analysis", "No analysis provided.")
            risk_score = evaluation_result.get("risk_score", 0)

            if violation:
                is_compliant = False
                
            findings.append({
                "policy_section_id": sec_id,
                "violation_detected": violation,
                "risk_score": risk_score,
                "ai_analysis": ai_analysis
            })
            
        logger.info(f"Validation complete. Compliant: {is_compliant}")
        return {
            "status": "success",
            "data": {
                "is_compliant": is_compliant,
                "findings": findings
            }
        }
    except Exception as e:
        logger.error(f"Error in validate_compliance_request: {e}")
        return {"status": "error", "message": str(e)}

def create_human_review_ticket(
    db: Session, 
    compliance_request_id: int, 
    policy_section_id: int, 
    ai_analysis: str
) -> Dict[str, Any]:
    """
    Creates a formal review ticket for a compliance violation.
    """
    logger.info(f"Executing create_human_review_ticket for request {compliance_request_id}, policy {policy_section_id}")
    try:
        ticket_in = ReviewTicketCreate(
            compliance_request_id=compliance_request_id,
            policy_section_id=policy_section_id,
            ai_analysis=ai_analysis,
            status="open"
        )
        
        ticket = review_ticket_repository.create(db, obj_in=ticket_in)
        logger.info(f"Created ticket ID {ticket.id}")
        
        # Broadcast to WebSocket clients
        try:
            import asyncio
            from app.api.websockets import manager
            
            async def _broadcast():
                await manager.broadcast({"type": "new_ticket", "ticket_id": ticket.id})
                
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(_broadcast())
            except RuntimeError:
                # If no running event loop, this means we are in a pure sync thread.
                # Uvicorn runs sync endpoints in a threadpool. We can use asyncio.run 
                # but it creates a new loop. It's safer to just run it.
                asyncio.run(_broadcast())
        except Exception as e:
            logger.warning(f"Failed to broadcast websocket event: {e}")
        
        return {
            "status": "success",
            "success": True,
            "ticket_id": ticket.id,
            "ticket_status": ticket.status
        }
        
    except Exception as e:
        logger.error(f"Error creating ticket: {e}")
        return {"status": "error", "message": str(e), "success": False}
