"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Zap,
  Building2,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Cpu,
  Activity,
  Lock,
  Mail,
  CreditCard
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import dogImage from "../public/dog-4.png";

/* ================= CONFIG ================= */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://securesite-2fow.onrender.com";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const MAIN_PLANS = [
  {
    id: "individual",
    tier: "Consumer IoT",
    icon: <User className="text-blue-400" size={28} />,
    desc: "Personal scam & hardware protection for home devices."
  },
  {
    id: "business",
    tier: "Industrial IoT",
    icon: <Building2 className="text-purple-400" size={28} />,
    desc: "Enterprise-grade security for robotic systems and fleet management."
  },
  {
    id: "accessibility",
    tier: "Assistive Tech",
    icon: <Zap className="text-emerald-400" size={28} />,
    desc: "Specialized monitoring for accessibility and disability hardware."
  }
];

/* ================= MAIN COMPONENT ================= */

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
  const [planView, setPlanView] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    verificationCode: ""
  });
  const [dogCode, setDogCode] = useState("");
  const [dogError, setDogError] = useState("");

  // Handle URL Params
  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId) {
      setPlanView(planId);
      setStep(7);
    }
  }, [searchParams]);

  // Success Redirect
  useEffect(() => {
    if (step === 6) {
      const t = setTimeout(() => router.push("/dashboard"), 3000);
      return () => clearTimeout(t);
    }
  }, [step, router]);

  /* ================= LOGIC HANDLERS ================= */

  const initPayment = async (tier, email) => {
    try {
      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier, email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setClientSecret(data.clientSecret);
      setStep(3);
    } catch (err) {
      alert(err.message || "Hardware link failed. Check connection.");
    }
  };

  const handleGoogleAuth = async (cred) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cred.credential,
          planTier: selectedPlan.tier
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (selectedPlan.id === "free") {
        localStorage.setItem("user", JSON.stringify(data.user));
        setStep(6);
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
        body: JSON.stringify({ ...formData, planTier: selectedPlan.tier })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (selectedPlan.id === "free") {
        localStorage.setItem("user", JSON.stringify(data.user));
        setStep(6);
      } else {
        await initPayment(selectedPlan.tier, formData.email);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (user) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData((prev) => ({ ...prev, verificationCode: code }));
    localStorage.setItem("user", JSON.stringify(user));
    setStep(4);
  };

  const handleDogCodeSubmit = (e) => {
    e.preventDefault();
    if (dogCode === formData.verificationCode) {
      setStep(6);
    } else {
      setDogError("Invalid hardware synchronization code");
    }
  };

  /* ================= UI RENDER ================= */

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: CATEGORIES */}
        {step === 1 && (
          <motion.div
            key="1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-5xl w-full z-10"
          >
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
                SYSTEM <span className="text-blue-500">PROVISIONING</span>
              </h1>
              <p className="text-zinc-500 font-mono tracking-widest uppercase text-sm">Select your operational infrastructure</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {MAIN_PLANS.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPlanView(p.id);
                    setStep(7);
                  }}
                  className="p-8 rounded-[2rem] bg-zinc-900/40 backdrop-blur-xl border border-white/5 cursor-pointer hover:bg-zinc-800/40 transition-all group"
                >
                  <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                    {p.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{p.tier}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 7: SPECIFIC PLANS */}
        {step === 7 && (
          <motion.div key="7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl w-full z-10">
            <button
              onClick={() => setStep(1)}
              className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-mono text-sm"
            >
              <ArrowLeft size={16} /> BACK_TO_ROOT
            </button>

            <div className="grid md:grid-cols-3 gap-6">
              {planView === "individual" ? (
                [
                  { id: "free", tier: "Core", price: "$0", info: "Standard security node" },
                  { id: "pro", tier: "Advanced", price: "$5", info: "Encrypted data tunnels" },
                  { id: "premium", tier: "Elite", price: "$7", info: "Full robotic autonomy" }
                ].map((plan) => (
                  <div key={plan.id} className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/10 flex flex-col">
                    <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-1">{plan.info}</h3>
                    <h2 className="text-3xl font-bold">{plan.tier}</h2>
                    <p className="text-4xl font-black my-8">
                      {plan.price}
                      <span className="text-sm font-normal text-zinc-600"> /mo</span>
                    </p>
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setStep(2);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                    >
                      Initialize Link
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-12 rounded-[3rem] bg-zinc-900/50 border border-white/10 text-center">
                  <h2 className="text-4xl font-bold mb-4">{planView === "business" ? "Enterprise" : "Accessibility"} Node</h2>
                  <p className="text-zinc-400 mb-8 max-w-lg mx-auto leading-relaxed">
                    Full-scale hardware deployment including physical sensor arrays and priority network bandwidth for mission-critical operations.
                  </p>
                  <button
                    onClick={() => {
                      const p =
                        planView === "business"
                          ? { id: "business", tier: "Business", price: "$3000" }
                          : { id: "accessibility", tier: "Accessibility", price: "$500" };
                      setSelectedPlan(p);
                      setStep(2);
                    }}
                    className="bg-white text-black px-12 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                  >
                    Deploy Infrastructure
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 2: AUTH */}
        {step === 2 && (
          <motion.div key="2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full max-w-md">
            <AuthCard
              {...{ isLogin, setIsLogin, formData, setFormData, handleAuthSubmit, handleGoogleAuth, selectedPlan, loading }}
            />
          </motion.div>
        )}

        {/* STEP 3: CHECKOUT */}
        {step === 3 && clientSecret && (
          <motion.div key="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-10 w-full max-w-lg bg-zinc-900 p-8 rounded-[2.5rem] border border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <CreditCard className="text-blue-500" />
              <h2 className="text-2xl font-bold">Secure Checkout</h2>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm amount={selectedPlan.price.replace("$", "")} onSuccess={handlePaymentSuccess} />
            </Elements>
          </motion.div>
        )}

        {/* STEP 4: CODE DISPLAY */}
        {step === 4 && (
          <motion.div key="4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center z-10">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Payment Authorized</h2>
            <p className="text-zinc-500 mb-8 font-mono uppercase text-xs tracking-widest">Hardware Sync Token Generated</p>
            <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl mb-8">
              <p className="text-5xl font-black tracking-[0.5em] text-blue-500 font-mono pl-4">
                {formData.verificationCode}
              </p>
            </div>
            <button
              onClick={() => setStep(5)}
              className="bg-zinc-100 text-black px-10 py-4 rounded-2xl font-bold hover:bg-white transition-all w-full"
            >
              Confirm Synchronization
            </button>
          </motion.div>
        )}

        {/* STEP 5: DOG VERIFICATION */}
        {step === 5 && (
          <motion.div key="5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-10">
            <DogVerification {...{ formData, dogCode, setDogCode, dogError, handleDogCodeSubmit }} />
          </motion.div>
        )}

        {/* STEP 6: FINAL SUCCESS */}
        {step === 6 && (
          <motion.div key="6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center z-10">
            <div className="relative inline-block mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] border-2 border-dashed border-blue-500/30 rounded-full"
              />
              <CheckCircle2 size={100} className="text-emerald-500 relative" />
            </div>
            <h2 className="text-5xl font-black mb-4">ACCESS GRANTED</h2>
            <div className="flex items-center justify-center gap-2 text-zinc-500 font-mono">
              <Loader2 size={16} className="animate-spin" />
              <span>REDIRECTING_TO_DASHBOARD...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function AuthCard({ isLogin, setIsLogin, formData, setFormData, handleAuthSubmit, handleGoogleAuth, selectedPlan, loading }) {
  return (
    <div className="bg-zinc-900 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-1">{isLogin ? "System Login" : "Operator Registration"}</h2>
        <p className="text-zinc-500 text-xs font-mono tracking-tighter">NODE_TIER: {selectedPlan?.tier?.toUpperCase()}</p>
      </div>

      <div className="flex justify-center mb-8">
        <GoogleLogin onSuccess={handleGoogleAuth} theme="dark" shape="pill" />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-[1px] bg-white/5 flex-grow" />
        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Secure Credentials</span>
        <div className="h-[1px] bg-white/5 flex-grow" />
      </div>

      <form onSubmit={handleAuthSubmit} className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input
              required placeholder="Full Name"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black border border-white/10 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input
            required type="email" placeholder="Operator Email"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black border border-white/10 focus:border-blue-500 outline-none transition-all"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input
            required type="password" placeholder="System Password"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black border border-white/10 focus:border-blue-500 outline-none transition-all"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" /> : isLogin ? "Authorize Access" : "Initialize Account"}
        </button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)} className="mt-8 text-xs text-zinc-500 w-full hover:text-blue-400 transition-colors uppercase tracking-[0.2em] font-mono">
        {isLogin ? "Generate New Profile" : "Existing Operator?"}
      </button>
    </div>
  );
}

function DogVerification({ dogCode, setDogCode, dogError, handleDogCodeSubmit }) {
  return (
    <div className="max-w-md w-full bg-zinc-900 p-10 rounded-[3rem] border border-white/10 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 to-transparent" />
      </div>
      <div className="relative mb-8 inline-block">
        <Image src={dogImage} width={180} height={180} alt="dog security" className="rounded-full border-4 border-blue-500/20" />
        <div className="absolute bottom-2 right-2 bg-emerald-500 p-2 rounded-full border-4 border-zinc-900">
           <ShieldCheck size={20} />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">Hardware Sync</h2>
      <p className="text-zinc-500 text-sm mb-8 font-mono">Confirm 6-digit synchronization code</p>
      
      <form onSubmit={handleDogCodeSubmit} className="space-y-6">
        <input
          value={dogCode}
          onChange={(e) => setDogCode(e.target.value)}
          maxLength={6}
          placeholder="000000"
          className="w-full p-5 text-center bg-black border border-white/10 rounded-2xl text-3xl font-mono tracking-[0.5em] focus:border-blue-500 outline-none transition-all"
        />
        {dogError && <p className="text-red-500 text-xs font-mono animate-pulse">{dogError}</p>}
        <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all uppercase tracking-widest">
          Finalize Link
        </button>
      </form>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="relative w-24 h-24 mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-t-2 border-blue-500 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className="text-blue-500 animate-pulse" />
        </div>
      </div>
      <p className="text-zinc-600 font-mono text-xs tracking-[0.3em] uppercase">Booting_System...</p>
    </div>
  );
}
