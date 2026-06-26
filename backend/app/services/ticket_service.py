from sqlalchemy.orm import Session
from app.repositories.ticket_repo import TicketRepository
from app.repositories.audit_repo import AuditRepository
from app.schemas.ticket import TicketCreate, TicketUpdate
from app.schemas.audit import AuditLogCreate
import uuid

class TicketService:
    def __init__(self, db: Session):
        self.ticket_repo = TicketRepository(db)
        self.audit_repo = AuditRepository(db)

    def create_ticket(self, ticket_data: TicketCreate, agent_id: str = "system"):
        if not ticket_data.id or not ticket_data.id.startswith("TKT-"):
            ticket_data.id = f"TKT-{uuid.uuid4().hex[:8].upper()}"
        
        ticket = self.ticket_repo.create(ticket_data)
        
        # Log the action
        audit_log = AuditLogCreate(
            user_id=agent_id,
            action="CREATE_TICKET",
            target_id=ticket.id,
            details={"status": ticket.status, "assigned_queue": ticket.assigned_queue}
        )
        self.audit_repo.create(audit_log)
        return ticket

    def update_ticket_status(self, ticket_id: str, ticket_update: TicketUpdate, user_id: str):
        ticket = self.ticket_repo.update_status(ticket_id, ticket_update)
        if ticket:
            audit_log = AuditLogCreate(
                user_id=user_id,
                action="UPDATE_TICKET_STATUS",
                target_id=ticket.id,
                details={"new_status": ticket_update.status}
            )
            self.audit_repo.create(audit_log)
        return ticket

    def get_ticket(self, ticket_id: str):
        return self.ticket_repo.get_by_id(ticket_id)

    def list_tickets(self, skip: int = 0, limit: int = 100):
        return self.ticket_repo.get_all(skip, limit)
