"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, ShieldCheck } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const zigZagPath = "M-100 50 L100 20 L200 80 L300 30 L400 70 L500 50 L600 20 L700 80 L800 40 L900 60 L1100 50";
  
  // Split into two parts for better control over the "next line" behavior
  const line1 = "Neutralize Every";
  const line2 = "Threat.";

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

  const renderLetters = (text, startDelay = 0) => {
    return text.split("").map((char, i) => {
      const colors = ["#3b82f6", "#06b6d4"];
      const currentColor = colors[i % colors.length];
      return (
        <motion.span
          key={i}
          custom={i + startDelay}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          className="inline-block"
          style={{
            color: currentColor,
            marginRight: char === " " ? "0.6rem" : "0",
            textShadow: char !== " " ? `0 0 10px ${currentColor}66` : "none"
          }}
        >
          {char}
        </motion.span>
      );
    });
  };

  return (
    <section className="relative min-h-screen bg-[#020202] flex flex-col items-center justify-center overflow-hidden selection:bg-blue-500 selection:text-white pt-20">
      
      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,#2563eb10_0%,transparent_70%)] blur-[100px]" />
        <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute top-1/2 -translate-y-1/2 w-full h-[150px] md:h-[300px] opacity-30 md:opacity-50 overflow-visible">
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
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f610_1px,transparent_1px),linear-gradient(to_bottom,#3b82f610_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]" />
      </div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 text-center px-4">
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 md:mb-8 inline-block">
          <div className="px-3 py-1 md:px-5 md:py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 backdrop-blur-md flex items-center gap-2">
            <ShieldCheck size={12} className="text-blue-400 animate-pulse" />
            <span className="text-blue-400 font-mono text-[8px] md:text-[10px] font-black tracking-[0.1em] md:tracking-[0.3em] uppercase">
              Military-Grade Encryption Active
            </span>
          </div>
        </motion.div>

        {/* UPDATED TITLE: Uses two lines for better mobile fit */}
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] md:leading-[0.9] flex flex-col items-center">
            {/* First Line */}
            <span className="flex flex-wrap justify-center">
              {renderLetters(line1)}
            </span>
            {/* Second Line - The "Threat." part */}
            <span className="flex flex-wrap justify-center mt-2 md:mt-0">
              {renderLetters(line2, line1.length)}
            </span>
          </h1>
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-6 md:mt-10 text-gray-400 text-base md:text-2xl max-w-xl md:max-w-2xl mx-auto font-medium"
        >
          AI-driven perimeter for digital communications. <br className="hidden md:block"/> 
          <span className="text-white font-bold italic block md:inline mt-2 md:mt-0">Zero Latency. Zero Vulnerability. Zero Scams.</span>
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8 }} className="mt-10 md:mt-14 flex items-center justify-center">
          <button 
            onClick={() => router.push('/signup')}
            className="group relative px-8 py-4 md:px-14 md:py-6 bg-blue-600 text-white font-black rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.3)] md:shadow-[0_0_50px_rgba(37,99,235,0.4)] overflow-hidden active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2 md:gap-4 text-sm md:text-xl tracking-tighter italic uppercase">
              Initialize Deployment <Zap size={18} fill="white" className="animate-pulse" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-[-2%] md:bottom-[-5%] w-full h-[20%] md:h-[30%] opacity-20 pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(to_right,#3b82f622_1px,transparent_1px),linear-gradient(to_bottom,#3b82f622_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom" />
      </div>

    </section>
  );
}