"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  TrendingDown, 
  ShieldCheck, 
  Briefcase, 
  BarChart, 
  ExternalLink,
  Lock,
  ArrowUpRight
} from "lucide-react";
import Footer from "../components/Footer";

const caseStudies = [
  {
    client: "Nexus Fintech Group",
    industry: "Banking & Finance",
    challenge: "Surge in high-sophistication SMS phishing targeting high-net-worth accounts.",
    result: "99.2% reduction in successful account takeovers.",
    metric: "-84% Fraud Loss",
    imageColor: "from-blue-600/20 to-blue-900/40"
  },
  {
    client: "Global Health Systems",
    industry: "Healthcare Infrastructure",
    challenge: "Unauthorized data exfiltration attempts via internal communication channels.",
    result: "Instant neutralization of 4,000+ malicious links monthly.",
    metric: "100% HIPAA Compliance",
    imageColor: "from-cyan-600/20 to-cyan-900/40"
  },
  {
    client: "Titan Logistics",
    industry: "Supply Chain",
    challenge: "Social engineering attacks targeting fleet operators via mobile messages.",
    result: "Zero successful breaches since ArcticShield deployment.",
    metric: "60k Nodes Secured",
    imageColor: "from-indigo-600/20 to-indigo-900/40"
  }
];

export default function CaseStudiesPage() {
  const router = useRouter();

  return (
    <main className="bg-[#020202] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6"
          >
            <BarChart size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Impact Analysis</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">
            Proven <span className="text-blue-500">Defense.</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Real-world deployments. Verified results. See how ArcticShield protects the world's most vulnerable digital perimeters.
          </p>
        </div>
      </section>

      {/* --- CASE STUDIES LIST --- */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {caseStudies.map((study, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group flex flex-col lg:flex-row items-stretch bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all duration-500"
            >
              {/* Visual Side */}
              <div className={`lg:w-1/3 bg-gradient-to-br ${study.imageColor} p-12 flex flex-col justify-center items-center relative`}>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                 <h2 className="text-4xl font-black text-white relative z-10 text-center italic uppercase leading-none">
                    {study.metric}
                 </h2>
                 <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mt-4 relative z-10">Verified Outcome</p>
              </div>

              {/* Content Side */}
              <div className="lg:w-2/3 p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black uppercase italic text-white mb-1">{study.client}</h3>
                      <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">{study.industry}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <ShieldCheck className="text-blue-400" size={20} />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">The Challenge</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed font-medium">{study.challenge}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">The Solution</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed font-medium">{study.result}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                  <button className="text-[11px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                    Read Full Mission Report <ExternalLink size={14} />
                  </button>
                  <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE DEPLOYMENT
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- STATS RIBBON --- */}
      <section className="py-20 border-y border-white/5 bg-blue-600/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Threats Blocked", val: "420M+" },
            { label: "Avg Neutralization", val: "400ms" },
            { label: "Client Retention", val: "99.8%" },
            { label: "Data Secured", val: "2.4PB" }
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-3xl font-black italic text-white mb-1">{stat.val}</p>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-8 tracking-tighter">
            Achieve similar <br/> <span className="text-blue-500">Security ROI.</span>
          </h2>
          <button 
            onClick={() => router.push('/contact')}
            className="px-12 py-6 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform uppercase italic tracking-widest text-sm flex items-center gap-3 mx-auto shadow-2xl"
          >
            Consult with an Analyst <ArrowUpRight size={18} />
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}