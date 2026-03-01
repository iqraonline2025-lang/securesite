"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CheckCircle2, Mail, Lock, Loader2, Cpu } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import dogImage from "../public/dog-4.png";

const API_BASE = "https://securesite-10.onrender.com";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PLANS = [
  { id: "p1", tier: "Basic", price: 0, display: "Free", features: ["1 Vault", "Standard Enc."] },
  { id: "p2", tier: "Pro", price: 5, display: "£5", features: ["5 Vaults", "Quantum Guard", "Priority Support"] },
  { id: "p3", tier: "Ultra", price: 10, display: "£10", features: ["Unlimited", "Satellite Sync", "Biometrics"] },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1:Plans, 3:Auth, 4:Stripe, 5:Key, 6:Dog, 7:Redirect
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [dogCode, setDogCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  // TRANSITION: Show the local code
  const showVerificationKey = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep(5);
    setLoading(false);
  };

  const handleAuthSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");

    if (isLoginMode || selectedPlan?.price === 0) {
      showVerificationKey();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: selectedPlan.tier, email: formData.email }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setStep(4);
      } else { setError(data.message); }
    } catch { setError("Network Error"); }
    finally { setLoading(false); }
  };

  const handleFinalVerify = async () => {
    if (dogCode !== generatedCode) { setError("INVALID_KEY"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/finalize-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, planTier: selectedPlan?.tier, isLogin: isLoginMode }),
      });
      if (res.ok) {
        setStep(7);
        localStorage.setItem("vault_session_active", "true");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else { 
        const d = await res.json(); 
        setError(d.message); 
      }
    } catch { setError("Sync failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: PLANS */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
            {PLANS.map(plan => (
              <div key={plan.id} onClick={() => { setSelectedPlan(plan); setStep(3); }}
                className="p-8 rounded-[2.5rem] border border-white/10 bg-zinc-900/20 hover:border-blue-500 cursor-pointer transition-all group">
                <h3 className="text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">{plan.tier}</h3>
                <div className="text-5xl font-black italic mb-6">{plan.display}</div>
                <ul className="space-y-3">
                  {plan.features.map(f => <li key={f} className="text-[11px] text-zinc-400 flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500"/> {f}</li>)}
                </ul>
              </div>
            ))}
          </motion.div>
        )}

        {/* STEP 3: AUTH (EMAIL/PASS + GOOGLE) */}
        {step === 3 && (
          <motion.div key="s3" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-zinc-950 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
            <h2 className="text-2xl font-black italic uppercase text-center mb-8">{isLoginMode ? "Login" : "Sign Up"}</h2>
            <div className="flex justify-center mb-6"><GoogleLogin onSuccess={showVerificationKey} theme="filled_black" shape="pill" /></div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-zinc-500" size={18} />
                <input type="email" required placeholder="EMAIL" className="w-full bg-black border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 font-mono text-xs"
                  onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-zinc-500" size={18} />
                <input type="password" required placeholder="PASSWORD" className="w-full bg-black border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 font-mono text-xs"
                  onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <button className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase italic hover:bg-blue-500 transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "CONTINUE"}
              </button>
            </form>
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="w-full mt-6 text-[10px] uppercase font-bold text-zinc-500">{isLoginMode ? "Need account?" : "Have account?"}</button>
            {error && <p className="mt-4 text-red-500 text-center text-[10px] font-bold uppercase">{error}</p>}
          </motion.div>
        )}

        {/* STEP 4: CHECKOUT */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md bg-zinc-950 p-10 rounded-[3rem] border border-blue-500/20">
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
              <CheckoutForm onSuccess={showVerificationKey} />
            </Elements>
          </motion.div>
        )}

        {/* STEP 5: CODE DISPLAY */}
        {step === 5 && (
          <motion.div key="s5" initial={{ y: 20 }} animate={{ y: 0 }} className="text-center bg-zinc-950 p-16 rounded-[4rem] border border-white/5 max-w-md w-full">
            <Cpu size={60} className="mx-auto text-blue-500 mb-8 animate-pulse" />
            <h2 className="text-2xl font-black uppercase italic mb-4">Your Access Key</h2>
            <div className="bg-black p-8 rounded-3xl border border-white/10 text-5xl font-mono text-blue-400 tracking-widest mb-8">{generatedCode}</div>
            <button onClick={() => setStep(6)} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase italic">I Have Saved the Key</button>
          </motion.div>
        )}

        {/* STEP 6: DOG VERIFICATION */}
        {step === 6 && (
          <motion.div key="s6" className="text-center bg-zinc-950 p-16 rounded-[4rem] border border-white/5 max-w-md w-full">
            <Image src={dogImage} width={200} height={200} alt="K9" className="mx-auto mb-8 grayscale" />
            <h3 className="text-[10px] uppercase font-bold text-zinc-500 mb-4">Input Encryption Key</h3>
            <input autoFocus maxLength={6} placeholder="000000" className="w-full bg-black text-center text-5xl p-6 rounded-3xl border border-white/10 text-blue-500 font-mono outline-none mb-6"
              onChange={e => setDogCode(e.target.value)} />
            <button onClick={handleFinalVerify} className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase italic tracking-widest">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify Identity"}
            </button>
            {error && <p className="mt-4 text-red-500 font-bold text-[10px] uppercase">{error}</p>}
          </motion.div>
        )}

        {/* STEP 7: SUCCESS */}
        {step === 7 && (
          <motion.div key="s7" className="text-center">
            <CheckCircle2 size={100} className="text-blue-500 mx-auto mb-6" />
            <h2 className="text-4xl font-black italic uppercase">Access Granted</h2>
            <p className="text-zinc-500 font-mono text-xs uppercase mt-2">Routing to Dashboard...</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
