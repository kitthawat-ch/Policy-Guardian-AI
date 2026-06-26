from sqlalchemy.orm import Session
from app.repositories.employee_repo import EmployeeRepository
from app.schemas.employee import EmployeeCreate
import uuid

class EmployeeService:
    def __init__(self, db: Session):
        self.employee_repo = EmployeeRepository(db)

    def get_employee(self, employee_id: str):
        return self.employee_repo.get_by_id(employee_id)

    def create_employee(self, employee_data: EmployeeCreate):
        if not employee_data.id:
            employee_data.id = f"EMP-{uuid.uuid4().hex[:6].upper()}"
        return self.employee_repo.create(employee_data)
