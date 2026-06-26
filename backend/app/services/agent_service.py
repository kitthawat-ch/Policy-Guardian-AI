import logging
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.mcp.tools import policy_tools, validation_tools
from app.models.compliance import ComplianceRequest
from app.repositories.compliance_repository import compliance_repository

# ADK Multi-agent imports
from app.agents.router_agent import RouterAgent
from app.agents.qa_agent import QAAgent
from app.agents.auditor_agent import AuditorAgent

logger = logging.getLogger(__name__)

class AgentService:
    """
    Agent Service orchestrator using a Multi-Agent system (ADK).
    """

    def __init__(self, db: Session):
        self.db = db
        self.traces = []
        # Instantiate Specialized Agents
        self.router = RouterAgent()
        self.qa_agent = QAAgent()
        self.auditor = AuditorAgent()

    def _add_trace(self, step: str, details: Any):
        """Records an execution trace for debugging."""
        trace_record = {"step": step, "details": details}
        self.traces.append(trace_record)
        logger.info(f"TRACE: [{step}] {details}")

    def determine_request_type(self, request_text: str) -> str:
        """
        Mock intent classification.
        """
        text_lower = request_text.lower()
        if "?" in text_lower or "what is" in text_lower or "how to" in text_lower:
            return "Information Request"
        elif any(word in text_lower for word in ["production", "pii", "finance", "migration", "critical"]):
            return "High Risk Request"
        else:
            return "Low Risk Request"

    def process_request(self, user_id: int, request_text: str, project_name: str = "Query", force_info_flow: bool = False, active_skills: list[str] = None, messages: list[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Main entry point to handle a user request using Multi-Agent orchestration.
        """
        self.traces.clear()
        self._add_trace("Receive Request", {"user_id": user_id, "text": request_text})

        req_type = "Information Request"
        search_query = request_text
        requires_val = False
        
        # Ensure messages is initialized
        if not messages:
            messages = [{"role": "user", "content": request_text}]

        if force_info_flow:
            self._add_trace("LLM Action [RouterAgent]", {"task": "Understand Request & Select Tools (Forced Info Flow)"})
            try:
                eval_result = self.router.route_request(messages)
                req_type = "Information Request"
                search_query = eval_result.get("search_query", request_text)
                requires_val = False
                self._add_trace("Determine Type (Forced)", {"request_type": req_type, "reasoning": eval_result.get("reasoning")})
                self._add_trace("Tool Selection Reasoning", {"extracted_query": search_query})
            except Exception as e:
                logger.warning(f"Failed to call router (using fallback): {e}")
                self._add_trace("LLM Warning", {"message": "API unavailable or quota exceeded. Falling back to database keyword search."})
                search_query = request_text
        else:
            # 1. Determine Request Type using Router Agent
            self._add_trace("LLM Action [RouterAgent]", {"task": "Understand Request & Route to appropriate agent"})
            eval_result = self.router.route_request(messages)
            
            req_type = eval_result.get("request_type", "High Risk Request")
            search_query = eval_result.get("search_query", "cloud security")
            requires_val = eval_result.get("requires_validation", True)
            
            self._add_trace("Determine Type", {"request_type": req_type, "reasoning": eval_result.get("reasoning")})
            self._add_trace("Tool Selection Reasoning", {"extracted_query": search_query})

        # 2. Process via Specialized Agents
        # For streaming, we will return a generator or a special response, but we need to rethink this.
        # Actually, if we return a dictionary with answer as a generator, `chat.py` can't serialize it.
        # So we might need a separate method for streaming `process_request_stream`.
        
        final_answer = ""
        
        if req_type == "Information Request" and not requires_val:
            final_answer = self._handle_information_request(request_text, search_query, active_skills, messages)
        else:
            final_answer = self._handle_project_validation(user_id, project_name, request_text, req_type, search_query, active_skills)

        self._add_trace("Generate Answer", {"final_answer": "Streamed response" if isinstance(final_answer, type((x for x in []))) else final_answer})

        return {
            "type": req_type,
            "answer": final_answer, # Can be a generator now
            "traces": self.traces,
            "search_query": search_query
        }

    def _handle_information_request(self, request_text: str, search_query: str, active_skills: list[str] = None, messages: list[Dict[str, str]] = None):
        """Handles searching the policy database and routing to QA Agent."""
        self._add_trace("Select Tool", {"tool": "search_policy", "query": search_query})
        search_res = policy_tools.search_policy(self.db, query=search_query, limit=3)
        
        self._add_trace("Process MCP Response", {"search_response": search_res})
        
        context_data = []
        if search_res["status"] == "success" and search_res["data"]:
            for item in search_res["data"]:
                section_id = item["section_id"]
                self._add_trace("Select Tool", {"tool": "get_policy_section", "section_id": section_id})
                section_res = policy_tools.get_policy_section(self.db, section_id)
                
                if section_res["status"] == "success":
                    context_data.append(section_res["data"])
                    self._add_trace("Process MCP Response", {"section_response": section_res})

        self._add_trace("LLM Action [QAAgent]", {"task": "Generate Response with Citations", "context_size": len(context_data)})
        
        # Generate final response with QA Agent as a stream generator
        return self.qa_agent.generate_final_response_stream(messages, context_data, active_skills)

    def _handle_project_validation(self, user_id: int, project_name: str, description: str, req_type: str, search_query: str, active_skills: list[str] = None) -> str:
        """Handles validating a compliance request routing to Auditor Agent (via MCP validation tools)."""
        # Save the request in DB first
        from app.schemas.compliance import ComplianceRequestCreate
        req_in = ComplianceRequestCreate(project_name=project_name, description=description, status="pending", submitted_by=user_id)
        db_request = compliance_repository.create(self.db, obj_in=req_in)
        
        self._add_trace("Create Request", {"request_id": db_request.id})

        search_res = policy_tools.search_policy(self.db, query=search_query, limit=2)
        policy_ids = [item["section_id"] for item in search_res.get("data", [])]
        if not policy_ids:
            policy_ids = [1, 2]

        self._add_trace("Select Tool", {"tool": "validate_compliance_request", "policy_ids": policy_ids})
        # Note: validation_tools internally calls the AuditorAgent now (or we can inject it).
        # We will assume validation_tools currently uses the old GeminiEvaluator. Let's fix that next!
        val_res = validation_tools.validate_compliance_request(self.db, db_request.id, project_name, description, policy_ids, active_skills)
        self._add_trace("Process MCP Response", {"validation_response": val_res})

        if val_res["status"] == "success":
            data = val_res["data"]
            is_compliant = data["is_compliant"]
            
            # Extract highest risk score and AI analysis
            max_risk_score = 0
            dynamic_summary = ""
            for finding in data["findings"]:
                if finding.get("risk_score", 0) > max_risk_score:
                    max_risk_score = finding.get("risk_score", 0)
                    dynamic_summary = finding.get("ai_analysis", "")
                    
            risk_score = max_risk_score if max_risk_score > 0 else 20
                
            db_request.risk_score = risk_score
            self.db.commit()
            
            self._add_trace("Risk Assessment", {"risk_score": risk_score})

            # Apply Risk Rules
            if risk_score < 50:
                db_request.status = "approved"
                self.db.commit()
                return dynamic_summary if dynamic_summary else "Risk Score is low. Your project meets all policies and has been Auto Approved."
                
            elif 50 <= risk_score <= 80:
                self._add_trace("Action", {"reason": "Risk Score 50-80. Recommending approval but requires human review."})
                for finding in data["findings"]:
                    validation_tools.create_human_review_ticket(
                        self.db, 
                        compliance_request_id=db_request.id, 
                        policy_section_id=finding["policy_section_id"], 
                        ai_analysis=finding["ai_analysis"] + " [AI Recommendation: Approve]"
                    )
                db_request.status = "under_review"
                self.db.commit()
                return dynamic_summary if dynamic_summary else "Recommend Approval but pending human review."
                
            else: # > 80
                self._add_trace("Action", {"reason": "Risk Score > 80. Strict Human Review Required."})
                for finding in data["findings"]:
                    if finding["violation_detected"]:
                        validation_tools.create_human_review_ticket(
                            self.db, 
                            compliance_request_id=db_request.id, 
                            policy_section_id=finding["policy_section_id"], 
                            ai_analysis=finding["ai_analysis"] + " [AI Recommendation: Human Review Required]"
                        )
                db_request.status = "under_review"
                self.db.commit()
                return dynamic_summary if dynamic_summary else "High Risk. Human Review Required."
                
        return "An error occurred while validating your project."
