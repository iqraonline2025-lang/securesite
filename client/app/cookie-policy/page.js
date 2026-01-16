"use client";
import React from "react";
import { motion } from "framer-motion";
import { Cookie, ShieldCheck, Eye, Info, XCircle } from "lucide-react";
import Footer from "../components/Footer";

const cookieData = [
  { name: "AS_SESSION", purpose: "Authentication & Security", type: "Essential", expiry: "Session" },
  { name: "AS_THEME", purpose: "User UI Preferences", type: "Functional", expiry: "1 Year" },
  { name: "AS_GATEWAY", purpose: "Load Balancing", type: "System", expiry: "24 Hours" }
];

export default function CookiePolicy() {
  return (
    <main className="bg-[#020202] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* --- HERO --- */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6"
          >
            <Cookie size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Minimalist Tracking Protocol</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">
            Cookie <span className="text-blue-500">Usage.</span>
          </h1>
          <p className="text-zinc-500 font-medium italic">Transparency regarding local data storage.</p>
        </div>
      </section>

      {/* --- STATEMENT --- */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto p-8 rounded-[2rem] bg-zinc-900/20 border border-white/5 flex items-start gap-6">
          <div className="p-3 bg-blue-500/10 rounded-xl">
             <ShieldCheck className="text-blue-500" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase italic mb-2">Zero Tracking Policy</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              ArcticShield does not use marketing, advertising, or 3rd-party tracking cookies. 
              We utilize only the bare minimum of technical cookies required to provide a 
              secure, authenticated connection to our global defense network.
            </p>
          </div>
        </div>
      </section>

      {/* --- COOKIE TABLE --- */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/10">
          <div className="p-8 border-b border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Cookie Inventory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <th className="px-8 py-6">Identifier</th>
                  <th className="px-8 py-6">Purpose</th>
                  <th className="px-8 py-6">Classification</th>
                  <th className="px-8 py-6">Persistence</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-zinc-400">
                {cookieData.map((cookie, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6 font-mono text-blue-400">{cookie.name}</td>
                    <td className="px-8 py-6">{cookie.purpose}</td>
                    <td className="px-8 py-6">
                      <span className="px-2 py-1 rounded bg-zinc-800 text-[9px] font-black uppercase tracking-tighter text-zinc-300">
                        {cookie.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">{cookie.expiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --- HOW TO DISABLE --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#050505]">
        <div className="max-w-3xl mx-auto space-y-12">
          <div>
            <h2 className="text-white uppercase font-black tracking-widest text-lg mb-6 flex items-center gap-3">
              <Eye className="text-blue-500" size={20} /> Managing Preferences
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Most browsers allow you to refuse or delete cookies via their settings menus. 
              Note that disabling essential cookies will prevent you from accessing the 
              ArcticShield Command Console as we will be unable to verify your session identity.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Chrome', 'Safari', 'Firefox', 'Edge'].map(browser => (
                <div key={browser} className="py-3 px-4 rounded-xl border border-white/5 text-center text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  {browser}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- EXTERNAL INFO --- */}
      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-zinc-900/50 to-transparent border border-white/5 text-center">
          <Info className="mx-auto text-blue-500 mb-6" size={32} />
          <h2 className="text-2xl font-black uppercase italic mb-4">In-Depth Resources</h2>
          <p className="text-zinc-500 text-sm mb-8">For more information on your rights as a digital citizen, visit the official Cookie Law portal.</p>
          <button 
            onClick={() => window.open('https://www.cookiesandyou.com/', '_blank')}
            className="px-10 py-5 border border-white/10 text-white font-black rounded-xl hover:bg-blue-600 hover:border-blue-600 transition-all uppercase italic tracking-widest text-[10px]"
          >
            External Resource
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}