# Policy Guardian AI

**AI Agent for Enterprise Policy Intelligence** / **ระบบผู้ช่วยอัจฉริยะสำหรับค้นหา ตีความ และตรวจสอบความสอดคล้องตามระเบียบองค์กร**

An enterprise-grade platform accelerating engineering velocity through an Agentic AI Architecture and strict Human-in-the-Loop workflows. This project is submitted for the **Kaggle 5-Day AI Agents: Intensive Vibe Coding Course with Google** Capstone (Track: Agents for Business).

## Capstone Features
- **Agentic AI Architecture**: System utilizes multiple specialized AI agents (Router, QA, Auditor) working collaboratively to process requests, rather than a single monolithic prompt.
- **Retrieval-Augmented Generation (RAG)**: Implements vector embeddings and semantic search to allow the AI to ground its answers using the uploaded corporate security policies. Zero Hallucination.
- **Dynamic Skills Injection**: Users can dynamically inject rule-based compliance skills (e.g., Device Compliance, Data Protection) into the AI's context at runtime.
- **Prompt Injection Defense**: The system is fortified against prompt injection attacks. It isolates user inputs to prevent malicious commands from bypassing compliance checks.
- **Human-in-the-Loop (HITL)**: High-risk compliance violations trigger an automated ticket system (updated in real-time via WebSockets). AI does not act alone; it requires human review.
- **Transparency & Audit Logging**: Every AI prompt, response, and risk evaluation is logged securely in the database via the LLM Monitor and Audit Logs for continuous evaluation.

## Architecture & Security
- **Model Context Protocol (MCP)**: Formal MCP Server connecting the LLM safely to internal SQLite databases.
- **Data Isolation**: The LLM runs statelessly and never connects to the database directly; it communicates via strict MCP Tool abstractions.

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS, Axios
- **Backend**: FastAPI, SQLAlchemy, SQLite, Python-dotenv, WebSockets
- **AI**: Google Gemini 3.5 Pro & Flash

## Setup Instructions

1. **Clone the repository**
2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   # Windows: .\venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Configuration**: 
   You can configure your `GEMINI_API_KEY` directly through the web UI after starting the system by navigating to `http://localhost:3000/settings`. The system will automatically create and manage the `.env` file for you.
4. **Seed Database** (Ensure you are still in the `backend` folder):
   ```bash
   python seed.py
   python seed_audit_logs.py
   ```
5. **Run Backend**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
6. **Run Frontend**:
   Open a **new terminal** window/tab, then:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
7. Open `http://localhost:3000` and go to **Settings** to set your API Key.
