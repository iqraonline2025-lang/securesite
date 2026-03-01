"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Building2, Accessibility, Loader2, 
  Cpu, CheckCircle2 
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// --- EXTERNAL ---
import CheckoutForm from "../components/CheckoutForm"; 
import dogImage from "../public/dog-4.png";

const API_BASE = "https://securesite-10.onrender.com";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const USER_TYPES = [
  { id: "individual", label: "Individual", icon: User, desc: "Personal Security" },
  { id: "business", label: "Business", icon: Building2, desc: "Enterprise Shield" },
  { id: "accessibility", label: "Accessibility", icon: Accessibility, desc: "Specialized Access" },
];

const PLANS = [
  { id: "ind-1", tier: "Basic", price: 0, display: "Free", category: "individual", features: ["1 Device", "Standard Encryption"] },
  { id: "ind-2", tier: "Pro", price: 5, display: "£5", category: "individual", features: ["5 Devices", "Advanced VPN"] },
  { id: "ind-3", tier: "Ultra", price: 10, display: "£10", category: "individual", features: ["Unlimited Devices", "Quantum Guard"] },
  { id: "biz-1", tier: "Enterprise", price: 3000, display: "£3000", category: "business", features: ["Admin Console", "SSO Integration"] },
  { id: "acc-1", tier: "Universal", price: 500, display: "£500", category: "accessibility", features: ["Voice Command", "Simplified UI"] },
];

const fader = {
  initial: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 1.02, filter: "blur(10px)" }
};

export default function SignupPage() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem("vault_session_active") === "true") {
      router.replace("/dashboard");
    }
  }, [router]);

  if (!isMounted) return <LoadingScreen />;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-screen bg-[#020202] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
        <Suspense fallback={<LoadingScreen />}>
          <SignupFlow />
        </Suspense>
      </div>
    </GoogleOAuthProvider>
  );
}

function SignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [userType, setUserType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [dogCode, setDogCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "" });

  const startVerification = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep(5);
    setLoading(false);
  };

  const handleAuthSubmit = async (emailInput) => {
    setLoading(true);
    setError("");
    const email = emailInput || formData.email;

    // LOGIN or FREE PLAN: Skip Stripe
    if (isLoginMode || (selectedPlan && selectedPlan.price === 0)) {
      startVerification();
      return;
    }

    // PAID SIGNUP: Initialize Stripe
    try {
      const res = await fetch(`${API_BASE}/api/auth/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: selectedPlan.tier, email }),
      });

      if (!res.ok) throw new Error(`Server Error: ${res.status}`);
      
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setStep(4);
    } catch (err) {
      setError("Connection Refused: Check Backend Status");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalVerify = () => {
    if (dogCode === generatedCode) {
      setLoading(true);
      localStorage.setItem("vault_session_active", "true");
      setStep(7);
      setTimeout(() => router.push("/dashboard"), 1800);
    } else {
      setError("CRITICAL_ERR: AUTH_KEY_MISMATCH");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="s1" variants={fader} initial="initial" animate="animate" exit="exit" className="grid md:grid-cols-3 gap-6">
              {USER_TYPES.map((type) => (
                <div key={type.id} onClick={() => { setUserType(type.id); setStep(2); }}
                  className="cursor-pointer bg-zinc-900/20 backdrop-blur-xl border border-white/10 p-12 rounded-[3.5rem] group text-center transition-all hover:bg-zinc-800/40">
                  <type.icon size={52} className="mx-auto mb-8 text-blue-500 group-hover:scale-110 transition-all" />
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{type.label}</h2>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">{type.desc}</p>
                </div>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" variants={fader} initial="initial" animate="animate" exit="exit" className="flex flex-wrap justify-center gap-6">
              {PLANS.filter(p => p.category === userType).map((plan) => (
                <div key={plan.id} onClick={() => { setSelectedPlan(plan); setStep(3); }}
                  className="w-full max-w-[340px] flex flex-col bg-zinc-900/30 backdrop-blur-3xl border border-white/5 p-10 rounded-[3.5rem] hover:border-blue-500/50 transition-all cursor-pointer group">
                  <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-[0.3em] mb-4">{plan.tier}</h3>
                  <div className="text-7xl font-black italic mb-10 tracking-tighter">{plan.display}</div>
                  <div className="space-y-4 mb-10 flex-grow text-zinc-400 text-[13px]">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-4"><CheckCircle2 size={16} className="text-blue-500 shrink-0" /> {f}</div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto w-full bg-zinc-950/80 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 text-center">
               <h2 className="text-xl font-black italic uppercase mb-8 tracking-tighter">
                 {isLoginMode ? "Secure Login" : "Initialize Protocol"}
               </h2>
               <div className="flex justify-center mb-10">
                  <GoogleLogin onSuccess={() => handleAuthSubmit("google_user@gmail.com")} onError={() => setError("OAuth Error")} />
               </div>
               <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleAuthSubmit(); }}>
                  <input type="email" required placeholder="EMAIL" className="w-full bg-black/60 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500/50 transition-all font-mono text-xs" onChange={e => setFormData({email: e.target.value})} />
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-black uppercase italic tracking-[0.3em] transition-all text-sm mt-4">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "CONTINUE"}
                  </button>
                  {error && <p className="text-red-500 text-center text-[10px] mt-4 uppercase font-bold">{error}</p>}
               </form>
               <button onClick={() => setIsLoginMode(!isLoginMode)} className="mt-8 text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-blue-400 transition-colors">
                  {isLoginMode ? "Switch to Signup" : "Already have access? Login"}
               </button>
            </motion.div>
          )}

          {step === 4 && clientSecret && (
            <motion.div key="s4" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto w-full bg-[#080808] border border-blue-500/20 p-12 rounded-[4rem]">
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                  <CheckoutForm onSuccess={startVerification} />
                </Elements>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto text-center bg-zinc-950/90 backdrop-blur-3xl p-14 rounded-[4rem] border border-white/5 shadow-3xl">
                <Cpu size={50} className="mx-auto mb-8 text-blue-500 animate-pulse" />
                <h2 className="text-2xl font-black uppercase italic mb-8">Encryption Issued</h2>
                <div className="bg-black/80 py-12 rounded-[2rem] border border-white/5 shadow-inner">
                  <span className="text-5xl font-mono text-blue-400 tracking-[0.4em] font-black">{generatedCode}</span>
                </div>
                <button onClick={() => setStep(6)} className="mt-12 w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-xs">Verify Access</button>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto text-center bg-zinc-950/90 backdrop-blur-3xl p-14 rounded-[4rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/30 animate-scan" />
                <Image src={dogImage} width={220} height={220} alt="K9" className="mx-auto mb-10 grayscale opacity-80" unoptimized />
                <input autoFocus maxLength={6} placeholder="000000" className="w-full bg-black/80 text-center text-6xl p-8 rounded-[2rem] border border-white/10 text-blue-500 font-mono outline-none mb-8" onChange={e => setDogCode(e.target.value)} />
                <button onClick={handleFinalVerify} className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase italic tracking-widest transition-all">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Grant Access"}
                </button>
                {error && <p className="mt-6 text-red-500 font-bold text-[9px] uppercase tracking-[0.3em]">{error}</p>}
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="s7" variants={fader} initial="initial" animate="animate" className="max-w-md mx-auto text-center bg-zinc-950/90 backdrop-blur-3xl p-14 rounded-[4rem] border border-blue-500/30 shadow-2xl">
               <CheckCircle2 size={64} className="mx-auto mb-6 text-blue-500" />
               <h2 className="text-3xl font-black uppercase italic mb-4 tracking-tighter text-white">Access Granted</h2>
               <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Synchronizing Dashboard...</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan { animation: scan 4s linear infinite; }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020202]">
      <Loader2 className="text-blue-500 animate-spin" size={60} />
      <div className="text-zinc-700 font-mono text-[9px] uppercase tracking-[0.6em] mt-4">Establishing Secure Neural Link</div>
    </div>
  );
}
