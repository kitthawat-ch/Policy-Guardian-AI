# คู่มือการติดตั้งระบบ (Deployment Guide)

คู่มือนี้อธิบายถึงขั้นตอนการตั้งค่าและเปิดใช้งานระบบ เพื่อทดสอบและประเมินผลการทำงานในเครื่องคอมพิวเตอร์ของคุณ

## สิ่งที่ต้องเตรียม (Prerequisites)
- Node.js (เวอร์ชัน 20 ขึ้นไป)
- Python (เวอร์ชัน 3.12 ขึ้นไป)
- คีย์ API ของ Google Gemini (A valid Google Gemini API Key)

## 1. การตั้งค่าสภาพแวดล้อม (Environment Setup)

### ส่วนหลังบ้าน (Backend)
1. เปิดเทอร์มินัลแล้วไปที่โฟลเดอร์ backend:
   ```bash
   cd Capstone-Project/backend
   ```
2. สร้างและเปิดใช้งาน Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # สำหรับ Windows ใช้: venv\Scripts\activate
   ```
3. ติดตั้งไลบรารีที่จำเป็น:
   ```bash
   pip install -r requirements.txt
   ```
4. คุณสามารถตั้งค่า API Key ผ่านหน้าเว็บได้เลยหลังจากรันระบบ หรือสร้างไฟล์ `.env` เองตามนี้:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### ส่วนหน้าบ้าน (Frontend)
1. เปิดเทอร์มินัลใหม่แล้วไปที่โฟลเดอร์ frontend:
   ```bash
   cd Capstone-Project/frontend
   ```
2. ติดตั้งไลบรารีของ Node:
   ```bash
   npm install
   ```

## 2. การรันระบบ (Running the Application)

### เปิดใช้งาน Backend
รันคำสั่งในโฟลเดอร์ backend โดยที่เปิด venv ไว้:
```bash
uvicorn app.main:app --reload --port 8000
```
API และเซิร์ฟเวอร์ WebSocket จะเปิดทำงานที่พอร์ต `8000`

### เปิดใช้งาน Frontend
รันคำสั่งในโฟลเดอร์ frontend:
```bash
npm run dev
```
ระบบจะเปิดใช้งานที่ `http://localhost:3000`

## 3. เมนูและวิธีการทดสอบระบบ (Usage)
เมื่อระบบทำงานแล้ว คุณสามารถเข้าไปทดสอบฟีเจอร์ต่างๆ ได้ที่:
1. **ถาม-ตอบนโยบาย (Ask Policy AI)**: `http://localhost:3000/ask-policy` เพื่อทดสอบระบบค้นหาและดึงข้อมูลอัจฉริยะ (RAG)
2. **ประเมินสถาปัตยกรรม (Evaluate)**: `http://localhost:3000/evaluate` เพื่อทดสอบสถาปัตยกรรมปัญญาประดิษฐ์แบบ Agentic และระบบป้องกัน Prompt Injection
3. **ระบบตรวจสอบโดยมนุษย์ (Review Queue)**: `http://localhost:3000/reviewer` เพื่อทดสอบระบบการอนุมัติโดยมนุษย์ (HITL) ที่อัปเดตแบบเรียลไทม์
4. **ทักษะ AI (Agent Skills)**: `http://localhost:3000/skills` เพื่อจัดการและตั้งค่าระบบปรับเปลี่ยนทักษะ AI แบบไดนามิก
5. **ความโปร่งใสของ LLM (LLM Monitor)**: `http://localhost:3000/llm-logs` เพื่อตรวจสอบการตัดสินใจและข้อมูลที่ถูกประมวลผลผ่าน AI
6. **ประเมินผล AI (Evaluation)**: `http://localhost:3000/evaluation` เพื่อดูแดชบอร์ดประสิทธิภาพและความแม่นยำของ RAG
7. **ฐานข้อมูลนโยบาย (Knowledge Base)**: `http://localhost:3000/knowledge-base` เพื่อจัดการเอกสารอ้างอิง
8. **ศูนย์จัดการ MCP (MCP Hub)**: `http://localhost:3000/mcp-hub` เพื่อดูการทำงานของโปรโตคอลเชื่อมต่อฐานข้อมูล (MCP)
9. **ตรวจสอบประวัติการแก้ไข (Audit Logs)**: `http://localhost:3000/audit` เพื่อตรวจสอบประวัติการใช้งานระบบที่ไม่สามารถถูกลบได้
10. **สรุปโครงงาน (Capstone Showcase)**: `http://localhost:3000/capstone` เพื่อดูภาพรวมฟีเจอร์และหลักฐาน Source Code
11. **ตั้งค่าระบบ (Settings)**: `http://localhost:3000/settings` เพื่อจัดการ API Key 
12. **คู่มือการใช้งาน (Tutorial)**: `http://localhost:3000/tutorial` สำหรับดาวน์โหลดไฟล์จำลองเพื่อใช้ทดสอบระบบ
