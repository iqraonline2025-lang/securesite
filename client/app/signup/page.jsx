"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import {
  ShieldCheck,
  ChevronLeft,
  Loader2,
  Globe,
  Briefcase,
  Accessibility,
  CheckCircle2,
  Cpu,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import StripeCheckout from "../components/CheckoutForm";
import dogImage from "../public/dog-4.png";
import { useRouter } from "next/navigation";

export default function SecurityApp() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // State Management
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLogin, setIsLogin] = useState(false); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");

  const categories = [
    { id: "individual", name: "Individual", icon: Globe, desc: "Personal Vault" },
    { id: "business", name: "Business", icon: Briefcase, desc: "Enterprise Node" },
    { id: "accessibility", name: "Accessibility", icon: Accessibility, desc: "Universal Access" }
  ];

  const planData = {
    individual: [
      { id: "free", name: "Free Plan", price: "£0", features: ["Basic scam alerts", "Basic safety tips", "Limited dashboard", "Limited learning resources"] },
      { id: "pro", name: "Pro Plan", price: "£5", features: ["Everything in Free", "Priority scam alerts", "Faster notifications", "Extra learning resources", "Ad-free experience"] },
      { id: "premium", name: "Premium Plan", price: "£7", features: ["Everything in Pro", "Advanced scam detection", "Analytics dashboard", "Scam history + risk level", "Early access", "Priority support"] }
    ],
    business: [
      { id: "business", name: "Monthly Business Plan", price: "£3,000–£6,000", features: ["Robotic dogs", "SecureMe App", "Maintenance & Repairs", "24/7 Support", "Monitoring dashboard", "Patrol routes"] }
    ],
    accessibility: [
      { id: "accessibility", name: "Accessibility & Disability", price: "Contact us", features: ["Support for disabled individuals", "Vulnerable user monitoring", "Mobility assistance", "Subsidized technology"] }
    ]
  };

  // 1. Email/Password Auth Check
  const handleAuth = async () => {
    if (!email || !password) return alert("Please enter both email and password.");
    
    if (isLogin) {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Invalid credentials");
        
        localStorage.setItem("user", JSON.stringify(data.user));
        generateMasterKey(); // Login skips checkout
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Signup flow: Check if payment is needed
      selectedPlan === "free" ? generateMasterKey() : setStep(4);
    }
  };

  // 2. FIXED: Google Login Flow (Now matches Signup Path)
  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: credentialResponse.credential, 
          planTier: selectedPlan || "free" 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google Authentication Failed");

      localStorage.setItem("user", JSON.stringify(data.user));

      // REDIRECT LOGIC
      if (isLogin) {
        // Just logging in? Go to keys
        generateMasterKey();
      } else {
        // Signing up? Follow the money (Checkout) or go to keys (Free)
        selectedPlan === "free" ? generateMasterKey() : setStep(4);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMasterKey = () => {
    setGeneratedCode(Math.floor(100000 + Math.random() * 900000).toString());
    setStep(5);
  };

  // 3. Final Verification
  const finalizeAndEnter = async () => {
    if (enteredCode !== generatedCode) return alert("Master Key Mismatch");

    setLoading(true);
    try {
      if (!isLogin) {
        const res = await fetch(`${API_URL}/api/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            password, 
            planTier: selectedPlan,
            isNewUser: true 
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Signup failed");
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      localStorage.setItem("isVerified", "true");
      router.replace("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider 
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
      use_fedcm_for_prompt={true} // FIXES COOP ERROR
    >
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-sans">
        <AnimatePresence mode="wait">

          {/* STEP 1: Sector Selection */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-5xl">
              <h1 className="text-5xl font-black italic uppercase text-center mb-12 tracking-tighter text-blue-500">Select Sector</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setStep(2); }} className="bg-zinc-900/40 border border-white/10 p-10 rounded-[2.5rem] text-left hover:border-blue-500 transition-all group">
                    <cat.icon className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
                    <h3 className="text-2xl font-black uppercase italic">{cat.name}</h3>
                    <p className="text-zinc-500 text-xs mt-2 uppercase font-bold tracking-widest">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Plan Selection */}
          {step === 2 && selectedCategory && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-6xl">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-zinc-500 mb-8 font-black uppercase text-[10px] hover:text-white transition-colors">
                <ChevronLeft size={16} /> Back to Sectors
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {planData[selectedCategory].map((plan) => (
                  <div key={plan.id} className="bg-zinc-900/40 border border-white/10 p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-blue-500/50 transition-all">
                    <div>
                      <h3 className="text-zinc-500 text-xs font-black uppercase mb-4">{plan.name}</h3>
                      <div className="text-4xl font-black mb-6 tracking-tighter">{plan.price}</div>
                      <ul className="space-y-4 mb-8">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center text-sm text-zinc-400 font-medium">
                            <CheckCircle2 size={16} className="text-blue-500 mr-3 flex-shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button onClick={() => { setSelectedPlan(plan.id); setStep(3); }} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-blue-600 hover:text-white transition-all">
                      Confirm Plan
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Identity Setup */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md bg-zinc-900/90 p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl text-center space-y-6">
              <ShieldCheck className="mx-auto text-blue-500 mb-4" size={40} />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">{isLogin ? "Operative Login" : "Initialize Identity"}</h2>
              
              <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] underline text-blue-400 font-bold uppercase tracking-widest">
                {isLogin ? "New here? Create Account" : "Existing Operative? Login"}
              </button>

              <div className="space-y-4 mt-4">
                <input type="email" placeholder="EMAIL" className="w-full p-4 bg-black rounded-xl border border-white/5 outline-none focus:border-blue-500 transition-all text-xs font-mono" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="PASSWORD" className="w-full p-4 bg-black rounded-xl border border-white/5 outline-none focus:border-blue-500 transition-all text-xs font-mono" value={password} onChange={e => setPassword(e.target.value)} />
                <button onClick={handleAuth} disabled={loading} className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all flex justify-center items-center">
                  {loading ? <Loader2 className="animate-spin" /> : isLogin ? "Authorize Login" : "Continue"}
                </button>
                <div className="flex justify-center mt-4">
                  <GoogleLogin onSuccess={handleGoogleLogin} theme="filled_black" shape="pill" />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Payment */}
          {step === 4 && (
             <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md bg-zinc-900/90 p-10 rounded-[3rem] border border-white/10">
               <h2 className="text-center font-black uppercase italic mb-6">Finalize Secure Payment</h2>
               <StripeCheckout planTier={selectedPlan} onSuccess={generateMasterKey} />
             </motion.div>
          )}

          {/* STEP 5: Key Generation Display */}
          {step === 5 && (
            <motion.div key="s5" className="text-center space-y-8">
              <Image src={dogImage} alt="Dog" width={256} height={256} className="mx-auto rounded-2xl shadow-lg border border-blue-500/20" unoptimized />
              <Cpu size={60} className="mx-auto text-blue-500 animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Security Key Generated</h2>
              <div className="bg-black border-2 border-blue-600 p-12 rounded-[2.5rem] text-5xl font-mono tracking-[0.5rem] text-blue-400">
                {generatedCode}
              </div>
              <button onClick={() => setStep(6)} className="bg-white text-black px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                I have saved this key <ArrowRight size={18} className="inline ml-2"/>
              </button>
            </motion.div>
          )}

          {/* STEP 6: Final Verification Code */}
          {step === 6 && (
            <motion.div key="s6" className="text-center space-y-8 max-w-sm w-full">
              <ShieldCheck size={50} className="mx-auto text-green-500" />
              <h2 className="text-xs font-black uppercase tracking-widest">Verify Synchronization</h2>
              <input type="text" maxLength={6} placeholder="000000" className="w-full p-6 bg-zinc-900 rounded-[2rem] text-center text-4xl font-mono border border-white/10 outline-none focus:border-green-500 transition-all" value={enteredCode} onChange={e => setEnteredCode(e.target.value)} />
              <button onClick={finalizeAndEnter} disabled={loading} className="w-full bg-green-600 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest flex justify-center items-center">
                {loading ? <Loader2 className="animate-spin" /> : "Authorize Dashboard Access"}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </GoogleOAuthProvider>
  );
}