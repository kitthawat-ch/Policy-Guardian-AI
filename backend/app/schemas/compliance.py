from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ComplianceRequestBase(BaseModel):
    project_name: str
    description: Optional[str] = None
    status: str = "pending"
    risk_score: int = 0

class ComplianceRequestCreate(ComplianceRequestBase):
    submitted_by: int

class ComplianceRequestResponse(ComplianceRequestBase):
    id: int
    submitted_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
