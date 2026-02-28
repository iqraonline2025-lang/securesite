"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { 
  User, Building2, Zap, ArrowLeft, ArrowRight, 
  CheckCircle2, Lock, Activity, ShieldCheck, Loader2 
} from "lucide-react";

// Mock Dog Image - Replace with your public/dog-4.png
const dogImage = "/dog-4.png"; 

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

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
  const [step, setStep] = useState(1); // 1: Main Plans, 2: Sub-plans, 3: Auth, 4: Stripe, 5: Code, 6: Dog, 7: Final
  const [category, setCategory] = useState(null); // 'individual', 'business', 'accessibility'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");

  /* --- Logic Handlers --- */

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setStep(2);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setStep(3); // Go to Login/Signup
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    // Decode JWT logic here
    setUserEmail("operator@iot-secure.com"); 
    if (selectedPlan.price === 0) {
      generateCode();
    } else {
      // Call your /api/create-payment-intent here
      setClientSecret("mock_secret"); 
      setStep(4);
    }
  };

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setStep(5);
  };

  const handleDogVerify = () => {
    if (enteredCode === verificationCode) {
      setStep(7);
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      alert("Hardware Sync Failed: Invalid Code");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl w-full z-10">
        
        {/* STEP 1: MAIN CATEGORIES */}
        {step === 1 && (
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
            <CategoryCard 
              title="Individual" 
              icon={<User size={32}/>} 
              desc="Personal security nodes" 
              onClick={() => handleCategorySelect('individual')} 
            />
            <CategoryCard 
              title="Business" 
              icon={<Building2 size={32}/>} 
              desc="Enterprise fleet defense" 
              onClick={() => handleCategorySelect('business')} 
            />
            <CategoryCard 
              title="Accessibility" 
              icon={<Zap size={32}/>} 
              desc="Assistive hardware sync" 
              onClick={() => handleCategorySelect('accessibility')} 
            />
          </div>
        )}

        {/* STEP 2: SUB-PLANS / FEATURES */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right duration-500">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-zinc-500 mb-8 hover:text-white transition-colors">
              <ArrowLeft size={16}/> Back to Categories
            </button>
            <div className="grid md:grid-cols-3 gap-6">
              {category === 'individual' && (
                <>
                  <PlanCard title="Basic" price={0} features={["1 Device", "Standard Encryption"]} onSelect={() => handlePlanSelect({name: 'Basic', price: 0})} />
                  <PlanCard title="Pro" price={5} features={["5 Devices", "AI Threat Detection"]} onSelect={() => handlePlanSelect({name: 'Pro', price: 5})} />
                  <PlanCard title="Elite" price={15} features={["Unlimited", "24/7 Monitoring"]} onSelect={() => handlePlanSelect({name: 'Elite', price: 15})} />
                </>
              )}
              {category === 'business' && (
                <div className="col-span-3">
                  <PlanCard title="Enterprise Pro" price={3000} features={["Global Fleet", "Custom Hardware Tunnels", "Dedicated Support"]} onSelect={() => handlePlanSelect({name: 'Business Pro', price: 3000})} />
                </div>
              )}
              {category === 'accessibility' && (
                <div className="col-span-3">
                  <PlanCard title="Disability Support" price={500} features={["Voice Overrides", "Haptic Sync", "Family Alerts"]} onSelect={() => handlePlanSelect({name: 'Access Plus', price: 500})} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: AUTH */}
        {step === 3 && (
          <div className="max-w-md mx-auto bg-zinc-900 border border-white/10 p-10 rounded-[2.5rem] text-center shadow-2xl">
            <Lock className="mx-auto mb-6 text-blue-500" size={48} />
            <h2 className="text-3xl font-bold mb-2">Secure Login</h2>
            <p className="text-zinc-500 mb-8 uppercase tracking-widest text-xs">Identity Verification Required</p>
            <GoogleLogin onSuccess={handleGoogleSuccess} theme="dark" shape="pill" />
          </div>
        )}

        {/* STEP 4: STRIPE */}
        {step === 4 && (
          <div className="max-w-md mx-auto bg-zinc-900 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Activity size={20} className="text-purple-500"/> Provisioning Payment</h2>
             <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm onComplete={generateCode} />
             </Elements>
          </div>
        )}

        {/* STEP 5: SHOW CODE */}
        {step === 5 && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-zinc-900 border border-white/10 p-10 rounded-[2.5rem]">
              <h2 className="text-2xl font-bold mb-2">Hardware Sync Token</h2>
              <p className="text-zinc-500 mb-8 text-sm">Save this code for the next step</p>
              <div className="text-5xl font-mono font-black tracking-[0.3em] text-blue-500 mb-10">{verificationCode}</div>
              <button onClick={() => setStep(6)} className="w-full bg-blue-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                Continue to Verification <ArrowRight size={18}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: DOG VERIFICATION */}
        {step === 6 && (
          <div className="max-w-md mx-auto bg-zinc-900 border border-white/10 p-10 rounded-[3rem] text-center">
            <Image src={dogImage} width={200} height={200} alt="Security Dog" className="mx-auto mb-8 rounded-full border-4 border-blue-500/20" />
            <h2 className="text-2xl font-bold mb-6">Final Synchronization</h2>
            <input 
              type="text" 
              maxLength={6} 
              placeholder="Enter Code"
              className="w-full p-5 bg-black border border-white/10 rounded-2xl text-center text-3xl font-mono mb-6 focus:border-blue-500 outline-none"
              onChange={(e) => setEnteredCode(e.target.value)}
            />
            <button onClick={handleDogVerify} className="w-full bg-emerald-600 py-4 rounded-2xl font-bold">Verify & Finish</button>
          </div>
        )}

        {/* STEP 7: SUCCESS */}
        {step === 7 && (
          <div className="text-center">
            <CheckCircle2 size={100} className="text-emerald-500 mx-auto mb-6 animate-bounce" />
            <h2 className="text-4xl font-black">ACCESS GRANTED</h2>
            <p className="text-zinc-500 font-mono mt-2">Redirecting to Secure Dashboard...</p>
          </div>
        )}

      </div>
    </div>
  );
}

/* --- UI SUB-COMPONENTS --- */

function CategoryCard({ title, icon, desc, onClick }) {
  return (
    <div onClick={onClick} className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2rem] cursor-pointer hover:border-blue-500/50 transition-all group">
      <div className="mb-6 text-zinc-500 group-hover:text-blue-500 transition-colors">{icon}</div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm">{desc}</p>
    </div>
  );
}

function PlanCard({ title, price, features, onSelect }) {
  return (
    <div className="bg-zinc-900 border border-white/5 p-8 rounded-[2rem] flex flex-col h-full">
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <div className="text-3xl font-black mb-6">${price}<span className="text-sm font-normal text-zinc-500">/mo</span></div>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
            <ShieldCheck size={14} className="text-blue-500" /> {f}
          </li>
        ))}
      </ul>
      <button onClick={onSelect} className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-colors">Select Plan</button>
    </div>
  );
}

function CheckoutForm({ onComplete }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Real Stripe payment confirmation logic goes here
    setTimeout(() => {
      onComplete();
      setLoading(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-black border border-white/10 rounded-xl">
        <CardElement options={{ style: { base: { color: "#fff", fontSize: "16px" } } }} />
      </div>
      <button disabled={loading} className="w-full bg-purple-600 py-4 rounded-2xl font-bold transition-opacity disabled:opacity-50">
        {loading ? <Loader2 className="animate-spin mx-auto"/> : "Confirm Secure Payment"}
      </button>
    </form>
  );
}

function LoadingScreen() {
  return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="text-blue-500 animate-spin" size={48}/></div>;
}
