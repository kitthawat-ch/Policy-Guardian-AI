import pytest
from app.mcp.tools.policy_tools import search_policy, get_policy_section
from app.models.policy import Policy, PolicySection
from app.models.user import User

def seed_data(db):
    user = User(username="admin", email="admin@test.com", role="admin")
    db.add(user)
    db.commit()

    policy = Policy(title="Data Protection", version="1.0", status="active", created_by=user.id)
    db.add(policy)
    db.commit()

    section1 = PolicySection(policy_id=policy.id, section_number="1.1", title="Encryption", content="All data must be encrypted.")
    section2 = PolicySection(policy_id=policy.id, section_number="1.2", title="Public Cloud", content="No public cloud allowed.")
    db.add_all([section1, section2])
    db.commit()
    return policy, section1, section2

def test_search_policy_success(db_session):
    seed_data(db_session)
    result = search_policy(db_session, query="encrypted")
    
    assert result["status"] == "success"
    assert len(result["data"]) == 1
    assert result["data"][0]["title"] == "Encryption"
    assert "encrypted" in result["data"][0]["snippet"]

def test_search_policy_empty(db_session):
    seed_data(db_session)
    result = search_policy(db_session, query="nonexistent")
    
    assert result["status"] == "success"
    assert len(result["data"]) == 0

def test_get_policy_section_success(db_session):
    _, section1, _ = seed_data(db_session)
    result = get_policy_section(db_session, section_id=section1.id)
    
    assert result["status"] == "success"
    assert result["data"]["section_id"] == section1.id
    assert result["data"]["title"] == "Encryption"
    assert result["data"]["policy_title"] == "Data Protection"

def test_get_policy_section_not_found(db_session):
    result = get_policy_section(db_session, section_id=999)
    assert result["status"] == "error"
    assert "not found" in result["message"]
