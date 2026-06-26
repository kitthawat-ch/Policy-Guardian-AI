"use client";

import { useState } from "react";
import axios from "axios";
import { ShieldAlert, CheckCircle, Clock, Loader2, AlertCircle } from "lucide-react";

export default function ComplianceCheckPage() {
  const [form, setForm] = useState({ project_name: "", description: "" });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_name || !form.description) return;
    
    setLoading(true);
    setResult(null);
    setError("");
    
    try {
      const res = await axios.post("http://localhost:8000/api/validate-request", {
        user_id: 1, // hardcoded user for MVP
        project_name: form.project_name,
        description: form.description
      });
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred during evaluation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 h-full min-h-[calc(100vh-8rem)]">
      {/* Form Area */}
      <div className="flex-1 bg-white/80 backdrop-blur-lg border border-slate-200 rounded-3xl shadow-2xl p-8 flex flex-col">
        <div className="mb-8">
           <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Compliance Checker</h2>
           <p className="text-slate-500 mt-2">Submit your project architecture for instant AI policy validation.</p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
            <input 
              type="text" 
              value={form.project_name}
              onChange={(e) => setForm({...form, project_name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-shadow"
              placeholder="e.g., Cloud Migration v2"
              required
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Architecture Description</label>
            <textarea 
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-shadow min-h-[200px]"
              placeholder="Describe where data is stored, what technologies are used, encryption methods, etc."
              required
            ></textarea>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Run AI Validation"}
          </button>
        </form>
      </div>

      {/* Result Panel */}
      <div className="w-full md:w-[400px]">
        {result ? (
          <div className={`h-full p-8 rounded-3xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-8 flex flex-col ${
            result.status === "approved" ? "bg-emerald-50/90 border-emerald-200 " :
            result.status === "rejected" ? "bg-rose-50/90 border-rose-200 " :
            "bg-amber-50/90 border-amber-200 "
          }`}>
            <div className="flex items-center gap-4 mb-6">
               {result.status === "approved" && <CheckCircle className="text-emerald-500" size={36} />}
               {result.status === "rejected" && <ShieldAlert className="text-rose-500" size={36} />}
               {result.status === "under_review" || result.status === "pending" ? <Clock className="text-amber-500" size={36} /> : null}
               <div>
                 <h3 className="font-extrabold text-2xl">
                   {result.status === "approved" ? "Approved" : result.status === "rejected" ? "Denied" : "Pending Review"}
                 </h3>
                 <p className="text-sm opacity-80 mt-1 uppercase tracking-wider font-bold">Risk Score: {result.risk_score || "N/A"}</p>
               </div>
            </div>
            
            <div className="bg-white/50 p-5 rounded-2xl mb-6 shadow-inner">
               <p className="text-sm font-medium leading-relaxed">{result.overall_assessment || "Validation completed."}</p>
            </div>

            {result.flagged_sections && result.flagged_sections.length > 0 && (
              <div className="flex-1 overflow-auto">
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">Flagged Policies</h4>
                <div className="space-y-3">
                  {result.flagged_sections.map((flag: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                      <p className="font-bold text-sm text-rose-600 mb-2">Section {flag.section_number}</p>
                      <p className="text-sm text-slate-600 ">{flag.ai_analysis}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full p-8 rounded-3xl border border-dashed border-slate-300 bg-white/30 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="text-slate-400" size={32} />
             </div>
            <p className="text-slate-500 font-medium">The AI Copilot will evaluate your request against organizational policies in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
