"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Building2, Accessibility, Loader2, Zap, 
  Shield, Cpu, Fingerprint, CheckCircle2, Lock 
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
  { id: "ind-1", tier: "Basic", price: 0, display: "Free", category: "individual", features: ["1 Device", "Standard Encryption", "Community Support"] },
  { id: "ind-2", tier: "Pro", price: 5, display: "£5", category: "individual", features: ["5 Devices", "Advanced VPN", "24/7 Support", "Ad-Blocker"] },
  { id: "ind-3", tier: "Ultra", price: 10, display: "£10", category: "individual", features: ["Unlimited Devices", "Quantum Guard", "Priority Node", "Dedicated IP"] },
  { id: "biz-1", tier: "Enterprise", price: 3000, display: "£3000", category: "business", features: ["Admin Console", "SSO Integration", "SLA Guarantee", "Audit Logs"] },
  { id: "acc-1", tier: "Universal", price: 500, display: "£500", category: "accessibility", features: ["Voice Command", "Screen Reader Opt", "Simplified UI", "Haptic Alerts"] },
];

const fader = {
  initial: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 1.02, filter: "blur(10px)" }
};

export default function SignupPage() {
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
  const [isLoginMode, setIsLoginMode] = useState(false); // Toggle between Login/Signup
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Hard lock for redirect
  const [userType, setUserType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [dogCode, setDogCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleAuthSuccess = async (email) => {
    setLoading(true);
    setError("");
    // If user is logging in, we skip payment/plan steps and go straight to verification
    if (isLoginMode) {
        generateCode();
        return;
    }

    if (selectedPlan?.price > 0 && userType === "individual") {
      try {
        const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planTier: selectedPlan.tier, email: email }),
        });
        if (!res.ok) throw new Error("Backend Protocol Error");
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setStep(4);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      generateCode();
    }
  };

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep(5);
    setLoading(false);
  };

  const handleFinalRedirect = () => {
    if (dogCode === generatedCode) {
      setLoading(true);
      setError("");
      setIsAuthenticated(true); // LOCK THE UI
      setStep(7);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setLoading(false);
      setError("CRITICAL_ERR: AUTH_KEY_MISMATCH");
    }
  };

  // IF AUTHENTICATED, DON'T RENDER THE FLOW AT ALL
  if (isAuthenticated && step !== 7) return <LoadingScreen />;

  return (
    <div className="relative flex items-center justify-center min-h-screen p-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full opacity-30 -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="s1" variants={fader} initial="initial" animate="animate" exit="exit" className="grid md:grid-cols-3 gap-6">
              {USER_TYPES.map((type) => (
                <motion.div 
                  key={type.id} 
                  whileHover={{ y: -8, backgroundColor: "rgba(39, 39, 42, 0.4)" }} 
                  onClick={() => { setUserType(type.id); setStep(2); }}
                  className="cursor-pointer bg-zinc-900/20 backdrop-blur-xl border border-white/10 p-12 rounded-[3.5rem] group text-center transition-all duration-300 shadow-2xl"
                >
                  <type.icon size={52} className="mx-auto mb-8 text-blue-500 group-hover:scale-110 transition-all" />
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{type.label}</h2>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">{type.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" variants={fader} initial="initial" animate="animate" exit="exit" className="flex flex-wrap justify-center gap-6">
              {PLANS.filter(p => p.category === userType).map((plan) => (
                <div key={plan.id} onClick={() => { setSelectedPlan(plan); setStep(3); }}
                  className="w-full max-w-[340px] flex flex-col bg-zinc-900/30 backdrop-blur-3xl border border-white/5 p-10 rounded-[3.5rem] hover:border-blue-500/50 transition-all duration-500 cursor-pointer group shadow-2xl relative overflow-hidden min-h-[550px]"
                >
                  <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-[0.3em] mb-4">{plan.tier}</h3>
                  <div className="text-7xl font-black italic mb-10 tracking-tighter">
                    {plan.display}
                    <span className="text-xs font-normal text-zinc-600 not-italic tracking-widest ml-2">/ ACCESS</span>
                  </div>
                  <div className="space-y-4 mb-10 flex-grow text-zinc-400 text-[13px]">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-4">
                        <CheckCircle2 size={16} className="text-blue-500 shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                  <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-14 bg-blue-600 group-hover:w-full transition-all duration-1000" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto w-full bg-zinc-950/80 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 shadow-2xl text-center">
               <h2 className="text-xl font-black italic uppercase mb-8 tracking-tighter">
                 {isLoginMode ? "Secure Login" : "Initialize Protocol"}
               </h2>
               
               <div className="flex justify-center mb-10">
                  <GoogleLogin 
                    onSuccess={() => handleAuthSuccess(formData.email || "vault_user@auth.com")} 
                    theme="filled_black" 
                    shape="pill"
                  />
               </div>

               <div className="flex items-center gap-4 mb-10 opacity-20 text-[10px] uppercase font-black">
                  <div className="h-[1px] flex-1 bg-white" /> OR <div className="h-[1px] flex-1 bg-white" />
               </div>

               <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleAuthSuccess(formData.email); }}>
                  <div className="relative">
                    <input 
                      type="email" required placeholder="SECURE_EMAIL" 
                      className="w-full bg-black/60 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500/50 transition-all font-mono text-xs pl-12" 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                  </div>
                  <div className="relative">
                    <input 
                      type="password" required placeholder="ACCESS_KEY" 
                      className="w-full bg-black/60 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500/50 transition-all font-mono text-xs pl-12" 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-black uppercase italic tracking-[0.3em] transition-all text-sm mt-4">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : (isLoginMode ? "Access Vault" : "Initiate Protocol")}
                  </button>
                  {error && <p className="text-red-500 text-center text-[10px] mt-4 uppercase font-bold">{error}</p>}
               </form>

               {/* LOGIN/SIGNUP TOGGLE */}
               <div className="mt-8 pt-6 border-t border-white/5">
                  <button 
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-blue-400 transition-colors"
                  >
                    {isLoginMode ? "New User? Create Account" : "Existing Member? Secure Login"}
                  </button>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto w-full">
              <div className="bg-[#080808] border border-blue-500/20 p-12 rounded-[4rem] shadow-2xl">
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                  <CheckoutForm onSuccess={generateCode} />
                </Elements>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto text-center">
               <div className="bg-zinc-950/90 backdrop-blur-3xl p-14 rounded-[4rem] border border-white/5 shadow-3xl">
                  <Cpu size={50} className="mx-auto mb-8 text-blue-500 animate-pulse" />
                  <h2 className="text-2xl font-black uppercase italic mb-8">Encryption Issued</h2>
                  <div className="bg-black/80 py-12 rounded-[2rem] border border-white/5 shadow-inner">
                    <span className="text-5xl font-mono text-blue-400 tracking-[0.4em] font-black">{generatedCode}</span>
                  </div>
                  <button onClick={() => setStep(6)} className="mt-12 w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-xs">Verify Biometrics</button>
               </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto text-center">
               <div className="bg-zinc-950/90 backdrop-blur-3xl p-14 rounded-[4rem] border border-white/5 shadow-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/30 shadow-[0_0_20px_blue] animate-scan" />
                  <div className="mb-10 relative inline-block group">
                    <Image src={dogImage} width={220} height={220} alt="K9" className="grayscale group-hover:grayscale-0 transition-all duration-1000" unoptimized />
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); handleFinalRedirect(); }}>
                    <input autoFocus maxLength={6} placeholder="000000" 
                      className="w-full bg-black/80 text-center text-6xl p-8 rounded-[2rem] border border-white/10 text-blue-500 font-mono outline-none focus:border-blue-500/50 mb-8 tracking-tighter" 
                      onChange={e => { setError(""); setDogCode(e.target.value); }} 
                    />
                    <button className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase italic tracking-widest text-white hover:bg-blue-500 transition-colors">
                      {loading ? <Loader2 className="animate-spin mx-auto" /> : "Grant Access"}
                    </button>
                    {error && <p className="mt-6 text-red-500 font-bold text-[9px] uppercase tracking-[0.3em]">{error}</p>}
                  </form>
               </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="s7" variants={fader} initial="initial" animate="animate" className="max-w-md mx-auto text-center">
               <div className="bg-zinc-950/90 backdrop-blur-3xl p-14 rounded-[4rem] border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                  <CheckCircle2 size={64} className="mx-auto mb-6 text-blue-500" />
                  <h2 className="text-3xl font-black uppercase italic mb-4 tracking-tighter text-white">Access Granted</h2>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-4">
                     <motion.div 
                        initial={{ width: "0%" }} 
                        animate={{ width: "100%" }} 
                        transition={{ duration: 1.2 }} 
                        className="h-full bg-blue-500" 
                     />
                  </div>
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Synchronizing Dashboard...</p>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020202]">
      <div className="relative mb-6">
        <Loader2 className="text-blue-500 animate-spin" size={60} />
        <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/50" size={20} />
      </div>
      <div className="text-zinc-700 font-mono text-[9px] uppercase tracking-[0.6em] animate-pulse">Establishing Secure Neural Link</div>
    </div>
  );
}
