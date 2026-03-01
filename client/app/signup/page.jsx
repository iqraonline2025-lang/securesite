"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Building2, Accessibility, Loader2, Zap, 
  Shield, Cpu, Fingerprint, CheckCircle2, LayoutDashboard, Settings, Activity
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// --- COMPONENTS ---
// Ensure these paths match your actual project structure
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
  { id: "ind-1", tier: "Basic", price: 0, display: "Free", category: "individual", features: ["1 Device", "Standard Encryption"] },
  { id: "ind-2", tier: "Pro", price: 5, display: "£5", category: "individual", features: ["5 Devices", "Advanced VPN", "24/7 Support"] },
  { id: "ind-3", tier: "Ultra", price: 10, display: "£10", category: "individual", features: ["Unlimited Devices", "Quantum Guard"] },
  { id: "biz-1", tier: "Enterprise", price: 49, display: "£49", category: "business", features: ["Admin Console", "SSO Integration"] },
  { id: "acc-1", tier: "Universal", price: 2, display: "£2", category: "accessibility", features: ["Voice Command", "Screen Reader"] },
];

const fader = {
  initial: { opacity: 0, y: 10, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(8px)" }
};

export default function SignupPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-screen bg-[#020202] text-white selection:bg-blue-500/30">
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
    
    // Logic: Only Paid Individual plans require Stripe
    if (selectedPlan?.price > 0 && userType === "individual") {
      try {
        const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planTier: selectedPlan.tier, email }),
        });
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setStep(4);
        } else {
          throw new Error("Payment initialization failed");
        }
      } catch (err) {
        setError("NETWORK_AUTH_FAILURE: Backend unreachable");
      } finally {
        setLoading(false);
      }
    } else {
      // Free or non-individual plans skip Stripe
      generateCode();
    }
  };

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep(5);
    setLoading(false);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (dogCode === generatedCode) {
      setStep(7);
    } else {
      setError("CRITICAL_ERR: AUTH_KEY_MISMATCH");
    }
  };

  const filteredPlans = PLANS.filter(p => p.category === userType);

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[160px] rounded-full" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CATEGORIES */}
          {step === 1 && (
            <motion.div key="s1" variants={fader} initial="initial" animate="animate" exit="exit" className="grid md:grid-cols-3 gap-8">
              {USER_TYPES.map((type) => (
                <motion.div key={type.id} whileHover={{ y: -10 }} onClick={() => { setUserType(type.id); setStep(2); }}
                  className="cursor-pointer bg-zinc-900/20 backdrop-blur-2xl border border-white/5 p-12 rounded-[3rem] group text-center">
                  <type.icon size={50} className="mx-auto mb-6 text-blue-500 transition-transform group-hover:scale-110" />
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">{type.label}</h2>
                  <p className="text-zinc-500 text-sm mt-2 font-mono uppercase tracking-widest">{type.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* STEP 2: PRICING */}
          {step === 2 && (
            <motion.div key="s2" variants={fader} initial="initial" animate="animate" exit="exit" className="flex flex-wrap justify-center gap-8">
              {filteredPlans.map((plan) => (
                <div key={plan.id} onClick={() => { setSelectedPlan(plan); setStep(3); }}
                  className="w-full max-w-[320px] bg-zinc-900/40 border border-white/10 p-10 rounded-[3rem] hover:border-blue-500 transition-all cursor-pointer group">
                  <h3 className="text-blue-500 font-black uppercase text-xs tracking-widest mb-2">{plan.tier}</h3>
                  <div className="text-6xl font-black italic mb-8">{plan.display}</div>
                  <div className="space-y-4 mb-10">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-3 text-zinc-400 text-sm">
                        <CheckCircle2 size={16} className="text-blue-500" /> {f}
                      </div>
                    ))}
                  </div>
                  <div className="h-1 w-12 bg-blue-600 group-hover:w-full transition-all duration-700" />
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 3: LOGIN / AUTH */}
          {step === 3 && (
            <motion.div key="s3" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto w-full bg-zinc-900/60 p-12 rounded-[3.5rem] border border-white/10 shadow-3xl">
               <div className="flex justify-center mb-10">
                  <GoogleLogin 
                    onSuccess={() => handleAuthSuccess("google-user@auth.com")} 
                    onError={() => setError("GOOGLE_AUTH_FAILED")}
                    theme="filled_black" 
                  />
               </div>
               <div className="h-[1px] w-full bg-white/5 mb-10" />
               <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAuthSuccess(formData.email); }}>
                  <input 
                    type="email" 
                    required 
                    placeholder="SECURE_EMAIL" 
                    className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500 font-mono text-sm" 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                  <input 
                    type="password" 
                    required 
                    placeholder="ACCESS_KEY" 
                    className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500 font-mono text-sm" 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  <button className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase italic tracking-[0.2em] shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "Initiate Checkout"}
                  </button>
               </form>
            </motion.div>
          )}

          {/* STEP 4: CHECKOUT */}
          {step === 4 && (
            <motion.div key="s4" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto w-full bg-[#0a0a0a] border border-blue-500/20 p-12 rounded-[3.5rem] shadow-2xl">
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm onSuccess={generateCode} />
              </Elements>
            </motion.div>
          )}

          {/* STEP 5: CODE APPEARS */}
          {step === 5 && (
            <motion.div key="s5" variants={fader} initial="initial" animate="animate" exit="exit" className="text-center max-w-md mx-auto">
               <div className="bg-zinc-900/80 p-16 rounded-[4rem] border border-blue-500/30">
                  <Cpu size={50} className="mx-auto mb-6 text-blue-500 animate-pulse" />
                  <h2 className="text-2xl font-black uppercase italic mb-8">Access Key Issued</h2>
                  <div className="bg-black py-10 rounded-3xl border border-white/5 shadow-inner">
                    <span className="text-5xl font-mono text-blue-400 tracking-[0.3em] font-black">{generatedCode}</span>
                  </div>
                  <button onClick={() => setStep(6)} className="mt-12 w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform">Proceed to Sentry</button>
               </div>
            </motion.div>
          )}

          {/* STEP 6: DOG PIC + INPUT */}
          {step === 6 && (
            <motion.div key="s6" variants={fader} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto text-center">
               <div className="bg-zinc-950 p-12 rounded-[3.5rem] border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_blue] animate-scan" />
                  <div className="mb-10 relative inline-block">
                    <Image src={dogImage} width={200} height={200} alt="K9" className="grayscale hover:grayscale-0 transition-all duration-700" unoptimized />
                    <Fingerprint className="absolute -bottom-2 -right-2 text-blue-500 bg-black rounded-full p-2 border border-blue-500/50" size={40} />
                  </div>
                  <h3 className="font-black italic uppercase text-xl mb-2">K9 Sentry Unit</h3>
                  <p className="text-zinc-600 font-mono text-[10px] mb-8 tracking-[0.4em]">AWAITING ENCRYPTION KEY</p>
                  <form onSubmit={handleVerify}>
                    <input 
                      autoFocus 
                      maxLength={6} 
                      placeholder="XXXXXX" 
                      className="w-full bg-black text-center text-5xl p-6 rounded-3xl border border-white/5 text-blue-500 font-mono outline-none focus:border-blue-500/50 transition-all mb-6" 
                      onChange={e => setDogCode(e.target.value)} 
                    />
                    <button className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase italic tracking-widest text-white shadow-xl shadow-blue-900/40">Grant Access</button>
                    {error && <p className="mt-4 text-red-500 font-black text-[10px] uppercase tracking-tighter">{error}</p>}
                  </form>
               </div>
            </motion.div>
          )}

          {/* STEP 7: DASHBOARD UI */}
          {step === 7 && (
            <motion.div key="s7" variants={fader} initial="initial" animate="animate" exit="exit" className="w-full max-w-5xl h-[650px] bg-zinc-900/20 backdrop-blur-3xl rounded-[4rem] border border-white/5 flex overflow-hidden shadow-3xl">
                <div className="w-24 border-r border-white/5 flex flex-col items-center py-12 gap-10">
                   <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40"><Shield size={24}/></div>
                   <LayoutDashboard className="text-white" />
                   <Activity className="text-zinc-700 hover:text-blue-500 cursor-pointer transition-colors" />
                   <Settings className="text-zinc-700 mt-auto hover:text-white cursor-pointer transition-colors" />
                </div>
                <div className="flex-1 p-16 overflow-y-auto">
                   <header className="flex justify-between items-end mb-16">
                      <div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Control Room</h1>
                        <p className="text-zinc-500 font-mono text-xs tracking-[0.3em]">ENCRYPTION ACTIVE // {selectedPlan?.tier} ACCESS</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-blue-500 uppercase">Uptime</p>
                        <p className="text-xl font-mono font-bold">99.99%</p>
                      </div>
                   </header>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 hover:border-blue-500/30 transition-all">
                        <h4 className="font-black uppercase italic text-sm mb-6 flex items-center gap-2"><Zap size={16} className="text-blue-500"/> Neural Traffic</h4>
                        <div className="h-32 flex items-end gap-2">
                          {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-600/20 rounded-t-lg" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-center items-center">
                        <div className="relative w-24 h-24 mb-4">
                           <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                           <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-xl">88%</div>
                        </div>
                        <p className="font-black uppercase italic text-[10px] tracking-widest text-zinc-500">Security Index</p>
                      </div>
                   </div>
                </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020202]">
      <Loader2 className="text-blue-500 animate-spin" size={50} />
      <div className="mt-6 text-zinc-700 font-mono text-[10px] uppercase tracking-[0.5em]">Establishing Secure Neural Link</div>
    </div>
  );
}
