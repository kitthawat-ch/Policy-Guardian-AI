from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.database.connection import get_db
from app.services.compliance_service import ComplianceService
from app.services.ticket_service import TicketService
from app.schemas.ticket import TicketCreate

router = APIRouter(prefix="/compliance", tags=["Compliance"])

class ExpenseRequest(BaseModel):
    employee_id: str
    expense_type: str
    amount: float
    currency: str
    description: str

class ExpenseResponse(BaseModel):
    status: str
    reason: str
    triggered_rules: list[str]
    ticket_id: str | None = None

@router.post("/evaluate", response_model=ExpenseResponse)
def evaluate_expense(request: ExpenseRequest, db: Session = Depends(get_db)):
    comp_service = ComplianceService()
    ticket_service = TicketService(db)
    
    result = comp_service.validate_expense(
        request.employee_id, request.expense_type, request.amount, request.currency, request.description
    )
    
    ticket_id = None
    if result["status"] == "REQUIRES_REVIEW":
        ticket_data = TicketCreate(
            id=f"TKT-{uuid.uuid4().hex[:8].upper()}",
            employee_id=request.employee_id,
            request_type=request.expense_type,
            assigned_queue="GENERAL_REVIEW",
            agent_summary=result["reason"],
            details=request.model_dump()
        )
        ticket = ticket_service.create_ticket(ticket_data)
        ticket_id = ticket.id
        
    return ExpenseResponse(
        status=result["status"],
        reason=result["reason"],
        triggered_rules=result["triggered_rules"],
        ticket_id=ticket_id
    )
