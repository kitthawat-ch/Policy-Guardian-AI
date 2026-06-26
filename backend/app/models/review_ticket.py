from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ReviewTicket(Base):
    __tablename__ = "review_tickets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    compliance_request_id = Column(Integer, ForeignKey("compliance_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    policy_section_id = Column(Integer, ForeignKey("policy_sections.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String, nullable=False) # 'open', 'resolved', 'flagged'
    findings = Column(Text, nullable=True)
    ai_analysis = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    compliance_request = relationship("ComplianceRequest", back_populates="review_tickets")
    policy_section = relationship("PolicySection")
    reviewer = relationship("User")
