"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation"; // Import the router
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";

export default function CTA() {
  const buttonRef = useRef(null);
  const router = useRouter(); // Initialize router
  const [isHovered, setIsHovered] = useState(false);

  // Magnet Effect for the button
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);

    gsap.to(buttonRef.current, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.3)",
    });
  };

  // Click Handler
  const handleGetStarted = () => {
    router.push("/signup"); // Redirects to your signup page
  };

  return (
    <section className="relative py-40 bg-[#020202] overflow-hidden">
      {/* Background Pulse Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 0.1, 0], 
              scale: [0.8, 1.5, 2],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: i * 1.3,
              ease: "linear" 
            }}
            className="absolute w-[400px] h-[400px] border border-blue-500 rounded-full"
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        {/* Lock Icon Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-8"
        >
          <Lock size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption</span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8"
        >
          JOIN TODAY AND <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            STAY SAFE
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 text-lg md:text-xl max-w-xl mx-auto mb-12"
        >
          Secure your identity, your finances, and your peace of mind. 
          The best defense is one that never sleeps.
        </motion.p>

        {/* Magnetic Button Container */}
        <div 
          className="relative py-10"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <button
            ref={buttonRef}
            onClick={handleGetStarted} // Link to Signup
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative px-12 py-6 bg-blue-600 text-white font-black text-xl rounded-2xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:shadow-blue-500/50 transition-shadow duration-300 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              GET STARTED <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </span>
            
            {/* Internal Glow Effect */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          </button>
        </div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale"
        >
          <div className="flex items-center gap-2 text-white font-bold tracking-tighter">
            <ShieldCheck className="text-blue-500" /> ISO 27001 SECURE
          </div>
          <div className="w-px h-4 bg-white/20 hidden md:block" />
          <div className="text-white font-bold tracking-tighter">GDPR COMPLIANT</div>
          <div className="w-px h-4 bg-white/20 hidden md:block" />
          <div className="text-white font-bold tracking-tighter">256-BIT AES</div>
        </motion.div>
      </div>
    </section>
  );
}