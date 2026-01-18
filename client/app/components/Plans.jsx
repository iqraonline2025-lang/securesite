"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Building2, GraduationCap, User, ShieldCheck } from "lucide-react";

const plans = [
  {
    id: "free",
    tier: "Free",
    price: "$0",
    icon: <User size={32} />,
    color: "#3b82f6",
    benefits: ["SMS Link Scanning", "Manual Reporting", "Basic Filter"],
  },
  {
    id: "premium",
    tier: "Premium",
    price: "$9",
    icon: <Zap size={32} />,
    color: "#06b6d4",
    benefits: ["Call Detection", "Phishing Auto-Block", "24/7 Priority"],
  },
  {
    id: "business",
    tier: "Business",
    price: "$49",
    icon: <Building2 size={32} />,
    color: "#6366f1",
    benefits: ["Team Training", "Admin Dashboard", "API Access"],
  },
  {
    id: "lab",
    tier: "Lab",
    price: "$25",
    icon: <GraduationCap size={32} />,
    color: "#a855f7",
    benefits: ["Campus Defense", "Workshops", "Research Proxy"],
  },
];

export default function PlansRadial() {
  const [activeTab, setActiveTab] = useState(plans[1]);
  const router = useRouter();

  const handlePlanSelection = () => {
    router.push(`/signup?plan=${activeTab.id}`);
  };

  return (
    <section id="plans" className="relative py-20 md:py-32 bg-[#020202] min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Glow - Responsive size */}
      <div 
        className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full opacity-20 blur-[80px] md:blur-[120px] transition-colors duration-1000"
        style={{ backgroundColor: activeTab.color }}
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10">
        
        {/* LEFT: THE INTERACTIVE HUB */}
        <div className="relative flex items-center justify-center h-[350px] md:h-[500px] order-2 lg:order-1">
          {/* Inner Circles - Scaled for mobile */}
          <div className="absolute w-[200px] h-[200px] md:w-[350px] md:h-[350px] border border-white/5 rounded-full" />
          
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[280px] h-[280px] md:w-[450px] md:h-[450px] border border-dashed border-blue-500/20 rounded-full"
          />

          {/* Central Shield Icon */}
          <div className="relative z-20 bg-black p-5 md:p-8 rounded-full border-4 border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
             <ShieldCheck size={40} md={64} style={{ color: activeTab.color }} className="transition-colors duration-500" />
          </div>

          {/* Radial Plan Buttons */}
          {plans.map((plan, i) => {
            const angle = (i * 360) / plans.length;
            const isActive = activeTab.id === plan.id;
            
            // Dynamic Radius: Smaller on mobile (120px) vs Desktop (200px)
            const radius = typeof window !== "undefined" && window.innerWidth < 768 ? 120 : 200;

            return (
              <motion.button
                key={plan.id}
                onClick={() => setActiveTab(plan)}
                initial={false}
                animate={{
                  x: Math.cos((angle * Math.PI) / 180) * radius,
                  y: Math.sin((angle * Math.PI) / 180) * radius,
                  scale: isActive ? 1.1 : 0.9,
                }}
                className={`absolute p-3 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all duration-500 ${
                  isActive 
                  ? "bg-white text-black border-white shadow-[0_0_20px_white]" 
                  : "bg-black text-white border-white/10 hover:border-white/30"
                }`}
              >
                {/* Responsive icon sizes */}
                {React.cloneElement(plan.icon, { size: typeof window !== "undefined" && window.innerWidth < 768 ? 20 : 32 })}
              </motion.button>
            );
          })}
        </div>

        {/* RIGHT: DYNAMIC CONTENT AREA */}
        <div className="min-h-[350px] md:h-[400px] flex flex-col justify-center text-center lg:text-left order-1 lg:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 md:space-y-6"
            >
              <span className="text-blue-500 font-mono font-black tracking-widest uppercase text-xs md:text-sm">
                {activeTab.tier} Security Tier
              </span>
              <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                {activeTab.price}
                <span className="text-lg md:text-xl text-gray-500 font-normal">/month</span>
              </h3>
              <p className="text-gray-400 text-sm md:text-lg max-w-md mx-auto lg:mx-0 italic leading-relaxed">
                Our {activeTab.tier} shield provides robust coverage tailored for {activeTab.id === 'lab' ? 'security laboratories' : 'your digital safety'}.
              </p>
              
              <ul className="grid grid-cols-1 gap-3 md:gap-4 pt-4 justify-items-center lg:justify-items-start">
                {activeTab.benefits.map((benefit, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-white text-sm md:text-base font-medium"
                  >
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-blue-500" />
                    </div>
                    {benefit}
                  </motion.li>
                ))}
              </ul>

              <div className="pt-6">
                <button 
                  onClick={handlePlanSelection}
                  className="w-full md:w-auto px-8 md:px-12 py-3 md:py-4 rounded-xl font-black transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
                  style={{ 
                    backgroundColor: activeTab.color, 
                    color: 'white',
                    boxShadow: `0 10px 30px -10px ${activeTab.color}80` 
                  }}
                >
                  Deploy {activeTab.tier} Shield
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}