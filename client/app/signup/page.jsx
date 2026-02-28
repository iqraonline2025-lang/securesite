"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Zap,
  Building2,
  GraduationCap,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://securesite-2fow.onrender.com";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

const PLANS = [
  {
    id: "basic",
    tier: "Individual Basic",
    icon: <User className="text-blue-400" size={24} />,
    price: "$0",
    desc: "Essential protection for individuals",
  },
  {
    id: "pro",
    tier: "Individual Pro",
    icon: <Zap className="text-yellow-400" size={24} />,
    price: "$9",
    desc: "AI-powered enhanced detection",
  },
  {
    id: "plus",
    tier: "Individual Plus",
    icon: <GraduationCap className="text-emerald-400" size={24} />,
    price: "$25",
    desc: "Advanced research toolkit",
  },
  {
    id: "business",
    tier: "Business Pro",
    icon: <Building2 className="text-purple-400" size={24} />,
    price: "$49",
    desc: "Enterprise-grade infrastructure",
  },
];

export default function SignupPage() {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <Suspense fallback={<LoadingScreen />}>
        <SignupContent />
      </Suspense>
    </GoogleOAuthProvider>
  );
}

function SignupContent() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  /* =======================
     AUTO REDIRECT
  ======================= */

  useEffect(() => {
    if (step === 6) {
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  }, [step, router]);

  /* =======================
     INIT PAYMENT
  ======================= */

  const initPayment = async (tier, email) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setClientSecret(data.clientSecret);
      setStep(3);
    } catch (err) {
      setError(err.message || "Payment error");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     GOOGLE AUTH
  ======================= */

  const handleGoogleAuth = async (cred) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cred.credential,
          planTier: selectedPlan.tier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("user", JSON.stringify(data.user));

      if (selectedPlan.id === "basic") {
        setStep(6);
      } else {
        await initPayment(selectedPlan.tier, data.user.email);
      }
    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     EMAIL SIGNUP
  ======================= */

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          planTier: selectedPlan.tier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("user", JSON.stringify(data.user));

      if (selectedPlan.id === "basic") {
        setStep(6);
      } else {
        await initPayment(selectedPlan.tier, formData.email);
      }
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white flex items-center justify-center p-6">
      <AnimatePresence mode="wait">

        {/* STEP 1 - PLAN SELECT */}
        {step === 1 && (
          <motion.div
            key="plans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-4 gap-6 max-w-6xl w-full"
          >
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => {
                  setSelectedPlan(plan);
                  setStep(2);
                }}
                className="bg-zinc-900/70 border border-zinc-800 p-8 rounded-3xl cursor-pointer hover:scale-105 transition-all"
              >
                {plan.icon}
                <h3 className="text-xl font-bold mt-4">{plan.tier}</h3>
                <p className="text-zinc-400 text-sm mt-2">{plan.desc}</p>
                <p className="text-3xl font-black mt-6">{plan.price}/mo</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* STEP 2 - AUTH */}
        {step === 2 && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900/80 border border-zinc-800 p-10 rounded-3xl max-w-md w-full"
          >
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-sm text-zinc-400 mb-6"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <h2 className="text-2xl font-bold mb-6">
              Sign up for {selectedPlan.tier}
            </h2>

            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleAuth}
                onError={() => setError("Google sign-in failed")}
              />
            </div>

            <div className="text-center text-zinc-500 mb-4">OR</div>

            <form onSubmit={handleSignup} className="space-y-4">
              <input
                required
                placeholder="Full Name"
                className="w-full p-3 bg-black border border-zinc-800 rounded-xl"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="w-full p-3 bg-black border border-zinc-800 rounded-xl"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                required
                type="password"
                placeholder="Password"
                className="w-full p-3 bg-black border border-zinc-800 rounded-xl"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold transition"
              >
                {loading ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 3 - STRIPE */}
        {step === 3 && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              onSuccess={(user) => {
                localStorage.setItem("user", JSON.stringify(user));
                setStep(6);
              }}
            />
          </Elements>
        )}

        {/* STEP 6 - SUCCESS */}
        {step === 6 && (
          <div className="text-center">
            <CheckCircle2 size={100} className="text-green-500 mx-auto" />
            <h2 className="text-4xl font-bold mt-6">Access Granted</h2>
            <p className="text-zinc-400 mt-2">
              Redirecting to dashboard...
            </p>
          </div>
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
