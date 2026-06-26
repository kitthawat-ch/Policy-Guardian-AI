from sqlalchemy.orm import Session
from app.repositories.policy_repo import PolicyRepository
from app.schemas.policy import PolicyCreate
import uuid

class PolicyService:
    def __init__(self, db: Session):
        self.policy_repo = PolicyRepository(db)

    def create_policy(self, policy_data: PolicyCreate):
        if not policy_data.id:
            policy_data.id = f"POL-{uuid.uuid4().hex[:6].upper()}"
        return self.policy_repo.create(policy_data)

    def get_policy(self, policy_id: str):
        return self.policy_repo.get_by_id(policy_id)

    def list_policies(self, skip: int = 0, limit: int = 100):
        return self.policy_repo.get_all(skip, limit)

    def search_policies(self, query: str, limit: int = 5):
        # Mock Vector Search implementation
        policies = self.list_policies(0, 100)
        results = []
        for p in policies:
            if query.lower() in p.content.lower() or query.lower() in p.title.lower():
                results.append(p)
                if len(results) >= limit:
                    break
        return results
