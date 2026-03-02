"use client";
import React, { useEffect, useState } from "react";
import { 
  Loader2, ShieldCheck, LogOut, Search, TrendingUp, 
  Activity, AlertTriangle, Cpu, Database, Globe 
} from "lucide-react";

// --- MOCK DATA ---
const INITIAL_LOGS = [
  { id: 101, type: "Phishing Attempt", origin: "Moscow, RU", status: "Neutralized" },
  { id: 102, type: "Brute Force", origin: "Beijing, CN", status: "IP Blocked" },
  { id: 103, type: "Data Leak", origin: "Sofia, BG", status: "Encrypted" },
];

export default function Dashboard() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveLogs, setLiveLogs] = useState(INITIAL_LOGS);

  // Load config (user name, stats)
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    setConfig({
      userName: userEmail ? userEmail.split("@")[0].toUpperCase() : "OPERATIVE",
      stats: { threatsBlocked: 1248, safetyScore: 98, uptime: "99.9%" },
      health: [
        { label: "Neural Engine", usage: 32, icon: <Cpu size={14} /> },
        { label: "Vault Storage", usage: 78, icon: <Database size={14} /> },
        { label: "Bandwidth", usage: 12, icon: <Globe size={14} /> },
      ],
    });
    setLoading(false);

    // LIVE DATA SIMULATION
    const interval = setInterval(() => {
      const newThreat = {
        id: Date.now(),
        type: "Unauthorized Access",
        origin: "Unknown Node",
        status: "Analyzing",
      };
      setLiveLogs(prev => [newThreat, ...prev.slice(0, 4)]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear(); 
    window.location.reload(); // refresh dashboard
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">
          Accessing Mainframe...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                Arctic<span className="text-blue-500">Shield</span>
              </h1>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                Defense Protocol Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-zinc-900/50 border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-6">
              <div>
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Operator ID</p>
                <p className="text-[10px] font-black uppercase truncate max-w-[120px]">
                  {config?.userName}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-red-500 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Shield Integrity */}
          <div className="lg:col-span-4 bg-zinc-900/50 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">
              Shield Integrity
            </p>
            <div className="h-2 w-full bg-white/5 rounded-full mb-8">
              <div
                className="h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${config?.stats.safetyScore}%` }}
              />
            </div>
            <p className="text-7xl font-black italic tracking-tighter">{config?.stats.safetyScore}%</p>
            <Activity className="absolute bottom-[-10%] right-[-10%] text-white/5" size={180} />
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
              <TrendingUp className="text-blue-500" />
              <div>
                <p className="text-6xl font-black italic">{config?.stats.threatsBlocked}</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">
                  Threats Intercepted
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {config?.health.map((h, i) => (
                <div
                  key={i}
                  className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-zinc-400">{h.icon}</div>
                    <p className="text-[9px] font-black uppercase text-zinc-400">{h.label}</p>
                  </div>
                  <p className="text-xs font-black italic">{h.usage}%</p>
                </div>
              ))}
              <ScanButton />
            </div>
          </div>

          {/* Threat Logs */}
          <div className="lg:col-span-12 bg-zinc-900/50 border border-white/5 rounded-[3rem] overflow-hidden mt-6">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-xs font-black uppercase italic tracking-widest flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" /> Live Incident Stream
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black uppercase text-zinc-500 bg-white/5">
                    <th className="px-10 py-5">Classification</th>
                    <th className="px-10 py-5">Origin</th>
                    <th className="px-10 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {liveLogs.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-10 py-6 text-xs font-black uppercase italic">{t.type}</td>
                      <td className="px-10 py-6 text-[10px] text-zinc-500 font-bold">{t.origin}</td>
                      <td className="px-10 py-6 text-[10px] font-black text-emerald-500 uppercase italic">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} /> {t.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanButton() {
  const [scanning, setScanning] = useState(false);
  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
  };

  return (
    <button
      onClick={handleScan}
      disabled={scanning}
      className={`w-full py-5 rounded-3xl font-black uppercase italic transition-all flex items-center justify-center gap-2 ${
        scanning ? "bg-zinc-800 text-zinc-600" : "bg-blue-600 hover:bg-blue-500 text-white"
      }`}
    >
      {scanning ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
      {scanning ? "Syncing..." : "Initiate System Scan"}
    </button>
  );
}
