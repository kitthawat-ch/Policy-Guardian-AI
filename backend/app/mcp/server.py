from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.mcp.tools import policy_tools, validation_tools

router = APIRouter()

# MCP Tools Directory
MCP_TOOLS = {
    "search_policy": {
        "description": "Searches the compliance policy database for sections matching a given query.",
        "parameters": {"query": "string", "limit": "integer (optional)"}
    },
    "get_policy_section": {
        "description": "Retrieves the complete content of a specific policy section by ID.",
        "parameters": {"section_id": "integer"}
    },
    "validate_compliance_request": {
        "description": "Validates a project architecture against specific policy sections using AI.",
        "parameters": {"compliance_request_id": "integer", "project_name": "string", "description": "string", "policy_section_ids": "list[int]"}
    }
}

@router.get("/tools")
def list_tools() -> Dict[str, Any]:
    """
    Standard MCP Endpoint: List all available tools.
    """
    return {
        "status": "success",
        "tools": MCP_TOOLS
    }

@router.post("/tools/{tool_name}/execute")
def execute_tool(tool_name: str, params: Dict[str, Any], db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Standard MCP Endpoint: Execute a tool by name.
    """
    if tool_name not in MCP_TOOLS:
        raise HTTPException(status_code=404, detail="Tool not found")
        
    try:
        if tool_name == "search_policy":
            return policy_tools.search_policy(db, query=params.get("query"), limit=params.get("limit", 5))
            
        elif tool_name == "get_policy_section":
            return policy_tools.get_policy_section(db, section_id=params.get("section_id"))
            
        elif tool_name == "validate_compliance_request":
            return validation_tools.validate_compliance_request(
                db, 
                compliance_request_id=params.get("compliance_request_id"),
                project_name=params.get("project_name"),
                description=params.get("description"),
                policy_section_ids=params.get("policy_section_ids", [])
            )
            
        else:
            raise HTTPException(status_code=400, detail="Tool implementation missing")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
