"use client";

import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  ShieldCheck,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Zap,
  Code2,
  Info,
  FileCode,
  Terminal,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Tool Definitions (mirroring the Python MCPs)
───────────────────────────────────────────── */
const MCP_TOOLS = [
  {
    id: "search_policy",
    name: "search_policy",
    category: "Retrieval",
    icon: Search,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    badgeColor: "bg-blue-100 text-blue-700",
    description:
      "ค้นหานโยบายที่เกี่ยวข้องจาก Vector Store โดยใช้ Semantic Search เพื่อดึงเอกสารที่ตรงกับคำค้นหาของผู้ใช้มากที่สุด",
    descriptionEn:
      "Performs semantic similarity search against the policy vector store to retrieve the most relevant policy documents for a given query.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query string to find relevant policies.\n(ข้อความที่ใช้ค้นหานโยบายที่เกี่ยวข้อง)",
        },
        top_k: {
          type: "integer",
          description: "Number of top results to return.\n(จำนวนผลลัพธ์สูงสุดที่ต้องการให้แสดง ค่าเริ่มต้น: 5)",
          default: 5,
        },
      },
      required: ["query"],
    },
    returns: "List of matching policy chunks with their content and metadata.",
    example: {
      query: "data retention policy for customer records",
      top_k: 3,
    },
  },
  {
    id: "validate_compliance_request",
    name: "validate_compliance_request",
    category: "Validation",
    icon: ShieldCheck,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
    badgeColor: "bg-emerald-100 text-emerald-700",
    description:
      "ประเมินคำขอโปรเจกต์เทียบกับนโยบายองค์กร คำนวณ Risk Score และออก Compliance Verdict พร้อม Justification โดยละเอียด",
    descriptionEn:
      "Evaluates a project request against organizational policies, computes a risk score (0-100), and returns a compliance verdict with detailed justification.",
    parameters: {
      type: "object",
      properties: {
        project_name: {
          type: "string",
          description: "The name of the project being evaluated.\n(ชื่อโปรเจกต์ที่ต้องการประเมิน)",
        },
        description: {
          type: "string",
          description: "A detailed description of the project activities.\n(รายละเอียดของกิจกรรมหรือการทำงานในโปรเจกต์)",
        },
        data_types: {
          type: "array",
          items: { type: "string" },
          description: "List of data types the project will handle.\n(รายการประเภทของข้อมูลที่โปรเจกต์จะนำไปใช้งาน)",
        },
        department: {
          type: "string",
          description: "The department submitting the project request.\n(แผนกหรือฝ่ายที่ส่งคำขอโปรเจกต์)",
        },
      },
      required: ["project_name", "description", "data_types", "department"],
    },
    returns:
      "violation_detected (boolean), risk_score (0-100), and ai_analysis (string).",
    example: {
      project_name: "Customer Analytics Dashboard",
      description: "Build a dashboard using customer purchase data",
      data_types: ["PII", "Financial Records"],
      department: "Marketing",
    },
  },
  {
    id: "create_human_review_ticket",
    name: "create_human_review_ticket",
    category: "HITL",
    icon: ClipboardList,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-700",
    description:
      "สร้างตั๋วสำหรับ Human-in-the-Loop Review เมื่อ Risk Score อยู่ในระดับกลาง (50-80) หรือสูง (>80) เพื่อส่งต่อให้ทีม Compliance ตรวจสอบ",
    descriptionEn:
      "Creates a Human-in-the-Loop review ticket when risk is medium or high, routing the request to the compliance team for manual inspection.",
    parameters: {
      type: "object",
      properties: {
        project_name: {
          type: "string",
          description: "The name of the project requiring review.\n(ชื่อโปรเจกต์ที่ต้องได้รับการตรวจสอบ)",
        },
        risk_score: {
          type: "number",
          description: "The calculated risk score (0-100) from validation.\n(คะแนนความเสี่ยงที่คำนวณได้จากการประเมินเบื้องต้น)",
        },
        compliance_notes: {
          type: "string",
          description: "Summary of compliance concerns to include in the ticket.\n(สรุปข้อกังวลด้านนโยบายที่จะระบุลงในตั๋วตรวจสอบ)",
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
          description: "Ticket priority level based on risk score.\n(ระดับความสำคัญของตั๋วประเมินจากคะแนนความเสี่ยง)",
        },
      },
      required: ["project_name", "risk_score", "compliance_notes", "priority"],
    },
    returns:
      "Ticket ID, assigned reviewer, estimated review time, and ticket status.",
    example: {
      project_name: "Customer Analytics Dashboard",
      risk_score: 72,
      compliance_notes: "Handles PII without explicit consent flow documented.",
      priority: "high",
    },
  },
];

/* ─────────────────────────────────────────────
   Category Badge
───────────────────────────────────────────── */
function CategoryBadge({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}
    >
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   JSON Schema Viewer
───────────────────────────────────────────── */
function JsonBlock({ data }: { data: object }) {
  return (
    <pre className="bg-slate-900 text-slate-100 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

/* ─────────────────────────────────────────────
   Tool Card
───────────────────────────────────────────── */
function ToolCard({ tool }: { tool: (typeof MCP_TOOLS)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = tool.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl ${tool.iconBg} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-6 h-6 ${tool.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="font-mono font-bold text-slate-800 text-base">
                {tool.name}
              </h2>
              <CategoryBadge
                label={tool.category}
                colorClass={tool.badgeColor}
              />
            </div>
            <p className="text-sm text-slate-600 mb-1">{tool.description}</p>
            <p className="text-xs text-slate-400 italic">{tool.descriptionEn}</p>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="mt-4 flex gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Code2 className="w-3.5 h-3.5" />
            <span>
              <span className="font-semibold text-slate-700">
                {tool.parameters.required.length}
              </span>{" "}
              required params
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5" />
            <span>
              <span className="font-semibold text-slate-700">
                {Object.keys(tool.parameters.properties).length}
              </span>{" "}
              total params
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-emerald-600 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Expand Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <span>{expanded ? "Hide Details" : "View Schema & Example"}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Expandable Detail Panel */}
      {expanded && (
        <div className="p-6 border-t border-slate-100 space-y-5 bg-slate-50/50">
          {/* Parameters Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Input Parameters
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600">
                      Parameter
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600">
                      Type
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600">
                      Required
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(tool.parameters.properties).map(
                    ([key, val]) => {
                      const v = val as {
                        type: string;
                        description: string;
                        default?: unknown;
                        enum?: string[];
                        items?: { type: string };
                      };
                      const isRequired =
                        tool.parameters.required.includes(key);
                      return (
                        <tr
                          key={key}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-4 py-2.5 font-mono font-semibold text-blue-700">
                            {key}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                              {v.type === "array"
                                ? `${v.type}[${v.items?.type}]`
                                : v.type}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            {isRequired ? (
                              <span className="text-emerald-600 font-semibold">
                                ✓
                              </span>
                            ) : (
                              <span className="text-slate-400">–</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 whitespace-pre-line leading-relaxed">
                            {v.description}
                            {v.default !== undefined && (
                              <span className="text-slate-400 ml-1">
                                (default: {String(v.default)})
                              </span>
                            )}
                            {v.enum && (
                              <div className="mt-1 flex gap-1 flex-wrap">
                                {v.enum.map((e) => (
                                  <span
                                    key={e}
                                    className="bg-amber-50 text-amber-700 text-xs px-1.5 py-0.5 rounded font-mono"
                                  >
                                    {e}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Returns */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Returns
            </h3>
            <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-3">
              {tool.returns}
            </p>
          </div>

          {/* JSON Schema */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Full JSON Schema
            </h3>
            <JsonBlock data={tool.parameters} />
          </div>

          {/* Example Payload */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Example Payload
            </h3>
            <JsonBlock data={tool.example} />
          </div>
        </div>
      )}
    </div>
  );
}



/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function McpHubPage() {
  const [filter, setFilter] = useState<"All" | "Retrieval" | "Validation" | "HITL">("All");

  const categories: Array<"All" | "Retrieval" | "Validation" | "HITL"> = [
    "All",
    "Retrieval",
    "Validation",
    "HITL",
  ];

  const filtered =
    filter === "All"
      ? MCP_TOOLS
      : MCP_TOOLS.filter((t) => t.category === filter);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">MCP Hub <span className="text-lg text-slate-500 font-medium">(ศูนย์รวมส่วนเสริมของ AI)</span></h1>
            <p className="text-sm text-slate-500 mt-1">
              เครื่องมือและฟังก์ชันทั้งหมดที่ AI Agent สามารถเรียกใช้งานได้อัตโนมัติ<br/>
              <span className="text-xs text-slate-400">Registered tools and functions available to the AI Agent</span>
            </p>
          </div>
        </div>

        {/* Executive Concept & Evidence */}
        <div className="mt-6 bg-gradient-to-r from-slate-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-lg font-bold text-blue-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Executive Concept (แนวคิดสถาปัตยกรรม)
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-slate-200 leading-relaxed italic border-l-4 border-blue-400 pl-4 py-1">
                <strong className="text-blue-200 font-semibold mb-1 block not-italic">EN:</strong>
                "Our system adopts the MCP (Model Context Protocol) concept as a standard for integration between AI Agents and databases. Instead of connecting through complex traditional APIs, we built standardized Tool Schemas. This allows our AI to independently, accurately, and safely retrieve corporate policies (RAG) or trigger ticket creation, acting as if it has its own limbs."
              </p>
              <p className="text-sm text-slate-200 leading-relaxed italic border-l-4 border-blue-400 pl-4 py-1">
                <strong className="text-blue-200 font-semibold mb-1 block not-italic">TH:</strong>
                "ระบบของเรานำแนวคิดของ MCP (Model Context Protocol) มาใช้เป็นมาตรฐานในการเชื่อมต่อระหว่าง AI Agents และฐานข้อมูลครับ แทนที่เราจะเชื่อมต่อ API แบบดั้งเดิมที่ยุ่งยาก เราได้สร้าง Tool Schema ที่ได้มาตรฐานขึ้นมา ทำให้ AI ของเราสามารถดึงข้อมูลนโยบายองค์กร (RAG) หรือส่งคำสั่งเปิดตั๋ว (Ticket) ได้อย่างอิสระ แม่นยำ และปลอดภัย ราวกับมีแขนขาเป็นของตัวเองครับ"
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                <FileCode className="w-4 h-4" /> Source Code Evidence (หลักฐานการใช้งานจริง):
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li className="flex items-start gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-white">backend/app/agents/router_agent.py</strong> (Line 21-46, 91)<br/>
                    <div className="mt-1 space-y-1">
                      <div className="text-slate-400 text-[10px] font-sans">
                        <strong className="text-slate-300">EN:</strong> Declares <code>genai.types.FunctionDeclaration</code> and passes <code>tools=[search_policy_tool, validate_compliance_request_tool]</code> via API to let Gemini decide which to call (Native Tool Calling).
                      </div>
                      <div className="text-slate-400 text-[10px] font-sans">
                        <strong className="text-slate-300">TH:</strong> การประกาศ <code>genai.types.FunctionDeclaration</code> และส่งพารามิเตอร์ <code>tools=[...]</code> ผ่าน API ให้ Gemini ตัดสินใจเรียกใช้งาน
                      </div>
                    </div>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Summary Banner */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[
            { label: "Total Tools", value: MCP_TOOLS.length, color: "text-blue-600" },
            { label: "Retrieval Tools", value: MCP_TOOLS.filter((t) => t.category === "Retrieval").length, color: "text-indigo-600" },
            { label: "Action Tools", value: MCP_TOOLS.filter((t) => t.category !== "Retrieval").length, color: "text-emerald-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col"
            >
              <span className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
              <span className="text-xs text-slate-500 mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Presentation Guide / Architecture Note */}
      <div className="mb-8 flex items-start gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
        <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
        <div className="space-y-4 w-full">
          <div>
            <h3 className="font-bold text-blue-900 text-lg mb-1">How MCP-Style Integration Works in Our System</h3>
            <p className="text-sm text-blue-800 leading-relaxed mb-3">
              To fulfill the <strong>"MCP-Style Tool Integration"</strong> requirement while maintaining enterprise-grade security against AI Hallucinations, we implemented these 3 core capabilities as <strong>Structured Output & Orchestrated Actions</strong> rather than free-form AI API calls.
            </p>
          </div>

          <div className="bg-white/60 rounded-xl p-4 border border-blue-100 space-y-3">
            <h4 className="font-bold text-slate-800 text-sm border-b border-blue-100 pb-2">Architecture Implementation Details (รายละเอียดการติดตั้งระบบ)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <div className="font-mono text-xs font-bold text-blue-600 mb-1 flex items-center gap-1.5"><Search className="w-3.5 h-3.5"/> search_policy</div>
                <div className="text-[11px] text-slate-600 leading-relaxed mt-2 space-y-1.5">
                  <p>
                    <strong className="text-slate-800">EN:</strong> Embedded within the <code>QA Agent</code> (RAG). The orchestrator intercepts queries and performs vector searches directly to ensure accuracy.
                  </p>
                  <div className="border-t border-slate-100"></div>
                  <p>
                    <strong className="text-slate-800">TH:</strong> ฝังอยู่ใน <code>QA Agent</code> (RAG) ระบบกลางจะเรียก Vector Search ดึงข้อมูลป้อนให้ AI โดยตรง เพื่อความแม่นยำและป้องกัน AI ค้นหาผิดพลาด
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <div className="font-mono text-xs font-bold text-emerald-600 mb-1 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5"/> validate_compliance</div>
                <div className="text-[11px] text-slate-600 leading-relaxed mt-2 space-y-1.5">
                  <p>
                    <strong className="text-slate-800">EN:</strong> Implemented as the <code>Auditor Agent</code>. Forces the AI to evaluate requests and return strict Structured JSON Output matching this schema.
                  </p>
                  <div className="border-t border-slate-100"></div>
                  <p>
                    <strong className="text-slate-800">TH:</strong> คือตัว <code>Auditor Agent</code> บังคับให้ AI ประเมินความเสี่ยงและส่งผลลัพธ์กลับมาเป็น Structured JSON ตามโครงสร้างแบบแผนนี้เป๊ะๆ
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <div className="font-mono text-xs font-bold text-amber-600 mb-1 flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5"/> create_ticket</div>
                <div className="text-[11px] text-slate-600 leading-relaxed mt-2 space-y-1.5">
                  <p>
                    <strong className="text-slate-800">EN:</strong> Controlled by the <code>Orchestrator</code>. If risk is high, the backend safely uses the JSON evaluation to create a ticket in the DB automatically.
                  </p>
                  <div className="border-t border-slate-100"></div>
                  <p>
                    <strong className="text-slate-800">TH:</strong> ควบคุมโดย <code>Orchestrator</code> เมื่อระดับความเสี่ยงสูง ระบบ Backend จะดึงข้อมูลไปเปิดตั๋วลง Database ป้องกันไม่ให้ AI สุ่มเปิดตั๋วเอง
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === cat
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          Showing {filtered.length} of {MCP_TOOLS.length} tools
        </span>
      </div>



      {/* Tool Cards */}
      <div className="space-y-4">
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-8 text-center text-xs text-slate-400 pb-4">
        All tools are registered with the AI Agent at startup and called automatically based on user intent.
      </div>
    </div>
  );
}
