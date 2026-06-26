import pytest
from app.mcp.tools.validation_tools import validate_compliance_request, create_human_review_ticket
from app.models.policy import Policy, PolicySection
from app.models.compliance import ComplianceRequest
from app.models.user import User

def seed_data(db):
    user = User(username="dev", email="dev@test.com", role="submitter")
    db.add(user)
    db.commit()

    policy = Policy(title="Cloud Policy", version="1.0", status="active", created_by=user.id)
    db.add(policy)
    db.commit()

    section1 = PolicySection(policy_id=policy.id, section_number="1.1", title="Cloud Storage", content="No public cloud storage allowed. Must use internal servers.")
    section2 = PolicySection(policy_id=policy.id, section_number="1.2", title="Data Locality", content="Data locality is required for European user data.")
    db.add_all([section1, section2])
    db.commit()
    
    request = ComplianceRequest(project_name="AWS Migration", description="Migrating European user data to AWS RDS unencrypted.", status="pending", submitted_by=user.id)
    db.add(request)
    db.commit()

    return section1, section2, request

def test_validate_compliance_request_violation(db_session):
    section1, section2, request = seed_data(db_session)
    
    # Description contains "aws", "european user", "unencrypted"
    result = validate_compliance_request(
        db_session,
        compliance_request_id=request.id,
        project_name=request.project_name,
        description=request.description,
        policy_section_ids=[section1.id, section2.id]
    )
    
    assert result["status"] == "success"
    assert result["data"]["is_compliant"] is False
    assert len(result["data"]["findings"]) == 2
    
    violations = [f for f in result["data"]["findings"] if f["violation_detected"]]
    assert len(violations) > 0

def test_validate_compliance_request_compliant(db_session):
    section1, section2, request = seed_data(db_session)
    
    result = validate_compliance_request(
        db_session,
        compliance_request_id=request.id,
        project_name="Internal App",
        description="Using internal on-premise servers for standard operations.",
        policy_section_ids=[section1.id, section2.id]
    )
    
    assert result["status"] == "success"
    assert result["data"]["is_compliant"] is True

def test_create_human_review_ticket_success(db_session):
    section1, section2, request = seed_data(db_session)
    
    result = create_human_review_ticket(
        db_session,
        compliance_request_id=request.id,
        policy_section_id=section1.id,
        ai_analysis="Violation found"
    )
    
    assert result["status"] == "success"
    assert result["success"] is True
    assert result["ticket_id"] is not None
    assert result["ticket_status"] == "open"
