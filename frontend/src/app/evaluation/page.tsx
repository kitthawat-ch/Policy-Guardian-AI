"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity, Target, FileText, ShieldCheck, Clock, Users,
  Loader2, ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2,
  MessageSquare, BookOpen, AlertCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const API_BASE = "http://localhost:8000/api";

// ─────────────────────────────────────────────
// Score Gauge (ring)
// ─────────────────────────────────────────────
function ScoreGauge({
  label, value, color,
}: {
  label: string; value: number | null; color: string;
}) {
  const pct = value !== null ? Math.round(value * 100) : null;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = pct !== null ? (pct / 100) * circ : 0;

  const colorMap: Record<string, string> = {
    indigo: "#6366f1",
    emerald: "#10b981",
    amber: "#f59e0b",
  };
  const stroke = colorMap[color] ?? "#6366f1";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        {pct !== null && (
          <circle
            cx="48" cy="48" r={r} fill="none"
            stroke={stroke} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset="0"
            transform="rotate(-90 48 48)"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        )}
        <text x="48" y="53" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e293b">
          {pct !== null ? `${pct}%` : "—"}
        </text>
      </svg>
      <p className="text-xs font-semibold text-slate-500 text-center">{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Score Badge
// ─────────────────────────────────────────────
function ScoreBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-400 text-sm">—</span>;
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? "bg-emerald-100 text-emerald-700" :
    pct >= 60 ? "bg-amber-100 text-amber-700" :
    "bg-rose-100 text-rose-700";
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {pct}%
    </span>
  );
}

// ─────────────────────────────────────────────
// Metric Card (existing)
// ─────────────────────────────────────────────
function MetricCard({ title, subtitle, value, trend, icon: Icon, colorClass, suffix = "%" }: any) {
  const actualTrendColor =
    title.includes("Time") || title.includes("Review")
      ? trend?.startsWith("-") ? "text-emerald-500" : "text-rose-500"
      : trend?.startsWith("+") ? "text-emerald-500" : "text-rose-500";

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorClass}`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${actualTrendColor} bg-white px-2 py-1 rounded-full shadow-sm`}>
          {trend?.startsWith("+") ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{title}</p>
        {subtitle && <p className="text-slate-400 text-xs font-medium mt-0.5">{subtitle}</p>}
        <div className="flex items-baseline gap-1 mt-1">
          <h3 className="text-4xl font-black text-slate-800">{value}</h3>
          {title !== "Average Response Time" && (
            <span className="text-xl font-bold text-slate-400">{suffix}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function EvaluationDashboard() {
  const [data, setData] = useState<any>(null);
  const [ragData, setRagData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ragLoading, setRagLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "employee") {
      window.location.href = "/";
      return;
    }

    axios.get(`${API_BASE}/evaluation/metrics`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    axios.get(`${API_BASE}/evaluation/rag-metrics`)
      .then(res => setRagData(res.data))
      .catch(console.error)
      .finally(() => setRagLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  const m = data?.metrics || {};
  const history = data?.historical_data || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Activity className="text-indigo-600" size={32} />
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI Performance &amp; Evaluation
          </h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Real-time RAG quality metrics + system performance<br/>
            <span className="text-xs">การประเมินคุณภาพ RAG และประสิทธิภาพของระบบแบบเรียลไทม์</span>
          </p>
        </div>
      </div>

      {/* ── RAG Quality Metrics (real data) ── */}
      <div className="bg-white/80 backdrop-blur-xl border border-indigo-100 rounded-3xl p-8 shadow-xl">
        <div className="flex items-start gap-3 mb-6">
          <Sparkles className="text-indigo-500 w-5 h-5 mt-1" />
          <h2 className="text-lg font-bold text-slate-800 leading-tight">
            RAG Quality Metrics<br/>
            <span className="text-sm font-normal text-slate-500">คุณภาพการดึงข้อมูลและตอบคำถาม</span>
          </h2>
          <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            คำนวณจากคำถามจริงทุกครั้ง
          </span>
        </div>

        {ragLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-indigo-400" size={32} />
          </div>
        ) : ragData?.total_evaluations === 0 ? (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
            <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <p className="text-sm text-slate-500">
              {ragData?.message ?? "ยังไม่มีข้อมูล — ลองถามคำถามใน Ask Policy AI ก่อนนะครับ"}
            </p>
          </div>
        ) : (
          <>
            {/* Gauges */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center bg-indigo-50 rounded-2xl p-6">
                <ScoreGauge label="Faithfulness" value={ragData?.averages?.faithfulness} color="indigo" />
                <p className="text-xs text-slate-500 text-center mt-2">คำตอบอ้างอิงจาก sources จริงไหม?</p>
              </div>
              <div className="flex flex-col items-center bg-emerald-50 rounded-2xl p-6">
                <ScoreGauge label="Answer Relevance" value={ragData?.averages?.answer_relevance} color="emerald" />
                <p className="text-xs text-slate-500 text-center mt-2">คำตอบตรงคำถามไหม?</p>
              </div>
              <div className="flex flex-col items-center bg-amber-50 rounded-2xl p-6">
                <ScoreGauge label="Context Relevance" value={ragData?.averages?.context_relevance} color="amber" />
                <p className="text-xs text-slate-500 text-center mt-2">ดึง policy ถูก section ไหม?</p>
              </div>
            </div>

            {/* Recent evaluations table */}
            <div>
              <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-start gap-2 leading-tight">
                <MessageSquare className="w-4 h-4 mt-0.5" />
                <div>
                  Recent Evaluations
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    (total: {ragData?.total_evaluations})
                  </span><br/>
                  <span className="text-xs font-normal text-slate-400">ประวัติการประเมินล่าสุด</span>
                </div>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-semibold">คำถาม</th>
                      <th className="px-4 py-3 text-center font-semibold">Faithfulness</th>
                      <th className="px-4 py-3 text-center font-semibold">Ans. Relevance</th>
                      <th className="px-4 py-3 text-center font-semibold">Ctx. Relevance</th>
                      <th className="px-4 py-3 text-center font-semibold">Sources</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ragData?.recent?.map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{row.query}</td>
                        <td className="px-4 py-3 text-center"><ScoreBadge value={row.faithfulness} /></td>
                        <td className="px-4 py-3 text-center"><ScoreBadge value={row.answer_relevance} /></td>
                        <td className="px-4 py-3 text-center"><ScoreBadge value={row.context_relevance} /></td>
                        <td className="px-4 py-3 text-center">
                          <span className="flex items-center justify-center gap-1 text-slate-500">
                            <BookOpen className="w-3.5 h-3.5" />
                            {row.sources_count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── System Performance Metrics (existing) ── */}
      <div>
        <h2 className="text-base font-bold text-slate-600 mb-4 flex items-start gap-2 leading-tight">
          <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5" /> 
          <div>
            System Performance<br/>
            <span className="text-xs font-normal text-slate-400">ประสิทธิภาพของระบบโดยรวม</span>
          </div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="Answer Accuracy" subtitle="ความแม่นยำของคำตอบ" value={m.answer_accuracy?.value} trend={m.answer_accuracy?.trend} icon={Target} colorClass="bg-indigo-100 text-indigo-600" />
          <MetricCard title="Citation Accuracy" subtitle="ความแม่นยำในการอ้างอิง" value={m.citation_accuracy?.value} trend={m.citation_accuracy?.trend} icon={FileText} colorClass="bg-purple-100 text-purple-600" />
          <MetricCard title="Compliance Accuracy" subtitle="ความแม่นยำด้านนโยบาย" value={m.compliance_accuracy?.value} trend={m.compliance_accuracy?.trend} icon={ShieldCheck} colorClass="bg-emerald-100 text-emerald-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <MetricCard title="Average Response Time" subtitle="เวลาตอบสนองเฉลี่ย" value={m.avg_response_time?.value} trend={m.avg_response_time?.trend} icon={Clock} colorClass="bg-amber-100 text-amber-600" />
          <MetricCard title="Human Review Rate" subtitle="อัตราการส่งให้คนตรวจสอบ" value={m.human_review_rate?.value} trend={m.human_review_rate?.trend} icon={Users} colorClass="bg-rose-100 text-rose-600" />
        </div>
      </div>

      {/* Weekly chart */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl">
        <h3 className="text-lg font-bold mb-8 leading-tight">
          Weekly Performance Trends<br/>
          <span className="text-sm font-normal text-slate-500">แนวโน้มประสิทธิภาพรายสัปดาห์</span>
        </h3>
        
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                formatter={(value: any, name: string) => {
                  if (value === null || value === undefined) return ["No data", name];
                  return [`${value}%`, name];
                }}
                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
              />
              <Bar dataKey="accuracy" name="Accuracy (ความแม่นยำ)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="human_reviews" name="Human Review (ส่งคนตรวจ)" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full mt-1" />
            <span className="text-sm font-bold text-slate-600 leading-tight">
              Accuracy<br/><span className="text-xs font-normal text-slate-400">ความแม่นยำ</span>
            </span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-rose-400 rounded-full mt-1" />
            <span className="text-sm font-bold text-slate-600 leading-tight">
              Human Review Rate<br/><span className="text-xs font-normal text-slate-400">อัตราการส่งให้คนตรวจ</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
