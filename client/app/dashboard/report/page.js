"use client";
import React, { useState } from "react";
import { ShieldAlert, Upload, Phone, Mail, Search, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

export default function ReportScamPage() {
  const [formData, setFormData] = useState({ phone: "", message: "" });
  const [file, setFile] = useState(null); // NEW: State for the file
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));

    // NEW: Use FormData to handle file + text fields
    const dataToSend = new FormData();
    dataToSend.append("email", user.email);
    dataToSend.append("phone", formData.phone);
    dataToSend.append("message", formData.message);
    if (file) {
      dataToSend.append("screenshot", file);
    }

    try {
      const res = await fetch("http://localhost:5000/api/reports/check", {
        method: "POST",
        // Note: Do NOT set Content-Type header when sending FormData
        // The browser will automatically set it to multipart/form-data with the correct boundary
        body: dataToSend,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen text-white">
      <div className="mb-12">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-blue-500">Scam Analyzer</h1>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Submit intelligence for real-time verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <form onSubmit={handleCheck} className="space-y-6">
          
          {/* File Upload Box */}
          <div className={`group relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all bg-zinc-900/30 ${file ? 'border-emerald-500/50' : 'border-zinc-800 hover:border-blue-500/50'}`}>
            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="text-emerald-500 mb-2" size={32} />
                <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{file.name}</p>
                <button type="button" onClick={() => setFile(null)} className="mt-2 text-[8px] text-zinc-500 uppercase underline">Remove</button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-4 text-zinc-600 group-hover:text-blue-500 transition-colors" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Upload Screenshot</p>
              </>
            )}
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
            <Phone className="text-zinc-500" size={20} />
            <input 
              type="text" 
              placeholder="PASTE PHONE NUMBER" 
              className="bg-transparent border-none outline-none w-full font-mono text-sm uppercase tracking-widest"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4 text-zinc-500">
              <Mail size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Message Content</span>
            </div>
            <textarea 
              rows="5" 
              placeholder="PASTE EMAIL OR SMS TEXT HERE..." 
              className="bg-transparent border-none outline-none w-full font-mono text-sm uppercase tracking-widest resize-none"
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            ></textarea>
          </div>

          <button 
            disabled={loading}
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Search className="animate-spin" /> : <ShieldAlert size={20} />}
            {loading ? "Analyzing Database..." : "Check Scam Intelligence"}
          </button>
        </form>

        {/* Result UI */}
        <div className="flex flex-col justify-center">
          {!result ? (
            <div className="border border-zinc-800 rounded-[3rem] p-12 text-center opacity-30">
              <Search size={48} className="mx-auto mb-6" />
              <p className="font-black uppercase italic text-sm tracking-widest">Awaiting Submission</p>
            </div>
          ) : (
            <div className={`p-10 rounded-[3rem] border-2 animate-in fade-in slide-in-from-bottom-4 duration-700 ${result.result === 'Malicious' ? 'bg-red-500/10 border-red-500' : 'bg-emerald-500/10 border-emerald-500'}`}>
              {result.result === 'Malicious' ? <AlertTriangle size={48} className="text-red-500 mb-6" /> : <CheckCircle2 size={48} className="text-emerald-500 mb-6" />}
              <h2 className="text-4xl font-black italic uppercase mb-2 leading-none">{result.result}</h2>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-8 leading-relaxed">{result.message}</p>
              <div className="p-4 bg-black/40 rounded-xl font-mono text-[9px] uppercase tracking-tighter text-zinc-400">
                Threat signature logged in global Shield database.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}