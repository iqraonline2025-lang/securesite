"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { 
  Menu, X, ChevronDown, LayoutDashboard, 
  Bell, ShieldAlert, LogOut, Shield 
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "#home", id: "home" },
  { name: "How It Works", href: "#how-it-works", id: "how-it-works" },
  { name: "Features", href: "#features", id: "features" },
  { name: "Plans", href: "#plans", id: "plans" },
  { name: "Safety Tips", href: "#tips", id: "tips" },
];

export default function Navbar() {
  const [activeTab, setActiveTab] = useState("Home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Auth Check
    const savedUser = localStorage.getItem("user");
    if (savedUser) setIsLoggedIn(true);

    // Scroll Highlight Logic
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = navLinks.find(link => link.id === entry.target.id);
          if (link) setActiveTab(link.name);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    navLinks.forEach((link) => {
      const section = document.getElementById(link.id);
      if (section) observer.observe(section);
    });

    gsap.registerPlugin(ScrollToPlugin);
    return () => observer.disconnect();
  }, []);

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      gsap.to(window, {
        duration: 0.8,
        scrollTo: { y: target, offsetY: 80 },
        ease: "power2.inOut",
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* IMPORTANT: 'sticky top-0' and 'z-[999]' make the bar stay. 
        'w-full' and 'bg-black/80' ensure the background is visible.
      */}
      <nav className="sticky top-0 w-full z-[999] h-20 bg-black/80 backdrop-blur-xl border-b border-white/10 flex items-center px-6 md:px-12 justify-between">
        
        {/* LOGO */}
        <div onClick={() => window.location.href = "/"} className="flex items-center gap-3 cursor-pointer shrink-0">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-600/20 rounded-xl border border-blue-500/30">
            <Shield size={22} className="text-blue-500" />
          </div>
          <span className="text-xl font-bold text-white tracking-tighter">
            Secure<span className="text-blue-500">Me</span>
          </span>
        </div>

        {/* DESKTOP LINKS */}
        <ul className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <li key={link.name} className="relative h-20 flex items-center">
              <a
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === link.name ? "text-blue-400" : "text-zinc-500 hover:text-white"
                }`}
              >
                {link.name}
              </a>
              {activeTab === link.name && (
                <motion.div
                  layoutId="navUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_15px_#3b82f6]"
                />
              )}
            </li>
          ))}
        </ul>

        {/* AUTH BUTTONS */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = "/login"}
            className="hidden md:block text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => window.location.href = "/signup"}
            className="px-6 py-2.5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-blue-500 transition-all shadow-[0_5px_15px_rgba(59,130,246,0.3)]"
          >
            Join
          </button>
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 bg-black z-[1000] p-8 flex flex-col"
          >
             <button onClick={() => setIsMobileMenuOpen(false)} className="self-end text-white p-2">
               <X size={32} />
             </button>
             <div className="flex flex-col gap-6 mt-12 text-4xl font-black uppercase italic">
                {navLinks.map(link => (
                  <a key={link.name} href={link.href} onClick={(e) => handleScroll(e, link.href)} className={activeTab === link.name ? "text-blue-500" : "text-zinc-800"}>
                    {link.name}
                  </a>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}