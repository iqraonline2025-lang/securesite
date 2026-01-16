"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Building2, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  Key, 
  Lock,
  Headphones,
  FileCheck,
  ChevronRight,
  Check
} from "lucide-react";
import Footer from "../components/Footer";

const enterpriseSolutions = [
  {
    title: "Fleet-Wide Deployment",
    description: "Provision and manage security protocols across thousands of corporate devices with a single administrative command.",
    icon: <Building2 className="text-blue-400" size={24} />,
    label: "Scalability"
  },
  {
    title: "Custom Neural Training",
    description: "Train our AI models on your organization's specific communication patterns to eliminate industry-specific spear-phishing.",
    icon: <Zap className="text-cyan-400" size={24} />,
    label: "Precision"
  },
  {
    title: "Audit-Ready Compliance",
    description: "Full SOC2 Type II and GDPR reporting tools built-in. Export detailed threat logs and mitigation reports instantly.",
    icon: <FileCheck className="text-blue-500" size={24} />,
    label: "Legal"
  }
];

export default function EnterprisePage() {
  const router = useRouter();

  return (
    <main className="bg-[#020202] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* --- ENTERPRISE HERO --- */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f605_1px,transparent_1px),linear-gradient(to_bottom,#3b82f605_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/20 text-blue-400 mb-8"
          >
            <Building2 size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Grade</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-8 leading-[0.85]">
            Corporate <span className="text-blue-500">Immunity</span> <br /> 
            At Global Scale.
          </h1>
          
          <p className="text-zinc-500 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            The ArcticShield Enterprise Protocol provides the centralized visibility and 
            autonomous defense required to protect modern distributed workforces.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => router.push('/contact')}
              className="px-10 py-5 bg-blue-600 text-white font-black rounded-xl hover:scale-105 transition-all shadow-xl shadow-blue-600/20 uppercase italic tracking-widest text-sm flex items-center gap-2"
            >
              Request Demo <ChevronRight size={18} />
            </button>
            <button 
              onClick={() => window.open('/whitepaper.pdf', '_blank')}
              className="px-10 py-5 border border-white/10 bg-white/5 text-white font-black rounded-xl hover:bg-white/10 transition-all uppercase italic tracking-widest text-sm"
            >
              Security Whitepaper
            </button>
          </div>
        </div>
      </section>

      {/* --- SOLUTION GRID --- */}
      <section className="py-24 px-6 border-y border-white/5 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {enterpriseSolutions.map((solution, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2rem] bg-zinc-900/30 border border-white/5 hover:border-blue-500/30 transition-all group"
            >
              <div className="mb-6 p-3 w-fit rounded-xl bg-black border border-white/5 group-hover:border-blue-500/50 transition-colors">
                {solution.icon}
              </div>
              <h3 className="text-xl font-black uppercase italic mb-4">{solution.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                {solution.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- COMPARISON TABLE --- */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black uppercase italic mb-12 text-center">Protocol Comparison</h2>
          <div className="rounded-3xl border border-white/5 bg-zinc-900/20 overflow-hidden backdrop-blur-md">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Feature Set</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Standard</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-blue-500">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["AI Neural Filtering", true, true],
                  ["Global Threat Sync", "Limited", "Real-time"],
                  ["SAML / SSO Integration", false, true],
                  ["Dedicated Support", false, "24/7 Priority"],
                  ["Compliance Exports", false, true]
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 font-bold text-zinc-300">{row[0]}</td>
                    <td className="p-6 text-zinc-500">{typeof row[1] === 'boolean' ? (row[1] ? <Check size={16} className="text-zinc-600" /> : "—") : row[1]}</td>
                    <td className="p-6 text-blue-400 font-bold">{typeof row[2] === 'boolean' ? (row[2] ? <Check size={16} /> : "—") : row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --- COMPLIANCE LOGOS --- */}
      <section className="py-20 px-6 opacity-40 grayscale flex flex-wrap justify-center gap-12 border-t border-white/5">
        <div className="flex items-center gap-2"><ShieldCheck /> <span className="font-black italic">SOC2 TYPE II</span></div>
        <div className="flex items-center gap-2"><Lock /> <span className="font-black italic">ISO 27001</span></div>
        <div className="flex items-center gap-2"><FileCheck /> <span className="font-black italic">GDPR COMPLIANT</span></div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          <h2 className="text-4xl md:text-6xl font-black uppercase italic mb-8 relative z-10 tracking-tighter">
            Ready to secure <br/> your organization?
          </h2>
          <button 
            onClick={() => router.push('/contact')}
            className="relative z-10 px-12 py-6 bg-white text-blue-600 font-black rounded-2xl hover:scale-110 transition-transform uppercase italic tracking-widest"
          >
            Start Enterprise Trial
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}