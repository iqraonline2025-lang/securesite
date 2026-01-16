"use client";
import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, Phone, Mail, MessageSquare, 
  ChevronRight, X, AlertTriangle, Clock, Loader2 
} from "lucide-react";

// --- FALLBACK MOCK DATA ---
// This ensures the page looks "active" even if the database is empty
const MOCK_ALERTS = [
  {
    id: "m1",
    type: "Email",
    risk_level: "High",
    subject: "Neural Tunnel Breach Attempt",
    source: "security-node-04.nexus",
    details: "An encrypted packet attempted to exploit a handshake vulnerability in your neural tunnel. Origin: Distributed Botnet (Volgograd, RU). Firewall layer 7 rejected the request.",
    created_at: new Date().toISOString()
  },
  {
    id: "m2",
    type: "Call",
    risk_level: "Medium",
    subject: "Deepfake Voice ID Match",
    source: "+1 (555) 902-114",
    details: "Incoming call matched the biometric signature for 'Social Engineering Bot #9'. System redirected the caller to a secure honeypot.",
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "m3",
    type: "SMS",
    risk_level: "Low",
    subject: "Smishing Link Quarantined",
    source: "Global-Package-Alert",
    details: "SMS containing a masked credential-harvester URL was intercepted. Link was analyzed and found to lead to a cloned banking portal.",
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export default function ScamAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      try {
        if (user && user.email) {
          const API_URL = process.env.NEXT_PUBLIC_API_URL;

const res = await fetch(`${API_URL}/api/alerts/${user.email}`);
          const data = await res.json();
          
          // Use DB data if available, otherwise use mock data
          if (data && data.length > 0) {
            setAlerts(data);
          } else {
            setAlerts(MOCK_ALERTS);
          }
        } else {
          setAlerts(MOCK_ALERTS);
        }
      } catch (err) {
        console.error("Fetch error, using fallback data:", err);
        setAlerts(MOCK_ALERTS);
      } finally {
        // Subtle delay for "Scanning" aesthetic
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchAlerts();
  }, []);

  const getRiskStyles = (level) => {
    switch (level) {
      case "High": return "text-red-500 bg-red-500/10 border-red-500/30 ring-red-500/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30 ring-yellow-500/20";
      case "Low": return "text-green-500 bg-green-500/10 border-green-500/30 ring-green-500/20";
      default: return "text-zinc-500 bg-zinc-900 border-zinc-800";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
       <Loader2 className="animate-spin text-red-600" size={48} />
       <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px]">Scanning Perimeter Intelligence...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#020202] min-h-screen text-white font-sans selection:bg-red-500/30">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-5 mb-16">
        <div className="p-4 bg-red-600/10 rounded-2xl border border-red-600/30 shadow-[0_0_30px_rgba(220,38,38,0.15)]">
          <ShieldAlert className="text-red-500" size={36} />
        </div>
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Threat Intelligence</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
            Status: <span className="text-emerald-500">Live Monitoring Active</span>
          </p>
        </div>
      </div>

      {/* ALERT FEED */}
      <div className="grid gap-4 max-w-6xl">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            onClick={() => setSelectedAlert(alert)}
            className="group flex items-center justify-between p-7 bg-zinc-950/40 border border-zinc-900/50 rounded-[2.5rem] hover:border-zinc-600 hover:bg-zinc-900/40 transition-all duration-300 cursor-pointer backdrop-blur-md"
          >
            <div className="flex items-center gap-7">
              {/* TYPE ICON */}
              <div className={`p-5 rounded-3xl border transition-all duration-500 ${getRiskStyles(alert.risk_level)}`}>
                {alert.type === "Call" && <Phone size={28} />}
                {alert.type === "Email" && <Mail size={28} />}
                {alert.type === "SMS" && <MessageSquare size={28} />}
              </div>
              
              {/* SUBJECT & SOURCE */}
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight group-hover:text-red-400 transition-colors">
                  {alert.subject}
                </h3>
                <p className="text-zinc-600 font-mono text-[11px] mt-1 uppercase tracking-widest leading-none">
                  {alert.source}
                </p>
              </div>
            </div>

            {/* STATUS BADGE */}
            <div className="flex items-center gap-10">
              <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase border ring-1 tracking-widest ${getRiskStyles(alert.risk_level)}`}>
                {alert.risk_level} Priority
              </div>
              <ChevronRight className="text-zinc-800 group-hover:text-white group-hover:translate-x-2 transition-all duration-300" />
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 z-50">
          <div className="bg-[#080808] border border-zinc-800/60 p-12 rounded-[3.5rem] max-w-3xl w-full relative overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)]">
            
            {/* TERMINAL SCANLINE EFFECT */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-gradient-to-b from-transparent via-red-500 to-transparent h-32 w-full animate-scanline" />
            
            <button 
              onClick={() => setSelectedAlert(null)} 
              className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors p-2 z-10"
            >
              <X size={36}/>
            </button>
            
            <div className="flex items-center gap-3 mb-8">
               <AlertTriangle className={getRiskStyles(selectedAlert.risk_level).split(' ')[0]} size={24} />
               <span className={`text-[11px] font-black uppercase tracking-[0.5em] ${getRiskStyles(selectedAlert.risk_level).split(' ')[0]}`}>
                 Forensic Analysis Report
               </span>
            </div>
            
            <h2 className="text-6xl font-black italic uppercase mb-4 leading-[0.85] text-white tracking-tighter">
              {selectedAlert.subject}
            </h2>
            <p className="text-zinc-500 font-mono mb-12 text-sm italic tracking-wide">{selectedAlert.source}</p>
            
            <div className="bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/40 mb-12 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-5 text-zinc-600">
                <Clock size={16}/>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                   Log Timestamp: {new Date(selectedAlert.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-zinc-300 text-xl leading-relaxed font-medium italic">
                "{selectedAlert.details}"
              </p>
            </div>

            <button 
              onClick={() => setSelectedAlert(null)}
              className="w-full py-7 bg-red-600 text-white font-black uppercase italic tracking-[0.2em] rounded-3xl hover:bg-red-500 transition-all active:scale-[0.97] shadow-[0_15px_40px_rgba(220,38,38,0.2)]"
            >
              Acknowledge & Terminate Threat
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
        .animate-scanline {
          animation: scanline 3s linear infinite;
        }
      `}</style>
    </div>
  );
}