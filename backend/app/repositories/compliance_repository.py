from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.compliance import ComplianceRequest
from app.schemas.compliance import ComplianceRequestCreate, ComplianceRequestBase

class ComplianceRepository(BaseRepository[ComplianceRequest, ComplianceRequestCreate, ComplianceRequestBase]):
    def get_by_submitter(self, db: Session, user_id: int, skip: int = 0, limit: int = 100):
        return db.query(self.model).filter(self.model.submitted_by == user_id).offset(skip).limit(limit).all()

compliance_repository = ComplianceRepository(ComplianceRequest)
