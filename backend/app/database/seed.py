import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.database.connection import SessionLocal, engine
from app.database import models

# Create tables
models.Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()

    # Check if we already seeded
    if db.query(models.Employee).first():
        print("Database already seeded!")
        db.close()
        return

    print("Seeding Employees...")
    emp1 = models.Employee(
        id="EMP-001",
        name="Alice Smith",
        email="alice.smith@example.com",
        role="Sales Representative",
        department="Sales",
        location="New York",
        manager_id="MGR-001"
    )
    emp2 = models.Employee(
        id="REV-001",
        name="Bob Reviewer",
        email="bob.reviewer@example.com",
        role="Compliance Officer",
        department="Compliance",
        location="Headquarters"
    )
    db.add_all([emp1, emp2])

    print("Seeding Policy Documents...")
    pol1 = models.PolicyDocument(
        id="POL-TRV-042",
        title="Client Entertainment Meals",
        category="MEALS",
        content="For client dinners in Tier 1 cities (including New York), the maximum allowable expense is $150 per person including tax and tip."
    )
    pol2 = models.PolicyDocument(
        id="POL-HR-12",
        title="Home Office Equipment",
        category="EQUIPMENT",
        content="Employees are allowed to expense up to $250 for home office equipment (monitors, chairs) per calendar year without prior approval."
    )
    db.add_all([pol1, pol2])

    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
