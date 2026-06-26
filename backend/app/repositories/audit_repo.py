from sqlalchemy.orm import Session
from app.database.models import AuditLog
from app.schemas.audit import AuditLogCreate
from typing import List

class AuditRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        return self.db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

    def create(self, log: AuditLogCreate) -> AuditLog:
        db_log = AuditLog(
            user_id=log.user_id,
            action=log.action,
            target_id=log.target_id,
            details=log.details
        )
        self.db.add(db_log)
        self.db.commit()
        self.db.refresh(db_log)
        return db_log
