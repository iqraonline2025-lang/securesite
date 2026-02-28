"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Building2, ShieldCheck, Loader2, 
  ArrowLeft, Mail, Lock, CreditCard, ChevronRight
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import dogImage from "../public/dog-4.png";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://securesite-2fow.onrender.com";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

/* ================= Plan Data from Image ================= */
const MAIN_CATEGORIES = [
  { 
    id: "individual", 
    tier: "Individual Plans", 
    icon: <User size={24} />, 
    price: "From £0/mo", 
    desc: "Personal security for individuals.",
    disabled: false,
    subPlans: [
      { id: "free", name: "Free Plan", price: "£0", features: "Basic scam alerts, tips, limited dashboard" },
      { id: "pro", name: "Pro Plan", price: "£5", features: "Priority alerts, faster notifications, ad-free" },
      { id: "premium", name: "Premium Plan", price: "£7", features: "Advanced detection, analytics, scam history" }
    ]
  },
  { 
    id: "business", 
    tier: "Business Plan", 
    icon: <Building2 size={24} />, 
    price: "£3,000 - £6,000/mo", 
    desc: "Robotic dogs & enterprise suite.",
    disabled: false,
    features: "Includes robotic dogs, maintenance, patrol routes, and monitoring"
  },
  { 
    id: "accessibility", 
    tier: "Accessibility & Disability", 
    icon: <ShieldCheck size={24} />, 
    price: "£500 - £1,000", 
    desc: "Social-impact partnership model.",
    disabled: true 
  },
];

export default function SignupPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <Suspense fallback={<LoadingScreen />}>
        <SignupContent />
      </Suspense>
    </GoogleOAuthProvider>
  );
}

function SignupContent() {
  const router = useRouter();
  const [step, setStep] = useState(1); 
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [dogCode, setDogCode] = useState("");
  const [dogError, setDogError] = useState("");

  /* Step 1 Logic: Category & Tier Selection */
  const handleCategoryClick = (cat) => {
    if (cat.disabled) return;
    setSelectedCategory(cat);
    if (cat.id === "business") {
        setSelectedTier({ name: "Business Plan", price: "3000" });
        setStep(2);
    }
  };

  const handleTierClick = (tier) => {
    setSelectedTier(tier);
    setStep(2);
  };

  /* Step 2 Logic: Auth -> Leads to Step 3 */
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/login" : "/api/signup";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, planTier: selectedTier.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setFormData(prev => ({ ...prev, email: data.user.email }));

      if (selectedTier.price === "£0" || selectedTier.price === "0") {
        setStep(4); // Skip payment for Free tier
      } else {
        await initPayment(selectedTier.name, data.user.email);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initPayment = async (tier, email) => {
    try {
      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier, email }),
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setStep(3); 
    } catch (err) {
      alert("Payment Error: " + err.message);
    }
  };

  /* Step 4 Logic: Verification -> Dashboard */
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: dogCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Invalid Code");

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setDogError("Verification Failed. Please check the code.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Back/Exit Button */}
      <button 
        onClick={() => step > 1 ? setStep(step === 2 && selectedCategory?.id === "individual" && selectedTier ? 1 : step - 1) : router.push('/')} 
        className="fixed top-8 left-8 z-50 flex items-center gap-2 bg-zinc-900 border border-white/10 px-4 py-2 rounded-full text-sm hover:bg-zinc-800 transition-all"
      >
        <ArrowLeft size={16} /> {step === 1 ? "Exit" : "Back"}
      </button>

      <AnimatePresence mode="wait">
        {/* STEP 1: PLAN CATEGORIES */}
        {step === 1 && !selectedTier && (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-6xl w-full text-center">
            <h1 className="text-5xl font-black mb-12 tracking-tighter">SELECT YOUR PATH</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MAIN_CATEGORIES.map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => handleCategoryClick(cat)}
                  className={`p-10 rounded-[2.5rem] border text-left transition-all relative overflow-hidden ${
                    cat.disabled ? "opacity-40 cursor-not-allowed border-white/5" : "cursor-pointer border-white/10 bg-zinc-900/30 hover:border-blue-500/50 hover:bg-zinc-900/50 group"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                    {cat.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{cat.tier}</h3>
                  <p className="text-zinc-500 text-sm mb-8 leading-relaxed">{cat.desc}</p>
                  <div className="text-2xl font-black">{cat.price}</div>
                  
                  {/* Individual Sub-Menu Overlay */}
                  {selectedCategory?.id === "individual" && cat.id === "individual" && (
                    <div className="absolute inset-0 bg-zinc-950 p-6 flex flex-col gap-3 z-10 animate-in fade-in zoom-in duration-300">
                        <p className="text-xs font-bold uppercase text-blue-500 mb-2">Choose Tier</p>
                        {cat.subPlans.map(tp => (
                            <button key={tp.id} onClick={(e) => {e.stopPropagation(); handleTierClick(tp)}} className="w-full text-left p-4 rounded-xl bg-zinc-900 border border-white/5 hover:border-blue-500 transition-all">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold">{tp.name}</span>
                                    <span className="text-blue-400 font-bold">{tp.price}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500">{tp.features}</p>
                            </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: IDENTITY (Signup/Login) */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full">
            <div className="bg-zinc-900/80 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-2xl">
              <div className="text-center mb-8">
                <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">{selectedTier?.name} Selected</span>
                <h2 className="text-3xl font-bold mt-2">{isLogin ? "Welcome Back" : "Create Identity"}</h2>
              </div>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLogin && (
                    <input required placeholder="Full Name" className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 focus:border-blue-500 outline-none transition-all" onChange={e => setFormData({...formData, name: e.target.value})} />
                )}
                <input required type="email" placeholder="Email Address" className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 focus:border-blue-500 outline-none transition-all" onChange={e => setFormData({...formData, email: e.target.value})} />
                <input required type="password" placeholder="Password" className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 focus:border-blue-500 outline-none transition-all" onChange={e => setFormData({...formData, password: e.target.value})} />
                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "Continue to Security"}
                </button>
              </form>
              <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-xs text-zinc-500 hover:text-white transition-colors">
                {isLogin ? "New user? Create account" : "Already have an account? Log in"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: CHECKOUT */}
        {step === 3 && clientSecret && (
          <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full">
            <div className="bg-zinc-900/80 border border-white/10 p-10 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-8 text-blue-400">
                    <CreditCard size={24} />
                    <h2 className="text-2xl font-bold">Secure Checkout</h2>
                </div>
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                    <CheckoutForm 
                        amount={selectedTier.price.replace("£", "")} 
                        onSuccess={() => setStep(4)} 
                    />
                </Elements>
            </div>
          </motion.div>
        )}

        {/* STEP 4: VERIFICATION CODE */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
            <div className="bg-zinc-950 border border-white/10 rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                <div className="mb-8 p-6 bg-zinc-900 rounded-3xl inline-block border border-white/5">
                    <Image src={dogImage} width={140} height={140} alt="Verification" unoptimized />
                </div>
                <h3 className="text-2xl font-bold mb-2">Security Override</h3>
                <p className="text-zinc-500 text-sm mb-8 px-4">Enter the 6-digit encryption key sent to {formData.email}</p>
                <form onSubmit={handleVerifyCode} className="space-y-6">
                    <input 
                        required 
                        maxLength={6} 
                        placeholder="000000"
                        className="w-full p-6 rounded-2xl bg-black border border-white/10 text-center font-mono text-4xl tracking-[0.4em] text-blue-500 focus:border-blue-500 outline-none transition-all"
                        onChange={e => setDogCode(e.target.value)}
                    />
                    {dogError && <p className="text-red-500 text-xs font-bold">{dogError}</p>}
                    <button className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all uppercase tracking-widest text-sm">
                        Access Dashboard
                    </button>
                </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );
}
