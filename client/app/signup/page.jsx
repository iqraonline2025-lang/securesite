"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Accessibility, Loader2, ArrowLeft } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import dogImage from "../public/dog-4.png";

/* ================= CONFIG ================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://securesite-2fow.onrender.com";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

/* ================= DATA ================= */

const USER_TYPES = [
  { id: "individual", label: "Individual", icon: User },
  { id: "business", label: "Business", icon: Building2 },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
];

const PLANS = [
  { id: "free", tier: "Free", price: 0, display: "£0", category: "individual" },
  { id: "pro", tier: "Pro", price: 5, display: "£5 / mo", category: "individual" },
  { id: "premium", tier: "Premium", price: 7, display: "£7 / mo", category: "individual" },
  { id: "business", tier: "Business", price: 0, display: "Custom Pricing", category: "business" },
  { id: "accessibility", tier: "Accessibility", price: 0, display: "Custom Pricing", category: "accessibility" },
];

const STEPS = ["Account Type", "Plan", "Authentication", "Verify", "Checkout"];

/* ================= PAGE ================= */

export default function SignupPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <Suspense fallback={<LoadingScreen />}>
        <SignupFlow />
      </Suspense>
    </GoogleOAuthProvider>
  );
}

function SignupFlow() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [dogCode, setDogCode] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  /* ================= SESSION PERSISTENCE ================= */

  useEffect(() => {
    const saved = sessionStorage.getItem("signupFlow");
    if (saved) {
      const parsed = JSON.parse(saved);
      setStep(parsed.step || 1);
      setUserType(parsed.userType || null);
      setSelectedPlan(parsed.selectedPlan || null);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      "signupFlow",
      JSON.stringify({ step, userType, selectedPlan })
    );
  }, [step, userType, selectedPlan]);

  const visiblePlans = PLANS.filter(p => p.category === userType);

  /* ================= VALIDATION ================= */

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* ================= BACK BUTTON ================= */

  const goBack = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  /* ================= EMAIL SIGNUP ================= */

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(formData.email)) {
      setError("Invalid email format");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, planTier: selectedPlan.tier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE ================= */

  const handleGoogle = async (credentialResponse) => {
    if (!selectedPlan) {
      setError("Select a plan first");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
          planTier: selectedPlan.tier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setFormData(prev => ({ ...prev, email: data.user.email }));
      setStep(4);
    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY ================= */

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(dogCode)) {
      setError("Enter valid 6-digit code");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: dogCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Invalid code");

      if (selectedPlan.price === 0 || selectedPlan.category !== "individual") {
        router.push("/dashboard");
      } else {
        const pay = await fetch(`${API_BASE}/api/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planTier: selectedPlan.tier,
            email: formData.email,
          }),
        });

        const payData = await pay.json();
        if (!pay.ok) throw new Error(payData.message);

        setClientSecret(payData.clientSecret);
        setStep(5);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">

      {/* Glow background */}
      <div className="absolute w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full top-[-200px] left-[-200px]" />

      <div className="w-full max-w-4xl relative z-10">

        {/* STEP INDICATOR */}
        <div className="flex justify-between mb-8 text-sm text-zinc-400">
          {STEPS.map((label, i) => (
            <div key={i} className={step === i + 1 ? "text-blue-400 font-bold" : ""}>
              {label}
            </div>
          ))}
        </div>

        {/* BACK BUTTON */}
        {step > 1 && (
          <button onClick={goBack} className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-white">
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="type" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid md:grid-cols-3 gap-6">
              {USER_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <div key={type.id}
                    onClick={() => { setUserType(type.id); setStep(2); }}
                    className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 hover:border-blue-500 p-8 rounded-3xl cursor-pointer text-center hover:scale-105 transition">
                    <Icon size={36} className="mx-auto mb-4 text-blue-400" />
                    <h2 className="text-xl font-semibold">{type.label}</h2>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid md:grid-cols-3 gap-6">
              {visiblePlans.map(plan => (
                <div key={plan.id}
                  onClick={() => { setSelectedPlan(plan); setStep(3); }}
                  className={`p-8 rounded-3xl cursor-pointer transition backdrop-blur-xl
                    ${selectedPlan?.id === plan.id
                      ? "border-2 border-blue-500 bg-zinc-900"
                      : "border border-zinc-800 bg-zinc-900/60 hover:border-blue-500"}`}>
                  <h3 className="text-xl font-bold">{plan.tier}</h3>
                  <p className="text-3xl font-black mt-2">{plan.display}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 3 AUTH */}
          {step === 3 && selectedPlan && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="max-w-md mx-auto bg-zinc-900/60 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800">
              <GoogleLogin onSuccess={handleGoogle} onError={() => setError("Google failed")} />
              <div className="text-center my-4 text-zinc-500">OR</div>

              <form onSubmit={handleSignup} className="space-y-4">
                <input required placeholder="Full Name"
                  className="w-full p-3 bg-black border border-zinc-800 rounded-xl"
                  onChange={e => setFormData({ ...formData, name: e.target.value.trim() })} />
                <input required type="email" placeholder="Email"
                  className="w-full p-3 bg-black border border-zinc-800 rounded-xl"
                  onChange={e => setFormData({ ...formData, email: e.target.value.trim() })} />
                <input required type="password" placeholder="Password"
                  className="w-full p-3 bg-black border border-zinc-800 rounded-xl"
                  onChange={e => setFormData({ ...formData, password: e.target.value })} />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Continue"}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4 VERIFY */}
          {step === 4 && (
            <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="max-w-md mx-auto bg-zinc-900/60 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800 text-center">
              <Image src={dogImage} alt="verify" width={120} className="mx-auto mb-6" />
              <form onSubmit={handleVerify} className="space-y-4">
                <input maxLength={6}
                  className="w-full p-4 text-center bg-black border border-zinc-800 rounded-xl text-xl"
                  onChange={(e) => setDogCode(e.target.value)} />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button className="w-full bg-white text-black p-3 rounded-xl font-bold">
                  Verify Code
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 5 CHECKOUT */}
          {step === 5 && clientSecret && (
            <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="max-w-md mx-auto bg-zinc-900/60 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm onSuccess={() => router.push("/dashboard")} />
              </Elements>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );
}
