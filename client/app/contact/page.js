"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Terminal, Send, CheckCircle2 } from "lucide-react";
import Footer from "../components/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="bg-[#020202] min-h-screen text-white selection:bg-blue-500/30">
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6"
            >
              <Terminal size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Direct Channel</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-8">
              Establish <br /> <span className="text-blue-500">Connection.</span>
            </h1>
            <p className="text-zinc-500 text-lg font-medium max-w-md leading-relaxed">
              Our specialists are ready to help you deploy ArcticShield across your personal or enterprise infrastructure. 
            </p>

            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                  <Mail className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Security Desk</p>
                  <p className="text-white font-bold">ops@arcticshield.ai</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-cyan-400/50 transition-colors">
                  <MessageSquare className="text-cyan-400" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Instant Intel</p>
                  <p className="text-white font-bold">Live Portal (Active 24/7)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem]"
          >
            <div className="bg-[#080808] rounded-[2.4rem] p-8 md:p-12">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Operator Name</label>
                      <input required className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-blue-500 transition-colors" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Secure Email</label>
                      <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-blue-500 transition-colors" placeholder="ops@company.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Transmission Details</label>
                    <textarea required rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-blue-500 transition-colors resize-none" placeholder="How can we assist your deployment?" />
                  </div>
                  <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition-all uppercase italic tracking-widest flex items-center justify-center gap-3">
                    Send Transmission <Send size={18} />
                  </button>
                </form>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="flex justify-center"><CheckCircle2 size={64} className="text-blue-500 animate-bounce" /></div>
                  <h3 className="text-2xl font-black uppercase italic">Transmission Received</h3>
                  <p className="text-zinc-500 font-medium">An operative will contact you shortly.</p>
                  <button onClick={() => setSubmitted(false)} className="text-blue-400 text-xs font-black uppercase tracking-widest pt-4">Send another message</button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}