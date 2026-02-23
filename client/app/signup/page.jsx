"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Zap, Building2, GraduationCap,
  CheckCircle2, Loader2, ArrowLeft, Mail, Lock
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import dogImage from "../public/dog-4.png";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://securesite-2fow.onrender.com";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const PLANS = [
  { id: "free", tier: "Free", icon: <User className="text-blue-400" size={24} />, price: "$0", desc: "Individual researchers", color: "from-blue-500/20" },
  { id: "premium", tier: "Premium", icon: <Zap className="text-yellow-400" size={24} />, price: "$9", desc: "AI-driven detection", color: "from-yellow-500/20" },
  { id: "business", tier: "Business", icon: <Building2 className="text-purple-400" size={24} />, price: "$49", desc: "Enterprise shield", color: "from-purple-500/20" },
  { id: "lab", tier: "Lab", icon: <GraduationCap className="text-emerald-400" size={24} />, price: "$25", desc: "Academic toolkit", color: "from-emerald-500/20" },
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
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", verificationCode: "" });
  const [dogCode, setDogCode] = useState("");
  const [dogError, setDogError] = useState("");

  // Pre-select plan from URL
  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId) {
      const found = PLANS.find(p => p.id === planId);
      if (found) setSelectedPlan(found);
    }
  }, [searchParams]);

  // Auto redirect after success
  useEffect(() => {
    if (step === 6) {
      const t = setTimeout(() => router.push("/dashboard"), 3000);
      return () => clearTimeout(t);
    }
  }, [step, router]);

  // Initialize payment
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
      setStep(3); // go to payment form
    } catch (err) {
      alert(err.message || "Payment initialization failed");
    }
  };

  // Google login
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
        setStep(6);
      } else if (["business", "lab", "premium"].includes(selectedPlan.id)) {
        await initPayment(selectedPlan.tier, data.user.email);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Email/password signup/login
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
        setStep(6);
      } else if (["business", "lab", "premium"].includes(selectedPlan.id)) {
        await initPayment(selectedPlan.tier, formData.email);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // After payment success → generate code
  const handlePaymentSuccess = (user) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData(prev => ({ ...prev, verificationCode: code }));
    localStorage.setItem("user", JSON.stringify(user));
    setStep(4); // show code after payment
  };

  // Handle dog verification submission
  const handleDogCodeSubmit = (e) => {
    e.preventDefault();
    if (dogCode === formData.verificationCode) {
      setStep(6); // success → dashboard
    } else {
      setDogError("Invalid verification code");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />

      <Link href="/">
        <button className="absolute top-8 left-8 flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 px-4 py-2 rounded-full transition-all text-sm font-medium backdrop-blur-md z-50">
          <ArrowLeft size={16} /> Exit
        </button>
      </Link>

      <AnimatePresence mode="wait">

        {/* STEP 1 — Plan Select */}
        {step === 1 && (
          <motion.div key="1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-5xl w-full">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                CHOOSE YOUR PLAN
              </h1>
              <p className="text-zinc-400 text-lg">Select the infrastructure that powers your research.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {PLANS.map(p => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -5 }}
                  onClick={() => { setSelectedPlan(p); setStep(2); }}
                  className={`relative p-8 rounded-[2rem] border transition-all duration-300 cursor-pointer group overflow-hidden
                    ${selectedPlan.id === p.id ? "border-blue-500 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)]" : "border-white/5 bg-zinc-900/40 hover:bg-zinc-800/60"}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative z-10">
                    <div className="p-3 bg-black/40 rounded-2xl w-fit mb-6 border border-white/5">{p.icon}</div>
                    <h3 className="text-xl font-bold mb-1">{p.tier}</h3>
                    <p className="text-zinc-500 text-sm leading-snug mb-6">{p.desc}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black">{p.price}</span>
                      <span className="text-xs text-zinc-500 font-medium">/mo</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2 — Auth */}
        {step === 2 && (
          <motion.div key="2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
            <AuthCard
              isLogin={isLogin}
              setIsLogin={setIsLogin}
              formData={formData}
              setFormData={setFormData}
              handleAuthSubmit={handleAuthSubmit}
              handleGoogleAuth={handleGoogleAuth}
              selectedPlan={selectedPlan}
              loading={loading}
            />
          </motion.div>
        )}

        {/* STEP 3 — Payment */}
        {step === 3 && clientSecret && (
          <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
            <div className="bg-zinc-900/40 border border-white/10 p-8 rounded-[2.5rem]">
              <h2 className="text-2xl font-bold mb-6 text-center italic">Secure Checkout</h2>
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm
                  amount={selectedPlan.price.replace("$","")}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          </motion.div>
        )}

        {/* STEP 4 — Payment Success + Show Code */}
        {step === 4 && (
          <motion.div key="code-display" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md w-full">
            <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
            <p className="text-zinc-400 mb-6">Use this code to proceed:</p>
            <div className="text-4xl font-mono bg-black/30 p-4 rounded-2xl border border-white/10 text-blue-400">{formData.verificationCode}</div>
            <button onClick={() => setStep(5)} className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl">Continue to Verification</button>
          </motion.div>
        )}

        {/* STEP 5 — Dog Verification Card */}
        {step === 5 && (
          <DogVerification
            formData={formData}
            dogCode={dogCode}
            setDogCode={setDogCode}
            dogError={dogError}
            handleDogCodeSubmit={handleDogCodeSubmit}
          />
        )}

        {/* STEP 6 — Final Success */}
        {step === 6 && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
              <CheckCircle2 size={100} className="text-emerald-500 mx-auto relative z-10 animate-bounce" />
            </div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Access Granted</h2>
            <p className="text-zinc-500 font-medium">Redirecting to your dashboard...</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// Auth card component
function AuthCard({ isLogin, setIsLogin, formData, setFormData, handleAuthSubmit, handleGoogleAuth, selectedPlan, loading }) {
  return (
    <div className="bg-zinc-900/40 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 italic uppercase tracking-tighter">
          {isLogin ? "Welcome Back" : "Initialize Account"}
        </h2>
        <p className="text-zinc-500 text-sm italic">Plan: {selectedPlan.tier}</p>
      </div>

      <div className="flex justify-center mb-8">
        <GoogleLogin onSuccess={handleGoogleAuth} theme="filled_black" shape="pill" />
      </div>

      <div className="relative flex items-center my-6">
        <div className="flex-grow border-t border-white/5"></div>
        <span className="mx-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">Or continue with</span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      <form onSubmit={handleAuthSubmit} className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-zinc-500" size={18} />
            <input
              required
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/40 border border-white/5 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-600"
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-3.5 text-zinc-500" size={18} />
          <input
            required
            type="email"
            placeholder="Email Address"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/40 border border-white/5 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-600"
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-zinc-500" size={18} />
          <input
            required
            type="password"
            placeholder="Password"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/40 border border-white/5 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-600"
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              {isLogin ? "Sign In" : "Create Account"}
              <Zap size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="mt-6 text-xs font-bold text-zinc-500 hover:text-white transition-colors w-full uppercase tracking-widest"
      >
        {isLogin ? "Need an account? Sign Up" : "Already registered? Log In"}
      </button>
    </div>
  );
}

// Dog verification component
function DogVerification({ formData, dogCode, setDogCode, dogError, handleDogCodeSubmit }) {
  return (
    <motion.div key="dog" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
      <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="bg-white/5 px-
