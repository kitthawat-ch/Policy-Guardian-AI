import sys
import os
from datetime import datetime, timedelta

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.models.compliance import ComplianceRequest
from app.models.review_ticket import ReviewTicket
from app.models.audit_log import AuditLog
from app.models.user import User

def seed_audit_data():
    db = SessionLocal()
    try:
        # Check if already has audit logs to avoid duplicate seeding
        if db.query(AuditLog).first():
            print("Audit logs already seeded. Skipping...")
            return
            
        print("Seeding compliance requests, review tickets, and audit logs...")
        
        # 1. Fetch Users
        alice = db.query(User).filter(User.username == "alice_engineer").first()
        bob = db.query(User).filter(User.username == "bob_compliance").first()
        
        if not alice or not bob:
            print("Error: Run seed.py first to seed users!")
            return
            
        # 2. Add Compliance Requests
        req1 = ComplianceRequest(
            project_name="AWS Cloud File Storage Migration",
            description="Migrating standard application static assets and logs to encrypted AWS S3 buckets. All traffic is over HTTPS, and default encryption uses AWS KMS (SSE-KMS) with AES-256.",
            status="approved",
            submitted_by=alice.id,
            risk_score=30
        )
        req2 = ComplianceRequest(
            project_name="Financial Transaction Processing DB v2",
            description="Moving core transactional ledger data containing payment details and customer identifiers to Azure SQL. We are using transparent data encryption (TDE), but the connection strings are currently stored in standard configuration files.",
            status="under_review",
            submitted_by=alice.id,
            risk_score=65
        )
        req3 = ComplianceRequest(
            project_name="Public HR Staff Dashboard",
            description="Developing a web dashboard to display organizational staff directory. The dashboard will store salary data, social security numbers (SSN), and phone numbers on a publicly accessible Firebase DB.",
            status="under_review",
            submitted_by=alice.id,
            risk_score=92
        )
        
        db.add_all([req1, req2, req3])
        db.commit() # commit to get IDs
        
        # 3. Add Human Review Tickets
        ticket1 = ReviewTicket(
            compliance_request_id=req2.id,
            policy_section_id=2, # Section 3.2 Cloud Migrations
            status="resolved",
            reviewer_id=bob.id,
            findings="Approved after review. Developer agreed to move database connection credentials to Azure Key Vault instead of plaintext configuration files.",
            ai_analysis="Risk Score is 65. Recommending approval but plaintext connection configurations present a medium risk. [AI Recommendation: Approve with mitigations]"
        )
        ticket2 = ReviewTicket(
            compliance_request_id=req3.id,
            policy_section_id=1, # Section 1.1 Public Cloud Storage
            status="open",
            findings=None,
            ai_analysis="Risk Score is 92. High risk violation detected. Storing customer SSN and salaries in unencrypted public cloud storage is strictly forbidden. [AI Recommendation: Reject]"
        )
        db.add_all([ticket1, ticket2])
        db.commit() # commit to get IDs
        
        # Update request 2 status to approved since the ticket is resolved
        req2.status = "approved"
        db.commit()
        
        # 4. Add Audit Logs
        # Log 1: Submission of Req 1 (3 days ago)
        log1 = AuditLog(
            user_id=alice.id,
            action="COMPLIANCE_CHECK_SUBMITTED",
            target_type="compliance_request",
            target_id=req1.id,
            details=f"Alice Engineer submitted compliance request for project '{req1.project_name}'.",
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        # Log 2: Auto approval of Req 1 (3 days ago)
        log2 = AuditLog(
            user_id=None, # System action
            action="AUTO_APPROVED",
            target_type="compliance_request",
            target_id=req1.id,
            details=f"Compliance check completed. Risk score: 30. Auto approved under standard policy rules.",
            created_at=datetime.utcnow() - timedelta(days=3) + timedelta(minutes=2)
        )
        
        # Log 3: Submission of Req 2 (2 days ago)
        log3 = AuditLog(
            user_id=alice.id,
            action="COMPLIANCE_CHECK_SUBMITTED",
            target_type="compliance_request",
            target_id=req2.id,
            details=f"Alice Engineer submitted compliance request for project '{req2.project_name}'.",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        # Log 4: System flagged Req 2 (2 days ago)
        log4 = AuditLog(
            user_id=None, # System action
            action="REVIEW_TICKET_CREATED",
            target_type="review_ticket",
            target_id=ticket1.id,
            details=f"AI risk assessment returned score 65. Compliance ticket created. Plaintext connection strings flag resolved by Sec Board review.",
            created_at=datetime.utcnow() - timedelta(days=2) + timedelta(seconds=30)
        )
        # Log 5: Bob approved Req 2 (1 day ago)
        log5 = AuditLog(
            user_id=bob.id,
            action="REVIEW_TICKET_APPROVED",
            target_type="review_ticket",
            target_id=ticket1.id,
            details=f"Bob Compliance manually approved ticket. Action findings: {ticket1.findings}",
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        
        # Log 6: Submission of Req 3 (4 hours ago)
        log6 = AuditLog(
            user_id=alice.id,
            action="COMPLIANCE_CHECK_SUBMITTED",
            target_type="compliance_request",
            target_id=req3.id,
            details=f"Alice Engineer submitted compliance request for project '{req3.project_name}'.",
            created_at=datetime.utcnow() - timedelta(hours=4)
        )
        # Log 7: System flagged Req 3 (4 hours ago)
        log7 = AuditLog(
            user_id=None, # System action
            action="REVIEW_TICKET_CREATED",
            target_type="review_ticket",
            target_id=ticket2.id,
            details=f"System flagged SSN and Salary exposure in public Firebase DB. Risk Score: 92. Strict human review ticket created.",
            created_at=datetime.utcnow() - timedelta(hours=4) + timedelta(seconds=15)
        )
        
        db.add_all([log1, log2, log3, log4, log5, log6, log7])
        db.commit()
        print("Database seeded with compliance history and audit logs successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data_already = seed_audit_data()
