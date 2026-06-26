"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ShieldCheck, Inbox, Activity, Cpu, Database, Settings, HelpCircle, ChevronDown, User, Shield, Terminal, Award } from "lucide-react";

export default function Sidebar() {
  const [role, setRole] = useState<"employee" | "compliance">("compliance");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as "employee" | "compliance";
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleRoleChange = (newRole: "employee" | "compliance") => {
    setRole(newRole);
    localStorage.setItem("userRole", newRole);
    setIsRoleDropdownOpen(false);
  };

  const navItemClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      isActive ? "bg-slate-100/80 shadow-sm" : "hover:bg-slate-100"
    }`;
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white/70 backdrop-blur-md flex flex-col h-screen fixed left-0 top-0 shadow-[4px_0_24px_rgba(0,36,125,0.05)]">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3.5 bg-white">
        <div className="w-11 h-11 flex-shrink-0 rounded-[14px] bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-400 flex items-center justify-center shadow-lg shadow-indigo-200/60 text-white transform transition-all hover:scale-110 hover:rotate-3 duration-300 cursor-default">
          <ShieldCheck size={24} strokeWidth={2.5} className="drop-shadow-sm" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-[19px] font-extrabold text-slate-700 tracking-tight leading-tight flex items-center flex-wrap">
            Policy
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 ml-1">
              Guardian
            </span>
          </h1>
          <div className="mt-1">
            <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase border border-indigo-100/50 shadow-sm">
              Enterprise AI
            </span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-3 mt-2 px-3">
          <div className="text-xs font-bold text-slate-600 tracking-wider">PRESENTATION</div>
          <div className="text-[10px] font-medium text-slate-400">โครงงานจบ</div>
        </div>
        <Link href="/capstone" className={navItemClass("/capstone")}>
          <Award size={18} className="text-amber-500 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">Capstone Showcase</span>
            <span className="text-[10px] text-slate-500">ผลงานและหลักฐาน</span>
          </div>
        </Link>
        <div className="mb-3 mt-6 px-3">
          <div className="text-xs font-bold text-slate-600 tracking-wider">EMPLOYEE</div>
          <div className="text-[10px] font-medium text-slate-400">พนักงาน</div>
        </div>
        <Link href="/" className={navItemClass("/")}>
          <BookOpen size={18} className="text-blue-500 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">Policy Search</span>
            <span className="text-[10px] text-slate-500">ค้นหานโยบาย</span>
          </div>
        </Link>

        {role === "compliance" && (
          <>
            <div className="mb-3 mt-6 px-3">
              <div className="text-xs font-bold text-slate-600 tracking-wider">COMPLIANCE TEAM</div>
              <div className="text-[10px] font-medium text-slate-400">ทีมตรวจสอบ</div>
            </div>
            <Link href="/reviewer" className={navItemClass("/reviewer")}>
              <Inbox size={18} className="text-amber-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Review Queue</span>
                <span className="text-[10px] text-slate-500">รายการรอตรวจ</span>
              </div>
            </Link>
            <Link href="/evaluation" className={navItemClass("/evaluation")}>
              <Activity size={18} className="text-indigo-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Evaluation Dashboard</span>
                <span className="text-[10px] text-slate-500">ประเมินผล AI</span>
              </div>
            </Link>
            <Link href="/audit" className={navItemClass("/audit")}>
              <Activity size={18} className="text-rose-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Audit Logs</span>
                <span className="text-[10px] text-slate-500">ประวัติการใช้งาน</span>
              </div>
            </Link>
            <Link href="/knowledge-base" className={navItemClass("/knowledge-base")}>
              <Database size={18} className="text-indigo-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Knowledge Base</span>
                <span className="text-[10px] text-slate-500">ฐานข้อมูล</span>
              </div>
            </Link>
          </>
        )}

        {role === "compliance" && (
          <>
            <div className="mb-3 mt-6 px-3">
              <div className="text-xs font-bold text-slate-600 tracking-wider">DEVELOPER</div>
              <div className="text-[10px] font-medium text-slate-400">นักพัฒนา</div>
            </div>
            <Link href="/skills" className={navItemClass("/skills")}>
              <Cpu size={18} className="text-emerald-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Agent Skills</span>
                <span className="text-[10px] text-slate-500">จัดการทักษะ AI</span>
              </div>
            </Link>
            <Link href="/mcp-hub" className={navItemClass("/mcp-hub")}>
              <Database size={18} className="text-purple-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">MCP Hub</span>
                <span className="text-[10px] text-slate-500">จัดการส่วนเสริม</span>
              </div>
            </Link>
            <Link href="/llm-logs" className={navItemClass("/llm-logs")}>
              <Terminal size={18} className="text-pink-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">LLM Monitor</span>
                <span className="text-[10px] text-slate-500">ประวัติคำสั่ง AI</span>
              </div>
            </Link>
            <Link href="/settings" className={navItemClass("/settings")}>
              <Settings size={18} className="text-slate-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Settings</span>
                <span className="text-[10px] text-slate-500">ตั้งค่าระบบ</span>
              </div>
            </Link>
          </>
        )}

        <div className="mb-3 mt-6 px-3">
          <div className="text-xs font-bold text-slate-600 tracking-wider">HELP & RESOURCES</div>
          <div className="text-[10px] font-medium text-slate-400">คู่มือการใช้งาน</div>
        </div>
        <Link href="/tutorial" className={navItemClass("/tutorial")}>
          <HelpCircle size={18} className="text-sky-500 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">Tutorial & Data</span>
            <span className="text-[10px] text-slate-500">โหลดข้อมูลทดสอบ</span>
          </div>
        </Link>

      </nav>

      {/* Role Switcher Area */}
      <div className="relative p-4 border-t border-slate-200">
        <button 
          onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
          className="w-full flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
              {role === "compliance" ? <Shield size={14} /> : <User size={14} />}
            </div>
            <div className="text-left">
              <div className="font-bold text-xs text-slate-800">Current Role</div>
              <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">
                {role === "compliance" ? "Compliance Team" : "Employee"}
              </div>
            </div>
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isRoleDropdownOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
            <button
              onClick={() => handleRoleChange("compliance")}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-2 transition-colors ${role === "compliance" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700 font-medium"}`}
            >
              <Shield size={16} className={role === "compliance" ? "text-indigo-600" : "text-slate-400"} />
              Compliance Team
            </button>
            <button
              onClick={() => handleRoleChange("employee")}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-2 transition-colors ${role === "employee" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700 font-medium"}`}
            >
              <User size={16} className={role === "employee" ? "text-indigo-600" : "text-slate-400"} />
              Employee
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
