# Policy Guardian AI

**AI Agent for Enterprise Policy Intelligence**

แพลตฟอร์มระดับองค์กรที่ช่วยเพิ่มความเร็วในการทำงานของวิศวกรผ่านสถาปัตยกรรมปัญญาประดิษฐ์แบบ Agentic พร้อมระบบการอนุมัติโดยมนุษย์ (Human-in-the-Loop) โปรเจกต์นี้ส่งเข้าร่วมใน **Kaggle 5-Day AI Agents: Intensive Vibe Coding Course with Google** Capstone (Track: Agents for Business)

## ฟีเจอร์หลัก (Capstone Features)
- **สถาปัตยกรรมปัญญาประดิษฐ์แบบ Agentic (Agentic AI Architecture)**: ใช้ AI Agents หลายตัวทำงานประสานกัน (Router, QA, Auditor) แทนการใช้ Prompt เดียว
- **ระบบค้นหาและดึงข้อมูลอัจฉริยะ (Retrieval-Augmented Generation - RAG)**: ค้นหาเอกสารนโยบายผ่าน Vector Embeddings เพื่อให้ AI ตอบคำถามพร้อมแหล่งอ้างอิงจริง หมดปัญหาการสร้างข้อมูลเท็จ
- **ระบบปรับเปลี่ยนทักษะ AI แบบไดนามิก (Dynamic Skills Injection)**: ผู้ใช้งานสามารถเปิด/ปิด ทักษะ (Skills) ของ AI ผ่านหน้าเว็บ เพื่อบังคับให้ AI สวมบทบาทและใช้กฎเฉพาะด้าน
- **ระบบป้องกันการโจมตีแบบ Prompt Injection (Prompt Injection Defense)**: ป้องกันไม่ให้ผู้ใช้แฮ็กข้ามขั้นตอนการตรวจสอบผ่านระบบแยกคำสั่งที่รัดกุม
- **ระบบการอนุมัติโดยมนุษย์ (Human-in-the-Loop - HITL)**: หากพบความเสี่ยง ระบบจะสร้างตั๋ว (Ticket) อัตโนมัติและส่งแจ้งเตือนแบบเรียลไทม์ผ่าน WebSocket เพื่อให้มนุษย์ตัดสินใจขั้นสุดท้าย
- **ความโปร่งใสและระบบตรวจสอบย้อนหลัง (Transparency & Audit Logging)**: ทุกคำถามและการวิเคราะห์ของ AI จะถูกบันทึกในหน้า LLM Monitor อย่างละเอียดเพื่อใช้ในการประเมินประสิทธิภาพย้อนหลัง

## สถาปัตยกรรมและความปลอดภัย
- **โปรโตคอลเชื่อมต่อฐานข้อมูล (Model Context Protocol - MCP)**: เชื่อมต่อ LLM เข้ากับฐานข้อมูลภายในอย่างปลอดภัย โดยให้ข้อมูลเฉพาะที่ร้องขอเท่านั้น
- **การแยกระบบเพื่อความปลอดภัย (Data Isolation)**: ระบบ AI (LLM) ทำงานแยกขาดจากฐานข้อมูล ไม่มีการเชื่อมต่อกันโดยตรง ป้องกันการรันคำสั่งนอกเหนือขอบเขต

## เทคโนโลยีที่ใช้
- **ส่วนหน้าบ้าน (Frontend)**: Next.js (App Router), TypeScript, TailwindCSS, Axios
- **ส่วนหลังบ้าน (Backend)**: FastAPI, SQLAlchemy, SQLite, Python-dotenv, WebSockets
- **ปัญญาประดิษฐ์ (AI)**: Google Gemini 3.5 Pro & Flash

## วิธีติดตั้งระบบ

1. **โคลนโปรเจกต์ (Clone the repository)**
2. **ตั้งค่า Backend**:
   ```bash
   cd backend
   python -m venv venv
   # Windows: .\venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   pip install -r requirements.txt
   ```
3. **การตั้งค่า (Configuration)**: 
   สามารถตั้งค่า API Key ผ่านหน้าเว็บได้เลยหลังจากรันระบบ โดยไปที่ `http://localhost:3000/settings` ระบบจะสร้างไฟล์ `.env` ให้อัตโนมัติ
4. **สร้างข้อมูลจำลอง (Seed Database)** (ทำในโฟลเดอร์ `backend`):
   ```bash
   python seed.py
   python seed_audit_logs.py
   ```
5. **เริ่มการทำงาน Backend**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
6. **เริ่มการทำงาน Frontend**:
   เปิดหน้าต่าง Terminal ใหม่ แล้วพิมพ์คำสั่ง:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
7. เปิดหน้าเว็บ `http://localhost:3000` และไปที่หน้า **Settings** เพื่อตั้งค่า API Key
