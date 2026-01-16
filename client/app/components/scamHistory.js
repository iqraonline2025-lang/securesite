"use client";
import React, { useEffect, useState } from "react";
import { Clock, ShieldCheck, ShieldAlert, ImageIcon } from "lucide-react";

export default function ScamHistory({ email }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/reports/history/${email}`)
      .then(res => res.json())
      .then(data => setHistory(data));
  }, [email]);

  return (
    <div className="mt-12 bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8">
      <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2">
        <Clock size={20} className="text-blue-500" /> Recent Intelligence Reports
      </h3>
      
      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-zinc-600 text-xs font-bold uppercase py-4">No reports filed yet.</p>
        ) : (
          history.map((report) => (
            <div key={report.id} className="bg-black/40 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                {report.screenshot_url ? (
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <ImageIcon size={18} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600 font-black text-xs">TXT</div>
                )}
                <div>
                  <p className="text-xs font-black uppercase text-white truncate max-w-[200px]">
                    {report.scam_text || "Phone Report: " + report.phone_number}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                report.analysis_result === 'Malicious' ? 'border-red-500/30 text-red-500 bg-red-500/5' : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
              }`}>
                {report.analysis_result === 'Malicious' ? <ShieldAlert size={12}/> : <ShieldCheck size={12}/>}
                <span className="text-[10px] font-black uppercase tracking-widest">{report.analysis_result}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}