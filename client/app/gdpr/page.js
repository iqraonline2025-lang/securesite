"use client";
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Trash2, FileSearch, Globe, Database, HelpCircle } from "lucide-react";
import Footer from "../components/Footer";

const gdprRights = [
  {
    title: "Right to Access",
    icon: <FileSearch className="text-blue-500" />,
    desc: "You have the right to request a full audit log of any personal data we hold. Since we use Zero-Knowledge protocols, this is typically limited to your account email and billing history."
  },
  {
    title: "Right to Erasure",
    icon: <Trash2 className="text-blue-400" />,
    desc: "Commonly known as the 'Right to be Forgotten.' With one click in your dashboard, you can trigger a cryptographic wipe of all associated account metadata."
  },
  {
    title: "Data Portability",
    icon: <Globe className="text-cyan-500" />,
    desc: "Export your threat signature history and account logs in a machine-readable JSON format for use with other security providers."
  },
  {
    title: "Data Minimization",
    icon: <Lock className="text-cyan-400" />,
    desc: "We only collect the absolute minimum data required to protect your network. We do not track IP addresses or specific user behaviors."
  }
];

export default function GDPRPage() {
  return (
    <main className="bg-[#020202] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* --- HERO --- */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6"
          >
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">EU Compliance Framework</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">
            GDPR <span className="text-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Compliance.</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            ArcticShield is fully aligned with the General Data Protection Regulation (GDPR). 
            Our privacy-by-design approach ensures your data remains under your total control.
          </p>
        </div>
      </section>

      {/* --- CORE RIGHTS GRID --- */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {gdprRights.map((right, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.01 }}
              className="p-10 rounded-[2.5rem] bg-zinc-900/20 border border-white/5 hover:border-blue-500/30 transition-all flex flex-col md:flex-row gap-8 items-start"
            >
              <div className="p-4 rounded-2xl bg-black border border-white/10 shrink-0">
                {right.icon}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic mb-3 text-white tracking-tight">{right.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                  {right.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- TECHNICAL DATA FLOW --- */}
      <section className="py-24 px-6 border-y border-white/5 bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-black uppercase italic mb-4">Data Residency</h2>
          <p className="text-zinc-500 font-medium">We utilize localized data centers to ensure your data never leaves its region of origin unless explicitly authorized.</p>
        </div>
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Storage Location", val: "EU-West (Ireland)", icon: <Database size={18} /> },
            { label: "Encryption Standard", val: "AES-256-GCM", icon: <Lock size={18} /> },
            { label: "Data Processor", val: "ArcticShield Ltd.", icon: <ShieldCheck size={18} /> }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-blue-500 flex justify-center mb-4">{item.icon}</div>
              <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-1">{item.label}</p>
              <p className="text-sm font-bold text-zinc-300">{item.val}</p>
            </div>
          ))}
        </div>
      </section>

      

      {/* --- DPO CONTACT --- */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center p-12 rounded-[3rem] bg-gradient-to-b from-blue-600/5 to-transparent border border-blue-500/10">
          <HelpCircle className="mx-auto text-blue-500 mb-8" size={48} />
          <h2 className="text-3xl font-black uppercase italic mb-6">Contact our DPO</h2>
          <p className="text-zinc-500 font-medium leading-relaxed mb-10">
            Have a specific question about how we handle European data? Our Data Protection Officer 
            is available for technical inquiries and compliance audits.
          </p>
          <button 
            onClick={() => window.location.href = 'mailto:dpo@arcticshield.ai'}
            className="px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-blue-500 hover:text-white transition-all uppercase italic tracking-widest text-sm"
          >
            Email Data Protection Officer
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}