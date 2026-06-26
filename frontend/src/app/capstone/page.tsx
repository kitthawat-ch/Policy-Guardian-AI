"use client";

import Link from "next/link";
import { 
  Award, 
  Code, 
  CheckCircle2, 
  Server, 
  GitBranch, 
  ShieldAlert, 
  Users, 
  Database, 
  ArrowRight,
  ArrowDown,
  Terminal,
  FileCode,
  Info,
  Download
} from "lucide-react";

export default function CapstoneShowcasePage() {
  const features = [
    {
      id: "agentic-ai",
      title: "Agentic AI Architecture",
      titleTh: "สถาปัตยกรรมปัญญาประดิษฐ์แบบ Agentic",
      desc: "System utilizes multiple specialized AI agents (Router, QA, Auditor) working collaboratively to process requests, rather than a single monolithic prompt.",
      descTh: "ระบบใช้ AI Agents หลายตัวที่ถูกฝึกมาเฉพาะด้าน (Router, QA, Auditor) ทำงานประสานกันแทนการใช้ Prompt เดียวจบ ทำให้ผลลัพธ์แม่นยำขึ้น",
      icon: <GitBranch className="text-indigo-500 w-6 h-6" />,
      files: [
        "backend/app/agents/base_agent.py",
        "backend/app/agents/router_agent.py",
        "backend/app/agents/qa_agent.py",
        "backend/app/agents/auditor_agent.py"
      ]
    },
    {
      id: "rag",
      title: "Retrieval-Augmented Generation (RAG)",
      titleTh: "ระบบค้นหาและดึงข้อมูลอัจฉริยะ (RAG)",
      desc: "Implements vector embeddings and semantic search (Cosine Similarity) to allow the AI to ground its answers using the uploaded corporate security policies.",
      descTh: "ใช้เทคโนโลยี Vector Embeddings และการค้นหาความหมาย (Cosine Similarity) ในการแปลงเอกสารเป็นตัวเลข เพื่อให้ AI ดึงข้อมูลมาอ้างอิงได้อย่างถูกต้อง",
      icon: <Database className="text-emerald-500 w-6 h-6" />,
      files: [
        "backend/app/services/embedding_service.py",
        "backend/app/services/policy_service.py"
      ]
    },
    {
      id: "dynamic-skills",
      title: "Dynamic Skills Injection",
      titleTh: "ระบบปรับเปลี่ยนทักษะ AI แบบไดนามิก",
      desc: "Users can dynamically inject rule-based compliance skills (e.g., Device Compliance, Data Protection) into the AI's context at runtime.",
      descTh: "ผู้ใช้งานสามารถเปิด/ปิด ทักษะ (Skills) ของ AI ผ่านหน้าเว็บ เพื่อบังคับให้ AI สวมบทบาทและใช้กฎเฉพาะด้านในการจับผิดคำขอได้อย่างยืดหยุ่น",
      icon: <Code className="text-rose-500 w-6 h-6" />,
      files: [
        ".agents/skills/device-compliance-checker/SKILL.md",
        ".agents/skills/data-protection-reviewer/SKILL.md",
        ".agents/skills/network-access-guard/SKILL.md",
        ".agents/skills/policy-auditor/SKILL.md"
      ]
    },
    {
      id: "prompt-injection",
      title: "Prompt Injection Defense",
      titleTh: "ระบบป้องกันการโจมตีแบบ Prompt Injection",
      desc: "The system is fortified against prompt injection attacks. It isolates user inputs and strictly instructs the Auditor AI to ignore malicious commands attempting to bypass compliance checks.",
      descTh: "มีกลไกป้องกันการแฮ็ก AI (Prompt Injection) โดยการแยกคำสั่งของผู้ใช้ออกจาก System Prompt หลัก ทำให้ AI ไม่หลงกลยอมอนุมัติตามคำสั่งหลอกลวงของผู้ไม่หวังดี",
      icon: <ShieldAlert className="text-red-500 w-6 h-6" />,
      files: [
        "backend/app/agents/auditor_agent.py"
      ]
    },
    {
      id: "hitl",
      title: "Human-in-the-Loop (HITL)",
      titleTh: "ระบบการอนุมัติโดยมนุษย์ (HITL)",
      desc: "High-risk compliance violations trigger an automated ticket system. AI does not act alone; it halts execution and requires human review.",
      descTh: "หาก AI ตรวจพบความเสี่ยงสูง ระบบจะสร้างตั๋ว (Ticket) อัตโนมัติและหยุดการทำงาน เพื่อส่งต่อให้พนักงาน (Reviewer) เข้ามาพิจารณาอนุมัติหรือปฏิเสธ",
      icon: <Users className="text-amber-500 w-6 h-6" />,
      files: [
        "backend/app/api/endpoints/tickets.py",
        "frontend/src/app/reviewer/page.tsx"
      ]
    },
    {
      id: "audit-logs",
      title: "Transparency & Audit Logging",
      titleTh: "ความโปร่งใสและระบบตรวจสอบย้อนหลัง",
      desc: "Every AI prompt, response, and risk evaluation is logged securely in the database for auditing and continuous evaluation.",
      descTh: "ทุกคำถาม ทุกคำตอบ และทุกการวิเคราะห์ของ AI จะถูกบันทึกเก็บไว้ในระบบฐานข้อมูล เพื่อความโปร่งใสและใช้ในการประเมินประสิทธิภาพย้อนหลัง",
      icon: <Server className="text-blue-500 w-6 h-6" />,
      files: [
        "backend/app/models/llm_log.py",
        "backend/app/models/audit_log.py",
        "frontend/src/app/llm-logs/page.tsx",
        "frontend/src/app/audit/page.tsx"
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg text-white">
          <Award size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent leading-tight">
            Capstone Showcase
            <div className="text-sm font-normal text-slate-500 mt-1">บทสรุปโครงงานและหลักฐานการทำงาน (Project Features & Evidence)</div>
          </h1>
        </div>
      </div>

      {/* Project Proposal & Context Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
          Project Proposal & Context (โครงร่างโครงงานและบริบทข้อมูล)
        </h2>


        <div className="bg-indigo-600 text-white rounded-xl p-6 mb-8 shadow-md">
          <h3 className="text-2xl font-black tracking-tight mb-2">Policy Guardian AI</h3>
          <div className="space-y-1 text-indigo-100 text-sm">
            <p>AI Agent for Enterprise Policy Intelligence</p>
            <p>ระบบผู้ช่วยอัจฉริยะสำหรับค้นหา ตีความ และตรวจสอบความสอดคล้องตามระเบียบองค์กร</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {/* THAI COLUMN */}
          <div className="space-y-6 text-sm text-slate-600">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 text-base mb-2">ที่มาและปัญหา</h3>
              <p className="leading-relaxed">ในหลายองค์กรมักมีเอกสารระเบียบและคู่มือจำนวนมาก เมื่อผู้ใช้ต้องการค้นหาข้อมูล (เช่น "เบิกค่าที่พักได้เท่าใด" หรือ "ระเบียบฉบับใดล่าสุด") มักต้องเปิดเอกสารหลายฉบับด้วยตนเอง ซึ่งใช้เวลานานและอาจตีความผิดพลาดได้</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 text-base mb-2">แนวทางแก้ไข (Proposed Solution)</h3>
              <p className="leading-relaxed">ระบบ <strong>AI Compliance Assistant</strong> จะจัดเก็บและสร้างฐานความรู้ (Knowledge Base / RAG) จากเอกสาร PDF/Markdown ผู้ใช้สามารถสอบถามด้วยภาษาธรรมชาติ ระบบจะวิเคราะห์เนื้อหา ค้นหา และสรุปคำตอบพร้อมแหล่งอ้างอิงได้อย่างรวดเร็ว</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 text-base mb-2">Human-in-the-Loop (การตรวจสอบโดยมนุษย์)</h3>
              <p className="leading-relaxed">เพื่อเพิ่มความน่าเชื่อถือ หาก AI ตรวจพบความขัดแย้ง, คำขอที่มีความเสี่ยงสูง หรือข้อมูลไม่ครบถ้วน ระบบจะหยุดทำงานและส่งเรื่อง (Ticket) ให้ผู้เชี่ยวชาญ/เจ้าหน้าที่ตรวจสอบก่อน ลดความเสี่ยงจากการที่ AI ตัดสินใจผิดพลาดด้วยตนเอง</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 text-base mb-2">ประโยชน์ที่คาดว่าจะได้รับ</h3>
              <ul className="list-disc pl-5 space-y-1.5 marker:text-slate-400">
                <li>ลดเวลาค้นหาเอกสารระเบียบและเพิ่มความถูกต้องสม่ำเสมอ</li>
                <li>ลดภาระเจ้าหน้าที่ในการตอบคำถามซ้ำๆ</li>
                <li>สนับสนุนการนำ AI Agent มาใช้ในองค์กรอย่างปลอดภัย โปร่งใส และตรวจสอบได้</li>
              </ul>
            </div>
          </div>

          {/* ENGLISH COLUMN */}
          <div className="space-y-6 text-sm text-slate-600">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 text-base mb-2">Background & Problem</h3>
              <p className="leading-relaxed">Organizations often have numerous scattered policy documents. When users search for specific rules, they must manually read through multiple files, which is time-consuming and highly prone to human misinterpretation.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 text-base mb-2">Proposed Solution</h3>
              <p className="leading-relaxed">The <strong>AI Compliance Assistant</strong> processes and creates a Knowledge Base from policy documents. Users can ask questions in natural language. The AI instantly searches, analyzes, and provides summarized answers with exact citations.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 text-base mb-2">Human-in-the-Loop (HITL)</h3>
              <p className="leading-relaxed">To ensure system reliability, if the AI detects policy conflicts, high-risk requests, or lacks confidence, it halts execution and escalates the request via a Ticket system for a human expert to review, mitigating AI risks.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 text-base mb-2">Expected Benefits</h3>
              <ul className="list-disc pl-5 space-y-1.5 marker:text-slate-400">
                <li>Significantly reduces policy search time and improves accuracy.</li>
                <li>Relieves compliance officers from answering repetitive questions.</li>
                <li>Promotes safe, transparent, and auditable enterprise AI adoption.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: System Flow Diagram */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-10 overflow-hidden">
        <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <GitBranch className="text-indigo-500 w-6 h-6" />
          1. System Flow (แผนผังการทำงานของระบบ)
        </h2>
        <p className="text-sm text-slate-500 mb-8">แสดงเส้นทางการทำงานของระบบ Multi-Agent AI ตั้งแต่รับคำถามจนถึงการสร้างตั๋ว (Request Lifecycle)</p>

        <div className="flex flex-col items-center max-w-3xl mx-auto space-y-3">
          {/* Step 1 */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm relative z-10">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-600 font-bold">1</div>
            <div>
              <div className="font-bold text-slate-700">User Submits Request (ผู้ใช้ส่งคำถาม/คำร้อง)</div>
              <div className="text-xs text-slate-500">Employee submits a question or system architecture for review. (ผู้ใช้งานส่งคำถามหรือแนบรายละเอียดสถาปัตยกรรมเพื่อตรวจสอบ)</div>
            </div>
          </div>
          <ArrowDown className="text-slate-300 w-6 h-6" />

          {/* Step 2 */}
          <div className="w-full bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-4 shadow-sm relative z-10">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">2</div>
            <div className="flex-1">
              <div className="font-bold text-indigo-700">Router Agent (ตัวแยกประเภทคำถาม)</div>
              <div className="text-xs text-indigo-600/70">Analyzes intent. Determines if it's a general question or a high-risk system change. (วิเคราะห์เจตนาว่าเป็นแค่คำถามทั่วไป หรือมีความเสี่ยงสูง)</div>
            </div>
          </div>
          <ArrowDown className="text-indigo-300 w-6 h-6" />

          {/* Fork */}
          <div className="w-full flex flex-col sm:flex-row gap-6 relative">
            <div className="absolute top-0 left-1/2 w-px h-full bg-indigo-200 -z-10 hidden sm:block"></div>
            
            {/* Step 3A: General */}
            <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm relative z-10 mt-4 sm:mt-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold mb-2 text-sm">3A</div>
              <div className="font-bold text-emerald-700 text-sm mb-1">QA Agent + RAG System (ตอบคำถามนโยบาย)</div>
              <div className="text-xs text-emerald-600/70">Searches policy knowledge base via embeddings for relevant context and generates a helpful answer. (ดึงข้อมูลนโยบายมาใช้อ้างอิงและตอบคำถาม)</div>
              <div className="mt-3 text-xs font-bold text-emerald-600 bg-emerald-100 inline-block px-2 py-1 rounded">No Ticket Created</div>
            </div>

            {/* Step 3B: High Risk */}
            <div className="flex-1 bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm relative z-10">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold mb-2 text-sm">3B</div>
              <div className="font-bold text-rose-700 text-sm mb-1 flex items-center gap-1">Auditor Agent + Skills + Injection Defense</div>
              <div className="text-xs text-rose-600/70">Injects selected Skills into prompt to hunt for policy violations, while actively blocking Prompt Injection attacks. Returns Risk Score. (สวมบทบาทตามทักษะที่เลือกและบล็อกการโจมตีทาง Prompt เพื่อประเมินความเสี่ยง)</div>
              <div className="mt-3 text-xs font-bold text-rose-600 bg-rose-100 inline-block px-2 py-1 rounded">Violation Detected</div>
            </div>
          </div>

          <ArrowDown className="text-rose-300 w-6 h-6 sm:ml-[50%]" />

          {/* Step 4 */}
          <div className="w-full sm:w-1/2 sm:ml-auto bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 shadow-sm relative z-10">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">4</div>
            <div>
              <div className="font-bold text-amber-700 text-sm">Human-in-the-Loop Review Queue (รออนุมัติโดยมนุษย์)</div>
              <div className="text-xs text-amber-600/70">System halts and creates a ticket. A human Reviewer must Approve or Reject. (ระบบระงับการทำงาน สร้างตั๋วงานให้เจ้าหน้าที่พิจารณาขั้นสุดท้าย)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Features Checklist */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500 w-6 h-6" />
          2. Capstone Features Checklist (รายการฟีเจอร์หลัก)
        </h2>
        <p className="text-sm text-slate-500 mb-8">รายการเทคโนโลยีที่ถูกพัฒนาขึ้นเพื่อตอบโจทย์โปรเจกต์จบ พร้อมเส้นทาง (Path) ไปยัง Source Code เพื่อใช้เป็นหลักฐาน (Evidence) ในการนำเสนอ</p>

        <div className="space-y-6">
          {features.map((feat) => (
            <div key={feat.id} className="border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow bg-slate-50/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  {feat.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    {feat.title}
                    <span className="text-xs font-normal bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Implemented</span>
                  </h3>
                  <div className="text-sm font-medium text-slate-500 mb-3">{feat.titleTh}</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-slate-600">
                    <div>
                      <span className="font-semibold block mb-1">ENG:</span>
                      {feat.desc}
                    </div>
                    <div>
                      <span className="font-semibold block mb-1">TH:</span>
                      {feat.descTh}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" /> Source Code Evidence (หลักฐานโค้ด):
                    </div>
                    <ul className="space-y-1.5">
                      {feat.files.map((file, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded">
                          <Terminal className="w-3 h-3 text-slate-400" />
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


        {/* Mock Data Context */}
        <div className="mt-12 bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" />
              Mock Data Context (ข้อมูลจำลองที่ใช้ในการทดสอบระบบ)
            </h3>
            <Link href="/tutorial" className="text-xs bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg shadow-sm font-semibold flex items-center gap-1.5 transition-colors w-fit">
              <Download className="w-4 h-4" />
              โหลดไฟล์ทดสอบ (Download Data)
            </Link>
          </div>
          <p className="text-indigo-800 text-sm mb-3 leading-relaxed">
            <strong>EN:</strong> To demonstrate the system's capabilities, we use a mock policy named <strong>"Global Remote Work Security Policy"</strong>. This document contains strict rules regarding Device Compliance, Data Protection, and Network Access for remote workers. All AI evaluations and test cases in this demo are based strictly on this document to show how the AI enforces corporate rules.
          </p>
          <p className="text-indigo-800 text-sm border-t border-indigo-200/60 pt-3 leading-relaxed">
            <strong>TH:</strong> เพื่อให้เห็นภาพการทำงานของระบบ ข้อมูลที่ใช้ทดสอบในเดโมนี้คือ <strong>"นโยบายความมั่นคงปลอดภัยสำหรับการทำงานระยะไกล (Global Remote Work Security Policy)"</strong> ซึ่งประกอบด้วยกฎเกณฑ์เรื่องการจัดการอุปกรณ์, การปกป้องข้อมูล และการเข้าถึงเครือข่าย การวิเคราะห์และจับผิดของ AI ทั้งหมดในระบบนี้จะอ้างอิงจากกฎในเอกสารฉบับนี้เป็นหลัก เพื่อป้องกันความสับสนเวลาทดสอบการทำงานของระบบครับ
          </p>
        </div>
    </div>
  );
}
