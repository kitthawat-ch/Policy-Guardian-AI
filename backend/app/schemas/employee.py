from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    department: str
    location: str
    manager_id: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    id: str

class EmployeeResponse(EmployeeBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
