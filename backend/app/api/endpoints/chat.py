from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any
import threading

from app.core.database import get_db, SessionLocal
from app.services.agent_service import AgentService
from app.services.rag_evaluator import rag_evaluator

router = APIRouter()

class AskPolicyRequest(BaseModel):
    question: str
    messages: list[Dict[str, str]] = []  # For chat history: [{"role": "user", "content": "..."}]
    user_id: int
    active_skills: list[str] = []

@router.post("/ask-policy")
def ask_policy(payload: AskPolicyRequest, db: Session = Depends(get_db)):
    """Handles natural language policy questions."""
    agent = AgentService(db)
    
    try:
        # Auto-routing enabled: AI will decide if it's Information or High Risk
        result = agent.process_request(user_id=payload.user_id, request_text=payload.question, active_skills=payload.active_skills)
        
        # Format for the frontend
        sources = []
        for trace in result.get("traces", []):
            if trace["step"] == "Process MCP Response" and "section_response" in trace["details"]:
                data = trace["details"]["section_response"]["data"]
                sources.append({
                    "title": data["policy_title"],
                    "section_number": data["section_number"],
                    "policy_section_id": data["section_id"],
                    "content": data.get("content", ""),
                })

        answer = result.get("answer", "I could not generate an answer.")
        req_type = result.get("type", "Information Request")

        request_id = None
        for trace in result.get("traces", []):
            if trace["step"] == "Create Request":
                request_id = trace["details"].get("request_id")

        # ── RAG Evaluation (fire-and-forget in background thread) ──────────
        def _run_eval():
            eval_db = SessionLocal()
            try:
                rag_evaluator.evaluate_and_store(
                    db=eval_db,
                    query=payload.question,
                    answer=answer,
                    sources=sources,
                )
            finally:
                eval_db.close()

        threading.Thread(target=_run_eval, daemon=True).start()
        # ──────────────────────────────────────────────────────────────────

        # Strip internal content field before returning to client
        client_sources = [
            {k: v for k, v in s.items() if k != "content"}
            for s in sources
        ]

        return {
            "answer": answer,
            "sources": client_sources,
            "request_id": request_id,
            "type": req_type,
            "traces": result.get("traces", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import StreamingResponse
import json

@router.post("/ask-policy-stream")
def ask_policy_stream(payload: AskPolicyRequest, db: Session = Depends(get_db)):
    """Handles streaming natural language policy questions."""
    agent = AgentService(db)
    
    try:
        result = agent.process_request(
            user_id=payload.user_id, 
            request_text=payload.question, 
            active_skills=payload.active_skills,
            messages=payload.messages
        )
        
        sources = []
        for trace in result.get("traces", []):
            if trace["step"] == "Process MCP Response" and "section_response" in trace["details"]:
                data = trace["details"]["section_response"]["data"]
                sources.append({
                    "title": data["policy_title"],
                    "section_number": data["section_number"],
                    "policy_section_id": data["section_id"],
                    "content": data.get("content", ""),
                })

        req_type = result.get("type", "Information Request")
        request_id = None
        for trace in result.get("traces", []):
            if trace["step"] == "Create Request":
                request_id = trace["details"].get("request_id")

        client_sources = [
            {k: v for k, v in s.items() if k != "content"}
            for s in sources
        ]
        
        def generate():
            # Send initial metadata
            metadata = {
                "type": "metadata",
                "data": {
                    "sources": client_sources,
                    "request_id": request_id,
                    "req_type": req_type,
                    "traces": result.get("traces", [])
                }
            }
            yield f"data: {json.dumps(metadata)}\n\n"
            
            final_answer = result.get("answer")
            full_answer = ""
            if isinstance(final_answer, type((x for x in []))):
                for chunk in final_answer:
                    full_answer += chunk
                    chunk_data = {
                        "type": "chunk",
                        "data": chunk
                    }
                    yield f"data: {json.dumps(chunk_data)}\n\n"
            else:
                full_answer = final_answer
                chunk_data = {
                    "type": "chunk",
                    "data": final_answer
                }
                yield f"data: {json.dumps(chunk_data)}\n\n"

            # Finalize with RAG Evaluation (fire-and-forget)
            def _run_eval():
                eval_db = SessionLocal()
                try:
                    rag_evaluator.evaluate_and_store(
                        db=eval_db,
                        query=payload.question,
                        answer=full_answer,
                        sources=sources,
                    )
                finally:
                    eval_db.close()
            threading.Thread(target=_run_eval, daemon=True).start()

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
