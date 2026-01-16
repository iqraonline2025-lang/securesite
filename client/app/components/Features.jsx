"use client";
import React from "react";
import { motion } from "framer-motion";
import { PhoneForwarded, MailCheck, BellRing, Lightbulb, LayoutDashboard } from "lucide-react";

export default function Features() {
  const featureList = [
    {
      title: "Scam Call Detection",
      desc: "Real-time voice analysis identifies spoofed numbers and known fraud scripts before you answer.",
      icon: <PhoneForwarded className="text-blue-400" />,
      color: "from-blue-600/20",
      border: "hover:border-blue-500/50"
    },
    {
      title: "Email & SMS Checking",
      desc: "Instant URL deconstruction for every message you receive to prevent phishing.",
      icon: <MailCheck className="text-cyan-400" />,
      color: "from-cyan-600/20",
      border: "hover:border-cyan-500/50"
    },
    {
      title: "Instant Alerts",
      desc: "High-priority push notifications that warn you the second a threat is detected.",
      icon: <BellRing className="text-indigo-400" />,
      color: "from-indigo-600/20",
      border: "hover:border-indigo-500/50"
    },
    {
      title: "Safety Tips",
      desc: "AI-generated insights on the latest phishing trends and how to stay ahead.",
      icon: <Lightbulb className="text-amber-400" />,
      color: "from-amber-600/20",
      border: "hover:border-amber-500/50"
    },
  ];

  return (
    <section className="relative py-32 bg-[#020202] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="mb-16 text-center lg:text-left">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter"
          >
            SMART <span className="text-blue-500">DEFENSE</span> TOOLS
          </motion.h2>
        </div>

        {/* The Expandable Flex Container */}
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[450px]">
          {featureList.map((f, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                layout: { duration: 0.6, type: "spring", bounce: 0.2 },
                opacity: { duration: 0.5, delay: i * 0.1 }
              }}
              // On hover, this card takes 3x the space of the others
              whileHover={{ flex: 3 }}
              className={`relative flex-[1] min-w-0 overflow-hidden p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/20 backdrop-blur-xl flex flex-col justify-between group transition-colors duration-500 ${f.border}`}
            >
              {/* Background Gradient Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

              {/* Icon Section */}
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  {f.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 whitespace-nowrap">
                  {f.title}
                </h3>
                
                {/* Description - only fully readable when expanded */}
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs group-hover:opacity-100 transition-opacity duration-300">
                  {f.desc}
                </p>
              </div>

              {/* Bottom Interactive Element */}
              <div className="relative z-10 mt-8">
                <div className="h-[2px] w-12 bg-blue-500/50 rounded-full group-hover:w-full transition-all duration-700" />
                <span className="text-[10px] font-mono text-gray-500 uppercase mt-2 block opacity-0 group-hover:opacity-100 transition-opacity delay-200">
                  Module Active
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Decorative Blur */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
    </section>
  );
}