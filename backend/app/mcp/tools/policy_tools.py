import logging
from sqlalchemy.orm import Session
from app.repositories.policy_repository import policy_section_repository
from app.models.policy import PolicySection, Policy
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def search_policy(db: Session, query: str, limit: int = 5) -> Dict[str, Any]:
    """
    Searches the compliance policy database for sections matching a given query.
    """
    logger.info(f"Executing search_policy tool. Query: '{query}', limit: {limit}")
    try:
        results = policy_section_repository.search_by_vector(db, query=query, limit=limit)
        
        items = []
        for section in results:
            items.append({
                "section_id": section.id,
                "policy_id": section.policy_id,
                "section_number": section.section_number,
                "title": section.title,
                "snippet": section.content[:150] + "..." if len(section.content) > 150 else section.content
            })
            
        logger.info(f"search_policy returned {len(items)} results.")
        return {"status": "success", "data": items}
        
    except Exception as e:
        logger.error(f"Error in search_policy: {e}")
        return {"status": "error", "message": str(e), "data": []}

def get_policy_section(db: Session, section_id: int) -> Dict[str, Any]:
    """
    Retrieves the complete content of a specific policy section.
    """
    logger.info(f"Executing get_policy_section tool for ID: {section_id}")
    try:
        # Joining policy to get policy title
        section = db.query(PolicySection).join(Policy).filter(PolicySection.id == section_id).first()
        
        if not section:
            logger.warning(f"Policy section ID {section_id} not found.")
            return {"status": "error", "message": f"Policy section {section_id} not found."}
            
        data = {
            "section_id": section.id,
            "policy_id": section.policy_id,
            "policy_title": section.policy.title,
            "section_number": section.section_number,
            "title": section.title,
            "content": section.content
        }
        
        logger.info(f"get_policy_section successful for ID: {section_id}")
        return {"status": "success", "data": data}
        
    except Exception as e:
        logger.error(f"Error in get_policy_section: {e}")
        return {"status": "error", "message": str(e)}
