import logging
from sqlalchemy.orm import Session
from typing import List, Optional
from app.repositories.review_ticket_repository import review_ticket_repository
from app.repositories.compliance_repository import compliance_repository
from app.repositories.audit_repository import audit_log_repository
from app.models.review_ticket import ReviewTicket
from app.schemas.review_ticket import ReviewTicketApprove, ReviewTicketReject
from app.schemas.audit_log import AuditLogCreate

logger = logging.getLogger(__name__)

class ReviewTicketService:
    """
    Manages the Human-in-the-Loop workflows for review tickets.
    """
    
    def __init__(self, db: Session):
        self.db = db

    def _log_audit(self, user_id: int, action: str, target_type: str, target_id: int, details: str):
        """Helper to create audit logs."""
        audit_in = AuditLogCreate(
            user_id=user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details
        )
        audit_log_repository.create(self.db, obj_in=audit_in)
        logger.info(f"Audit Logged: {action} on {target_type} {target_id} by user {user_id}")

    def get_review_queue(self, status: Optional[str] = "open", skip: int = 0, limit: int = 100) -> List[ReviewTicket]:
        """
        Retrieves the queue of review tickets pending human action.
        """
        if status:
            return review_ticket_repository.get_by_status(self.db, status=status, skip=skip, limit=limit)
        return review_ticket_repository.get_multi(self.db, skip=skip, limit=limit)

    def approve_ticket(self, ticket_id: int, payload: ReviewTicketApprove) -> Optional[ReviewTicket]:
        """
        Approves a review ticket.
        """
        ticket = review_ticket_repository.get(self.db, id=ticket_id)
        if not ticket:
            return None

        # Update Ticket
        updated_ticket = review_ticket_repository.update(
            self.db, 
            db_obj=ticket, 
            obj_in={
                "status": "resolved", 
                "reviewer_id": payload.reviewer_id, 
                "findings": payload.findings
            }
        )
        
        # Log action
        self._log_audit(
            user_id=payload.reviewer_id,
            action="approved",
            target_type="review_ticket",
            target_id=ticket.id,
            details=f"Ticket approved. Findings: {payload.findings}"
        )
        
        # Check if parent compliance request is fully resolved
        self._check_and_update_compliance_status(ticket.compliance_request_id)
        
        return updated_ticket

    def reject_ticket(self, ticket_id: int, payload: ReviewTicketReject) -> Optional[ReviewTicket]:
        """
        Rejects a review ticket (flags it as unacceptable).
        """
        ticket = review_ticket_repository.get(self.db, id=ticket_id)
        if not ticket:
            return None

        # Update Ticket
        updated_ticket = review_ticket_repository.update(
            self.db, 
            db_obj=ticket, 
            obj_in={
                "status": "flagged", 
                "reviewer_id": payload.reviewer_id, 
                "findings": payload.findings
            }
        )
        
        # Log action
        self._log_audit(
            user_id=payload.reviewer_id,
            action="rejected",
            target_type="review_ticket",
            target_id=ticket.id,
            details=f"Ticket rejected. Findings: {payload.findings}"
        )
        
        # Automatically reject the parent compliance request
        request = compliance_repository.get(self.db, id=ticket.compliance_request_id)
        if request and request.status != "rejected":
            compliance_repository.update(self.db, db_obj=request, obj_in={"status": "rejected"})
            self._log_audit(
                user_id=payload.reviewer_id,
                action="rejected",
                target_type="compliance_request",
                target_id=request.id,
                details="Automatically rejected due to ticket rejection."
            )
            
        return updated_ticket

    def _check_and_update_compliance_status(self, request_id: int):
        """
        If all open tickets for a request are resolved, mark the request as approved.
        """
        all_tickets = review_ticket_repository.get_by_compliance_request(self.db, request_id)
        
        if not all_tickets:
            return
            
        unresolved = [t for t in all_tickets if t.status != "resolved"]
        
        if len(unresolved) == 0:
            request = compliance_repository.get(self.db, id=request_id)
            if request and request.status != "approved":
                compliance_repository.update(self.db, db_obj=request, obj_in={"status": "approved"})
                self._log_audit(
                    user_id=0, # System
                    action="auto_approved",
                    target_type="compliance_request",
                    target_id=request.id,
                    details="All associated review tickets resolved."
                )
