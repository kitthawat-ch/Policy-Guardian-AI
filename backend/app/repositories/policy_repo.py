from sqlalchemy.orm import Session
from app.database.models import PolicyDocument
from app.schemas.policy import PolicyCreate
from typing import List, Optional

class PolicyRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, policy_id: str) -> Optional[PolicyDocument]:
        return self.db.query(PolicyDocument).filter(PolicyDocument.id == policy_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[PolicyDocument]:
        return self.db.query(PolicyDocument).offset(skip).limit(limit).all()

    def create(self, policy: PolicyCreate) -> PolicyDocument:
        db_policy = PolicyDocument(
            id=policy.id,
            title=policy.title,
            category=policy.category,
            content=policy.content,
            version=policy.version,
            is_active=policy.is_active
        )
        self.db.add(db_policy)
        self.db.commit()
        self.db.refresh(db_policy)
        return db_policy
