"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  File,
  ChevronRight,
  BookOpen,
  X,
  Zap,
  FileCode,
  Terminal,
} from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface PolicyDoc {
  id: number;
  title: string;
  version: string;
  description: string | null;
  status: string;
  section_count: number;
  created_at: string;
}

interface UploadResult {
  policy_id: number;
  title: string;
  total_chunks: number;
  message: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso.endsWith('Z') ? iso : iso + 'Z').toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fileSizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─────────────────────────────────────────────
// UploadZone
// ─────────────────────────────────────────────
function UploadZone({
  onUpload,
}: {
  onUpload: (file: File, title?: string) => Promise<void>;
}) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      await onUpload(selectedFile, customTitle || undefined);
      // result will be set by parent callback, we just clear here
      setResult({ policy_id: 0, title: "", total_chunks: 0, message: "success" });
      setSelectedFile(null);
      setCustomTitle("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
      <h2 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
        <Upload className="w-4 h-4 text-blue-500" />
        Upload New Document <span className="text-xs text-slate-400 font-normal ml-1">(อัปโหลดเอกสารใหม่)</span>
      </h2>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl cursor-pointer transition-all py-10 flex flex-col items-center gap-3 ${
          dragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.md"
          onChange={handleFileChange}
        />
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          <Upload className="w-6 h-6 text-blue-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">
            Drag and drop file here, or click to select
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            (ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์)
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Supports .pdf, .txt, .md (Max 10 MB)
          </p>
        </div>
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-400">{fileSizeLabel(selectedFile.size)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Optional custom title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Document Title <span className="text-slate-400 font-normal">(Optional - defaults to filename)</span> / ชื่อเอกสาร <span className="text-slate-400 font-normal">(ไม่บังคับ)</span>
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g., Data Security Policy 2024 / เช่น นโยบายความปลอดภัย 2567"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing and Saving... (กำลังประมวลผล...)
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload and Import to Knowledge Base (อัปโหลดและนำเข้า)
              </>
            )}
          </button>
        </div>
      )}

      {/* Result / Error */}
      {result && (
        <div className="mt-4 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">อัปโหลดสำเร็จ! เอกสารพร้อมให้ AI ค้นหาแล้ว</p>
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DeleteConfirmModal
// ─────────────────────────────────────────────
function DeleteConfirmModal({
  doc,
  onConfirm,
  onCancel,
  loading,
}: {
  doc: PolicyDoc;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">ยืนยันการลบ</h3>
            <p className="text-xs text-slate-500">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 mb-1">
          คุณต้องการลบเอกสาร:
        </p>
        <p className="text-sm font-semibold text-slate-900 bg-slate-50 rounded-lg px-3 py-2 mb-4">
          &quot;{doc.title}&quot;
        </p>
        <p className="text-xs text-slate-500 mb-5">
          จะมีการลบ {doc.section_count} sections ออกจาก Knowledge Base และ AI จะไม่สามารถค้นหาข้อมูลจากเอกสารนี้ได้อีก
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            ลบเอกสาร
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DocumentCard
// ─────────────────────────────────────────────
function DocumentCard({
  doc,
  onDelete,
}: {
  doc: PolicyDoc;
  onDelete: (doc: PolicyDoc) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-sm truncate">{doc.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                v{doc.version} · เพิ่มเมื่อ {formatDate(doc.created_at)}
              </p>
            </div>
            <span
              className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${
                doc.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {doc.status}
            </span>
          </div>

          {doc.description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{doc.description}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <File className="w-3.5 h-3.5" />
              <span>
                <span className="font-semibold text-slate-700">{doc.section_count}</span> sections
                ที่ AI ค้นหาได้
              </span>
            </div>
            <button
              onClick={() => onDelete(doc)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<PolicyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PolicyDoc | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<UploadResult | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await axios.get(`${API_BASE}/documents/?t=${Date.now()}`);
      setDocs(res.data);
    } catch (e: any) {
      setFetchError(e.response?.data?.detail || e.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleUpload = async (file: File, title?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    try {
      const res = await axios.post(`${API_BASE}/documents/upload`, formData);
      setUploadSuccess(res.data);
      await fetchDocs(); // refresh list
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Upload failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_BASE}/documents/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchDocs();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Knowledge Base</h1>
            <p className="text-sm text-slate-500">
              Upload policy documents for instant AI search and Q&A<br/>
              <span className="text-xs text-slate-400">อัปโหลดเอกสารนโยบายเพื่อให้ AI Agent ค้นหาและตอบคำถามได้ทันที</span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
            <span className="text-2xl font-bold text-indigo-600">{docs.length}</span>
            <p className="text-xs text-slate-500 mt-0.5">Documents in System <span className="text-[10px] text-slate-400 block">(เอกสารในระบบ)</span></p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
            <span className="text-2xl font-bold text-emerald-600">
              {docs.reduce((s, d) => s + d.section_count, 0)}
            </span>
            <p className="text-xs text-slate-500 mt-0.5">Searchable Sections <span className="text-[10px] text-slate-400 block">(ส่วนที่ AI ค้นหาได้)</span></p>
          </div>
        </div>
      </div>

      {/* How it works Banner */}
      <div className="mb-6 flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
        <ChevronRight className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-800 leading-relaxed space-y-2">
          <p>
            <strong className="font-semibold text-indigo-900">EN: How it works:</strong> Upon upload, the system extracts text from your document, splits it into ~800 character chunks, and stores it in the Knowledge Base database. The AI Agent can then instantly search through this data using the <code className="font-mono bg-indigo-100 px-1 rounded">search_policy</code> Tool to answer questions with automatic citations.
          </p>
          <div className="border-t border-indigo-200/50"></div>
          <p>
            <strong className="font-semibold text-indigo-900">TH: วิธีการทำงาน:</strong> เมื่อคุณอัปโหลดเอกสาร ระบบจะสกัดข้อความ หั่นออกเป็นส่วนย่อย (Chunks) ส่วนละประมาณ 800 ตัวอักษร แล้วบันทึกลงในฐานข้อมูล Knowledge Base จากนั้น AI Agent จะสามารถใช้ Tool <code className="font-mono bg-indigo-100 px-1 rounded">search_policy</code> เพื่อค้นหาเนื้อหาที่เกี่ยวข้องและนำไปตอบคำถามพร้อมแนบแหล่งอ้างอิงได้ทันที
          </p>
        </div>
      </div>

      {/* Executive Concept & Evidence */}
      <div className="mb-6 bg-gradient-to-r from-slate-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-lg font-bold text-blue-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Executive Concept (Semantic Chunking Algorithm)
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-slate-200 leading-relaxed italic border-l-4 border-blue-400 pl-4 py-1">
              <strong className="text-blue-200 font-semibold mb-1 block not-italic">EN:</strong>
              "To prevent context fragmentation, our RAG system doesn't just blindly cut text at 800 characters. It uses a Smart Semantic Chunking algorithm that prioritizes Markdown headers, followed by paragraph breaks and sentence endings. This guarantees that words and core concepts are never split in half."
            </p>
            <p className="text-sm text-slate-200 leading-relaxed italic border-l-4 border-blue-400 pl-4 py-1">
              <strong className="text-blue-200 font-semibold mb-1 block not-italic">TH:</strong>
              "เพื่อป้องกันปัญหาบริบทขาดหาย ระบบของเราไม่ได้สับข้อความทิ้งดื้อๆ ที่ 800 ตัวอักษรครับ แต่อัลกอริทึมจะหาจุดตัดที่สมเหตุสมผล โดยไล่ลำดับจากหัวข้อ (Markdown Headers), ย่อหน้าใหม่, และจุดจบประโยค ทำให้มั่นใจได้ว่าคำศัพท์หรือใจความสำคัญจะไม่ถูกหั่นขาดออกจากกันเด็ดขาด"
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-blue-500/30 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
              <FileCode className="w-4 h-4" /> Source Code Evidence (หลักฐานการใช้งานจริง):
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono">
              <li className="flex items-start gap-2">
                <Terminal className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">backend/app/api/endpoints/documents.py</strong> (Line 32-75)<br/>
                  <div className="mt-1 space-y-1">
                    <div className="text-slate-400 text-[10px] font-sans">
                      <strong className="text-slate-300">TH:</strong> ฟังก์ชัน <code>_chunk_text()</code> มีการใช้ Regex <code>{"re.search(r'^#{1,3}\\s+', text)"}</code> เพื่อหาหัวข้อ และถ้าเนื้อหายาวไป จะถอยหา <code>\n</code> หรือ <code>.</code> เพื่อจบ Chunk เสมอ
                    </div>
                  </div>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload success toast */}
      {uploadSuccess && (
        <div className="mb-4 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">
              ✅ นำเข้าสำเร็จ: &quot;{uploadSuccess.title}&quot;
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              แบ่งออกเป็น {uploadSuccess.total_chunks} sections — AI สามารถค้นหาข้อมูลจากเอกสารนี้ได้แล้ว
            </p>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="text-emerald-400 hover:text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <UploadZone onUpload={handleUpload} />

      {/* Document List */}
      <div>
        <h2 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-400" />
          System Documents <span className="text-slate-400 font-normal text-xs">(เอกสารในระบบ)</span> - {docs.length}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">กำลังโหลดรายการเอกสาร...</span>
          </div>
        ) : fetchError ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{fetchError}</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No documents found (ยังไม่มีเอกสารในระบบ)</p>
            <p className="text-xs mt-1">Upload a document above to get started (อัปโหลดเอกสารด้านบนเพื่อเริ่มต้น)</p>
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          doc={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
