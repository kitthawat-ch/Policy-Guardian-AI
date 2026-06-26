"use client";

import { useState, useEffect } from "react";
import { Terminal, Database, Clock, ChevronDown, ChevronUp, Loader2, Sparkles, RefreshCw } from "lucide-react";

export default function LLMLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/llm-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch LLM logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg border border-white/50 text-white">
              <Terminal size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                LLM Monitor <Sparkles className="text-amber-400" size={20} />
              </h1>
              <p className="text-sm font-medium text-slate-500">
                ระบบตรวจสอบคำสั่ง Prompt และ Response ของ AI แบบเรียลไทม์
              </p>
            </div>
          </div>
          <button 
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-sm shadow-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh Data
          </button>
        </div>

        {/* Content */}
        {loading && logs.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <Database size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">ยังไม่มีข้อมูล Log ของ AI ในระบบ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                
                {/* Accordion Header */}
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <CpuIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{log.agent_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                        <Clock size={12} />
                        {new Date(log.created_at.endsWith('Z') ? log.created_at : log.created_at + 'Z').toLocaleString('th-TH')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      Success
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      {expandedId === log.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Accordion Body */}
                {expandedId === log.id && (
                  <div className="border-t border-slate-200 bg-slate-50 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                    
                    {/* Prompt Box */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Raw Prompt (ส่งให้ AI)</h4>
                      <div className="bg-[#1e1e1e] rounded-xl p-4 overflow-auto max-h-[500px] border border-slate-800 shadow-inner">
                        <pre className="text-emerald-400 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                          {log.prompt}
                        </pre>
                      </div>
                    </div>

                    {/* Response Box */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">AI Response (ตอบกลับ)</h4>
                      <div className="bg-[#1e1e1e] rounded-xl p-4 overflow-auto max-h-[500px] border border-slate-800 shadow-inner">
                        <pre className="text-sky-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                          {log.response}
                        </pre>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function CpuIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
      <rect x="9" y="9" width="6" height="6"></rect>
      <line x1="9" y1="1" x2="9" y2="4"></line>
      <line x1="15" y1="1" x2="15" y2="4"></line>
      <line x1="9" y1="20" x2="9" y2="23"></line>
      <line x1="15" y1="20" x2="15" y2="23"></line>
      <line x1="20" y1="9" x2="23" y2="9"></line>
      <line x1="20" y1="14" x2="23" y2="14"></line>
      <line x1="1" y1="9" x2="4" y2="9"></line>
      <line x1="1" y1="14" x2="4" y2="14"></line>
    </svg>
  );
}
