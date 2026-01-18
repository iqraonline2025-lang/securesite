"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Menu, X, Shield } from "lucide-react";

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
    const savedUser = localStorage.getItem("user");
    if (savedUser) setIsLoggedIn(true);

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
      setIsMobileMenuOpen(false); // Close menu on click
    }
  };

  return (
    <>
      {/* 1️⃣ DESKTOP & BASE NAVBAR 
          Tailwind 'md:' classes handle the media queries.
      */}
      <nav className="sticky top-0 w-full z-[999] h-20 bg-black/80 backdrop-blur-xl border-b border-white/10 flex items-center px-4 md:px-12 justify-between">
        
        {/* LOGO */}
        <div onClick={() => window.location.href = "/"} className="flex items-center gap-3 cursor-pointer shrink-0">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-600/20 rounded-xl border border-blue-500/30">
            <Shield size={22} className="text-blue-500" />
          </div>
          <span className="text-lg md:text-xl font-bold text-white tracking-tighter">
            Secure<span className="text-blue-500">Me</span>
          </span>
        </div>

        {/* 2️⃣ DESKTOP LINKS - Hidden on small screens (hidden md:flex) */}
        <ul className="hidden md:flex items-center gap-8 lg:gap-10">
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

        {/* 3️⃣ RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-2 md:gap-4">
          {!isLoggedIn ? (
            <>
              <button 
                onClick={() => window.location.href = "/login"}
                className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors px-3"
              >
                Login
              </button>
              <button 
                onClick={() => window.location.href = "/signup"}
                className="px-5 py-2 md:px-6 md:py-2.5 bg-blue-600 text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-blue-500 transition-all shadow-[0_5px_15px_rgba(59,130,246,0.3)]"
              >
                Join
              </button>
            </>
          ) : (
            <button 
              onClick={() => window.location.href = "/dashboard"}
              className="px-5 py-2 bg-zinc-800 text-white text-[10px] font-black uppercase rounded-full"
            >
              Dashboard
            </button>
          )}

          {/* 4️⃣ HAMBURGER ICON - Visible only on small screens (md:hidden) */}
          <button 
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* 5️⃣ MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-black z-[1000] p-6 flex flex-col"
          >
            {/* CLOSE BUTTON */}
            <div className="flex justify-end">
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2">
                <X size={32} />
              </button>
            </div>

            {/* MOBILE NAV LINKS */}
            <div className="flex flex-col gap-8 mt-12">
              {navLinks.map((link, index) => (
                <motion.a 
                  key={link.name} 
                  href={link.href} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={(e) => handleScroll(e, link.href)} 
                  className={`text-4xl font-black uppercase tracking-tighter italic ${
                    activeTab === link.name ? "text-blue-500" : "text-zinc-800 hover:text-zinc-600"
                  }`}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>

            {/* MOBILE FOOTER AUTH */}
            <div className="mt-auto pb-10 flex flex-col gap-4">
              <button 
                onClick={() => window.location.href = "/login"}
                className="w-full py-4 border border-white/10 text-white font-black uppercase tracking-widest rounded-xl"
              >
                Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}