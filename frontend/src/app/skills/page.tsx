"use client";

import React, { useState, useEffect } from "react";
import { Cpu, ShieldCheck, Database, Laptop, Wifi } from "lucide-react";

export default function SkillsPage() {
  const [activeSkills, setActiveSkills] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("activeSkills");
    if (stored) {
      try {
        setActiveSkills(JSON.parse(stored));
      } catch (e) {}
    } else {
      setActiveSkills(["policy-auditor"]);
      localStorage.setItem("activeSkills", JSON.stringify(["policy-auditor"]));
    }
  }, []);

  const toggleSkill = (skillId: string) => {
    let newSkills;
    if (activeSkills.includes(skillId)) {
      newSkills = activeSkills.filter(id => id !== skillId);
    } else {
      newSkills = [...activeSkills, skillId];
    }
    setActiveSkills(newSkills);
    localStorage.setItem("activeSkills", JSON.stringify(newSkills));
  };

  const skills = [
    {
      id: "policy-auditor",
      name: "Remote Work Policy Auditor",
      nameTh: "ทักษะตรวจสอบนโยบายหลัก",
      description: "Evaluates if a proposed remote work setup or project violates any major rules in the Global Remote Work Security Policy.",
      descriptionTh: "ตรวจสอบว่าแผนงานหรือระบบที่เสนอมา มีการละเมิดกฎการทำงานระยะไกลที่สำคัญหรือไม่ (เช่น การทำงานในที่สาธารณะ การพิมพ์เอกสารลับ)",
      icon: <ShieldCheck size={24} />,
      version: "v3.0.0",
      activeColor: "bg-rose-50 border-rose-200 text-rose-500",
      standbyColor: "bg-slate-50 border-slate-200 text-slate-400",
      agents: ["Auditor Agent (Compliance Check)", "Router Agent"]
    },
    {
      id: "data-protection-reviewer",
      name: "Data Protection Reviewer",
      nameTh: "ทักษะสอดส่องการปกป้องข้อมูล",
      description: "Hunts for violations related to Data Management, such as storing PII on local drives, using personal Cloud, or unencrypted USBs.",
      descriptionTh: "ตรวจสอบช่องโหว่ด้านการเก็บข้อมูล เช่น การเซฟข้อมูล PII ลงฮาร์ดดิสก์ส่วนตัว การใช้ Google Drive ส่วนตัว หรือใช้แฟลชไดรฟ์เถื่อน",
      icon: <Database size={24} />,
      version: "v1.2.0",
      activeColor: "bg-indigo-50 border-indigo-200 text-indigo-500",
      standbyColor: "bg-slate-50 border-slate-200 text-slate-400",
      agents: ["Auditor Agent (Compliance Check)"]
    },
    {
      id: "device-compliance-checker",
      name: "Device Compliance Checker",
      nameTh: "ทักษะตรวจสภาพอุปกรณ์ปลายทาง",
      description: "Enforces OS updates within 7 days, mandatory EDR, and 10-minute auto-lock.",
      descriptionTh: "ตรวจจับและบังคับใช้กฎมาตรฐานของอุปกรณ์ (เช่น อัปเดต OS ใน 7 วัน, ติดตั้ง EDR เสมอ, ล็อกหน้าจออัตโนมัติ 10 นาที)",
      icon: <Laptop size={24} />,
      version: "v2.1.0",
      activeColor: "bg-emerald-50 border-emerald-200 text-emerald-500",
      standbyColor: "bg-slate-50 border-slate-200 text-slate-400",
      agents: ["QA Agent (Ask Policy AI)"]
    },
    {
      id: "network-access-guard",
      name: "Network & Access Guard",
      nameTh: "ทักษะตรวจสอบการเข้าถึงเครือข่าย",
      description: "Ensures all answers regarding remote logins enforce the 14-character password rule, 90-day rotation, and mandatory MFA.",
      descriptionTh: "ควบคุมให้ผู้ใช้ต้องปฏิบัติตามกฎการเข้าถึงเครือข่าย เช่น ต้องใช้ VPN ตลอดเวลา, เปิด MFA และตั้งรหัสผ่าน 14 ตัวอักษร",
      icon: <Wifi size={24} />,
      version: "v1.0.5",
      activeColor: "bg-amber-50 border-amber-200 text-amber-500",
      standbyColor: "bg-slate-50 border-slate-200 text-slate-400",
      agents: ["QA Agent (Ask Policy AI)"]
    }
  ];

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                <Cpu size={20} />
              </div>
              <div>
                Agent Skills
                <div className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">จัดการทักษะ AI</div>
              </div>
            </h1>
            <p className="mt-4 text-slate-500 font-medium max-w-2xl">
              Manage and monitor dynamically loaded specialized capabilities for AI agents.<br/>
              <span className="text-sm text-slate-400">จัดการและเปิด/ปิดความสามารถพิเศษที่ระบบโหลดให้กับ AI อัตโนมัติ</span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Skills</div>
            <div className="text-[10px] font-medium text-slate-400 mb-2">ทักษะทั้งหมด</div>
            <div className="text-3xl font-black text-slate-800">{skills.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Modules</div>
            <div className="text-[10px] font-medium text-slate-400 mb-2">โมดูลที่กำลังทำงาน</div>
            <div className="text-3xl font-black text-emerald-600">{activeSkills.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Token Optimization</div>
            <div className="text-[10px] font-medium text-slate-400 mb-2">ประสิทธิภาพการลด Token</div>
            <div className="text-3xl font-black text-blue-600">~85%</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Saved via Progressive Disclosure</div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {skills.map((skill) => {
            const isActive = activeSkills.includes(skill.id);
            const statusText = isActive ? "Active" : "Standby";
            const iconColorClass = isActive ? skill.activeColor : skill.standbyColor;

            return (
              <div 
                key={skill.id} 
                className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group ${isActive ? 'border-emerald-200 ring-1 ring-emerald-500/10' : 'border-slate-200'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${iconColorClass}`}>
                      {skill.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 transition-colors">
                        {skill.name}
                      </h3>
                      <div className="text-xs font-bold text-slate-500 mb-1">{skill.nameTh}</div>
                      <div className="text-[10px] font-medium text-slate-400 font-mono">
                        {skill.id} • {skill.version}
                      </div>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <button 
                    onClick={() => toggleSkill(skill.id)}
                    className="flex flex-col items-end"
                  >
                    <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {statusText.toUpperCase()}
                    </span>
                  </button>
                </div>
                
                <div className="mb-6 space-y-2">
                  <p className="text-sm text-slate-700 font-medium line-clamp-2">
                    {skill.description}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {skill.descriptionTh}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Used by:</span>
                    <div className="flex flex-wrap gap-1">
                      {skill.agents.map((agent, i) => (
                        <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explaination card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mt-8">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={24} className="text-emerald-400" />
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-white">How Progressive Disclosure Works</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                To prevent context window bloat and reduce hallucination, the orchestrator only injects these skills into the agent's prompt when a relevant intent is detected. For example, the <span className="font-mono text-emerald-400 bg-emerald-400/10 px-1 rounded">policy-auditor</span> skill is only loaded when a user submits architectural blueprints for validation.
              </p>
              <div className="h-px w-full bg-white/10 my-2"></div>
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-300">หลักการทำงานแบบ Progressive Disclosure:</span> เพื่อป้องกันปัญหาหน่วยความจำของ AI เต็ม (Context Bloat) และลดการมั่วข้อมูล (Hallucination) ระบบจะไม่โหลดทักษะทั้งหมดในครั้งเดียว แต่จะวิเคราะห์เจตนาของผู้ใช้และนำเข้าเฉพาะทักษะที่เกี่ยวข้องเท่านั้น หากทักษะใดถูก <span className="text-emerald-400 font-bold">Active</span> ไว้อยู่ ระบบจึงจะเรียกใช้งานได้
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
