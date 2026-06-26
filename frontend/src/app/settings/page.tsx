"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Settings,
  Key,
  Database,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Server,
  Database as DatabaseIcon,
  Bot
} from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-3.5-flash");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load API Key from backend on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/system/config");
        if (res.data?.gemini_api_key) {
          setApiKey(res.data.gemini_api_key);
        }
        if (res.data?.gemini_model) {
          setGeminiModel(res.data.gemini_model);
        }
      } catch (error) {
        console.error("Failed to load config", error);
      }
    };
    fetchConfig();
  }, []);

  const handleSaveApiKey = async () => {
    setIsSavingKey(true);
    setSaveSuccess(false);
    
    try {
      await axios.post("http://localhost:8000/api/system/config", {
        gemini_api_key: apiKey,
        gemini_model: geminiModel
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save config", error);
      alert("เกิดข้อผิดพลาดในการบันทึก API Key");
    } finally {
      setIsSavingKey(false);
    }
  };

  const resetSystem = async () => {
    setResetLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/system/reset");
      if (res.data?.status === "success") {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Failed to reset system", error);
      alert("เกิดข้อผิดพลาดในการรีเซ็ตระบบ");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg text-white">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent leading-tight">
            System Settings<br/>
            <span className="text-sm font-normal text-slate-500">ตั้งค่าระบบ</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* API Configuration */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-white">
            <Key className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-800 leading-tight">
              API Configuration<br/>
              <span className="text-sm font-normal text-slate-500">การตั้งค่าการเชื่อมต่อ API</span>
            </h2>
          </div>
          <div className="p-8">
            <div className="max-w-xl">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Gemini API Key
              </label>
              <div className="flex flex-col gap-3">
                <input 
                  type="password" 
                  placeholder="AIzaSy..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/50"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Gemini Model
                </label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/50 appearance-none cursor-pointer"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Fast & versatile)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast & lightweight)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Stable fallback)</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 mt-4">
                  <button 
                    onClick={handleSaveApiKey}
                    disabled={isSavingKey}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 shadow-md"
                  >
                    {isSavingKey ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Save Key
                  </button>
                  {saveSuccess && (
                    <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                      <CheckCircle2 className="w-4 h-4" />
                      Saved successfully
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                คีย์ API จะถูกอัปเดตลงในระบบและบันทึกทับในไฟล์ <code>.env</code> ให้โดยอัตโนมัติ คุณสามารถเปลี่ยนหรือลบคีย์ในไฟล์ <code>.env</code> ผ่านหน้านี้ได้เลย
              </p>
            </div>
          </div>
        </div>

        {/* System Data Management */}
        <div className="bg-white/80 backdrop-blur-xl border border-rose-100 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-8 py-6 border-b border-rose-50 flex items-center gap-3 bg-rose-50/30">
            <Database className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-800 leading-tight">
              Data Management<br/>
              <span className="text-sm font-normal text-slate-500">การจัดการข้อมูลระบบ</span>
            </h2>
          </div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Reset All Demo Data
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  ลบข้อมูลจำลองทั้งหมดในระบบเพื่อเริ่มต้นใหม่ การกระทำนี้จะลบข้อมูลต่อไปนี้:
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-500 list-disc list-inside">
                  <li>Audit Logs (ประวัติการใช้งานระบบ)</li>
                  <li>RAG Evaluations (ประวัติการประเมินประสิทธิภาพ AI)</li>
                  <li>Compliance Requests (รายการขอตรวจสอบนโยบาย)</li>
                  <li>Review Tickets (ตั๋วร้องขอให้คนตรวจสอบ)</li>
                  <li>Knowledge Base (เอกสารและนโยบายทั้งหมดในระบบ)</li>
                </ul>
              </div>
              <button 
                onClick={() => setShowConfirmModal(true)} 
                disabled={resetLoading}
                className="flex items-center gap-2 px-6 py-3 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm flex-shrink-0"
              >
                {resetLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                Reset Data
              </button>
            </div>
          </div>
        </div>

        {/* Technology Stack Showcase */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl mb-12">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800 leading-tight">
              Technology Stack<br/>
              <span className="text-sm font-normal text-slate-500">เทคโนโลยีที่ใช้ในโปรเจกต์นี้</span>
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base mb-1">Next.js & TailwindCSS</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Frontend พัฒนาด้วย React Framework ที่ทันสมัยที่สุด พร้อมจัดการ Styling ด้วย TailwindCSS เพื่อ UI ที่สวยงามและตอบสนองไว
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-green-200 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base mb-1">FastAPI (Python)</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Backend API ประสิทธิภาพสูง เขียนด้วย Python รันได้รวดเร็ว รองรับ Asynchronous และเหมาะกับงาน AI
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base mb-1">Google Gemini AI</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    ขุมพลังปัญญาประดิษฐ์จาก Google ที่ทำหน้าที่ทั้ง RAG Evaluator, Intent Routing และทำความเข้าใจ Policy ที่ซับซ้อน
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
                  <DatabaseIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base mb-1">PostgreSQL & pgvector</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    ฐานข้อมูลหลักของระบบ พร้อมส่วนขยาย pgvector สำหรับจัดเก็บและค้นหา Vector Embeddings (Semantic Search)
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-rose-50 p-6 flex flex-col items-center text-center border-b border-rose-100">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-2xl font-black text-rose-700 mb-1">Are you sure?</h3>
              <p className="text-rose-600/80 font-medium text-sm">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            </div>
            <div className="p-6">
              <p className="text-slate-600 text-center mb-8">
                ข้อมูล Demo ทั้งหมด รวมถึงประวัติการแชท นโยบายจำลอง และการประเมิน RAG จะถูก <strong>ลบอย่างถาวร</strong>
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  disabled={resetLoading}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={resetSystem}
                  disabled={resetLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resetLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  Yes, Reset Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Reset Successful!</h3>
              <p className="text-slate-500 mb-8">
                ข้อมูล Demo ทั้งหมดถูกล้างเรียบร้อยแล้ว ระบบกลับสู่สถานะเริ่มต้น
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
