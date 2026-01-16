"use client";
import React, { useState, useEffect } from "react";
import { Users, ShieldAlert, BarChart3, Database, HardDrive } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState({ users: [], reports: [], stats: {} });

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/stats")
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="mb-12">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-blue-500">Command Center</h1>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Global System Overview & Intelligence</p>
      </div>

      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Operators", val: data.stats.totalUsers, icon: Users, color: "text-blue-500" },
          { label: "Scams Reported", val: data.stats.totalReports, icon: Database, color: "text-emerald-500" },
          { label: "Threats Neutralized", val: data.stats.maliciousFound, icon: ShieldAlert, color: "text-red-500" }
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">{stat.label}</p>
              <p className="text-4xl font-black italic">{stat.val || 0}</p>
            </div>
            <stat.icon size={40} className={stat.color} strokeWidth={2.5} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* USER DIRECTORY */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
            <h2 className="font-black uppercase italic tracking-widest text-sm flex items-center gap-2">
              <Users size={18} className="text-blue-500" /> Operator Registry
            </h2>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                  <th className="px-4 pb-2">Name</th>
                  <th className="px-4 pb-2">Tier</th>
                  <th className="px-4 pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id} className="bg-black/40 border border-zinc-800 rounded-xl overflow-hidden group">
                    <td className="px-4 py-4 text-xs font-bold">{u.full_name}<br/><span className="text-[9px] text-zinc-600 font-mono">{u.email}</span></td>
                    <td className="px-4 py-4">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                        u.plan_tier === 'Lab' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>{u.plan_tier}</span>
                    </td>
                    <td className="px-4 py-4 text-[10px] text-emerald-500 font-black">ACTIVE</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RECENT REPORTS LOG */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
            <h2 className="font-black uppercase italic tracking-widest text-sm flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-500" /> Intelligence Feed
            </h2>
          </div>
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            {data.reports.map((report) => (
              <div key={report.id} className="p-4 bg-black/40 border border-zinc-800 rounded-2xl flex gap-4">
                <div className={`w-1 h-12 rounded-full ${report.analysis_result === 'Malicious' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-500">Report #{report.id} — {new Date(report.created_at).toLocaleDateString()}</p>
                  <p className="text-xs font-bold mt-1 text-zinc-200 truncate max-w-[300px]">{report.email_body || "Image analysis only"}</p>
                  <span className={`text-[9px] font-black uppercase mt-2 inline-block ${report.analysis_result === 'Malicious' ? 'text-red-500' : 'text-emerald-500'}`}>
                    Detected: {report.analysis_result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}