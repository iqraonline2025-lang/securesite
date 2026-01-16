"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { 
  ShieldCheck, Twitter, Github, Linkedin, 
  Globe, Mail, CheckCircle2, ArrowRight 
} from "lucide-react";

export default function Footer() {
  const footerRef = useRef(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success

  useEffect(() => {
    const ctx = gsap.context(() => {
      const footer = footerRef.current;
      const moveGlow = (e) => {
        const { left, top } = footer.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        gsap.to(".footer-glow", {
          opacity: 1,
          x: x - 150,
          y: y - 150,
          duration: 0.5,
        });
      };
      footer.addEventListener("mousemove", moveGlow);
      return () => footer.removeEventListener("mousemove", moveGlow);
    }, footerRef);
    return () => ctx.revert();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    
    // Simulate API Delay
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  const footerLinks = {
    Product: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/signup" },
      { name: "Enterprise", href: "/enterprise" },
      { name: "Case Studies", href: "/case-studies" }
    ],
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Security", href: "/security" },
      { name: "Contact", href: "/contact" }
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookie-policy" },
      { name: "GDPR", href: "/gdpr" }
    ],
  };

  return (
    <footer 
      ref={footerRef}
      className="relative bg-[#020202] pt-24 pb-12 overflow-hidden border-t border-white/5"
    >
      <div className="footer-glow pointer-events-none absolute w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full opacity-0 z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand & Newsletter Section */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase italic">
                Arctic<span className="text-blue-500">Shield</span>
              </span>
            </div>
            
            <p className="text-gray-500 max-w-sm leading-relaxed text-sm font-medium">
              Pioneering the next generation of neural defense. Join 2M+ users protected by our autonomous security network.
            </p>

            {/* Newsletter Logic */}
            <div className="relative max-w-sm min-h-[60px]">
              <AnimatePresence mode="wait">
                {status !== "success" ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSubscribe}
                    className="relative"
                  >
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Join the intelligence feed..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-16 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
                    />
                    <button 
                      disabled={status === "loading"}
                      className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all disabled:opacity-50"
                    >
                      {status === "loading" ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight size={18} />}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle2 size={20} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Transmission Received</span>
                    </div>
                    <p className="text-emerald-500/70 text-[11px] font-bold">
                      Your identity has been verified. Check your inbox for the first intel packet.
                    </p>
                    <div className="flex gap-4 pt-1 border-t border-emerald-500/10">
                       <a href="https://twitter.com" className="text-emerald-500 hover:text-emerald-300 transition-colors"><Twitter size={14} /></a>
                       <a href="https://github.com" className="text-emerald-500 hover:text-emerald-300 transition-colors"><Github size={14} /></a>
                       <a href="https://linkedin.com" className="text-emerald-500 hover:text-emerald-300 transition-colors"><Linkedin size={14} /></a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Link Groups */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-6">
                <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em]">{title}</h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        className="text-gray-500 hover:text-blue-400 text-sm font-medium transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* System Status Box */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-400 font-mono text-[9px] font-black uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                System Operational
              </div>
              <div className="text-white text-[11px] font-black uppercase tracking-tighter">
                Threat Level: <span className="text-emerald-500">Minimal</span>
              </div>
              <div className="pt-2 border-t border-white/5">
                <p className="text-[9px] text-zinc-600 leading-tight italic font-medium">
                  Active nodes: 1,248<br/>
                  Verified by Neural Hub 04.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            © 2026 ArcticShield Operations. Built for the perimeter.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="https://twitter.com" target="_blank" className="text-gray-500 hover:text-white transition-colors"><Twitter size={18} /></a>
            <a href="https://github.com" target="_blank" className="text-gray-500 hover:text-white transition-colors"><Github size={18} /></a>
            <a href="https://linkedin.com" target="_blank" className="text-gray-500 hover:text-white transition-colors"><Linkedin size={18} /></a>
            <div className="flex items-center gap-2 text-gray-500 hover:text-white cursor-pointer transition-colors text-[10px] font-black uppercase tracking-widest border-l border-white/10 pl-6">
              <Globe size={14} /> EN-US
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}