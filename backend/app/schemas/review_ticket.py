from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReviewTicketBase(BaseModel):
    compliance_request_id: int
    policy_section_id: int
    reviewer_id: Optional[int] = None
    status: str = "open"
    findings: Optional[str] = None
    ai_analysis: Optional[str] = None

class ReviewTicketCreate(ReviewTicketBase):
    pass

class ReviewTicketResponse(ReviewTicketBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReviewTicketApprove(BaseModel):
    reviewer_id: int
    findings: Optional[str] = None

class ReviewTicketReject(BaseModel):
    reviewer_id: int
    findings: str
