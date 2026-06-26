from sqlalchemy.orm import Session
from app.database.models import ReviewTicket
from app.schemas.ticket import TicketCreate, TicketUpdate
from typing import List, Optional

class TicketRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, ticket_id: str) -> Optional[ReviewTicket]:
        return self.db.query(ReviewTicket).filter(ReviewTicket.id == ticket_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ReviewTicket]:
        return self.db.query(ReviewTicket).offset(skip).limit(limit).all()

    def create(self, ticket: TicketCreate) -> ReviewTicket:
        db_ticket = ReviewTicket(
            id=ticket.id,
            employee_id=ticket.employee_id,
            request_type=ticket.request_type,
            assigned_queue=ticket.assigned_queue,
            agent_summary=ticket.agent_summary,
            details=ticket.details,
            citations=ticket.citations
        )
        self.db.add(db_ticket)
        self.db.commit()
        self.db.refresh(db_ticket)
        return db_ticket

    def update_status(self, ticket_id: str, ticket_update: TicketUpdate) -> Optional[ReviewTicket]:
        db_ticket = self.get_by_id(ticket_id)
        if db_ticket:
            db_ticket.status = ticket_update.status
            self.db.commit()
            self.db.refresh(db_ticket)
        return db_ticket
