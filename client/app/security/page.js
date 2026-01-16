"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  Lock, 
  RefreshCw, 
  EyeOff, 
  FileCheck, 
  Database,
  Server,
  Download,
  Activity
} from "lucide-react";
import Footer from "../components/Footer";

const protocols = [
  {
    title: "End-to-End Encryption",
    desc: "Every data packet is encrypted at the edge using AES-256-GCM. ArcticShield never holds your private keys.",
    icon: <Lock className="text-blue-500" size={24} />
  },
  {
    title: "Zero-Knowledge Architecture",
    desc: "Our systems are designed so that even with physical access to servers, data is unreadable without user entropy.",
    icon: <EyeOff className="text-cyan-500" size={24} />
  },
  {
    title: "Real-time Node Rotation",
    desc: "Security nodes rotate IP signatures every 300 seconds to prevent targeted DDoS and tracking.",
    icon: <RefreshCw className="text-blue-400" size={24} />
  },
  {
    title: "Hardware Security Modules",
    desc: "We utilize FIPS 140-2 Level 3 HSMs for root key storage in our primary global hubs.",
    icon: <Database className="text-cyan-400" size={24} />
  }
];

export default function SecurityPage() {
  const handleDownload = () => {
    // This creates a temporary link to trigger the browser's download manager
    const link = document.createElement('a');
    link.href = '/reports/arctic-shield-audit-q4-2025.pdf'; // Ensure file exists in /public/reports/
    link.download = 'ArcticShield_Security_Audit_2025.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="bg-[#020202] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* --- SECURITY HERO --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6"
          >
            <ShieldAlert size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Grade</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-6 leading-[0.85]">
            Security <br /> <span className="text-blue-500">By Design.</span>
          </h1>
          
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Our framework is built on mathematical certainty. We protect your perimeter 
            with autonomous, zero-knowledge architecture.
          </p>
        </div>
      </section>

      {/* --- INFRASTRUCTURE VISUAL --- */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto p-1 border border-white/5 rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent">
          <div className="bg-[#080808] rounded-[2.9rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-blue-500 mb-4">
                <Activity size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Global Node Health</span>
              </div>
              <h2 className="text-3xl font-black uppercase italic mb-6">Neural Neutralization Hubs</h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8 font-medium">
                Incoming communications are analyzed at the edge. We compare metadata against 
                850M+ known threat signatures without ever decrypting or reading the 
                underlying message content.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-blue-400 font-black text-xl italic">99.99%</p>
                  <p className="text-[9px] text-zinc-600 font-black uppercase">Uptime Reliability</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-emerald-500 font-black text-xl italic">&lt;400ms</p>
                  <p className="text-[9px] text-zinc-600 font-black uppercase">Detection Latency</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border border-blue-500/20 flex items-center justify-center relative">
                <Server size={64} className="text-blue-500 animate-pulse relative z-10" />
                {/* Visual Rings */}
                <div className="absolute inset-0 border border-blue-500/10 rounded-full scale-125 animate-ping" />
                <div className="absolute inset-0 border border-zinc-800 rounded-full scale-150" />
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* --- PROTOCOL GRID --- */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {protocols.map((p, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-10 rounded-3xl bg-zinc-900/20 border border-white/5 hover:border-blue-500/30 transition-all group"
            >
              <div className="mb-6 p-3 w-fit rounded-xl bg-black border border-white/5 group-hover:bg-blue-600/10 transition-colors">
                {p.icon}
              </div>
              <h3 className="text-xl font-black uppercase italic mb-4">{p.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- AUDIT / COMPLIANCE --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-zinc-950">
        <div className="max-w-3xl mx-auto text-center">
          <FileCheck className="mx-auto text-emerald-500 mb-8" size={56} />
          <h2 className="text-3xl font-black uppercase italic mb-6">Rigorous Validation</h2>
          <p className="text-zinc-500 font-medium leading-relaxed mb-10">
            ArcticShield is audited by independent third-party security firms every 90 days. 
            Our Q4 2025 assessment verified zero high-risk vulnerabilities and 
            full compliance with international data residency laws.
          </p>

          <button 
            onClick={handleDownload}
            className="group px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-emerald-500 hover:text-white transition-all duration-300 uppercase italic tracking-widest text-sm flex items-center gap-3 mx-auto"
          >
            Download Audit Report 
            <Download size={18} className="group-hover:translate-y-1 transition-transform" />
          </button>
          
          <p className="mt-6 text-[10px] text-zinc-700 font-black uppercase tracking-[0.2em]">
            Document Ref: AS-SEC-2025-V4
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}