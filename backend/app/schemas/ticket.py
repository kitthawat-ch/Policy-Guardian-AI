from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TicketBase(BaseModel):
    employee_id: str
    request_type: str
    assigned_queue: str
    agent_summary: str
    details: Optional[Dict[str, Any]] = None
    citations: Optional[List[str]] = None

class TicketCreate(TicketBase):
    id: str

class TicketUpdate(BaseModel):
    status: str

class TicketResponse(TicketBase):
    id: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
