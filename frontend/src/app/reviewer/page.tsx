"use client";





import { useEffect, useState } from"react";


import axios from"axios";


import { AlertTriangle, Check, X, Eye, Loader2, RefreshCw } from"lucide-react";





export default function ReviewerDashboard() {


  const [tickets, setTickets] = useState<any[]>([]);


  const [loading, setLoading] = useState(true);


  const [selectedTicket, setSelectedTicket] = useState<any>(null);


  const [actionLoading, setActionLoading] = useState(false);





  const fetchTickets = async () => {


    setLoading(true);


    try {


      const res = await axios.get("http://localhost:8000/api/review-tickets?status=open");


      setTickets(res.data?.tickets || []);


    } catch (error) {


      console.error(error);


    } finally {


      setLoading(false);


    }


  };





  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "employee") {
      window.location.href = "/";
      return;
    }
    fetchTickets();

    // WebSocket Connection for real-time ticket updates
    const ws = new WebSocket("ws://localhost:8000/ws/reviewer");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_ticket") {
          // Play a small notification or just refresh tickets
          console.log("New ticket arrived via WS:", data.ticket_id);
          fetchTickets();
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);





  const handleAction = async (action:"approve" |"reject") => {


    if (!selectedTicket) return;


    setActionLoading(true);


    try {


      await axios.post(`http://localhost:8000/api/review-tickets/${selectedTicket.id}/${action}`, { 


        reviewer_id: 2, // Hardcoded reviewer MVP


        findings: action ==="approve" ?"Manually approved." :"Violation confirmed."


      });


      setSelectedTicket(null);


      fetchTickets();


    } catch (error) {


      console.error(error);


    } finally {


      setActionLoading(false);


    }


  };





  return (


    <div className="flex gap-6 h-[calc(100vh-8rem)]">


      {/* Table Area */}


      <div className="flex-1 bg-white/80 backdrop-blur-lg border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">


        <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">


          <div>


            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Human Review Queue</h2>


            <p className="text-slate-500 text-sm mt-1">Manage flagged compliance violations.</p>


          </div>


          <div className="flex items-center gap-4">


            <button onClick={fetchTickets} className="text-slate-400 hover:text-slate-700 transition-colors">


              <RefreshCw size={20} className={loading ?"animate-spin" :""} />


            </button>


            <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold shadow-inner">


              {tickets.length} Pending


            </div>


          </div>


        </div>


        


        <div className="overflow-auto flex-1 p-0">


          <table className="w-full text-left border-collapse">


            <thead className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider sticky top-0">


              <tr>


                <th className="px-8 py-5 font-bold">Ticket ID</th>


                <th className="px-8 py-5 font-bold">Request ID</th>


                <th className="px-8 py-5 font-bold">Policy Section</th>


                <th className="px-8 py-5 font-bold">Created At</th>


                <th className="px-8 py-5 font-bold text-right">Action</th>


              </tr>


            </thead>


            <tbody className="divide-y divide-slate-100">


              {loading ? (


                 <tr><td colSpan={5} className="text-center py-12 text-slate-500"><Loader2 className="animate-spin mx-auto" size={32} /></td></tr>


              ) : tickets.length === 0 ? (


                 <tr><td colSpan={5} className="text-center py-16 text-slate-500 font-medium">The queue is empty. Good job!</td></tr>


              ) : (


                tickets.map(ticket => (


                  <tr key={ticket.id} className="hover:bg-amber-50 transition-colors cursor-pointer group" onClick={() => setSelectedTicket(ticket)}>


                    <td className="px-8 py-5 font-mono text-sm font-bold text-amber-600">#{ticket.id}</td>


                    <td className="px-8 py-5 text-sm font-medium">REQ-{ticket.compliance_request_id}</td>


                    <td className="px-8 py-5 text-sm"><span className="px-3 py-1 bg-slate-200 rounded-full font-medium">SEC-{ticket.policy_section_id}</span></td>


                    <td className="px-8 py-5 text-sm text-slate-500">{new Date(ticket.created_at.endsWith('Z') ? ticket.created_at : ticket.created_at + 'Z').toLocaleString('th-TH')}</td>


                    <td className="px-8 py-5 text-right">


                       <button className="text-slate-300 group-hover:text-amber-600 transition-colors"><Eye size={20}/></button>


                    </td>


                  </tr>


                ))


              )}


            </tbody>


          </table>


        </div>


      </div>





      {/* Ticket Slide-out Panel */}


      {selectedTicket && (


        <div className="w-[450px] bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-right-8">


          <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-3xl">


            <div>


              <h3 className="font-extrabold font-mono text-2xl text-amber-600">TICKET #{selectedTicket.id}</h3>


              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Review Action Required</p>


            </div>


            <button onClick={() => setSelectedTicket(null)} className="p-2 bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors"><X size={20}/></button>


          </div>


          


          <div className="p-8 flex-1 overflow-auto space-y-8">


            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl shadow-inner">


              <div className="flex items-center gap-2 text-amber-700 mb-3 font-extrabold uppercase tracking-widest text-xs">


                <AlertTriangle size={18} /> AI Analysis Findings


              </div>


              <p className="text-sm font-medium leading-relaxed text-amber-900">{selectedTicket.ai_analysis}</p>


            </div>





            <div>


              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Request Context</h4>


              <div className="bg-slate-50 p-6 rounded-2xl space-y-4 text-sm border border-slate-100">


                <div className="flex flex-col gap-1 mb-4">


                  <span className="text-slate-500 font-medium">Project Name:</span>


                  <span className="font-bold text-slate-800 text-lg">{selectedTicket.project_name}</span>


                </div>


                <div className="flex flex-col gap-1">


                  <span className="text-slate-500 font-medium">Architecture Description:</span>


                  <p className="text-slate-700 bg-white p-4 rounded-xl border border-slate-200">


                    {selectedTicket.description}


                  </p>


                </div>


              </div>


            </div>





            <div>


              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Violated Policy</h4>


              <div className="bg-rose-50 p-6 rounded-2xl space-y-4 text-sm border border-rose-100">


                <div className="flex justify-between items-start mb-2">


                  <span className="font-bold text-rose-800 text-base">{selectedTicket.policy_title}</span>


                  <span className="font-bold bg-white px-3 py-1 rounded-md shadow-sm text-rose-600">SEC-{selectedTicket.policy_section_id}</span>


                </div>


                <p className="text-rose-700 font-serif leading-relaxed italic">


                  "{selectedTicket.policy_content}"


                </p>


              </div>


            </div>


          </div>





          <div className="p-8 bg-slate-50 border-t border-slate-200 rounded-b-3xl grid grid-cols-2 gap-4">


            <button 


              onClick={() => handleAction("reject")} 


              disabled={actionLoading}


              className="flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all font-bold disabled:opacity-50 active:scale-[0.98]"


            >


              {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <><X size={20} /> Deny</>}


            </button>


            <button 


              onClick={() => handleAction("approve")} 


              disabled={actionLoading}


              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all font-bold shadow-lg disabled:opacity-50 active:scale-[0.98]"


            >


              {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Approve</>}


            </button>


          </div>


        </div>


      )}


    </div>


  );


}


