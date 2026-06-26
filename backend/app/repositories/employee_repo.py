from sqlalchemy.orm import Session
from app.database.models import Employee
from app.schemas.employee import EmployeeCreate
from typing import List, Optional

class EmployeeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, employee_id: str) -> Optional[Employee]:
        return self.db.query(Employee).filter(Employee.id == employee_id).first()

    def create(self, employee: EmployeeCreate) -> Employee:
        db_employee = Employee(
            id=employee.id,
            name=employee.name,
            email=employee.email,
            role=employee.role,
            department=employee.department,
            location=employee.location,
            manager_id=employee.manager_id
        )
        self.db.add(db_employee)
        self.db.commit()
        self.db.refresh(db_employee)
        return db_employee
