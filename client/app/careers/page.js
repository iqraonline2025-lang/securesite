"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowUpRight, 
  Cpu, 
  ShieldCheck, 
  Globe,
  Zap,
  Terminal
} from "lucide-react";
import Footer from "../components/Footer";

const departments = [
  { name: "Engineering", count: 4 },
  { name: "Security Ops", count: 2 },
  { name: "Product", count: 1 },
  { name: "Legal", count: 1 }
];

const openRoles = [
  {
    title: "Neural Network Architect",
    dept: "Engineering",
    location: "Remote / London",
    type: "Full-Time",
    tags: ["Python", "TensorFlow", "CyberSec"]
  },
  {
    title: "Lead Security Researcher",
    dept: "Security Ops",
    location: "Blackburn, UK",
    type: "Full-Time",
    tags: ["Pen-Testing", "Zero-Day", "Network"]
  },
  {
    title: "Frontend Engineer (WebGL/GSAP)",
    dept: "Product",
    location: "Remote",
    type: "Contract",
    tags: ["Next.js", "Framer Motion", "Three.js"]
  },
  {
    title: "Compliance & Data Privacy Counsel",
    dept: "Legal",
    location: "Washington D.C.",
    type: "Full-Time",
    tags: ["GDPR", "SOC2", "International Law"]
  }
];

export default function CareersPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const handleJoinPool = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="bg-[#020202] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* --- CAREERS HERO --- */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#3b82f608_0%,transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-8"
          >
            <Briefcase size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Talent Acquisition</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-8 leading-[0.85]">
            Architect the <br /> <span className="text-blue-500">Unbreakable.</span>
          </h1>
          
          <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            We are looking for the 0.1%. Join a global team of cryptographers and engineers 
            redefining the boundaries of digital defense.
          </p>
        </div>
      </section>

      {/* --- CULTURE GRID --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Globe />, title: "Remote First", desc: "Work from anywhere on the planet." },
            { icon: <Zap />, title: "High Octane", desc: "We move at the speed of the threat landscape." },
            { icon: <Cpu />, title: "Modern Stack", desc: "Access to elite compute power and AI tools." },
            { icon: <ShieldCheck />, title: "Privacy First", desc: "We protect our employees like our users." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-blue-500/20 transition-colors group">
              <div className="text-blue-500 mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-3">{item.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- JOBS LIST --- */}
      <section id="roles" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          
          <div className="flex flex-wrap gap-4 mb-16 justify-center">
            {departments.map((dept) => (
              <button key={dept.name} className="px-6 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 hover:text-blue-400 transition-all">
                {dept.name} <span className="text-zinc-600 ml-2">{dept.count}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {openRoles.map((role, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => router.push('/contact')}
                className="group p-8 rounded-3xl bg-zinc-900/20 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div>
                  <h3 className="text-2xl font-black italic uppercase group-hover:text-blue-500 transition-colors">{role.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      <MapPin size={12} /> {role.location}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      <Clock size={12} /> {role.type}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {role.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-blue-500/5 border border-blue-500/10 text-[8px] font-black text-blue-400 uppercase tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all">
                    Apply Now
                  </span>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                    <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- JOIN TALENT POOL (WITH SUCCESS MESSAGE) --- */}
      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto p-12 rounded-[3rem] bg-zinc-900/40 border border-white/5 text-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Terminal className="mx-auto mb-6 text-blue-500/50" size={32} />
                <h2 className="text-2xl font-black uppercase italic mb-4">Don't see your fit?</h2>
                <p className="text-zinc-500 text-sm font-medium mb-8">Join our talent database for future operational openings.</p>
                <form 
                  onSubmit={handleJoinPool}
                  className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative z-10"
                >
                  <input 
                    required
                    type="email"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500 transition-colors" 
                    placeholder="operator@protocol.ai" 
                  />
                  <button 
                    type="submit"
                    className="px-8 py-4 bg-blue-600 rounded-xl font-black uppercase italic tracking-widest text-xs hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
                  >
                    Join Pool
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="py-4"
              >
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                  <ShieldCheck className="text-blue-400" size={40} />
                </div>
                <h2 className="text-3xl font-black uppercase italic mb-2 text-white tracking-tighter">Entry Authorized</h2>
                <p className="text-zinc-500 text-sm font-medium mb-8 max-w-xs mx-auto">Your credentials have been added to the secure talent registry. We will contact you when a slot opens.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  Return to portal
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </main>
  );
}