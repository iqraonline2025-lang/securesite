"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Building2, Accessibility, Loader2, ArrowLeft, 
  CheckCircle2, Zap, ShieldCheck, Key, Mail, Lock 
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import dogImage from "../public/dog-4.png";

/* ================= CONFIG ================= */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://securesite-2fow.onrender.com";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const USER_TYPES = [
  { id: "individual", label: "Individual", icon: User, desc: "Personal Security" },
  { id: "business", label: "Business", icon: Building2, desc: "Enterprise Shield" },
  { id: "accessibility", label: "Accessibility", icon: Accessibility, desc: "Specialized Access" },
];

const PLANS = [
  { id: "free", tier: "Free", price: 0, display: "£0", category: "individual", color: "from-blue-500/10" },
  { id: "pro", tier: "Pro", price: 5, display: "£5", category: "individual", color: "from-purple-500/10" },
  { id: "premium", tier: "Premium", price: 7, display: "£7", category: "individual", color: "from-yellow-500/10" },
  { id: "business", tier: "Business", price: 0, display: "Custom", category: "business", color: "from-emerald-500/10" },
  { id: "accessibility", tier: "Accessibility", price: 0, display: "Free", category: "accessibility", color: "from-zinc-500/10" },
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

  /* ================= AUTH LOGIC ================= */
  const handleAuthSuccess = async (email) => {
    if (selectedPlan.price > 0 && selectedPlan.category === "individual") {
      await initPayment(email);
    } else {
      generateCode();
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, planTier: selectedPlan.tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await handleAuthSuccess(formData.email);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogle = async (cred) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: cred.credential, planTier: selectedPlan.tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFormData(prev => ({ ...prev, email: data.user.email }));
      await handleAuthSuccess(data.user.email);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const initPayment = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: selectedPlan.tier, email }),
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setStep(4); // Move to Checkout
    } catch (err) {
      setError("Payment system offline");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep(5); // Show Code
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (dogCode === generatedCode) {
      setStep(7); // Dashboard redirect step
      setTimeout(() => router.push("/dashboard"), 2500);
    } else {
      setError("INVALID ENCRYPTION KEY");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background FX */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-4xl relative z-10">
        {step > 1 && step < 5 && (
          <button onClick={() => setStep(step - 1)} className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold">
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: TYPE */}
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-6">
              {USER_TYPES.map(type => (
                <div key={type.id} onClick={() => { setUserType(type.id); setStep(2); }}
                  className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] cursor-pointer hover:border-blue-500/50 hover:bg-zinc-800/40 transition-all text-center group">
                  <type.icon size={40} className="mx-auto mb-6 text-blue-400 group-hover:scale-110 transition-transform" />
                  <h2 className="text-xl font-bold mb-2 uppercase tracking-tight">{type.label}</h2>
                  <p className="text-zinc-500 text-sm">{type.desc}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 2: PLANS */}
          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid md:grid-cols-3 gap-6">
              {visiblePlans.map(plan => (
                <div key={plan.id} onClick={() => { setSelectedPlan(plan); setStep(3); }}
                  className={`relative p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 hover:border-blue-500 transition-all cursor-pointer overflow-hidden group`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <h3 className="text-zinc-400 font-bold uppercase text-xs tracking-widest mb-4">{plan.tier}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black">{plan.display}</span>
                    <span className="text-zinc-500 text-sm">/mo</span>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 text-xs text-center font-bold">Select Plan</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 3: AUTH */}
          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto w-full bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem]">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Initialize Access</h2>
                <p className="text-zinc-500 text-xs mt-1">Tier: {selectedPlan.tier}</p>
              </div>
              <div className="flex justify-center mb-8"><GoogleLogin onSuccess={handleGoogle} theme="filled_black" shape="pill" /></div>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="relative"><Mail className="absolute left-4 top-4 text-zinc-600" size={18}/><input required type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black border border-white/5 focus:border-blue-500 outline-none transition" onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                <div className="relative"><Lock className="absolute left-4 top-4 text-zinc-600" size={18}/><input required type="password" placeholder="Secure Password" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black border border-white/5 focus:border-blue-500 outline-none transition" onChange={e => setFormData({ ...formData, password: e.target.value })} /></div>
                <button className="w-full bg-blue-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition shadow-lg shadow-blue-600/20">
                  {loading ? <Loader2 className="animate-spin" /> : <>Continue <Zap size={16} /></>}
                </button>
                {error && <p className="text-red-500 text-center text-xs font-bold uppercase mt-2">{error}</p>}
              </form>
            </motion.div>
          )}

          {/* STEP 4: CHECKOUT */}
          {step === 4 && (
            <motion.div key="4" className="max-w-md mx-auto w-full bg-white p-8 rounded-[2.5rem] text-black">
              <h2 className="text-xl font-bold mb-6 text-center">Secure Payment</h2>
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat' } }}>
                <CheckoutForm onSuccess={generateCode} />
              </Elements>
            </motion.div>
          )}

          {/* STEP 5: SHOW CODE */}
          {step === 5 && (
            <motion.div key="5" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-zinc-900/60 border border-blue-500/30 p-12 rounded-[3rem] max-w-md mx-auto backdrop-blur-3xl">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><Key size={40} className="text-blue-400" /></div>
              <h2 className="text-2xl font-bold mb-2 uppercase tracking-tighter">Code Generated</h2>
              <p className="text-zinc-500 mb-8 text-sm leading-relaxed">System has issued a one-time encryption key. Memorize it for the biometric guard.</p>
              <div className="text-5xl font-mono font-black tracking-[0.4em] bg-black p-8 rounded-3xl text-blue-400 border border-white/5 shadow-2xl">
                {generatedCode}
              </div>
              <button onClick={() => setStep(6)} className="mt-10 w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition uppercase tracking-widest">
                Initiate Verification
              </button>
            </motion.div>
          )}

          {/* STEP 6: DOG VERIFY (ROBOTIC UI) */}
          {step === 6 && (
            <motion.div key="6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto w-full">
              <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
                <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Link: Active</div>
                  <span>Unit: K9_Sentry</span>
                </div>
                <div className="p-8 text-center">
                  <div className="relative group mb-8 bg-black/40 rounded-3xl border border-white/5 p-6 overflow-hidden">
                    <motion.div initial={{ top: "-10%" }} animate={{ top: "110%" }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 w-full h-[2px] bg-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,1)] z-20" />
                    <Image src={dogImage} width={200} height={200} alt="K9" className="mx-auto grayscale group-hover:grayscale-0 transition-all duration-700" unoptimized />
                  </div>
                  <h3 className="text-xl font-bold mb-2 uppercase italic tracking-tighter">Biometric Challenge</h3>
                  <p className="text-zinc-500 text-xs mb-8 uppercase tracking-widest">Enter the 6-digit key assigned to your session</p>
                  <form onSubmit={handleVerify} className="space-y-6">
                    <input autoFocus maxLength={6} placeholder="000000" className="w-full p-5 text-center bg-black border border-white/10 rounded-2xl text-3xl font-mono tracking-[0.3em] text-blue-400 focus:border-blue-500 outline-none transition-all"
                      onChange={e => setDogCode(e.target.value)} />
                    {error && <p className="text-red-500 text-[10px] font-black uppercase">{error}</p>}
                    <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-500 transition shadow-lg shadow-blue-500/20 uppercase tracking-widest">Authorize</button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 7: REDIRECT SUCCESS */}
          {step === 7 && (
            <motion.div key="7" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                <CheckCircle2 size={128} className="text-emerald-500 relative z-10 animate-bounce" />
              </div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Access Granted</h2>
              <p className="text-zinc-500 font-bold tracking-[0.2em] uppercase text-xs animate-pulse">Syncing Secure Environment...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <span className="text-zinc-600 font-mono text-xs uppercase tracking-[0.3em]">Loading Secure Layer</span>
      </div>
    </div>
  );
}
