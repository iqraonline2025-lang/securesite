"use client";
import React, { useState } from "react";
import { Monitor, Activity, ShieldAlert, ArrowLeft, RefreshCw, Radio } from "lucide-react";
import Link from "next/link";

export default function MonitorPage() {
  const [isScanning, setIsScanning] = useState(false);

  // Simulated Lab Devices
  const [devices] = useState([
    { id: "LAB-01", status: "Secure", threat: "None", ip: "192.168.1.10" },
    { id: "LAB-02", status: "Secure", threat: "None", ip: "192.168.1.11" },
    { id: "LAB-03", status: "Warning", threat: "Suspicious Script", ip: "192.168.1.12" },
    { id: "LAB-04", status: "Secure", threat: "None", ip: "192.168.1.13" },
  ]);

  const triggerScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Lab Infrastructure</h1>
            <p className="text-blue-500 text-xs font-bold uppercase tracking-[0.3em]">Education / Research Node</p>
          </div>
          <button 
            onClick={triggerScan}
            disabled={isScanning}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all"
          >
            {isScanning ? <RefreshCw className="animate-spin" size={16}/> : <Radio size={16}/>}
            {isScanning ? "Scanning Network..." : "Force Lab Scan"}
          </button>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {devices.map((device) => (
            <div key={device.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] hover:border-zinc-700 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl ${device.status === 'Secure' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  <Monitor size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">{device.ip}</p>
                  <p className="text-sm font-black">{device.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 uppercase font-bold">Status</span>
                  <span className={device.status === 'Secure' ? 'text-emerald-500' : 'text-amber-500'}>{device.status}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 uppercase font-bold">Integrity</span>
                  <span>{device.status === 'Secure' ? '100%' : '82%'}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Active Threats</p>
                <p className={`text-xs font-bold ${device.threat === 'None' ? 'text-zinc-400' : 'text-amber-500'}`}>
                  {device.threat}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}