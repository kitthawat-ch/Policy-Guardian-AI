"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Search,
  BookOpen,
  AlertCircle,
  Loader2,
  X,
  FileText,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";
import Link from "next/link";

const API_BASE = "http://localhost:8000/api";

interface Source {
  title: string;
  section_number: string;
  policy_section_id: number;
  policy_id?: number;
}

interface SectionDetail {
  id: number;
  policy_id: number;
  policy_title: string;
  section_number: string;
  title: string;
  content: string;
}

// ─────────────────────────────────────────────
// Section Detail Modal
// ─────────────────────────────────────────────
function SectionModal({
  sectionId,
  onClose,
}: {
  sectionId: number;
  onClose: () => void;
}) {
  const [data, setData] = useState<SectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/documents/sections/${sectionId}`);
        setData(res.data);
      } catch {
        setError("ไม่สามารถโหลดเนื้อหา section ได้");
      } finally {
        setLoading(false);
      }
    })();
  }, [sectionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-slate-700 text-sm">
              {data ? `${data.policy_title} — Section ${data.section_number}` : "กำลังโหลด..."}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">กำลังโหลดเนื้อหา...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          ) : data ? (
            <div>
              <h2 className="font-bold text-slate-800 text-lg mb-1">{data.title}</h2>
              <p className="text-xs text-slate-400 mb-4">
                Policy ID: {data.policy_id} · Section {data.section_number}
              </p>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border border-slate-100">
                {data.content}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Source Card (clickable)
// ─────────────────────────────────────────────
function SourceCard({ source, onClick }: { source: Source; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30 transition-all group cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-blue-600 group-hover:text-blue-700 truncate">
            {source.title} (Section {source.section_number})
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Policy ID: {source.policy_section_id}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  request_id?: number | null;
  type?: string;
  isStreaming?: boolean;
}

export default function AskPolicyPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openSectionId, setOpenSectionId] = useState<number | null>(null);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);
    setError("");
    setTicketSuccess(null);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        isStreaming: true,
      },
    ]);

    try {
      const activeSkills = JSON.parse(localStorage.getItem("activeSkills") || "[]");
      
      const payload = {
        question: userMessage.content,
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        user_id: 1,
        active_skills: activeSkills
      };

      const res = await fetch(`${API_BASE}/ask-policy-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to connect to AI assistant.");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n\n");
            
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.replace("data: ", "");
                if (!dataStr) continue;
                
                try {
                  const data = JSON.parse(dataStr);
                  
                  if (data.type === "metadata") {
                    setMessages((prev) => 
                      prev.map(m => m.id === assistantMessageId ? {
                        ...m,
                        sources: data.data.sources,
                        request_id: data.data.request_id,
                        type: data.data.req_type
                      } : m)
                    );
                  } else if (data.type === "chunk") {
                    setMessages((prev) => 
                      prev.map(m => m.id === assistantMessageId ? {
                        ...m,
                        content: m.content + data.data
                      } : m)
                    );
                  } else if (data.type === "done") {
                    setMessages((prev) => 
                      prev.map(m => m.id === assistantMessageId ? {
                        ...m,
                        isStreaming: false
                      } : m)
                    );
                  }
                } catch (err) {
                  console.error("Error parsing stream chunk:", err, dataStr);
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred.");
      setMessages((prev) => 
        prev.map(m => m.id === assistantMessageId ? {
          ...m,
          content: "Sorry, I encountered an error. Please try again.",
          isStreaming: false
        } : m)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCompliance = async (failedMessage: string) => {
    setSubmittingTicket(true);
    setError(null);
    try {
      const activeSkills = JSON.parse(localStorage.getItem("activeSkills") || "[]");
      const res = await axios.post(`${API_BASE}/validate-request`, {
        project_name: "Chat Escalation",
        description: failedMessage,
        user_id: 1,
        active_skills: activeSkills
      });
      setTicketSuccess(`Ticket submitted successfully! (Request ID: ${res.data.compliance_request_id || 'N/A'})\nตั๋วถูกส่งเรียบร้อยแล้ว! กรุณาไปที่ Review Queue เพื่อตรวจสอบ`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Failed to submit compliance request."
      );
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 h-full min-h-[calc(100vh-8rem)]">
      {/* Header Area */}
      <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-8 relative overflow-hidden flex-shrink-0">
        <h2 className="text-3xl font-black mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
          Ask Policy AI
        </h2>
        <p className="text-slate-600 mb-2 font-medium">
          Ask natural language questions about our company compliance policies and receive instant, cited answers.<br />
          <span className="text-slate-500 font-normal">สอบถามข้อมูลนโยบายบริษัทและรับคำตอบพร้อมแหล่งอ้างอิงทันที</span>
        </p>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-inner p-6 overflow-y-auto flex flex-col gap-6 h-[500px]">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">Start a conversation by typing your question below.<br/><span className="text-sm opacity-80">เริ่มสนทนาโดยพิมพ์คำถามของคุณด้านล่าง</span></p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-5 ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white shadow-md rounded-br-sm" 
                  : "bg-white border border-slate-200 shadow-sm rounded-bl-sm"
              }`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 tracking-wider">AI ASSISTANT</span>
                    {msg.isStreaming && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin ml-2" />}
                  </div>
                )}
                
                <div className={`prose max-w-none text-sm md:text-base ${msg.role === "user" ? "text-white" : "text-slate-700"}`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.isStreaming && msg.content === "" && (
                    <span className="animate-pulse text-slate-400">Thinking...</span>
                  )}
                </div>

                {/* Sources Section */}
                {msg.sources && msg.sources.length > 0 && !msg.isStreaming && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <BookOpen size={14} /> Cited Sources
                    </h4>
                    <div className="grid gap-2">
                      {msg.sources.map((source: Source, idx: number) => (
                        <SourceCard
                          key={idx}
                          source={source}
                          onClick={() => setOpenSectionId(source.policy_section_id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Compliance Action Section */}
                {msg.role === "assistant" && !msg.isStreaming && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    {msg.request_id ? (
                      <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-3 rounded-xl flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-bold mb-1">
                            Your request has been successfully submitted to the reviewer (ID: {msg.request_id})<br/>
                            <span className="font-normal opacity-80">คำขอของท่านถูกส่งไปยังผู้รับผิดชอบเรียบร้อยแล้ว (ID: {msg.request_id})</span>
                          </p>
                        </div>
                        <Link href="/reviewer" className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap">
                          Review Queue
                        </Link>
                      </div>
                    ) : !ticketSuccess ? (
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => handleRequestCompliance(msg.content)}
                          disabled={submittingTicket}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 border border-slate-200 w-full justify-center"
                        >
                          {submittingTicket ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                          Request Formal Compliance Check / ส่งคำขอตรวจสอบ
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <p className="text-xs font-medium whitespace-pre-wrap">{ticketSuccess}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg p-4 flex-shrink-0">
        <form onSubmit={handleAsk} className="relative flex items-center gap-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Ask a follow-up question... (e.g. Can we use public cloud?)"
            className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-700 text-sm md:text-base outline-none text-slate-800 placeholder-slate-400 resize-none h-[60px]"
          />
          <button
            disabled={loading}
            type="submit"
            className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-bold h-[60px] px-6 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center flex-shrink-0"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <span className="hidden sm:inline mr-2">Send</span> }
            {!loading && <ChevronRight size={20} />}
          </button>
        </form>
      </div>

      {/* Error Panel */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={24} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Section Detail Modal */}
      {openSectionId !== null && (
        <SectionModal
          sectionId={openSectionId}
          onClose={() => setOpenSectionId(null)}
        />
      )}
    </div>
  );
}
