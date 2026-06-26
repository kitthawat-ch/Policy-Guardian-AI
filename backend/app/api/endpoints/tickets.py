from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.services.review_ticket_service import ReviewTicketService
from app.schemas.review_ticket import ReviewTicketApprove, ReviewTicketReject

router = APIRouter()

@router.get("/review-tickets")
def get_review_tickets(status: str = "open", db: Session = Depends(get_db)):
    """Fetch review tickets for the dashboard."""
    service = ReviewTicketService(db)
    try:
        tickets = service.get_review_queue(status=status)
        enhanced_tickets = []
        for t in tickets:
            enhanced_tickets.append({
                "id": t.id,
                "compliance_request_id": t.compliance_request_id,
                "policy_section_id": t.policy_section_id,
                "status": t.status,
                "created_at": t.created_at,
                "project_name": t.compliance_request.project_name if t.compliance_request else "Unknown",
                "description": t.compliance_request.description if t.compliance_request else "No description",
                "policy_title": t.policy_section.policy.title if (t.policy_section and t.policy_section.policy) else "Unknown Policy",
                "policy_content": t.policy_section.content if t.policy_section else "No policy content.",
                "ai_analysis": t.ai_analysis
            })
        return {"tickets": enhanced_tickets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/review-tickets/{ticket_id}/approve")
def approve_ticket(ticket_id: int, payload: ReviewTicketApprove, db: Session = Depends(get_db)):
    """Approve a ticket."""
    service = ReviewTicketService(db)
    try:
        ticket = service.approve_ticket(ticket_id, payload)
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return {"status": "success", "ticket_id": ticket.id}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/review-tickets/{ticket_id}/reject")
def reject_ticket(ticket_id: int, payload: ReviewTicketReject, db: Session = Depends(get_db)):
    """Reject a ticket."""
    service = ReviewTicketService(db)
    try:
        ticket = service.reject_ticket(ticket_id, payload)
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return {"status": "success", "ticket_id": ticket.id}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
