"use client";

import { 
  BookOpen, 
  Download, 
  Settings, 
  Database, 
  MessageSquare, 
  ShieldCheck, 
  Inbox, 
  Activity,
  ArrowRight,
  Copy,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TutorialPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const steps = [
    {
      id: 1,
      title: "ตั้งค่า API Key\nSet API Key",
      desc: "ไปที่เมนู Settings และนำ Gemini API Key มาใส่ เพื่อเปิดใช้งานระบบ AI Assistant\nGo to Settings menu and input your Gemini API Key to enable the AI Assistant",
      icon: <Settings className="w-6 h-6 text-slate-500" />,
      link: "/settings",
      linkText: "ไปที่ Settings\nGo to Settings"
    },
    {
      id: 2,
      title: "นำเข้าเอกสาร (Knowledge Base)\nImport Documents (Knowledge Base)",
      desc: "อัปโหลดไฟล์นโยบายจำลอง (ดาวน์โหลดได้จากด้านบน) เข้าสู่ระบบ เพื่อให้ระบบจำแนกและดึงเนื้อหาไปใช้งาน\nUpload the mock policy file (downloadable above) into the system for content extraction and indexing",
      icon: <Database className="w-6 h-6 text-indigo-500" />,
      link: "/knowledge-base",
      linkText: "ไปที่ Knowledge Base\nGo to Knowledge Base"
    },
    {
      id: 3,
      title: "ทดสอบถามคำถาม AI\nTest Asking the AI",
      desc: "ไปที่หน้า Ask Policy แล้วลองถามคำถาม หากคำถามมีความเสี่ยงสูง ระบบจะสร้างตั๋วงานส่งให้คนตรวจอัตโนมัติ\nGo to Ask Policy page. If your question implies high risk, the system will automatically create a review ticket.",
      icon: <MessageSquare className="w-6 h-6 text-blue-500" />,
      link: "/",
      linkText: "ไปที่ Ask Policy\nGo to Ask Policy"
    },
    {
      id: 4,
      title: "สวมบทบาทคนตรวจงาน (Reviewer)\nAct as the Reviewer",
      desc: "ไปที่ Review Queue เพื่อกดอนุมัติ (Approve) หรือปฏิเสธ (Reject) ตั๋วคำขอที่ AI ส่งมา\nGo to Review Queue to Approve or Reject the compliance requests submitted by the AI",
      icon: <Inbox className="w-6 h-6 text-amber-500" />,
      link: "/reviewer",
      linkText: "ไปที่ Review Queue\nGo to Review Queue"
    },
    {
      id: 5,
      title: "ตรวจสอบสถิติและประวัติ\nCheck Statistics and History",
      desc: "ดูผลลัพธ์การทำงานของ AI ที่ Evaluation Dashboard และประวัติการกดปุ่มทั้งหมดที่ Audit Logs\nView AI performance results in the Evaluation Dashboard and operation history in the Audit Logs",
      icon: <Activity className="w-6 h-6 text-rose-500" />,
      link: "/evaluation",
      linkText: "ไปที่ Dashboard\nGo to Dashboard"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg text-white">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent leading-tight">
            Tutorial & Mock Data
            <div className="text-sm font-normal text-slate-500 mt-1">คู่มือการทดสอบระบบและข้อมูลจำลอง</div>
          </h1>
        </div>
      </div>

      {/* Download Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 z-0 opacity-60"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            1. ดาวน์โหลดข้อมูลจำลอง (Download Mock Data)
          </h2>
          <p className="text-sm text-slate-600 mb-6 max-w-2xl leading-relaxed">
            ระบบต้องการเอกสารอ้างอิงเพื่อใช้ในการค้นหาและตอบคำถาม กรุณาดาวน์โหลดไฟล์นโยบายจำลองด้านล่างนี้ ซึ่งถูกเขียนขึ้นมาเป็นพิเศษให้รองรับรูปแบบการหั่นเอกสาร (Chunking) และทดสอบความแม่นยำของ AI
            <br />
            <span className="text-slate-500">The system requires reference documents for searching and answering questions. Please download the mock policy files below, which are specially written to support document chunking and AI accuracy testing.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/downloads/Global_Remote_Work_Security_Policy_TH.md" 
              download
              className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm">เวอร์ชันภาษาไทย (TH)</div>
                <div className="text-[10px] text-indigo-200 font-normal">ไฟล์ Markdown • 4 KB</div>
              </div>
            </a>

            <a 
              href="/downloads/Global_Remote_Work_Security_Policy.md" 
              download
              className="inline-flex items-center gap-3 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm">English Version (EN)</div>
                <div className="text-[10px] text-slate-300 font-normal">Markdown File • 3 KB</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          2. ขั้นตอนการทดสอบระบบ (System Walkthrough)
        </h2>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-5 hover:border-indigo-200 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="font-bold text-slate-800 text-lg flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-indigo-500 whitespace-nowrap">Step {step.id}:</span>
                  <div>
                    <div>{step.title.split('\n')[0]}</div>
                    <div className="text-sm text-slate-500 font-normal">{step.title.split('\n')[1]}</div>
                  </div>
                </h3>
                <div className="text-sm text-slate-600 mt-3 leading-relaxed space-y-1">
                  <p>{step.desc.split('\n')[0]}</p>
                  <p className="text-slate-500">{step.desc.split('\n')[1]}</p>
                </div>

                {/* Render Prompts inside Step 3 */}
                {step.id === 3 && (
                  <div className="mt-8 space-y-6">
                    {/* Group 1: General Info */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">1</span>
                        คำถามปกติทั่วไป (Information Request)
                      </h4>
                      <p className="text-xs text-blue-600/70 mb-3 ml-7">AI จะเพียงค้นหาและตอบคำถามให้ โดยไม่มีการสร้างตั๋วอัตโนมัติ</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                        {[
                          {
                            id: 1,
                            title: "ถามนโยบาย: Device Compliance (TH)",
                            prompt: "ผมเพิ่งซื้อคอมพิวเตอร์มาใหม่เพื่อใช้ทำงานที่บ้าน รบกวนช่วยสรุปให้หน่อยครับว่าผมต้องตั้งค่าคอมพิวเตอร์และติดตั้งซอฟต์แวร์ความปลอดภัยอะไรบ้างตามนโยบายของบริษัท?"
                          },
                          {
                            id: 11,
                            title: "Ask Policy: Device Compliance (EN)",
                            prompt: "I just bought a new laptop for remote work. Could you please summarize what security settings and software I need to configure according to the company policy?"
                          },
                          {
                            id: 2,
                            title: "ถามนโยบาย: Network & Access (TH)",
                            prompt: "ช่วงบ่ายผมต้องไปทำงานที่ร้านกาแฟ ผมสามารถเชื่อมต่อ Wi-Fi ของร้านเพื่อเช็คอีเมลและดึง Source Code ได้ไหมครับ มีข้อควรระวังหรือวิธีเชื่อมต่อที่ถูกต้องอย่างไรบ้าง?"
                          },
                          {
                            id: 22,
                            title: "Ask Policy: Network & Access (EN)",
                            prompt: "I need to work at a coffee shop this afternoon. Can I connect to their Wi-Fi to check emails and pull Source Code? What are the proper ways to connect securely?"
                          }
                        ].map((item) => (
                          <div key={`prompt-${item.id}`} className="bg-white rounded-lg border border-blue-100 p-3 relative group shadow-sm">
                            <div className="text-xs font-bold text-slate-700 mb-1">{item.title}</div>
                            <div className="text-xs text-slate-600 pr-8">{item.prompt}</div>
                            <button
                              onClick={() => copyToClipboard(item.prompt, item.id)}
                              className="absolute bottom-2 right-2 p-1.5 rounded-md text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Copy to clipboard"
                            >
                              {copiedId === item.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Group 2: High Risk */}
                    <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-rose-700 mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-xs">2</span>
                        คำถามความเสี่ยงสูง (High Risk - Auto Review)
                      </h4>
                      <p className="text-xs text-rose-600/70 mb-3 ml-7">AI จะตรวจสอบพบความเสี่ยงและสร้างตั๋วไปยังคนตรวจอัตโนมัติ</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                        {[
                          {
                            id: 3,
                            title: "ทดสอบทักษะ: Data Protection (TH)",
                            prompt: "พอดี OneDrive ของบริษัทเต็ม ผมเลยดาวน์โหลดข้อมูลลูกค้า (PII) เก็บไว้ในฮาร์ดดิสก์ตัวเอง และอัปโหลดใส่ Google Drive ส่วนตัวไว้ แบบนี้โอเคไหม?"
                          },
                          {
                            id: 33,
                            title: "Test Skill: Data Protection (EN)",
                            prompt: "Since the corporate OneDrive is full, I downloaded customer PII to my local hard drive and backed it up to my personal Google Drive. Is this okay?"
                          },
                          {
                            id: 4,
                            title: "ทดสอบทักษะ: Policy Auditor (TH)",
                            prompt: "เมื่อคืนผมทำคอมบริษัทหาย กะว่าจะรอดูสัก 2-3 วันเผื่อเจอค่อยแจ้ง IT ระหว่างนี้ผมจะเอาเอกสารลับไปพรินต์ที่ร้านรับพิมพ์งานหน้าปากซอยแทนก่อน"
                          },
                          {
                            id: 44,
                            title: "Test Skill: Policy Auditor (EN)",
                            prompt: "I lost my corporate laptop last night. I'll wait 2-3 days before notifying IT. Meanwhile, I'll print some confidential documents at the public print shop."
                          }
                        ].map((item) => (
                          <div key={`prompt-${item.id}`} className="bg-white rounded-lg border border-rose-100 p-3 relative group shadow-sm">
                            <div className="text-xs font-bold text-slate-700 mb-1">{item.title}</div>
                            <div className="text-xs text-slate-600 pr-8">{item.prompt}</div>
                            <button
                              onClick={() => copyToClipboard(item.prompt, item.id)}
                              className="absolute bottom-2 right-2 p-1.5 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Copy to clipboard"
                            >
                              {copiedId === item.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-2 hidden sm:flex flex-col gap-1 items-end">
                <Link 
                  href={step.link}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors min-w-[140px]"
                >
                  <div className="text-center">
                    <div>{step.linkText.split('\n')[0]}</div>
                    <div className="text-[10px] font-normal opacity-80">{step.linkText.split('\n')[1]}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
