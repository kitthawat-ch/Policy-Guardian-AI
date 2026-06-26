from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class PolicySectionBase(BaseModel):
    section_number: str
    title: str
    content: str

class PolicySectionCreate(PolicySectionBase):
    pass

class PolicySectionResponse(PolicySectionBase):
    id: int
    policy_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PolicyBase(BaseModel):
    title: str
    version: str
    description: Optional[str] = None
    status: str

class PolicyCreate(PolicyBase):
    created_by: Optional[int] = None
    sections: List[PolicySectionCreate] = []

class PolicyResponse(PolicyBase):
    id: int
    created_by: Optional[int]
    created_at: datetime
    updated_at: datetime
    sections: List[PolicySectionResponse] = []

    class Config:
        from_attributes = True
