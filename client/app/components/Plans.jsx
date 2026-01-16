"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import the router for programmatic navigation
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
    id: "lab", // Changed to 'lab' to match your Settings logic
    tier: "Lab",
    price: "$25",
    icon: <GraduationCap size={32} />,
    color: "#a855f7",
    benefits: ["Campus Defense", "Workshops", "Research Proxy"],
  },
];

export default function PlansRadial() {
  const [activeTab, setActiveTab] = useState(plans[1]); // Default to Premium
  const router = useRouter();

  // Redirect function
  const handlePlanSelection = () => {
    // Redirect to signup and pass the plan ID as a query param
    router.push(`/signup?plan=${activeTab.id}`);
  };

  return (
    <section className="relative py-32 bg-[#020202] min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] transition-colors duration-1000"
        style={{ backgroundColor: activeTab.color }}
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center z-10">
        
        {/* LEFT: THE INTERACTIVE HUB */}
        <div className="relative flex items-center justify-center h-[500px]">
          <div className="absolute w-[350px] h-[350px] border border-white/5 rounded-full" />
          
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[450px] h-[450px] border border-dashed border-blue-500/20 rounded-full"
          />

          <div className="relative z-20 bg-black p-8 rounded-full border-4 border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
             <ShieldCheck size={64} style={{ color: activeTab.color }} className="transition-colors duration-500" />
          </div>

          {plans.map((plan, i) => {
            const angle = (i * 360) / plans.length;
            const isActive = activeTab.id === plan.id;

            return (
              <motion.button
                key={plan.id}
                onClick={() => setActiveTab(plan)}
                initial={false}
                animate={{
                  x: Math.cos((angle * Math.PI) / 180) * 200,
                  y: Math.sin((angle * Math.PI) / 180) * 200,
                  scale: isActive ? 1.2 : 1,
                }}
                className={`absolute p-5 rounded-2xl border-2 transition-all duration-500 ${
                  isActive 
                  ? "bg-white text-black border-white shadow-[0_0_30px_white]" 
                  : "bg-black text-white border-white/10 hover:border-white/30"
                }`}
              >
                {plan.icon}
              </motion.button>
            );
          })}
        </div>

        {/* RIGHT: DYNAMIC CONTENT AREA */}
        <div className="h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <span className="text-blue-500 font-mono font-black tracking-widest uppercase">
                {activeTab.tier}
              </span>
              <h3 className="text-6xl font-black text-white tracking-tighter">
                {activeTab.price}
                <span className="text-xl text-gray-500 font-normal">/month</span>
              </h3>
              <p className="text-gray-400 text-lg max-w-md italic">
                Our {activeTab.tier} shield provides robust coverage specifically tailored for {activeTab.id === 'lab' ? 'security laboratories' : 'your digital safety'}.
              </p>
              
              <ul className="grid grid-cols-1 gap-4 pt-6">
                {activeTab.benefits.map((benefit, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-white font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Check size={14} className="text-blue-500" />
                    </div>
                    {benefit}
                  </motion.li>
                ))}
              </ul>

              {/* ACTION BUTTON WITH REDIRECT */}
              <button 
                onClick={handlePlanSelection}
                className="mt-10 px-10 py-4 rounded-xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl"
                style={{ 
                  backgroundColor: activeTab.color, 
                  color: 'white',
                  boxShadow: `0 10px 30px -10px ${activeTab.color}80` 
                }}
              >
                Get Started with {activeTab.tier}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}