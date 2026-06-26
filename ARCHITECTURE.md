# System Architecture

## High-Level Overview

The application follows the **Clean Architecture** paradigm, ensuring separation of concerns across multiple domain layers. 

```mermaid
graph TD
    UI[Frontend: Next.js & Tailwind] -->|REST API & WebSockets| API[FastAPI Endpoints]
    API --> AS[Agent Service (Agentic AI)]
    API --> RS[Review Ticket Service]
    API --> DS[Document Service]
    API --> AuS[Audit Service]
    API --> MCPE[MCP Server API]
    API --> EVAL[Evaluation & Logs Service]
    
    AS --> RouterA[Router Agent]
    RouterA -->|Routes Information Requests| QAAgent[QA Agent (RAG)]
    RouterA -->|Routes Risk Requests| AudAgent[Auditor Agent]
    
    MCPE --> MCP[MCP Tools Layer]
    QAAgent -->|Tool Calls| MCP
    AudAgent -->|Tool Calls| MCP
    
    MCP --> REPO[Repository Layer]
    RS --> REPO
    DS --> REPO
    AuS --> REPO
    EVAL --> REPO
    
    REPO --> DB[(SQLite Database)]
    
    subgraph "Model Context Protocol (MCP Server)"
    MCP_P[Policy Tools]
    MCP_V[Validation Tools]
    end
    MCP --- MCP_P
    MCP --- MCP_V
```

## Layer Definitions

1. **Frontend (Next.js App Router)**: Responsible purely for presentation. Handles user interactions, visual states, and API consumption across features like Chat, Evaluation, Review, Knowledge Base, MCP Hub, Audit logs, Capstone Showcase, Agent Skills, and LLM Monitor (LLM Logs). Includes Thai localization subtitles.
2. **API Layer (FastAPI)**: Serves as the ingress point. Handles HTTP routing, WebSockets (`/ws/reviewer`) for real-time ticket updates, input validation, and authentication context.
3. **Service Layer**: 
    - **Agent Service**: Orchestrates the **Agentic AI Architecture** using a Multi-Agent pattern to prevent Context Bloat.
    - **Review Ticket Service**: Enforces deterministic **Human-in-the-Loop (HITL)** workflows.
    - **Document Service**: Manages the knowledge base for the **Retrieval-Augmented Generation (RAG)** system.
    - **Audit Service**: Handles recording of immutable logs for **Transparency & Audit Logging**.
4. **Evaluation / Skills Layer (ADK Agents)**: 
    - **QA Agent**: Utilizes **RAG** semantic search via Embeddings to answer policy questions.
    - **Auditor Agent**: Uses **Dynamic Skills Injection** and strictly enforces **Prompt Injection Defense** to evaluate high-risk tasks.
5. **MCP Layer (MCP Server API)**: The deterministic "Source of Truth" exposed natively over the `/api/mcp/tools` endpoint, strictly enforcing the **Model Context Protocol (MCP)**.
6. **Repository Layer**: Abstraction over SQLAlchemy. Prevents upper layers from executing raw SQL.
7. **Database**: SQLite (upgradeable to PostgreSQL). Stores Users, Policies, Requests, Tickets, Documents, Audit Logs, LLM Logs, and RAG Evaluations.

## Security Architecture
- **Data Isolation**: The LLM runs statelessly. It never connects to the database directly; it only communicates via MCP Tool abstractions.
- **Auditability**: Every automated LLM and Human-in-the-Loop action writes immutably to the `audit_logs` and `llm_logs` tables.
