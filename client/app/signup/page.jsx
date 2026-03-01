"use client";

import React, { useState, Suspense, useEffect } from "react";
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

// ... (USER_TYPES and PLANS constants remain the same)

export default function SignupPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // PREVENT RE-ENTRY: Check if user is already verified on mount
  useEffect(() => {
    const session = localStorage.getItem("vault_session_active");
    if (session === "true") {
      router.replace("/dashboard");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  if (isCheckingAuth) return <LoadingScreen />;

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
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
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
    if (isLoginMode) {
        generateCode();
        return;
    }
    // ... (Payment Logic remains the same)
    generateCode();
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
      
      // PERSISTENCE: Save state so they can't come back to this page
      localStorage.setItem("vault_session_active", "true");
      
      setIsAuthenticated(true); 
      setStep(7);
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setLoading(false);
      setError("CRITICAL_ERR: AUTH_KEY_MISMATCH");
    }
  };

  if (isAuthenticated && step !== 7) return <LoadingScreen />;

  return (
    <div className="relative flex items-center justify-center min-h-screen p-6">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Type Selection */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid md:grid-cols-3 gap-6">
              {USER_TYPES.map((type) => (
                <div key={type.id} onClick={() => { setUserType(type.id); setStep(2); }} className="cursor-pointer bg-zinc-900/20 backdrop-blur-xl border border-white/10 p-12 rounded-[3.5rem] text-center hover:bg-zinc-800/40 transition-all">
                  <type.icon size={52} className="mx-auto mb-8 text-blue-500" />
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">{type.label}</h2>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 3: Integrated Auth (Login/Signup toggle) */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-md mx-auto w-full bg-zinc-950/80 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 shadow-2xl text-center">
               <h2 className="text-xl font-black italic uppercase mb-8 tracking-tighter">
                 {isLoginMode ? "Secure Login" : "Initialize Protocol"}
               </h2>
               
               <div className="flex justify-center mb-10">
                  <GoogleLogin onSuccess={() => handleAuthSuccess(formData.email || "user@vault.com")} theme="filled_black" shape="pill" />
               </div>

               <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleAuthSuccess(formData.email); }}>
                  <input type="email" required placeholder="SECURE_EMAIL" className="w-full bg-black/60 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500/50 transition-all font-mono text-xs" onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input type="password" required placeholder="ACCESS_KEY" className="w-full bg-black/60 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500/50 transition-all font-mono text-xs" onChange={e => setFormData({...formData, password: e.target.value})} />
                  
                  <button className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-black uppercase italic tracking-[0.3em] text-sm mt-4">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : (isLoginMode ? "Access Vault" : "Create Vault")}
                  </button>
               </form>

               <div className="mt-8 pt-6 border-t border-white/5">
                  <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-blue-400">
                    {isLoginMode ? "New User? Create Account" : "Existing Member? Secure Login"}
                  </button>
               </div>
            </motion.div>
          )}

          {/* STEP 6: K9 Verification */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto text-center">
               <div className="bg-zinc-950/90 p-14 rounded-[4rem] border border-white/5 relative overflow-hidden shadow-3xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/30 animate-scan" />
                  <Image src={dogImage} width={220} height={220} alt="K9" className="mx-auto mb-10 grayscale" unoptimized />
                  <input autoFocus maxLength={6} placeholder="000000" className="w-full bg-black/80 text-center text-6xl p-8 rounded-[2rem] border border-white/10 text-blue-500 font-mono mb-8" onChange={e => setDogCode(e.target.value)} />
                  <button onClick={handleFinalRedirect} className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase italic tracking-widest">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "Grant Access"}
                  </button>
               </div>
            </motion.div>
          )}

          {/* STEP 7: Final Success (Locks out UI) */}
          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto text-center">
               <div className="bg-zinc-950/90 p-14 rounded-[4rem] border border-blue-500/30 shadow-2xl">
                  <CheckCircle2 size={64} className="mx-auto mb-6 text-blue-500" />
                  <h2 className="text-3xl font-black uppercase italic mb-4 text-white">Access Granted</h2>
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Synchronizing Dashboard...</p>
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020202]">
      <Loader2 className="text-blue-500 animate-spin mb-4" size={40} />
      <div className="text-zinc-700 font-mono text-[9px] uppercase tracking-[0.6em]">Verifying Security Clearance...</div>
    </div>
  );
}
