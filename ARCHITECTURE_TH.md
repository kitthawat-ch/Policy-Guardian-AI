# สถาปัตยกรรมระบบ (System Architecture)

## ภาพรวมระบบ (High-Level Overview)

ระบบนี้ใช้โครงสร้างแบบ **Clean Architecture** เพื่อแยกส่วนการทำงานต่างๆ อย่างชัดเจน

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

## คำอธิบายแต่ละส่วน (Layer Definitions)

1. **ส่วนหน้าบ้าน (Frontend - Next.js App Router)**: จัดการการแสดงผลแบบโต้ตอบ รองรับหน้าจอแสดงผลหลายรูปแบบ ได้แก่ Ask Policy AI, Evaluate, Reviewer Queue, Knowledge Base, MCP Hub, Audit Logs, Capstone Showcase, Agent Skills, LLM Monitor (LLM Logs) พร้อมคำบรรยายภาษาไทย
2. **ส่วน API (FastAPI)**: จุดรับส่งข้อมูลหลัก รองรับการเชื่อมต่อแบบ HTTP และ WebSockets (`/ws/reviewer`) เพื่ออัปเดตสถานะตั๋วแบบเรียลไทม์
3. **ส่วนบริการจัดการ (Service Layer)**: 
    - **Agent Service**: หัวใจหลักของ **สถาปัตยกรรมปัญญาประดิษฐ์แบบ Agentic** ทำหน้าที่วิเคราะห์และแบ่งงานให้ AI Agent ย่อย
    - **Review Ticket Service**: ระบบจัดการ **การอนุมัติโดยมนุษย์ (HITL)**
    - **Document Service**: จัดการเนื้อหาของ **ระบบค้นหาและดึงข้อมูลอัจฉริยะ (RAG)**
    - **Audit Service**: จัดการบันทึก **ความโปร่งใสและระบบตรวจสอบย้อนหลัง (Audit Logs)**
4. **ส่วนประเมินผลและทักษะของ AI (Evaluation / Skills Layer)**: 
    - **QA Agent**: ใช้ **ระบบค้นหาและดึงข้อมูลอัจฉริยะ (RAG)** เพื่อตอบคำถามนโยบาย
    - **Auditor Agent**: ใช้ **ระบบปรับเปลี่ยนทักษะ AI แบบไดนามิก (Dynamic Skills)** ร่วมกับ **ระบบป้องกันการโจมตีแบบ Prompt Injection** เพื่อประเมินความเสี่ยงและป้องกันการแฮ็ก
5. **ส่วนโปรโตคอลเชื่อมต่อฐานข้อมูล (MCP Server API Layer)**: ทำหน้าที่ควบคุมสิทธิ์ให้ AI เข้าถึงเฉพาะข้อมูลที่อนุญาตผ่าน **Model Context Protocol (MCP)**
6. **ส่วนเชื่อมต่อฐานข้อมูล (Repository Layer)**: จัดการคำสั่งฐานข้อมูลผ่านตัวกลาง (SQLAlchemy) เพื่อป้องกันช่องโหว่
7. **ฐานข้อมูล (Database)**: SQLite (อัปเกรดได้เป็น PostgreSQL) จัดเก็บข้อมูลต่างๆ ได้แก่ Users, Policies, Requests, Tickets, Documents, Audit Logs, LLM Logs และ RAG Evaluations

## สถาปัตยกรรมด้านความปลอดภัย (Security Architecture)
- **การแยกส่วนการประมวลผล (Data Isolation)**: AI ประมวลผลแยกส่วนจากฐานข้อมูล และเข้าถึงข้อมูลผ่าน MCP เท่านั้น ป้องกันการหลุดรั่วของข้อมูลสำคัญ
- **ตรวจสอบย้อนหลังได้ 100% (Full Auditability)**: ทุกคำถามที่ผู้ใช้ส่งให้ AI และผลการประเมินจากระบบ HITL จะถูกบันทึกเพื่อใช้ประเมินประสิทธิภาพในหน้า Showcase และ LLM Logs เสมอ
