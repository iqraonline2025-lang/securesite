"use client";

import React, { useState, Suspense, useEffect } from "react";
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
    setStep(5); // Show the code issued screen
    setLoading(false);
  };

  const handleAuthSubmit = async (email) => {
    setLoading(true);
    setError("");
    setFormData({ email });

    // If Login OR Free Plan, go straight to code
    if (isLoginMode || (selectedPlan && selectedPlan.price === 0)) {
      startVerification();
      return;
    }

    // If Paid Plan, get Stripe Secret
    try {
      const res = await fetch(`${API_BASE}/api/auth/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planTier: selectedPlan.tier, 
          email: email 
        }),
      });

      const data = await res.json();
      if (res.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setStep(4); // Go to Stripe
      } else {
        throw new Error(data.message || "Stripe Init Failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalVerify = () => {
    if (dogCode === generatedCode) {
      setLoading(true);
      localStorage.setItem("vault_session_active", "true");
      setStep(7); // Success Screen
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      setError("AUTH_KEY_INVALID");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Select User Type */}
          {step === 1 && (
            <motion.div key="s1" variants={fader} initial="initial" animate="animate" exit="exit" className="grid md:grid-cols-3 gap-6">
              {USER_TYPES.map((type) => (
                <div key={type.id} onClick={() => { setUserType(type.id); setStep(2); }}
                  className="cursor-pointer bg-zinc-900/20 backdrop-blur-xl border border-white/10 p-12 rounded-[3.5rem] group text-center transition-all hover:bg-zinc-800/40">
                  <type.icon size={52} className="mx-auto mb-8 text-blue-500 group-hover:scale-110 transition-transform" />
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">{type.label}</h2>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-2">{type.desc}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 2: Select Plan */}
          {step === 2 && (
            <motion.div key="s2" variants={fader} initial="initial" animate="animate" exit="exit" className="flex flex-wrap justify-center gap-6">
              {PLANS.filter(p => p.category === userType).map((plan) => (
                <div key={plan.id} onClick={() => { setSelectedPlan(plan); setStep(3); }}
                  className="w-[320px] bg-zinc-900/40 border border-white/5 p-10 rounded-[3.5rem] hover:border-blue-500 transition-all cursor-pointer">
                  <h3 className="text-blue-400 font-bold uppercase text-[10px] tracking-widest">{plan.tier}</h3>
                  <div className="text-6xl font-black italic my-6 tracking-tighter">{plan.display}</div>
                  <div className="space-y-3 mb-8">
                    {plan.features.map(f => <div key={f} className="flex items-center gap-2 text-xs text-zinc-400"><CheckCircle2 size={14} className="text-blue-500" /> {f}</div>)}
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-600 w-1/4 group-hover:w-full transition-all duration-700" /></div>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 3: Email / Auth */}
          {step === 3 && (
            <motion.div key="s3" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto w-full bg-zinc-950/80 p-12 rounded-[3.5rem] border border-white/5 text-center">
               <h2 className="text-xl font-black italic uppercase mb-8">{isLoginMode ? "Secure Login" : "Initialize Protocol"}</h2>
               <div className="flex justify-center mb-8">
                 <GoogleLogin onSuccess={() => handleAuthSubmit("google_user@gmail.com")} onError={() => setError("Google Fail")} />
               </div>
               <form onSubmit={(e) => { e.preventDefault(); handleAuthSubmit(formData.email); }}>
                 <input type="email" required placeholder="EMAIL" className="w-full bg-black border border-white/10 p-5 rounded-2xl mb-4 font-mono text-xs outline-none focus:border-blue-500" onChange={e => setFormData({email: e.target.value})} />
                 <button className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase italic text-sm tracking-widest hover:bg-blue-500">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "CONTINUE"}
                 </button>
               </form>
               <button onClick={() => setIsLoginMode(!isLoginMode)} className="mt-6 text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors">
                  {isLoginMode ? "Need an Account?" : "Already Registered?"}
               </button>
               {error && <p className="mt-4 text-red-500 text-[9px] font-bold uppercase tracking-widest">{error}</p>}
            </motion.div>
          )}

          {/* STEP 4: Stripe */}
          {step === 4 && clientSecret && (
            <motion.div key="s4" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto w-full bg-zinc-950 p-10 rounded-[3.5rem] border border-blue-500/20">
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm onSuccess={startVerification} />
              </Elements>
            </motion.div>
          )}

          {/* STEP 5: Code Issued */}
          {step === 5 && (
            <motion.div key="s5" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto text-center bg-zinc-950 p-14 rounded-[4rem] border border-white/5">
                <Cpu size={50} className="mx-auto mb-8 text-blue-500 animate-pulse" />
                <h2 className="text-2xl font-black uppercase italic mb-8">Encryption Key</h2>
                <div className="bg-black py-10 rounded-3xl border border-white/5">
                  <span className="text-5xl font-mono text-blue-400 tracking-[0.3em] font-black">{generatedCode}</span>
                </div>
                <button onClick={() => setStep(6)} className="mt-10 w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs">Verify Identity</button>
            </motion.div>
          )}

          {/* STEP 6: K9 Verification */}
          {step === 6 && (
            <motion.div key="s6" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto text-center bg-zinc-950 p-12 rounded-[4rem] border border-white/5 relative overflow-hidden">
                <Image src={dogImage} width={200} height={200} alt="K9" className="mx-auto mb-8 grayscale" />
                <input autoFocus maxLength={6} placeholder="000000" className="w-full bg-black text-center text-6xl p-6 rounded-3xl border border-white/10 text-blue-500 font-mono outline-none mb-6" onChange={e => setDogCode(e.target.value)} />
                <button onClick={handleFinalVerify} className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase italic tracking-widest">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Authorize"}
                </button>
                {error && <p className="mt-4 text-red-500 font-bold text-[10px] uppercase">{error}</p>}
            </motion.div>
          )}

          {/* STEP 7: Success */}
          {step === 7 && (
            <motion.div key="s7" variants={fader} initial="initial" animate="animate" className="max-w-md mx-auto text-center bg-zinc-950 p-14 rounded-[4rem] border border-blue-500/30">
               <CheckCircle2 size={64} className="mx-auto mb-6 text-blue-500" />
               <h2 className="text-3xl font-black uppercase italic text-white">Access Granted</h2>
               <p className="text-zinc-500 font-mono text-[10px] uppercase mt-4 animate-pulse">Routing to Dashboard...</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020202]">
      <Loader2 className="text-blue-500 animate-spin" size={50} />
      <div className="text-zinc-700 font-mono text-[10px] uppercase tracking-[0.5em] mt-4">Syncing Neural Link...</div>
    </div>
  );
}
