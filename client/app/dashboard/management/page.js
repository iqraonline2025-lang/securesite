"use client";
import React, { useState, useEffect } from "react";
// Fixed the Activity import and added ArrowLeft for navigation
import { Users, Monitor, ShieldCheck, AlertCircle, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ManagementPage() {
  const [assets, setAssets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    
    if (savedUser && savedUser.email) {
      setUser(savedUser);
      
      // Fetch assets from your new SQL table
      fetch(`http://localhost:5000/api/assets/${savedUser.email}`)
        .then(res => res.json())
        .then(data => {
          setAssets(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setLoading(false);
        });
    }
  }, []);

  const isLab = user?.tier === "Lab";

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-zinc-500 font-black animate-pulse uppercase tracking-widest">Loading Assets...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-black text-white">
      {/* Back Button */}
      <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          {isLab ? "🔬 Device Monitoring" : "👥 Team Management"}
        </h1>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
          {isLab ? "School & Lab Security Protocol" : "Enterprise Network Administration"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-black rounded-2xl border border-zinc-800 text-blue-500 group-hover:scale-110 transition-transform">
                {asset.asset_type === 'Member' ? <Users size={24}/> : <Monitor size={24}/>}
              </div>
              <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                asset.status === 'Protected' 
                  ? 'text-green-500 border-green-500/20 bg-green-500/5' 
                  : 'text-red-500 border-red-500/20 bg-red-500/5'
              }`}>
                {asset.status}
              </span>
            </div>
            
            <h3 className="text-2xl font-black italic uppercase mb-1 tracking-tight">{asset.asset_name}</h3>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
              Last Scan: {new Date(asset.last_scan).toLocaleDateString()}
            </p>

            <div className="mt-8 pt-6 border-t border-zinc-800/50 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <Activity size={12} className="text-zinc-600" />
                  <span className="text-[9px] font-bold text-zinc-600 uppercase">Live Telemetry</span>
               </div>
               <button className="text-[9px] font-black text-blue-500 uppercase hover:text-white transition-colors">Details</button>
            </div>
          </div>
        ))}

        {/* Action Card */}
        <button className="border-2 border-dashed border-zinc-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-zinc-600 hover:text-white hover:border-zinc-500 transition-all group">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center mb-4 group-hover:border-white transition-colors">
            <span className="text-3xl font-light">+</span>
          </div>
          <span className="font-black uppercase text-[10px] tracking-[0.2em]">Add {isLab ? "Device" : "Member"}</span>
        </button>
      </div>
    </div>
  );
}