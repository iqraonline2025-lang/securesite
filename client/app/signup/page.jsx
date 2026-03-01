"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Accessibility, Loader2 } from "lucide-react";
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

/* ================= PLANS ================= */

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

  const visiblePlans = PLANS.filter(p => p.category === userType);

  /* ================= PAYMENT ================= */

  const initPayment = async () => {
    const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planTier: selectedPlan.tier, email: formData.email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setClientSecret(data.clientSecret);
    setStep(4);
  };

  /* ================= EMAIL SIGNUP ================= */

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, planTier: selectedPlan.tier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStep(3); // VERIFY FIRST
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE AUTH ================= */

  const handleGoogle = async (credentialResponse) => {
    try {
      setLoading(true);

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
      setStep(3);
    } catch (err) {
      setError("Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY ================= */

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: dogCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Invalid code");

      if (
        selectedPlan.price === 0 ||
        selectedPlan.category !== "individual"
      ) {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        await initPayment();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white flex items-center justify-center p-6">

      <AnimatePresence mode="wait">

        {/* ================= STEP 1 USER TYPE ================= */}
        {step === 1 && (
          <motion.div key="type" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl w-full">
            <h1 className="text-4xl font-bold text-center mb-10">
              Choose Your Account Type
            </h1>

            <div className="grid md:grid-cols-3 gap-6">
              {USER_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    onClick={() => {
                      setUserType(type.id);
                      setStep(2);
                    }}
                    className="bg-zinc-900 border border-zinc-800 hover:border-blue-500 transition p-8 rounded-3xl cursor-pointer text-center hover:scale-105"
                  >
                    <Icon size={36} className="mx-auto mb-4 text-blue-400" />
                    <h2 className="text-2xl font-semibold">{type.label}</h2>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ================= STEP 2 PLANS ================= */}
        {step === 2 && (
          <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl w-full">
            <h2 className="text-3xl font-bold text-center mb-8 capitalize">
              {userType} Plans
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {visiblePlans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan);
                    setStep(3);
                  }}
                  className="bg-zinc-900 border border-zinc-800 hover:border-blue-500 p-8 rounded-3xl cursor-pointer hover:scale-105 transition"
                >
                  <h3 className="text-xl font-bold mb-4">{plan.tier}</h3>
                  <p className="text-3xl font-black">{plan.display}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ================= STEP 3 SIGNUP ================= */}
        {step === 3 && !selectedPlan && null}

        {step === 3 && selectedPlan && (
          <motion.div key="auth" className="w-full max-w-md bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
            <GoogleLogin onSuccess={handleGoogle} onError={() => setError("Google failed")} />

            <div className="text-center text-zinc-500 my-4">OR</div>

            <form onSubmit={handleSignup} className="space-y-4">
              <input required placeholder="Full Name" className="w-full p-3 bg-black border border-zinc-800 rounded-xl"
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <input required type="email" placeholder="Email" className="w-full p-3 bg-black border border-zinc-800 rounded-xl"
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <input required type="password" placeholder="Password" className="w-full p-3 bg-black border border-zinc-800 rounded-xl"
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Continue"}
              </button>
            </form>
          </motion.div>
        )}

        {/* ================= STEP 4 VERIFY ================= */}
        {step === 4 && !clientSecret && (
          <motion.div key="verify" className="w-full max-w-md bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center">
            <Image src={dogImage} alt="verification" width={120} className="mx-auto mb-6" />
            <form onSubmit={handleVerify} className="space-y-4">
              <input maxLength={6} placeholder="Enter 6-digit code"
                className="w-full p-4 text-center bg-black border border-zinc-800 rounded-xl text-xl"
                onChange={(e) => setDogCode(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button className="w-full bg-white text-black p-3 rounded-xl font-bold">
                Verify Code
              </button>
            </form>
          </motion.div>
        )}

        {/* ================= STEP 5 CHECKOUT ================= */}
        {step === 4 && clientSecret && (
          <motion.div key="checkout" className="w-full max-w-md bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
            <h2 className="text-2xl font-bold text-center mb-6">Secure Checkout</h2>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm onSuccess={() => router.push("/dashboard")} />
            </Elements>
          </motion.div>
        )}

      </AnimatePresence>
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
