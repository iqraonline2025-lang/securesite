"use client";
import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Smartphone, Brain, ShieldCheck, ArrowDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HowItWorks() {
  const containerRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the vertical line height as we scroll
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: 1,
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      title: "Scam Received",
      subtitle: "Step 01: The Threat",
      desc: "A scammer targets you with a phishing link or fraudulent message.",
      icon: <Smartphone size={32} className="text-red-500" />,
      side: "left",
      glow: "shadow-[0_0_30px_rgba(239,68,68,0.2)]",
    },
    {
      title: "AI Analysis",
      subtitle: "Step 02: The Brain",
      desc: "Our system deconstructs the threat using neural pattern matching.",
      icon: <Brain size={32} className="text-blue-500" />,
      side: "right",
      glow: "shadow-[0_0_30px_rgba(59,130,246,0.2)]",
    },
    {
      title: "You Are Saved",
      subtitle: "Step 03: The Rescue",
      desc: "The threat is neutralized. You receive a warning and stay protected.",
      icon: <ShieldCheck size={32} className="text-emerald-500" />,
      side: "left",
      glow: "shadow-[0_0_40px_rgba(16,185,129,0.3)]",
    },
  ];

  return (
    <section ref={containerRef} className="relative py-40 bg-[#020202] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative">
        
        {/* Header */}
        <div className="text-center mb-32">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter"
          >
            THE <span className="text-blue-500 underline decoration-blue-500/30">RESCUE</span> FLOW
          </motion.h2>
        </div>

        {/* Vertical Progress Line */}
        <div className="absolute left-1/2 top-[400px] bottom-40 w-[2px] bg-white/10 -translate-x-1/2 hidden lg:block">
          <div 
            ref={lineRef} 
            className="w-full h-full bg-gradient-to-b from-red-500 via-blue-500 to-emerald-500 origin-top scale-y-0"
          />
        </div>

        {/* Steps */}
        <div className="space-y-40">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: step.side === "left" ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`flex flex-col lg:flex-row items-center justify-between gap-10 ${
                step.side === "right" ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Card Content */}
              <div className={`w-full lg:w-[45%] p-8 rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 backdrop-blur-xl ${step.glow} hover:border-white/20 transition-all group`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-500 uppercase tracking-widest">{step.subtitle}</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{step.title}</h3>
                  </div>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">{step.desc}</p>
                
                {/* Micro-Interaction Status Bar */}
                <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: "100%" }}
                     transition={{ duration: 1.5, delay: 0.5 }}
                     className={`h-full bg-current ${i === 0 ? 'text-red-500' : i === 1 ? 'text-blue-500' : 'text-emerald-500'}`}
                     style={{ backgroundColor: 'currentColor' }}
                   />
                </div>
              </div>

              {/* Central Indicator (Only visible on scroll) */}
              <div className="relative z-10 hidden lg:flex items-center justify-center w-20 h-20 rounded-full bg-[#020202] border-2 border-white/10">
                <motion.div 
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6]"
                />
              </div>

              {/* Spacer for layout */}
              <div className="hidden lg:block w-[45%]" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/5 animate-bounce">
        <ArrowDown size={48} />
      </div>
    </section>
  );
}