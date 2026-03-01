"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Building2, Accessibility, Loader2, ArrowLeft, 
  Zap, Key, Mail, Lock, Shield 
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import dogImage from "../public/dog-4.png";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://securesite-2fow.onrender.com";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const USER_TYPES = [
  { id: "individual", label: "Individual", icon: User, desc: "Personal Security" },
  { id: "business", label: "Business", icon: Building2, desc: "Enterprise Shield" },
  { id: "accessibility", label: "Accessibility", icon: Accessibility, desc: "Specialized Access" },
];

const PLANS = [
  { id: "free", tier: "Free", price: 0, display: "£0", category: "individual" },
  { id: "pro", tier: "Pro", price: 5, display: "£5", category: "individual" },
  { id: "premium", tier: "Premium", price: 7, display: "£7", category: "individual" },
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
  const [formData, setFormData] = useState({ email: "", password: "" });

  const visiblePlans = PLANS.filter(p => p.category === userType || userType === 'individual');

  /* ================= FLOW LOGIC ================= */
  
  // 1. After Email/Google Auth
  const handleAuthSuccess = async (email) => {
    if (selectedPlan.price > 0) {
      await initPayment(email);
    } else {
      generateCode(); // Skip checkout for free plans
    }
  };

  // 2. Initialize Stripe
  const initPayment = async (email) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: selectedPlan.tier, email }),
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setStep(4); // GO TO CHECKOUT
    } catch (err) {
      setError("Payment Gateway Offline");
    } finally {
      setLoading(false);
    }
  };

  // 3. After Checkout Success
  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep(5); // SHOW CODE
  };

  // 4. Final Verification
  const handleVerify = (e) => {
    e.preventDefault();
    if (dogCode === generatedCode) {
      router.push("/dashboard"); // DIRECT REDIRECT (No success screen)
    } else {
      setError("INVALID ENCRYPTION KEY");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-4xl relative z-10">
        {step > 1 && step < 5 && (
          <button onClick={() => setStep(step - 1)} className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-xs uppercase font-bold tracking-widest">
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
                  className="relative p-10 rounded-[2rem] border border-white/10 bg-zinc-900/40 hover:border-blue-500 transition-all cursor-pointer group overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-4">{plan.tier}</h3>
                  <div className="text-4xl font-black mb-6">{plan.display}<span className="text-sm text-zinc-600">/mo</span></div>
                  <div className="py-3 w-full bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-bold text-center">Select Tier</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 3: AUTH */}
          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto w-full bg-zinc-900/60 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem]">
              <h2 className="text-2xl font-black uppercase text-center mb-8 italic">Identity Sync</h2>
              <div className="flex justify-center mb-8"><GoogleLogin onSuccess={(c) => handleAuthSuccess(c.email)} theme="filled_black" /></div>
              <form onSubmit={(e) => { e.preventDefault(); handleAuthSuccess(formData.email); }} className="space-y-4">
                <input required type="email" placeholder="Email" className="w-full p-4 rounded-2xl bg-black border border-white/5 focus:border-blue-500 outline-none" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <input required type="password" placeholder="Password" className="w-full p-4 rounded-2xl bg-black border border-white/5 focus:border-blue-500 outline-none" onChange={e => setFormData({ ...formData, password: e.target.value })} />
                <button className="w-full bg-blue-600 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-blue-500 transition shadow-lg shadow-blue-600/20">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Continue to Payment"}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: CHECKOUT (Now before code) */}
          {step === 4 && (
            <motion.div key="4" className="max-w-md mx-auto w-full bg-[#111] border border-white/10 p-10 rounded-[2.5rem]">
              <h2 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <Shield className="text-blue-500" size={20} /> Secure Checkout
              </h2>
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm onSuccess={generateCode} />
              </Elements>
            </motion.div>
          )}

          {/* STEP 5: SHOW CODE */}
          {step === 5 && (
            <motion.div key="5" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-zinc-900/80 border border-blue-500/30 p-12 rounded-[3rem] max-w-md mx-auto backdrop-blur-3xl">
              <Key size={48} className="text-blue-400 mx-auto mb-6" />
              <h2 className="text-2xl font-black uppercase mb-2">Encryption Key</h2>
              <p className="text-zinc-500 mb-8 text-xs uppercase tracking-widest">Memorize this for the final gate</p>
              <div className="text-5xl font-mono font-black tracking-[0.3em] bg-black p-8 rounded-3xl text-blue-400 border border-white/5 shadow-2xl">
                {generatedCode}
              </div>
              <button onClick={() => setStep(6)} className="mt-10 w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition uppercase tracking-widest">
                Initiate Biometrics
              </button>
            </motion.div>
          )}

          {/* STEP 6: BIOMETRIC CHALLENGE */}
          {step === 6 && (
            <motion.div key="6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto w-full">
              <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="bg-white/5 px-6 py-3 border-b border-white/5 text-[10px] font-mono text-zinc-500 uppercase flex justify-between">
                   <span>Sentry Mode: Active</span>
                   <span>K9_UNIT</span>
                </div>
                <div className="p-10 text-center">
                  <div className="relative mb-8 bg-black/40 rounded-3xl p-6 border border-white/5 overflow-hidden">
                    <motion.div initial={{ top: "-10%" }} animate={{ top: "110%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_blue] z-20" />
                    <Image src={dogImage} width={180} height={180} alt="K9" className="mx-auto grayscale" unoptimized />
                  </div>
                  <form onSubmit={handleVerify} className="space-y-6">
                    <input autoFocus maxLength={6} placeholder="000000" className="w-full p-5 text-center bg-black border border-white/10 rounded-2xl text-3xl font-mono tracking-[0.3em] text-blue-400 focus:border-blue-500 outline-none transition-all"
                      onChange={e => setDogCode(e.target.value)} />
                    <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-500 transition uppercase tracking-widest">Authorize Access</button>
                    {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
                  </form>
                </div>
              </div>
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
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );
}
