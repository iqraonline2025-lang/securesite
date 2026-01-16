"use client";
import React from "react";
import { 
  Lightbulb, ShieldAlert, LifeBuoy, CheckCircle, 
  ChevronRight, PhoneOff, Lock, Globe 
} from "lucide-react";

export default function SafetyTipsPage() {
  const commonScams = [
    { title: "Phishing", desc: "Fake emails/sites designed to steal login credentials.", icon: <Globe size={20}/> },
    { title: "Vishing", desc: "Voice scams where callers pretend to be government agents.", icon: <PhoneOff size={20}/> },
    { title: "Tech Support", desc: "Fake pop-ups claiming your PC has a virus.", icon: <Lock size={20}/> }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen text-white pb-20">
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-emerald-500">Shield Academy</h1>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Daily Defense & Emergency Protocols</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COL: DAILY TIPS */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-6 text-emerald-500">
              <Lightbulb size={24} />
              <h2 className="text-xl font-black uppercase italic">Daily Intelligence</h2>
            </div>
            <div className="space-y-4">
              <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800">
                <p className="text-emerald-500 text-[10px] font-black uppercase mb-2">Today's Focus</p>
                <h3 className="text-lg font-bold mb-2">Check the "From" Address</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Always hover over the sender's name in emails. Scammers use names like "Netflix Support" but the email address is often a string of random characters.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-6 text-blue-500">
              <ShieldAlert size={24} />
              <h2 className="text-xl font-black uppercase italic">Common Scam Types</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {commonScams.map((scam, i) => (
                <div key={i} className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 hover:border-blue-500/50 transition-all">
                  <div className="text-blue-500 mb-4">{scam.icon}</div>
                  <h4 className="font-black uppercase text-sm mb-2">{scam.title}</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">{scam.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COL: EMERGENCY PROTOCOL */}
        <div className="space-y-6">
          <section className="bg-red-600 p-8 rounded-[2.5rem] sticky top-24">
            <div className="flex items-center gap-3 mb-6 text-white">
              <LifeBuoy size={24} />
              <h2 className="text-xl font-black uppercase italic">If Scammed</h2>
            </div>
            <div className="space-y-4">
              {[
                "Freeze your bank cards immediately.",
                "Change all primary passwords.",
                "Enable 2FA on your email.",
                "Report to local cyber-police."
              ].map((step, i) => (
                <div key={i} className="flex gap-3 items-start text-white/90">
                  <div className="mt-1"><CheckCircle size={14} /></div>
                  <p className="text-xs font-bold uppercase leading-tight">{step}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 bg-white text-red-600 font-black uppercase italic rounded-2xl text-xs hover:bg-zinc-100 transition-all">
              Full Recovery Guide
            </button>
          </section>
        </div>

      </div>
    </div>
  );
}