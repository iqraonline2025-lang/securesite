"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Zap, Building2, GraduationCap, 
  CheckCircle2, Loader2, Cpu, ArrowLeft
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PLANS = [
  { id: "free", tier: "Free", icon: <User size={20} />, price: "$0", desc: "Essential infrastructure for individual researchers." },
  { id: "premium", tier: "Premium", icon: <Zap size={20} />, price: "$9", desc: "Advanced AI-driven detection & neural processing." },
  { id: "business", tier: "Business", icon: <Building2 size={20} />, price: "$49", desc: "Enterprise-grade shield with priority bandwidth." },
  { id: "lab", tier: "Lab", icon: <GraduationCap size={20} />, price: "$25", desc: "Specialized toolset for academic environments." },
];

export default function SignupPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <Suspense fallback={
        <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-[10px] uppercase font-black tracking-widest text-zinc-700">Connecting to Network...</p>
        </div>
      }>
        <SignupContent />
      </Suspense>
    </GoogleOAuthProvider>
  );
}

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- 1. HOOKS (Top-level) ---
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId) {
      const found = PLANS.find(p => p.id === planId);
      if (found) setSelectedPlan(found);
    }
  }, [searchParams]);

  // FIXED: Hook is now top-level
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  // --- 2. LOGIC HANDLERS ---
  const initPayment = async (tier, email) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setClientSecret(data.clientSecret);
        setStep(3);
      }
    } catch (err) {
      alert("Billing Gateway Error");
    }
  };

  const handleGoogleAuth = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (isLogin || selectedPlan.id === "free") {
        localStorage.setItem("user", JSON.stringify(data.user));
        setStep(4);
      } else {
        await initPayment(selectedPlan.tier, data.user.email);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/login" : "/api/signup";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, planTier: selectedPlan.tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (isLogin || selectedPlan.id === "free") {
        localStorage.setItem("user", JSON.stringify(data.user));
        setStep(4);
      } else {
        await initPayment(selectedPlan.tier, formData.email);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background FX */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />

      {/* Global Back Button */}
      <Link href="/">
        <motion.button
          whileHover={{ x: -5 }}
          className="absolute top-10 left-10 z-50 flex items-center gap-3 px-5 py-3 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-all group"
        >
          <ArrowLeft size={16} className="text-zinc-500 group-hover:text-white" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white">Exit</span>
        </motion.button>
      </Link>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-6xl z-10">
            <div className="text-center mb-16">
              <h1 className="text-7xl font-black italic tracking-tighter uppercase mb-4">Select <span className="text-blue-500">Infrastructure</span></h1>
              <p className="text-zinc-500 tracking-[0.4em] text-[10px] uppercase font-bold">Encrypted Compute Nodes</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {PLANS.map((p) => (
                <motion.div 
                  key={p.id}
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedPlan(p)}
                  className={`p-8 rounded-[2.5rem] border cursor-pointer transition-all duration-500 ${selectedPlan.id === p.id ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-white/5 bg-zinc-900/40 hover:border-white/10'}`}
                >
                  <div className="flex justify-between mb-8">
                    <div className={`p-4 rounded-2xl ${selectedPlan.id === p.id ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{p.icon}</div>
                    <span className="text-2xl font-black italic tracking-tighter">{p.price}</span>
                  </div>
                  <h3 className="text-xl font-black italic uppercase mb-2">{p.tier}</h3>
                  <p className="text-zinc-500 text-xs mb-8 min-h-[40px] leading-relaxed tracking-tight">{p.desc}</p>
                  <button onClick={() => setStep(2)} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${selectedPlan.id === p.id ? 'bg-blue-600' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>Initialize Node</button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md z-10">
            <div className="bg-zinc-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl relative">
              <h2 className="text-4xl font-black italic text-center uppercase mb-10 tracking-tighter">{isLogin ? "Welcome" : "Authorize"}</h2>
              
              <div className="flex flex-col gap-6">
                <div className="flex justify-center w-full overflow-hidden rounded-2xl border border-white/10 p-1 bg-black/20">
                  <GoogleLogin 
                    onSuccess={handleGoogleAuth} 
                    onError={() => alert("Google Auth Failed")}
                    theme="filled_black"
                    shape="pill"
                    width="320px"
                  />
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-[9px] uppercase font-bold text-zinc-600"><span className="bg-[#0c0c0c] px-4">Manual Interface</span></div>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  {!isLogin && <input type="text" placeholder="Identity Name" required className="w-full p-4 bg-black/40 rounded-2xl border border-white/5 outline-none focus:border-blue-500/50 text-sm transition-all" onChange={(e) => setFormData({...formData, name: e.target.value})} />}
                  <input type="email" placeholder="Email Address" required className="w-full p-4 bg-black/40 rounded-2xl border border-white/5 outline-none focus:border-blue-500/50 text-sm transition-all" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  <input type="password" placeholder="Passkey" required className="w-full p-4 bg-black/40 rounded-2xl border border-white/5 outline-none focus:border-blue-500/50 text-sm transition-all" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex justify-center mt-4 shadow-lg shadow-blue-600/20">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Validate credentials"}
                  </button>
                </form>

                <button onClick={() => setIsLogin(!isLogin)} className="text-[9px] font-black uppercase text-zinc-500 hover:text-blue-500 text-center tracking-[0.2em]">
                  {isLogin ? "Need new credentials?" : "Existing operative login"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md z-10">
            <div className="bg-zinc-900/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-600/20 rounded-xl text-blue-500"><Cpu size={24} /></div>
                <div>
                  <h3 className="font-black italic uppercase text-xl">Billing Portal</h3>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest">{selectedPlan.tier} Edition Node</p>
                </div>
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm 
                  amount={selectedPlan.price.replace('$', '')} 
                  onSuccess={(updatedUser) => {
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setStep(4);
                  }} 
                />
              </Elements>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center z-10">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.15)] mx-auto mb-10">
              <CheckCircle2 className="text-emerald-500" size={48} />
            </div>
            <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Access Granted</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12">Protocol: <span className="text-emerald-500">{selectedPlan.tier} Activated</span></p>
            <div className="flex items-center justify-center gap-3 text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">
              <Loader2 size={12} className="animate-spin" /> Synchronizing Dashboard...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}