import os
from sqlalchemy.orm import Session
from app.core.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.policy import Policy, PolicySection
from app.models.compliance import ComplianceRequest
from app.models.review_ticket import ReviewTicket

def seed_db():
    # 1. Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # 2. Check if already seeded
        if db.query(User).first():
            print("Database already seeded. Skipping...")
            return

        print("Seeding database with mock data...")

        # 3. Create Users
        u1 = User(id=1, email="engineer@corp.com", username="alice_engineer", role="submitter")
        u2 = User(id=2, email="compliance@corp.com", username="bob_compliance", role="reviewer")
        db.add(u1)
        db.add(u2)
        
        # 4. Create Policies
        p1 = Policy(title="Data Classification and Storage Policy", version="1.0", status="active", created_by=u2.id)
        p2 = Policy(title="Cloud Architecture Security Standards", version="2.1", status="active", created_by=u2.id)
        db.add(p1)
        db.add(p2)
        db.commit() # commit to get IDs
        
        # 5. Create Policy Sections
        s1 = PolicySection(
            policy_id=p1.id, 
            section_number="1.1", 
            title="Public Cloud Storage", 
            content="Customer PII must NEVER be stored in unencrypted public cloud storage buckets. All data at rest must use AES-256."
        )
        s2 = PolicySection(
            policy_id=p2.id, 
            section_number="3.2", 
            title="Cloud Migrations", 
            content="Any cloud migration involving financial data must be explicitly approved by the security board. Standard cloud data is allowed if properly isolated."
        )
        db.add(s1)
        db.add(s2)
        
        db.commit()
        print("Successfully seeded Users and Policies.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
