"use client";
import React from "react";
import { motion } from "framer-motion";
import { FileText, Download, ShieldAlert, Lock, Cpu } from "lucide-react";
import Footer from "../components/Footer";

export default function WhitepaperPage() {
  return (
    <main className="bg-[#020202] min-h-screen text-white">
      <section className="relative pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6">
            <FileText size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Technical Brief v2.0</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-6">
            Neural <span className="text-cyan-400">Architecture</span>
          </h1>
          <p className="text-zinc-500 font-medium text-lg italic">
            "The methodology of autonomous threat neutralization in high-latency environments."
          </p>
        </motion.div>

        {/* Abstract Box */}
        <div className="p-8 md:p-12 rounded-3xl bg-zinc-900/40 border border-white/5 mb-12">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-6">Abstract</h2>
          <p className="text-zinc-400 leading-relaxed font-medium text-sm mb-6">
            This document outlines the engineering principles behind ArcticShield’s Neural Defense Network. We discuss the transition from signature-based detection to behavioral-synapse modeling, ensuring zero-day protection across global SMS and RCS protocols.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start">
              <div className="mt-1 text-cyan-400"><Cpu size={18} /></div>
              <p className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider">Edge-Processing Logic</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="mt-1 text-blue-500"><Lock size={18} /></div>
              <p className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider">Zero-Knowledge Verification</p>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="flex flex-col items-center gap-8 py-12 border-t border-white/5">
          <p className="text-zinc-500 text-sm font-medium">Ready for the full technical disclosure? (PDF, 4.2 MB)</p>
          <button className="group relative px-10 py-5 bg-white text-black font-black rounded-xl hover:scale-105 transition-all uppercase italic tracking-widest flex items-center gap-3">
            Download Whitepaper <Download size={20} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </section>

      <div className="h-24 bg-gradient-to-t from-zinc-900/20 to-transparent" />
      <Footer />
    </main>
  );
}