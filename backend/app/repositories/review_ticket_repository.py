from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.review_ticket import ReviewTicket
from app.schemas.review_ticket import ReviewTicketCreate, ReviewTicketBase

class ReviewTicketRepository(BaseRepository[ReviewTicket, ReviewTicketCreate, ReviewTicketBase]):
    def get_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100):
        return db.query(self.model).filter(self.model.status == status).offset(skip).limit(limit).all()

    def get_by_compliance_request(self, db: Session, request_id: int):
        return db.query(self.model).filter(self.model.compliance_request_id == request_id).all()

review_ticket_repository = ReviewTicketRepository(ReviewTicket)
