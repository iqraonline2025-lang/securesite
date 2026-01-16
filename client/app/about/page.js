"use client";
import React from "react";
import { useRouter } from "next/navigation"; // Added for navigation
import { motion } from "framer-motion";
import { ShieldCheck, Globe, Users, Target, Rocket, Fingerprint, Briefcase, ArrowRight } from "lucide-react";
import Footer from "../components/Footer";

const stats = [
  { label: "Founded", value: "2022" },
  { label: "Global Nodes", value: "1,200+" },
  { label: "Threats Neutralized", value: "850M" },
  { label: "Security Operatives", value: "150+" },
];

const jobs = [
  { title: "Neural Network Engineer", location: "Remote / London", team: "Core Engineering" },
  { title: "Cyber-Security Analyst", location: "Blackburn, UK", team: "Ops" },
  { title: "Senior Cryptographer", location: "Remote", team: "Privacy" }
];

export default function AboutPage() {
  const router = useRouter(); // Initialize router

  return (
    <main className="bg-[#020202] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* --- VISION HERO --- */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,#2563eb08_0%,transparent_70%)] blur-[120px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-8"
          >
            <Target size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Our Mission</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-8 leading-[0.85]">
            Defending the <br /> <span className="text-blue-500">Human Element.</span>
          </h1>
          
          <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
            ArcticShield was born to make digital communication infallible. 
            We are a collective of researchers dedicated to total privacy.
          </p>
        </div>
      </section>

      {/* --- STATS GRID --- */}
      <section className="py-12 border-y border-white/5 bg-zinc-900/10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <p className="text-4xl font-black italic text-white mb-2">{stat.value}</p>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CORE PHILOSOPHY --- */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative p-12 bg-zinc-900/40 border border-white/5 rounded-[3rem] backdrop-blur-xl">
             <Fingerprint className="text-blue-500 mb-8" size={48} />
             <h2 className="text-3xl font-black uppercase italic mb-6">The Zero-Knowledge <br/> Commitment.</h2>
             <p className="text-zinc-400 font-medium leading-relaxed">
               Privacy is a fundamental human right. Our architecture ensures that we build 
               the shield, but only you hold the keys.
             </p>
          </div>

          <div className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Open Infrastructure</h2>
            {jobs.map((job, idx) => (
              <div 
                key={idx}
                className="group flex justify-between items-center p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-blue-500/50 transition-all cursor-pointer"
                onClick={() => router.push('/contact')} // Links to contact for application
              >
                <div>
                  <h4 className="text-white font-black uppercase italic group-hover:text-blue-400 transition-colors">{job.title}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">{job.team} • {job.location}</p>
                </div>
                <ArrowRight size={20} className="text-zinc-700 group-hover:text-blue-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- JOIN THE MISSION CTA --- */}
      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto p-12 rounded-[3rem] bg-gradient-to-b from-zinc-900/50 to-transparent border border-white/5 text-center">
          <Rocket className="mx-auto mb-8 text-blue-500" size={40} />
          <h2 className="text-3xl md:text-5xl font-black uppercase italic mb-6 tracking-tighter">
            Build the <span className="text-blue-500">Shield</span> with us.
          </h2>
          <p className="text-zinc-500 font-medium mb-10">We are always looking for visionary engineers and security researchers.</p>
          
          {/* FIXED BUTTON: Added onClick handler */}
          <button 
            onClick={() => {
                const element = document.getElementById('careers-list');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
                else router.push('/contact'); // Fallback to contact page
            }}
            className="px-10 py-5 border border-blue-500/50 text-blue-400 font-black rounded-xl hover:bg-blue-500/10 transition-all uppercase italic tracking-widest text-sm"
          >
            View Open Positions
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}