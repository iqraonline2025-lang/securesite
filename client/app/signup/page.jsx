"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Zap, Building2, GraduationCap,
  Loader2, ArrowLeft, Mail, Lock, ShieldCheck
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import dogImage from "../public/dog-4.png";

/* ================= API & STRIPE ================= */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://securesite-2fow.onrender.com";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

/* ================= Plans ================= */
const PLANS = [
  { id: "free", tier: "Free", icon: <User size={22} />, price: "$0", desc: "Individual researchers", border: "hover:border-blue-500/50" },
  { id: "premium", tier: "Premium", icon: <Zap size={22} />, price: "$9", desc: "AI-driven detection", border: "hover:border-yellow-500/50" },
  { id: "business", tier: "Business", icon: <Building2 size={22} />, price: "$49", desc: "Enterprise shield", border: "hover:border-purple-500/50" },
  { id: "lab", tier: "Lab", icon: <GraduationCap size={22} />, price: "$25", desc: "Academic toolkit", border: "hover:border-emerald-500/50" },
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
  const searchParams = useSearchParams();

  /* ALL ORIGINAL LOGIC STATE PRESERVED */
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [dogCode, setDogCode] = useState("");
  const [dogError, setDogError] = useState("");

  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId) {
      const found = PLANS.find(p => p.id === planId);
      if (found) setSelectedPlan(found);
    }
  }, [searchParams]);

  const initPayment = async (tier, email) => {
    try {
      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setClientSecret(data.clientSecret);
      setStep(3); 
    } catch (err) {
      alert(err.message || "Payment failed");
    }
  };

  const handleGoogleAuth = async (cred) => {
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

      if (selectedPlan.id === "free") {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else if (["business", "lab"].includes(selectedPlan.id)) {
        setStep(3); 
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
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, planTier: selectedPlan.tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setFormData(prev => ({ ...prev, email: data.user.email }));

      if (selectedPlan.id === "free") {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else if (["business", "lab"].includes(selectedPlan.id)) {
        setStep(3); 
      } else {
        await initPayment(selectedPlan.tier, data.user.email);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDogCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: dogCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid code");

      localStorage.setItem("user", JSON.stringify(data.user || { email: formData.email }));
      router.push("/dashboard");
    } catch (err) {
      setDogError("Invalid verification code");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Visual background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navigation */}
      <div className="fixed top-8 left-8 z-50">
        <Link href="/">
          <button className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 px-4 py-2 rounded-full transition-all text-sm font-medium backdrop-blur-md">
            <ArrowLeft size={16} /> Exit
          </button>
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-6xl w-full text-center">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-12 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              CHOOSE YOUR PLAN
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map(p => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  onClick={() => { setSelectedPlan(p); setStep(2); }}
                  className={`relative p-8 rounded-3xl border cursor-pointer transition-all duration-300 group ${
                    selectedPlan.id === p.id 
                    ? "border-blue-500 bg-blue-500/5 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]" 
                    : `border-white/5 bg-zinc-900/20 ${p.border}`
                  }`}
                >
                  <div className="inline-flex p-3 rounded-2xl bg-zinc-800/50 mb-6 group-hover:scale-110 transition-transform">
                    {p.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{p.tier}</h3>
                  <p className="text-zinc-500 text-sm mb-6 leading-relaxed">{p.desc}</p>
                  <div className="mt-auto pt-6 border-t border-white/5">
                    <span className="text-3xl font-black tracking-tight">{p.price}</span>
                    <span className="text-zinc-500 text-xs ml-1">/mo</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="auth" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="max-w-md w-full">
            <div className="bg-zinc-900/40 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl">
              <div className="text-center mb-8">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500 mb-2">Tier: {selectedPlan.tier}</div>
                <h2 className="text-3xl font-bold tracking-tight">{isLogin ? "Welcome Back" : "Create Account"}</h2>
              </div>

              <div className="flex justify-center mb-8">
                <GoogleLogin onSuccess={handleGoogleAuth} theme="filled_black" shape="pill" width="100%" />
              </div>

              <div className="relative flex items-center mb-8">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="mx-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Or continue with email</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input required placeholder="Full Name" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-white/5 focus:border-blue-500/50 outline-none transition-all" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                )}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input required type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-white/5 focus:border-blue-500/50 outline-none transition-all" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input required type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-white/5 focus:border-blue-500/50 outline-none transition-all" onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>

                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl text-white font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center">
                  {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
                </button>
              </form>

              <button onClick={() => setIsLogin(!isLogin)} className="mt-6 text-xs text-zinc-500 hover:text-zinc-300 w-full transition-colors font-medium underline underline-offset-4">
                {isLogin ? "Need an account? Sign Up" : "Already registered? Log In"}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && ["business", "lab"].includes(selectedPlan.id) && (
          <DogVerification 
            formData={formData} 
            dogCode={dogCode} 
            setDogCode={setDogCode} 
            dogError={dogError} 
            handleDogCodeSubmit={handleDogCodeSubmit} 
          />
        )}

        {step === 3 && selectedPlan.id === "premium" && clientSecret && (
          <motion.div key="payment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
            <div className="bg-zinc-900/40 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
              <div className="text-center mb-8">
                <ShieldCheck className="mx-auto text-blue-500 mb-4" size={40} />
                <h2 className="text-2xl font-bold">Secure Checkout</h2>
                <p className="text-zinc-500 text-sm mt-1">Tier: {selectedPlan.tier} Plan</p>
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm 
                  amount={selectedPlan.price.replace("$", "")} 
                  onSuccess={user => { localStorage.setItem("user", JSON.stringify(user)); router.push("/dashboard"); }} 
                />
              </Elements>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DogVerification({ formData, dogCode, setDogCode, dogError, handleDogCodeSubmit }) {
  return (
    <motion.div key="dog" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
      <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        
        <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 mb-8">
          <Image src={dogImage} width={180} height={180} alt="robotic unit" className="mx-auto drop-shadow-2xl" unoptimized />
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold tracking-tight mb-2">Security Verification</h3>
          <p className="text-zinc-500 text-sm leading-relaxed px-4">
            Enter the 6-digit key sent to <br/>
            <span className="text-zinc-200 font-mono text-xs">{formData.email}</span>
          </p>
        </div>

        <form onSubmit={handleDogCodeSubmit} className="space-y-6">
          <input
            value={dogCode}
            onChange={e => setDogCode(e.target.value)}
            maxLength={6}
            placeholder="000000"
            className="w-full p-6 rounded-2xl bg-black border border-white/10 text-center font-mono text-4xl tracking-[0.4em] text-blue-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
          {dogError && <p className="text-red-500 text-center text-xs font-bold">{dogError}</p>}
          <button className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-2xl transition-all shadow-xl">
            VERIFY IDENTITY
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="relative">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <div className="absolute inset-0 blur-xl bg-blue-500/20 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
