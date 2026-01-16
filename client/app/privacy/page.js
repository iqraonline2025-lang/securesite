"use client";
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, EyeOff, Lock, Globe, Database, UserCheck } from "lucide-react";
import Footer from "../components/Footer";

const policySections = [
  {
    title: "Zero-Knowledge Principle",
    icon: <EyeOff className="text-blue-500" />,
    content: "We utilize end-to-end encryption (E2EE) for all communication metadata. ArcticShield operatives cannot read, intercept, or decrypt your personal or corporate data packets."
  },
  {
    title: "Data Collection",
    icon: <Database className="text-cyan-500" />,
    content: "We only collect 'Anonymized Signal Intelligence'—this includes threat signatures and malicious URL patterns. We do not store IP addresses, geolocation, or device identifiers."
  },
  {
    title: "Data Retention",
    icon: <Lock className="text-blue-400" />,
    content: "Threat intelligence is stored for 30 days to train our neural models. Personal account metadata is purged immediately upon account deactivation."
  },
  {
    title: "Third-Party Disclosure",
    icon: <Globe className="text-cyan-400" />,
    content: "We do not sell, trade, or leak your information. We do not comply with informal data requests; we require a verified legal warrant which, due to our encryption, would yield no readable data."
  }
];

export default function PrivacyPolicy() {
  return (
    <main className="bg-[#020202] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* --- HERO --- */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6"
          >
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Protocol Version 2.1</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">
            Privacy <span className="text-blue-500">Manifesto.</span>
          </h1>
          <p className="text-zinc-500 font-medium italic">Last Updated: January 14, 2026</p>
        </div>
      </section>

      {/* --- CORE DATA FLOW --- */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {policySections.map((section, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-zinc-900/20 border border-white/5 hover:border-blue-500/30 transition-all"
            >
              <div className="mb-6">{section.icon}</div>
              <h3 className="text-xl font-black uppercase italic mb-4">{section.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- DETAILED LEGALESE --- */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
          <h2 className="text-white uppercase italic font-black text-2xl mb-8">Detailed Terms</h2>
          
          <div className="space-y-12 text-zinc-400 font-medium leading-relaxed">
            <div>
              <h4 className="text-blue-500 uppercase tracking-widest text-[10px] font-black mb-2">1.0 User Rights</h4>
              <p>Under the GDPR and CCPA, you have the right to request a full export of your data or the immediate 'Right to be Forgotten.' ArcticShield provides an automated 'Destroy All Data' toggle within your Command Console.</p>
            </div>

            <div>
              <h4 className="text-blue-500 uppercase tracking-widest text-[10px] font-black mb-2">2.0 Cookie Policy</h4>
              <p>We do not use tracking cookies. We use a single 'Session Token' stored in local storage to keep you authenticated. No cross-site tracking or advertising pixels are present on this domain.</p>
            </div>

            <div>
              <h4 className="text-blue-500 uppercase tracking-widest text-[10px] font-black mb-2">3.0 Infrastructure Security</h4>
              <p>All data processing occurs in ISO 27001 certified data centers. Our employees are subject to strict background checks and use multi-factor hardware authentication (Yubikeys) for all internal system access.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTACT FOR PRIVACY --- */}
      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto p-12 rounded-[3rem] bg-blue-600/5 border border-blue-500/20 text-center">
          <UserCheck className="mx-auto text-blue-500 mb-6" size={40} />
          <h2 className="text-2xl font-black uppercase italic mb-4 text-white">Privacy Officer</h2>
          <p className="text-zinc-500 text-sm font-medium mb-6">Questions regarding our data processing protocols? Contact our legal desk.</p>
          <a href="mailto:privacy@arcticshield.ai" className="text-blue-400 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">
            privacy@arcticshield.ai
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}