from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ComplianceRequest(Base):
    __tablename__ = "compliance_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, nullable=False) # 'pending', 'under_review', 'approved', 'rejected'
    risk_score = Column(Integer, default=0)
    submitted_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    submitter = relationship("User")
    review_tickets = relationship("ReviewTicket", back_populates="compliance_request", cascade="all, delete-orphan")
