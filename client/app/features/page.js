"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Zap, 
  Lock, 
  MessageSquareOff, 
  Activity,
  UserCheck,
  ArrowRight
} from "lucide-react";

const detailedFeatures = [
  {
    title: "AI Neural Filtering",
    description: "Our proprietary engine processes incoming metadata to identify 'Zero-Day' scam patterns before they trigger a notification on your device.",
    icon: <Cpu className="text-blue-400" />,
    stats: "99.9% Detection Rate"
  },
  {
    title: "Global Threat Sync",
    description: "Once a malicious node is identified anywhere in the world, the signature is pushed to our global network in under 400ms.",
    icon: <Globe className="text-cyan-400" />,
    stats: "Global Low Latency"
  },
  {
    title: "Zero-Knowledge Privacy",
    description: "We never see your messages. Encryption happens at the edge, meaning your private data remains private, even from us.",
    icon: <Lock className="text-blue-500" />,
    stats: "AES-256 Bit"
  },
  {
    title: "SMS Perimeter Defense",
    description: "Automatically divert suspicious SMS and RCS traffic into a secure 'Sandboxed' environment for remote inspection.",
    icon: <MessageSquareOff className="text-cyan-500" />,
    stats: "Sandbox Active"
  },
  {
    title: "Predictive Analytics",
    description: "Using historical data and behavioral modeling to predict the next wave of phishing attacks before they are launched.",
    icon: <Activity className="text-blue-400" />,
    stats: "Deep Learning"
  },
  {
    title: "Identity Protection",
    description: "Monitors data leaks and dark-web marketplaces for your phone number and credentials, alerting you of potential exposure.",
    icon: <UserCheck className="text-cyan-400" />,
    stats: "24/7 Monitoring"
  }
];

export default function FeaturesPage() {
  const router = useRouter();

  return (
    <main className="bg-[#020202] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#3b82f608_0%,transparent_50%)]" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6"
          >
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Protocol Capabilities</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">
            Engineered for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Total Neutralization</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Explore the advanced architecture behind the ArcticShield perimeter. 
            From neural filtering to global node distribution.
          </p>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {detailedFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(59,130,246,0.05)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#080808] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black uppercase italic mb-4">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8 font-medium">
                {feature.description}
              </p>
              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Metric Status</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">{feature.stats}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- CTA BOX --- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto p-12 rounded-[3rem] bg-zinc-900/40 border border-white/5 backdrop-blur-xl text-center relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 blur-[100px]" />
          <h2 className="text-3xl md:text-4xl font-black uppercase italic mb-8 relative z-10 leading-tight">
            Ready to deploy your <br/> personal perimeter?
          </h2>
          <button 
            onClick={() => router.push('/signup')}
            className="group relative z-10 px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-sm italic flex items-center gap-3 mx-auto"
          >
            Initialize Deployment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* --- MICRO FOOTER --- */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Brand & Copyright */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-500" />
              <span className="text-sm font-black italic uppercase tracking-tighter">
                Arctic<span className="text-blue-500">Shield</span>
              </span>
            </div>
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest border-l border-zinc-800 pl-4">
              © 2026 Operations
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-8">
            {["Privacy", "Terms", "Documentation", "Status"].map((item) => (
              <a 
                key={item} 
                href={`/${item.toLowerCase()}`} 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-blue-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* System Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
              Protocol v4.0.2 Active
            </span>
          </div>

        </div>
      </footer>
    </main>
  );
}