"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, ShieldAlert, LogOut, FlaskConical, 
  Search, Users, Lightbulb, Settings, ShieldCheck, Menu, X 
} from "lucide-react";

export default function Nav({ user }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = useMemo(() => {
    const links = [
      { name: "Home", href: "/dashboard", icon: LayoutDashboard },
      { name: "Alerts", href: "/dashboard/alerts", icon: ShieldAlert },
      { name: "Report", href: "/dashboard/report", icon: Search },
      { name: "Academy", href: "/dashboard/tips", icon: Lightbulb },
    ];

    if (user?.role === "Admin") {
      links.unshift({ name: "Command", href: "/dashboard/admin", icon: ShieldCheck });
    }

    if (user?.tier === "Business") {
      links.push({ name: "Team", href: "/dashboard/management", icon: Users });
    }

    if (user?.tier === "Lab") {
      links.push({ name: "Lab", href: "/dashboard/management", icon: FlaskConical });
    }

    links.push({ name: "Settings", href: "/dashboard/settings", icon: Settings });
    return links;
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-xl border-b border-zinc-900 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* BRAND LOGO */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = "/dashboard"}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-black italic text-white text-xl">S</span>
            </div>
            <span className="font-black italic uppercase tracking-tighter text-xl md:text-2xl text-white leading-none">
              Shield
            </span>
          </div>

          {/* DESKTOP CENTER NAVIGATION (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <div key={link.name} className="relative flex items-center">
                  <Link 
                    href={link.href}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                      isActive ? "text-blue-500" : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    <Icon size={14} strokeWidth={3} />
                    {link.name}
                  </Link>
                  {isActive && (
                    <motion.div 
                      layoutId="activeGlow"
                      className="absolute -bottom-[26px] left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT SIDE: PROFILE & MOBILE TRIGGER */}
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                {user?.full_name || user?.name || "Operator"}
              </span>
              <span className={`text-[8px] font-bold uppercase tracking-[0.15em] ${
                user?.tier === 'Premium' ? 'text-amber-500' : 
                user?.tier === 'Business' ? 'text-blue-500' : 
                user?.tier === 'Lab' ? 'text-emerald-500' : 'text-zinc-500'
              }`}>
                {user?.tier || "Free"} Member
              </span>
            </div>
            
            {/* Desktop Logout Icon */}
            <button 
              onClick={handleLogout}
              className="hidden md:flex p-3 bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-2xl border border-zinc-800 transition-all active:scale-95"
            >
              <LogOut size={16} />
            </button>

            {/* HAMBURGER (Visible on Mobile/Tablet) */}
            <button 
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE FULL-SCREEN MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
               <span className="text-zinc-500 font-black uppercase text-xs tracking-widest">Navigation</span>
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2 bg-zinc-900 rounded-full">
                 <X size={24} />
               </button>
            </div>

            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 p-5 rounded-2xl border ${
                      isActive 
                      ? "bg-blue-600/10 border-blue-500/50 text-blue-500" 
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-black uppercase tracking-widest text-sm">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto space-y-4">
               <div className="p-5 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <p className="text-white font-black uppercase text-xs mb-1">{user?.name || "Operator"}</p>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">{user?.tier || "Free"} Status</p>
               </div>
               <button 
                onClick={handleLogout}
                className="w-full p-5 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3"
               >
                 <LogOut size={18} />
                 Terminate Session
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}