"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Accessibility, Loader2, ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Key } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
// Ensure this path is correct in your public folder
import dogImage from "../public/dog-4.png"; 

/* ================= CONFIG ================= */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://securesite-2fow.onrender.com";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

/* ================= DATA ================= */
const USER_TYPES = [
  { id: "individual", label: "Individual", icon: User, desc: "Personal use & security" },
  { id: "business", label: "Business", icon: Building2, desc: "Team & Enterprise" },
  { id: "accessibility", label: "Accessibility", icon: Accessibility, desc: "Specialized tools" },
];

const PLANS = [
  { id: "free", tier: "Free", price: 0, display: "£0", category: "individual", features: ["Basic Access", "Standard Support"] },
  { id: "pro", tier: "Pro", price: 5, display: "£5", category: "individual", features: ["Advanced Tools", "Priority Support"] },
  { id: "premium", tier: "Premium", price: 7, display: "£7", category: "individual", features: ["Full Suite", "24/7 Concierge"] },
  { id: "business", tier: "Business", price: 0, display: "Custom", category: "business", features: ["SLA", "Bulk Seats"] },
  { id: "accessibility", tier: "Accessibility", price: 0, display: "Free", category: "accessibility", features: ["Screen Readers", "Voice Control"] },
];

export default function SignupPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <Suspense fallback={<LoadingScreen />}>
        <SignupFlow />
      </Suspense>
    </GoogleOAuthProvider>
  );
}

function SignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [dogCode, setDogCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const visiblePlans = PLANS.filter(p => p.category === userType);

  const goBack = () => {
    if (step === 5 || step === 6) return; // Prevent going back after payment/code gen
    setStep(prev => prev - 1);
    setError("");
  };

  /* ================= LOGIC HANDLERS ================= */

  const handleAuthSuccess = async (email, tier) => {
    if (selectedPlan.price > 0 && selectedPlan.category === "individual") {
      await initPayment(email, tier);
    } else {
      generateCode();
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, planTier: selectedPlan.tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await handleAuthSuccess(formData.email, selectedPlan.tier);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential, planTier: selectedPlan.tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFormData(prev => ({ ...prev, email: data.user.email }));
      await handleAuthSuccess(data.user.email, selectedPlan.tier);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const initPayment = async (email, tier) => {
    try {
      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier, email: email }),
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setStep(4);
    } catch (err) {
      setError("Payment system unavailable");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep(5);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (dogCode === generatedCode) {
      setLoading(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } else {
      setError("Verification code does not match.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -top-48 -left-48 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full -bottom-48 -right-48" />

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tight"
            >
              {step === 1 && "Choose Account Type"}
              {step === 2 && "Select Your Plan"}
              {step === 3 && "Create Your Account"}
              {step === 4 && "Secure Checkout"}
              {step === 5 && "Your Security Code"}
              {step === 6 && "Identity Verification"}
            </motion.h1>
            <p className="text-zinc-500 mt-2">Step {step} of 6</p>
        </div>

        {step > 1 && step < 5 && (
          <button onClick={goBack} className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Back
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: ACCOUNT TYPE */}
          {step === 1 && (
            <motion.div key="type" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="grid md:grid-cols-3 gap-6">
              {USER_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button key={type.id} onClick={() => { setUserType(type.id); setStep(2); }}
                    className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] hover:border-blue-500/50 hover:bg-zinc-800/40 transition-all duration-300 text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Icon size={32} className="text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{type.label}</h2>
                    <p className="text-sm text-zinc-500">{type.desc}</p>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* STEP 2: PLANS */}
          {step === 2 && (
            <motion.div key="plans" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid md:grid-cols-3 gap-6">
              {visiblePlans.map(plan => (
                <div key={plan.id} onClick={() => { setSelectedPlan(plan); setStep(3); }}
                  className="relative group bg-zinc-900/40 border border-white/5 p-8 rounded-[2rem] cursor-pointer hover:border-blue-500 transition-all">
                  {plan.tier === "Premium" && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">Most Secure</span>}
                  <h3 className="text-zinc-400 font-medium">{plan.tier}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold">{plan.display}</span>
                    {plan.price > 0 && <span className="text-zinc-500 text-sm">/mo</span>}
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                        <CheckCircle2 size={14} className="text-blue-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 3: AUTH */}
          {step === 3 && (
            <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto w-full bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem]">
               <div className="flex justify-center mb-6">
                 <GoogleLogin onSuccess={handleGoogle} onError={() => setError("Google Authentication Failed")} theme="filled_black" shape="pill" />
               </div>
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-zinc-600 text-xs uppercase tracking-widest">or email</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>
              <form onSubmit={handleSignup} className="space-y-4">
                <input required placeholder="Full Name" className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl focus:border-blue-500 outline-none transition" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <input required type="email" placeholder="Email Address" className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl focus:border-blue-500 outline-none transition" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <input required type="password" placeholder="Password" className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl focus:border-blue-500 outline-none transition" onChange={e => setFormData({ ...formData, password: e.target.value })} />
                {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold p-4 rounded-2xl transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : <>Continue <ShieldCheck size={18}/></>}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: CHECKOUT */}
          {step === 4 && clientSecret && (
            <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto w-full bg-white p-8 rounded-[2.5rem] text-black">
              <div className="flex items-center gap-2 mb-6 text-zinc-500 uppercase text-[10px] tracking-widest font-bold">
                <CreditCard size={14} /> Secure Payment
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat' } }}>
                <CheckoutForm onSuccess={generateCode} />
              </Elements>
            </motion.div>
          )}

          {/* STEP 5: SHOW CODE */}
          {step === 5 && (
            <motion.div key="code" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-zinc-900/40 border border-blue-500/30 p-12 rounded-[3rem] max-w-md mx-auto backdrop-blur-2xl">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Key size={40} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Secure Access Granted</h2>
              <p className="text-zinc-500 mb-8 text-sm">Memorize this code. You will need it in the next step to verify your hardware.</p>
              <div className="text-5xl font-mono font-black tracking-[0.5em] bg-black/60 border border-white/5 p-8 rounded-3xl text-blue-400 shadow-2xl">
                {generatedCode}
              </div>
              <button onClick={() => setStep(6)} className="mt-10 w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition">
                I have noted my code
              </button>
            </motion.div>
          )}

          {/* STEP 6: DOG VERIFY */}
          {step === 6 && (
            <motion.div key="verify" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center bg-zinc-900/40 border border-white/10 p-10 rounded-[3rem] max-w-md mx-auto">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
                <Image src={dogImage} alt="Verification Guard" width={128} height={128} className="relative z-10" />
              </div>
              <h2 className="text-xl font-bold mb-6">Enter Verification Code</h2>
              <form onSubmit={handleVerify} className="space-y-6">
                <input autoFocus maxLength={6} placeholder="000000"
                  className="w-full p-5 text-center bg-black/60 border border-white/10 rounded-2xl text-3xl font-mono tracking-[0.3em] focus:border-blue-500 outline-none"
                  onChange={(e) => setDogCode(e.target.value)} />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button disabled={loading} className="w-full bg-blue-600 text-white font-bold p-4 rounded-2xl hover:bg-blue-500 transition flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : "Verify & Finalize"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
      <Loader2 className="animate-spin text-blue-500" size={48} />
      <p className="text-zinc-500 animate-pulse text-sm tracking-widest uppercase">Initializing Security...</p>
    </div>
  );
}
