"use client";
import React, { useState, useEffect } from "react";
import { User, Lock, Crown, Zap, ShieldCheck, ArrowUpCircle, Building2, FlaskConical } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // --- 1. HANDLE PASSWORD UPDATE ---
  const handleUpdatePassword = async () => {
    if (!password) return setMessage("Enter a new access key first.");
    
    try {
      const res = await fetch("http://localhost:5000/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, newPassword: password }),
      });
      const data = await res.json();
      setMessage(data.message);
      setPassword(""); // Clear input
    } catch (err) {
      setMessage("Failed to update credentials.");
    }
  };

  // --- 2. HANDLE TIER UPGRADES ---
  const handleUpgrade = async (tier) => {
    try {
      const res = await fetch("http://localhost:5000/api/upgrade-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, newTier: tier }),
      });
      const data = await res.json();
      
      const updatedUser = { ...user, tier: tier };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage(data.message);
      
      // Reload after short delay to refresh Nav bar links
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setMessage("Upgrade failed.");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen text-white pb-20">
      <div className="mb-12">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-zinc-200">System Config</h1>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Manage Identity & Authorization Tiers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: IDENTITY & SECURITY */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-6 text-blue-500">
              <User size={20} />
              <h2 className="text-sm font-black uppercase tracking-widest">Operator</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Username</label>
                <p className="text-lg font-bold">{user?.name || "Loading..."}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Email</label>
                <p className="text-zinc-400 font-mono text-sm">{user?.email}</p>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-6 text-zinc-400">
              <Lock size={20} />
              <h2 className="text-sm font-black uppercase tracking-widest">Security</h2>
            </div>
            <input 
              type="password" 
              value={password}
              placeholder="NEW ACCESS KEY" 
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-xs font-mono mb-4 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              onClick={handleUpdatePassword}
              className="w-full py-4 bg-zinc-800 hover:bg-white hover:text-black font-black uppercase text-[10px] rounded-xl transition-all"
            >
              Update Credentials
            </button>
          </section>
        </div>

        {/* RIGHT COLUMN: PLAN & UPGRADES */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6 text-amber-500">
              <Crown size={20} />
              <h2 className="text-sm font-black uppercase tracking-widest">Active Plan</h2>
            </div>
            <p className="text-5xl font-black italic uppercase text-white mb-2">{user?.tier}</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-8">Status: System Operational</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <ShieldCheck size={18} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase">Real-time Monitoring</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <ShieldCheck size={18} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase">Global Threat Intel</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* UPGRADE CARDS */}
            {user?.tier === "Free" && (
              <button 
                onClick={() => handleUpgrade("Premium")}
                className="p-8 bg-blue-600 hover:bg-blue-500 rounded-[2.5rem] transition-all text-left group"
              >
                <Zap size={28} className="text-white fill-white mb-4" />
                <h3 className="text-xl font-black italic uppercase">Go Premium</h3>
                <p className="text-[10px] font-bold uppercase opacity-80 mt-1">AI Scan & Analytics</p>
              </button>
            )}

            {(user?.tier === "Free" || user?.tier === "Premium") && (
              <button 
                onClick={() => handleUpgrade("Business")}
                className="p-8 bg-zinc-800 hover:bg-zinc-700 rounded-[2.5rem] transition-all text-left border border-zinc-700"
              >
                <Building2 size={28} className="text-white mb-4" />
                <h3 className="text-xl font-black italic uppercase">Business</h3>
                <p className="text-[10px] font-bold uppercase opacity-80 mt-1">Manage Teams & Staff</p>
              </button>
            )}

            {user?.tier !== "Lab" && (
              <button 
                onClick={() => handleUpgrade("Lab")}
                className="p-8 bg-emerald-600 hover:bg-emerald-500 rounded-[2.5rem] transition-all text-left sm:col-span-2"
              >
                <FlaskConical size={28} className="text-white mb-4" />
                <h3 className="text-xl font-black italic uppercase">Developer Lab</h3>
                <p className="text-[10px] font-bold uppercase opacity-80 mt-1">Full Terminal Access & API Monitoring</p>
              </button>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 px-8 py-4 rounded-2xl shadow-2xl shadow-blue-500/40 animate-bounce">
          <p className="text-[10px] font-black uppercase tracking-widest">{message}</p>
        </div>
      )}
    </div>
  );
}