"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { 
  ShieldCheck, 
  Cpu, 
  User, 
  Building2, 
  Zap, 
  ArrowRight, 
  Lock, 
  Activity 
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");

  const plans = [
    { id: "basic", name: "Individual Basic", price: 0, icon: <User size={18}/> },
    { id: "pro", name: "Individual Pro", price: 5, icon: <Cpu size={18}/> },
    { id: "plus", name: "Individual Plus", price: 7, icon: <ShieldCheck size={18}/> },
    { id: "business", name: "Business Pro", price: 3000, icon: <Building2 size={18}/> },
    { id: "disability", name: "Disability Support", price: 500, icon: <Zap size={18}/> },
  ];

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setStep(2); 
  };

  const handleGoogleAuth = async () => {
    const fakeGoogleEmail = "user@gmail.com";
    setUserEmail(fakeGoogleEmail);
    if (selectedPlan.price === 0) {
      generateCode();
    } else {
      await createPaymentIntent();
    }
  };

  const createPaymentIntent = async () => {
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: selectedPlan.price * 100 }),
    });
    const data = await res.json();
    setClientSecret(data.clientSecret);
    setStep(3);
  };

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setStep(4);
  };

  const handleVerify = () => {
    if (enteredCode === verificationCode) {
      localStorage.setItem("user", JSON.stringify({ email: userEmail, plan: selectedPlan.name }));
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center p-6 font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md w-full z-10">
        {/* Step Indicator */}
        <div className="flex justify-between mb-8 px-2">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`h-1 flex-1 mx-1 rounded-full transition-colors ${step >= s ? 'bg-blue-500' : 'bg-zinc-800'}`} />
            ))}
        </div>

        {/* STEP 1 - SELECT PLAN */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter uppercase">Select Node Tier</h2>
                <p className="text-zinc-500 text-sm font-mono mt-1">ESTABLISH_SYSTEM_PARAMETERS</p>
            </div>
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                className="group w-full p-4 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-between hover:border-blue-500/50 hover:bg-zinc-800/50 transition-all"
              >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-800 rounded-lg group-hover:text-blue-400">{plan.icon}</div>
                    <span className="font-bold">{plan.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-mono text-sm">${plan.price}</span>
                    <ArrowRight size={14} className="text-zinc-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 - GOOGLE AUTH */}
        {step === 2 && (
          <div className="bg-zinc-900/80 border border-white/10 p-8 rounded-[2rem] text-center shadow-2xl">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock size={30} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Identity Verification</h2>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">Securely link your IoT operator profile via Google Authentication.</p>

            <button
              onClick={handleGoogleAuth}
              className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </div>
        )}

        {/* STEP 3 - STRIPE CHECKOUT */}
        {step === 3 && clientSecret && (
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem] shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Activity size={20} className="text-purple-500" /> Secure Payment
            </h2>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm generateCode={generateCode} />
            </Elements>
          </div>
        )}

        {/* STEP 4 - SHOW CODE */}
        {step === 4 && (
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem] text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 tracking-tight">Sync Code Generated</h2>
            <p className="text-zinc-500 text-sm mb-6">Enter this token to finalize hardware pairing.</p>

            <div className="bg-black/50 border border-blue-500/30 p-4 rounded-2xl mb-8">
              <span className="text-4xl font-mono font-black tracking-[0.3em] text-blue-500 ml-4">
                {verificationCode}
              </span>
            </div>

            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              className="w-full p-4 bg-black border border-white/10 rounded-xl text-center font-mono text-xl mb-4 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setEnteredCode(e.target.value)}
            />

            <button
              onClick={handleVerify}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all"
            >
              Establish Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutForm({ generateCode }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (!error) {
      generateCode();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-black border border-white/10 rounded-xl">
        <CardElement options={{
            style: {
                base: {
                    fontSize: '16px',
                    color: '#fff',
                    '::placeholder': { color: '#52525b' },
                },
            },
        }} />
      </div>
      <button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all"
      >
        Authorize Transaction
      </button>
    </form>
  );
}
