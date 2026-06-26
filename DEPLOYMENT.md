# Deployment Guide

This guide covers how to deploy the MVP for local demonstration and evaluation.

## Prerequisites
- Node.js (v20+)
- Python (v3.12+)
- A valid Google Gemini API Key

## 1. Environment Setup

### Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Capstone-Project/backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. You can configure your API key through the web interface (Settings page) once the app is running. Alternatively, create a `.env` file manually:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd Capstone-Project/frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```

## 2. Running the Application

### Start the Backend Server
From the `backend` directory with your venv activated:
```bash
uvicorn app.main:app --reload --port 8000
```
The API and WebSocket server will be available at `http://localhost:8000`. 

### Start the Frontend Server
From the `frontend` directory:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## 3. Usage
1. **Chat**: Navigate to `http://localhost:3000/ask-policy` to chat with the Gemini Agent.
2. **Submit Request**: Navigate to `http://localhost:3000/evaluate` to submit a mock compliance validation request.
3. **Review Queue**: Navigate to `http://localhost:3000/reviewer` to test the Human-in-the-Loop queue management (with real-time WebSocket updates).
4. **Agent Skills**: Navigate to `http://localhost:3000/skills` to manage the dynamic skill configurations (e.g. Data Protection, Device Compliance).
5. **LLM Monitor**: Navigate to `http://localhost:3000/llm-logs` to trace execution and observe LLM metrics.
6. **Evaluation**: Navigate to `http://localhost:3000/evaluation` to view AI performance metrics (RAG Evaluation).
7. **Knowledge Base**: Navigate to `http://localhost:3000/knowledge-base` to manage policy documents.
8. **MCP Hub**: Navigate to `http://localhost:3000/mcp-hub` to manage MCP tools and integrations.
9. **Audit Logs**: Navigate to `http://localhost:3000/audit` to view immutable audit logs.
10. **Capstone**: Navigate to `http://localhost:3000/capstone` to view the project presentation showcase.
11. **Settings**: Navigate to `http://localhost:3000/settings` for application settings (API Key management).
12. **Tutorial**: Navigate to `http://localhost:3000/tutorial` for help and usage guides.
