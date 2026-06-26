"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Activity, 
  Search, 
  RefreshCw, 
  PlusCircle, 
  Loader2, 
  Calendar, 
  ShieldAlert, 
  User, 
  Filter, 
  Database,
  CheckCircle,
  AlertTriangle,
  Trash2
} from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/audit-logs");
      setLogs(res.data?.logs || []);
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const triggerMockEvent = async () => {
    setActionLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/audit-logs/mock");
      if (res.data?.status === "success") {
        // Prepend the new log to the list
        setLogs(prevLogs => [res.data.log, ...prevLogs]);
      }
    } catch (error) {
      console.error("Failed to trigger mock event", error);
    } finally {
      setActionLoading(false);
    }
  };


  // Metrics calculations
  const totalLogs = logs.length;
  const approvalsCount = logs.filter(l => {
    const act = String(l.action || "").toUpperCase();
    return act.includes("APPROVED") || act.includes("AUTO_APPROVED");
  }).length;
  const violationsCount = logs.filter(l => {
    const act = String(l.action || "").toUpperCase();
    return act.includes("CREATED") || act.includes("REJECTED");
  }).length;

  // Filter and Search logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_id && String(log.user_id).includes(searchTerm));
      
    const matchesFilter = filterAction === "ALL" || log.action === filterAction;
    
    return matchesSearch && matchesFilter;
  });

  const getActionBadgeColor = (action: string) => {
    const act = String(action || "").toUpperCase();
    if (act.includes("APPROVED") || act.includes("AUTO")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (act.includes("REJECTED")) {
      return "bg-rose-100 text-rose-800 border-rose-200";
    }
    if (act.includes("CREATED") || act.includes("TICKET")) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getActorName = (userId: any) => {
    if (userId === 1) return { name: "Alice Engineer", role: "Engineer", iconClass: "bg-blue-50 text-blue-600" };
    if (userId === 2) return { name: "Bob Compliance", role: "Sec Officer", iconClass: "bg-purple-50 text-purple-600" };
    return { name: "System", role: "Automated", iconClass: "bg-slate-50 text-slate-600" };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <Activity className="text-rose-500" size={32} />
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">
              Compliance Audit Logs
            </h2>
          </div>
          <p className="text-slate-500 mt-2">
            Real-time, immutable record of compliance validations, automated overrides, and human reviewer decisions.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchLogs} 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button 
              onClick={triggerMockEvent} 
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 shadow-md relative group"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
              Simulate Event
            </button>
          </div>
          <span className="text-[11px] text-rose-500 font-medium bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
            * สำหรับกดจำลองข้อมูลตอนพรีเซนต์ (Demo purpose)
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Events */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-slate-100 text-slate-600">
            <Database size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Audit Events</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{totalLogs}</h3>
          </div>
        </div>

        {/* Security Approvals */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Security Approvals</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{approvalsCount}</h3>
          </div>
        </div>

        {/* Violations Flagged */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-100 text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Violations Flagged</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{violationsCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-md flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by details, action, or user ID..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-rose-500 text-sm shadow-inner transition-shadow"
          />
        </div>

        {/* Filter Selection */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full md:w-56 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 text-sm transition-shadow font-medium text-slate-700"
          >
            <option value="ALL">All Actions</option>
            <option value="COMPLIANCE_CHECK_SUBMITTED">Submitted Checks</option>
            <option value="AUTO_APPROVED">Auto Approvals</option>
            <option value="REVIEW_TICKET_CREATED">Tickets Created</option>
            <option value="REVIEW_TICKET_APPROVED">Human Approvals</option>
            <option value="REVIEW_TICKET_REJECTED">Human Denials</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col">
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider sticky top-0 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-6 py-5">Action Event</th>
                <th className="px-6 py-5">Actor / User</th>
                <th className="px-6 py-5">Target Resource</th>
                <th className="px-8 py-5">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                    Loading audit events...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-medium">
                    No matching audit events found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actor = getActorName(log.user_id);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Timestamp */}
                      <td className="px-8 py-5 whitespace-nowrap text-slate-500 font-medium font-sans">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(
                            (log.created_at || log.timestamp).endsWith('Z') 
                              ? (log.created_at || log.timestamp) 
                              : (log.created_at || log.timestamp) + 'Z'
                          ).toLocaleString('th-TH')}
                        </div>
                      </td>

                      {/* Action Event Badge */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${actor.iconClass}`}>
                            {actor.name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm leading-tight">{actor.name}</div>
                            <div className="text-slate-400 text-xs mt-0.5">{actor.role}</div>
                          </div>
                        </div>
                      </td>

                      {/* Target Resource */}
                      <td className="px-6 py-5 whitespace-nowrap text-slate-500">
                        <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          {log.target_type} #{log.target_id}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-8 py-5 text-slate-600 leading-relaxed font-sans max-w-sm break-words group-hover:text-slate-900 transition-colors">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
