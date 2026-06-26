from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import engine, Base
from app.api.endpoints import chat, validation, tickets, evaluation, audit, documents, llm_logs
from app.mcp import server as mcp_server
from app.models import rag_evaluation, llm_log  # noqa: F401 — registers table with Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Policy Guardian AI",
    description="AI Agent for Enterprise Policy Intelligence / ระบบผู้ช่วยอัจฉริยะสำหรับค้นหา ตีความ และตรวจสอบความสอดคล้องตามระเบียบองค์กร",
    version="1.0.0"
)

# Allow React frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chat.router, prefix="/api")
app.include_router(validation.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(evaluation.router, prefix="/api/evaluation")
app.include_router(audit.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(llm_logs.router, prefix="/api")
app.include_router(mcp_server.router, prefix="/api/mcp", tags=["mcp"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend MVP is running correctly."}

from fastapi import WebSocket, WebSocketDisconnect
from app.api.websockets import manager

@app.websocket("/ws/reviewer")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We just need to keep the connection open to send messages
            # Client doesn't need to send anything, but we need to receive to detect disconnects
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
