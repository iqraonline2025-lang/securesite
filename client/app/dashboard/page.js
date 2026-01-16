"use client";
import React, { useEffect, useState } from "react";
import { 
  Loader2, Shield, Zap, Users, AlertTriangle, 
  Activity, LogOut, Search, TrendingUp, 
  ShieldCheck, Globe, Cpu, Database, Bell
} from "lucide-react";

// --- MOCK DATA ---
const MOCK_THREAT_LOGS = [
  { id: 101, type: "Phishing Attempt", target: "auth_service.exe", risk: "High", time: "2m ago", status: "Neutralized", origin: "Moscow, RU" },
  { id: 102, type: "Brute Force", target: "admin_panel", risk: "Critical", time: "14m ago", status: "IP Blocked", origin: "Beijing, CN" },
  { id: 103, type: "Data Leak", target: "db_backup_01", risk: "Medium", time: "1h ago", status: "Encrypted", origin: "Sofia, BG" },
  { id: 104, type: "Spoofing", target: "user_session_42", risk: "Low", time: "3h ago", status: "Flagged", origin: "Frankfurt, DE" }
];

const MOCK_SYSTEM_HEALTH = [
  { label: "Neural Engine", usage: 42, icon: <Cpu size={14} /> },
  { label: "Vault Storage", usage: 78, icon: <Database size={14} /> },
  { label: "Bandwidth", usage: 15, icon: <Globe size={14} /> },
];

export default function Dashboard() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) { window.location.href = "/signup"; return; }
      const user = JSON.parse(storedUser);
      
      // Simulate API Data Construction
      setConfig({
        userName: user.name || "Operative",
        stats: { threatsBlocked: 1248, safetyScore: 94, activeNodes: 14, uptime: "99.99%" },
        recentThreats: MOCK_THREAT_LOGS,
        health: MOCK_SYSTEM_HEALTH
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
      <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Secure Mainframe...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Arctic<span className="text-blue-500">Shield</span></h1>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Neural Defense Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-zinc-900/50 border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-6">
              <div>
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Status</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                </p>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div>
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Active Operative</p>
                <p className="text-[10px] font-black uppercase truncate max-w-[100px]">{config?.userName}</p>
              </div>
            </div>
            <button 
              onClick={() => { localStorage.removeItem("user"); window.location.href="/"; }}
              className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-red-500 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Integrity Meter */}
          <div className="lg:col-span-4 bg-zinc-900/50 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">System Integrity</p>
              <div className="h-2 w-full bg-white/5 rounded-full mb-8">
                <div className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${config?.stats.safetyScore}%` }} />
              </div>
              <p className="text-7xl font-black italic tracking-tighter">{config?.stats.safetyScore}%</p>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2">Active Encryption</p>
            </div>
            <Activity className="absolute bottom-[-20%] right-[-10%] text-white/5" size={200} />
          </div>

          {/* Stats & Controls */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
              <TrendingUp className="text-blue-500 mb-4" />
              <div>
                <p className="text-6xl font-black italic tracking-tighter">{config?.stats.threatsBlocked}</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">Threats Neutralized</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {config?.health.map((h, i) => (
                <div key={i} className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl text-zinc-400">{h.icon}</div>
                    <p className="text-[10px] font-black uppercase text-zinc-400">{h.label}</p>
                  </div>
                  <p className="text-sm font-black italic">{h.usage}%</p>
                </div>
              ))}
              <ScanButton onComplete={fetchDashboard} />
            </div>
          </div>

          {/* Logs Table */}
          <div className="lg:col-span-12 bg-zinc-900/50 border border-white/5 rounded-[3rem] overflow-hidden mt-6">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-500" /> Neural Intercept logs
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Live Stream</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black uppercase text-zinc-500 bg-white/5 tracking-[0.2em]">
                    <th className="px-10 py-5">Classification</th>
                    <th className="px-10 py-5">Source Origin</th>
                    <th className="px-10 py-5">Protocol Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {config?.recentThreats.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-10 py-6 text-xs font-black uppercase italic">{t.type}</td>
                      <td className="px-10 py-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t.origin}</td>
                      <td className="px-10 py-6 text-[10px] font-black text-emerald-500 uppercase italic">
                        <div className="flex items-center gap-2"><ShieldCheck size={14} /> {t.status}</div>
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

function ScanButton({ onComplete }) {
  const [scanning, setScanning] = useState(false);
  const handleScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); onComplete(); }, 2500);
  };
  return (
    <button 
      onClick={handleScan} 
      disabled={scanning} 
      className={`w-full py-6 rounded-3xl font-black uppercase italic transition-all flex items-center justify-center gap-3 ${
        scanning ? 'bg-zinc-800 text-zinc-600' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
      }`}
    >
      {scanning ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
      {scanning ? "Calibrating..." : "Initiate System Scan"}
    </button>
  );
}