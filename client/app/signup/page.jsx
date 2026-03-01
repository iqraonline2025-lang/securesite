"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Accessibility, Loader2, Cpu, CheckCircle2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Components & Assets
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
  { id: "ind-1", tier: "Basic", price: 0, display: "Free", category: "individual", features: ["1 Device"] },
  { id: "ind-2", tier: "Pro", price: 5, display: "£5", category: "individual", features: ["5 Devices"] },
  { id: "ind-3", tier: "Ultra", price: 10, display: "£10", category: "individual", features: ["Unlimited"] },
  { id: "biz-1", tier: "Enterprise", price: 3000, display: "£3000", category: "business", features: ["SSO Integration"] },
  { id: "acc-1", tier: "Universal", price: 500, display: "£500", category: "accessibility", features: ["Voice Command"] },
];

const fader = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export default function SignupPage() {
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

  // 1. Local Code Generator
  const generateLocalKey = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep(5); // Show "Code Issued" screen
    setLoading(false);
  };

  // 2. Step 3: Initial Form Submission
  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    // If Login or Free Plan, go straight to code generation
    if (isLoginMode || (selectedPlan && selectedPlan.price === 0)) {
      generateLocalKey();
      return;
    }

    // If Paid Plan, get Stripe Secret
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
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Payment system unreachable");
    } finally {
      setLoading(false);
    }
  };

  // 3. Step 6: Final Verification
  const handleFinalVerify = async () => {
    if (dogCode !== generatedCode) {
      setError("KEY_MISMATCH_ERROR");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/finalize-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          planTier: selectedPlan?.tier,
          isLogin: isLoginMode 
        }),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("vault_session_active", "true");
        setStep(7);
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Database sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-6xl">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: USER TYPE */}
          {step === 1 && (
            <motion.div key="s1" {...fader} className="grid md:grid-cols-3 gap-6">
              {USER_TYPES.map((type) => (
                <div key={type.id} onClick={() => { setUserType(type.id); setStep(2); }}
                  className="cursor-pointer bg-zinc-900/20 border border-white/10 p-12 rounded-[3rem] text-center hover:bg-zinc-800/40 transition-all">
                  <type.icon size={50} className="mx-auto mb-6 text-blue-500" />
                  <h2 className="text-2xl font-black italic uppercase italic tracking-tighter">{type.label}</h2>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono mt-2">{type.desc}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 2: PLANS */}
          {step === 2 && (
            <motion.div key="s2" {...fader} className="flex flex-wrap justify-center gap-6">
              {PLANS.filter(p => p.category === userType).map((plan) => (
                <div key={plan.id} onClick={() => { setSelectedPlan(plan); setStep(3); }}
                  className="w-[300px] bg-zinc-900/40 border border-white/5 p-10 rounded-[3rem] hover:border-blue-500 cursor-pointer transition-all">
                  <h3 className="text-blue-400 font-bold uppercase text-[10px] tracking-widest">{plan.tier}</h3>
                  <div className="text-5xl font-black italic my-6">{plan.display}</div>
                  <div className="space-y-3 mb-8">
                    {plan.features.map(f => <div key={f} className="flex items-center gap-2 text-xs text-zinc-400"><CheckCircle2 size={14} className="text-blue-500" /> {f}</div>)}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 3: AUTH FORM & TOGGLE */}
          {step === 3 && (
            <motion.div key="s3" {...fader} className="max-w-md mx-auto w-full bg-zinc-950 p-12 rounded-[3.5rem] border border-white/5 text-center">
               <h2 className="text-xl font-black italic uppercase mb-8">{isLoginMode ? "Secure Login" : "Initialize Protocol"}</h2>
               <form onSubmit={handleAuthSubmit}>
                 <input type="email" required placeholder="EMAIL" className="w-full bg-black border border-white/10 p-5 rounded-2xl mb-4 font-mono text-xs outline-none focus:border-blue-500" 
                  onChange={e => setFormData({email: e.target.value})} />
                 <button className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase italic text-sm tracking-widest">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "CONTINUE"}
                 </button>
               </form>
               <button onClick={() => setIsLoginMode(!isLoginMode)} className="mt-6 text-[10px] uppercase font-bold text-zinc-500 hover:text-white">
                  {isLoginMode ? "Need an Account? Signup" : "Already Registered? Login"}
               </button>
               {error && <p className="mt-4 text-red-500 text-[10px] font-bold uppercase">{error}</p>}
            </motion.div>
          )}

          {/* STEP 4: STRIPE CHECKOUT */}
          {step === 4 && clientSecret && (
            <motion.div key="s4" {...fader} className="max-w-md mx-auto w-full bg-zinc-950 p-10 rounded-[3rem] border border-blue-500/30">
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm onSuccess={generateLocalKey} />
              </Elements>
            </motion.div>
          )}

          {/* STEP 5: CODE SHOW */}
          {step === 5 && (
            <motion.div key="s5" {...fader} className="max-w-md mx-auto text-center bg-zinc-950 p-14 rounded-[4rem] border border-white/5">
                <Cpu size={50} className="mx-auto mb-8 text-blue-500 animate-pulse" />
                <h2 className="text-2xl font-black uppercase italic mb-8">Access Key Issued</h2>
                <div className="bg-black py-10 rounded-3xl border border-white/5 mb-8">
                  <span className="text-5xl font-mono text-blue-400 tracking-[0.2em] font-black">{generatedCode}</span>
                </div>
                <button onClick={() => setStep(6)} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs">Begin Verification</button>
            </motion.div>
          )}

          {/* STEP 6: DOG VERIFICATION */}
          {step === 6 && (
            <motion.div key="s6" {...fader} className="max-w-md mx-auto text-center bg-zinc-950 p-12 rounded-[4rem] border border-white/5">
                <Image src={dogImage} width={180} height={180} alt="Security K9" className="mx-auto mb-8 grayscale" />
                <h3 className="text-xs uppercase font-mono text-zinc-500 mb-6 tracking-widest">Confirm Access Key</h3>
                <input autoFocus maxLength={6} placeholder="000000" className="w-full bg-black text-center text-6xl p-6 rounded-3xl border border-white/10 text-blue-500 font-mono outline-none mb-6" 
                  onChange={e => setDogCode(e.target.value)} />
                <button onClick={handleFinalVerify} className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-blue-500">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Authorize Access"}
                </button>
                {error && <p className="mt-4 text-red-500 font-bold text-[10px] uppercase">{error}</p>}
            </motion.div>
          )}

          {/* STEP 7: REDIRECTING */}
          {step === 7 && (
            <motion.div key="s7" {...fader} className="max-w-md mx-auto text-center">
               <CheckCircle2 size={80} className="mx-auto mb-6 text-blue-500" />
               <h2 className="text-4xl font-black uppercase italic">Identity Verified</h2>
               <p className="text-zinc-500 font-mono text-[10px] uppercase mt-4 animate-pulse">Syncing environment...</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
