from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogCreate, AuditLogBase

class AuditLogRepository(BaseRepository[AuditLog, AuditLogCreate, AuditLogBase]):
    def get_by_target(self, db: Session, target_type: str, target_id: int):
        return db.query(self.model).filter(
            self.model.target_type == target_type, 
            self.model.target_id == target_id
        ).all()

audit_log_repository = AuditLogRepository(AuditLog)
