"use client";
import React from "react";
import { useRouter } from "next/navigation"; // Added for redirection
import { motion } from "framer-motion";
import { Zap, ShieldCheck } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const zigZagPath = "M-100 50 L100 20 L200 80 L300 30 L400 70 L500 50 L600 20 L700 80 L800 40 L900 60 L1100 50";
  
  // NEW COPY: High-authority security language
  const sentence = "Neutralize Every Threat.";

  const letterVariants = {
    hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        delay: i * 0.05,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <section className="relative min-h-screen bg-[#020202] flex flex-col items-center justify-center overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* --- BACKGROUND: ARCTIC BLUE GRID --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,#2563eb10_0%,transparent_70%)] blur-[100px]" />

        <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute top-1/2 -translate-y-1/2 w-full h-[300px] opacity-50 overflow-visible">
          <motion.path
            d={zigZagPath}
            fill="transparent"
            stroke="#3b82f6" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ filter: "drop-shadow(0 0 10px #3b82f6)" }}
          />
        </svg>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f610_1px,transparent_1px),linear-gradient(to_bottom,#3b82f610_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 text-center px-6">
        
        {/* Arctic Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 inline-block"
        >
          <div className="px-5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 backdrop-blur-md flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-400 animate-pulse" />
            <span className="text-blue-400 font-mono text-[10px] font-black tracking-[0.3em] uppercase">
              Military-Grade Encryption Active
            </span>
          </div>
        </motion.div>

        {/* ELECTRIC BLUE TITLE */}
        <div className="max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] flex flex-wrap justify-center">
            {sentence.split("").map((char, i) => {
              const colors = ["#3b82f6", "#06b6d4"];
              const currentColor = colors[i % colors.length];

              return (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-block"
                  style={{
                    color: currentColor,
                    marginRight: char === " " ? "1.5rem" : "0",
                    textShadow: char !== " " 
                      ? `0 0 15px ${currentColor}88, 0 0 40px ${currentColor}22` 
                      : "none"
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </h1>
        </div>

        {/* Updated Sub-text for Elite Appeal */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-10 text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto font-medium"
        >
          The first AI-driven perimeter for your digital communications. <br className="hidden md:block"/> 
          <span className="text-white font-bold italic">Zero Latency. Zero Vulnerability. Zero Scams.</span>
        </motion.p>

        {/* Simplified Action Group: SINGLE BUTTON */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-14 flex items-center justify-center"
        >
          <button 
            onClick={() => router.push('/signup')}
            className="group relative px-14 py-6 bg-blue-600 text-white font-black rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_0_50px_rgba(37,99,235,0.4)] overflow-hidden active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-4 text-xl tracking-tighter italic uppercase">
              Initialize Deployment <Zap size={22} fill="white" className="animate-pulse" />
            </span>
            {/* The "Sweep" effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </motion.div>
      </div>

      {/* --- GRID FLOOR --- */}
      <div className="absolute bottom-[-5%] w-full h-[30%] opacity-20 pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(to_right,#3b82f622_1px,transparent_1px),linear-gradient(to_bottom,#3b82f622_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom" />
      </div>

    </section>
  );
}