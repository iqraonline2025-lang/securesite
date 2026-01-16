"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  LogOut, 
  FlaskConical, 
  Search, 
  Users,
  Lightbulb,
  Settings,
  ShieldCheck // Icon for Command Center
} from "lucide-react";

export default function Nav({ user }) {
  const pathname = usePathname();

  // Use useMemo to prevent re-calculating the link array unless the user tier changes
  const navLinks = useMemo(() => {
    // 1. Base links
    const links = [
      { name: "Home", href: "/dashboard", icon: LayoutDashboard },
      { name: "Alerts", href: "/dashboard/alerts", icon: ShieldAlert },
      { name: "Report", href: "/dashboard/report", icon: Search },
      { name: "Academy", href: "/dashboard/tips", icon: Lightbulb },
    ];

    // 2. Admin Command Center (Added at the start for priority)
    if (user?.role === "Admin") {
      links.unshift({ name: "Command", href: "/dashboard/admin", icon: ShieldCheck });
    }

    // 3. Conditional Management links
    if (user?.tier === "Business") {
      links.push({ name: "Team", href: "/dashboard/management", icon: Users });
    }

    if (user?.tier === "Lab") {
      links.push({ name: "Lab", href: "/dashboard/management", icon: FlaskConical });
    }

    // 4. Settings
    links.push({ name: "Settings", href: "/dashboard/settings", icon: Settings });

    return links;
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-900 px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* BRAND LOGO */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-black italic text-white text-xl">S</span>
          </div>
          <span className="font-black italic uppercase tracking-tighter text-2xl text-white leading-none">
            Shield
          </span>
        </div>

        {/* CENTER NAVIGATION */}
        <div className="hidden md:flex items-center gap-8">
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
                  <div className="absolute -bottom-[25px] left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all" />
                )}
              </div>
            );
          })}
        </div>

        {/* PROFILE & LOGOUT */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white uppercase tracking-wider">
              {user?.name || "Operator"}
            </span>
            <span className={`text-[8px] font-bold uppercase tracking-[0.15em] ${
              user?.tier === 'Premium' ? 'text-amber-500' : 
              user?.tier === 'Business' ? 'text-blue-500' : 
              user?.tier === 'Lab' ? 'text-emerald-500' : 'text-zinc-500'
            }`}>
              {user?.tier || "Free"} Member
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Secure Logout"
            className="p-3 bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-2xl border border-zinc-800 transition-all duration-300 active:scale-95"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}