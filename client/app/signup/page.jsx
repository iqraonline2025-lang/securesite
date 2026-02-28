"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Zap,
  Building2,
  GraduationCap,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import dogImage from "../public/dog-4.png";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://securesite-2fow.onrender.com";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

/* =======================
   PLAN CARDS (Updated UI)
======================= */

const PLANS = [
  {
    id: "basic",
    tier: "Individual Basic",
    icon: <User className="text-blue-400" size={24} />,
    price: "$0",
    desc: "Essential protection for individuals",
    color: "from-blue-500/20",
  },
  {
    id: "pro",
    tier: "Individual Pro",
    icon: <Zap className="text-yellow-400" size={24} />,
    price: "$9",
    desc: "AI-powered enhanced detection",
    color: "from-yellow-500/20",
  },
  {
    id: "plus",
    tier: "Individual Plus",
    icon: <GraduationCap className="text-emerald-400" size={24} />,
    price: "$25",
    desc: "Advanced research toolkit",
    color: "from-emerald-500/20",
  },
  {
    id: "business",
    tier: "Business Pro",
    icon: <Building2 className="text-purple-400" size={24} />,
    price: "$49",
    desc: "Enterprise-grade infrastructure",
    color: "from-purple-500/20",
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
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    verificationCode: "",
  });
  const [dogCode, setDogCode] = useState("");
  const [dogError, setDogError] = useState("");

  /* =======================
     AUTO REDIRECT AFTER SUCCESS
  ======================= */

  useEffect(() => {
    if (step === 6) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  /* =======================
     INIT STRIPE PAYMENT
  ======================= */

  const initPayment = async (tier, email) => {
    try {
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
      alert(err.message || "Payment failed");
    }
  };

  /* =======================
     GOOGLE AUTH
  ======================= */

  const handleGoogleAuth = async (cred) => {
    setLoading(true);

    try {
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

      setFormData((prev) => ({ ...prev, email: data.user.email }));

      if (selectedPlan.id === "basic") {
        localStorage.setItem("user", JSON.stringify(data.user));
        setStep(6);
      } else {
        await initPayment(selectedPlan.tier, data.user.email);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     EMAIL SIGNUP
  ======================= */

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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

      if (selectedPlan.id === "basic") {
        localStorage.setItem("user", JSON.stringify(data.user));
        setStep(6);
      } else {
        await initPayment(selectedPlan.tier, formData.email);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     PAYMENT SUCCESS
  ======================= */

  const handlePaymentSuccess = (user) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    setFormData((prev) => ({
      ...prev,
      verificationCode: code,
    }));

    localStorage.setItem("user", JSON.stringify(user));
    setStep(4);
  };

  /* =======================
     CODE VERIFY
  ======================= */

  const handleCodeSubmit = (e) => {
    e.preventDefault();

    if (dogCode === formData.verificationCode) {
      setStep(6);
    } else {
      setDogError("Invalid code");
    }
  };

  /* =======================
     UI
  ======================= */

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="plans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-4 gap-4 max-w-6xl"
          >
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => {
                  setSelectedPlan(plan);
                  setStep(2);
                }}
                className="p-8 bg-zinc-900 rounded-3xl cursor-pointer hover:scale-105 transition"
              >
                {plan.icon}
                <h3 className="text-xl font-bold mt-4">{plan.tier}</h3>
                <p className="text-zinc-400 text-sm">{plan.desc}</p>
                <p className="text-3xl font-black mt-4">{plan.price}/mo</p>
              </div>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-zinc-900 p-10 rounded-3xl max-w-md">
              <GoogleLogin onSuccess={handleGoogleAuth} />

              <form onSubmit={handleSignup} className="space-y-4 mt-6">
                <input
                  required
                  placeholder="Full Name"
                  className="w-full p-3 bg-black rounded-xl"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 bg-black rounded-xl"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  required
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 bg-black rounded-xl"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button className="w-full bg-blue-600 p-3 rounded-xl">
                  Create Account
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {step === 3 && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onSuccess={handlePaymentSuccess} />
          </Elements>
        )}

        {step === 4 && (
          <div className="text-center">
            <h2 className="text-3xl mb-4">Your Code</h2>
            <div className="text-4xl font-mono">
              {formData.verificationCode}
            </div>
            <button onClick={() => setStep(5)} className="mt-6 bg-blue-600 p-3 rounded-xl">
              Continue
            </button>
          </div>
        )}

        {step === 5 && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <input
              value={dogCode}
              onChange={(e) => setDogCode(e.target.value)}
              className="p-4 bg-black rounded-xl text-center"
              placeholder="Enter Code"
            />
            {dogError && <p className="text-red-500">{dogError}</p>}
            <button className="bg-blue-600 p-3 rounded-xl w-full">
              Verify
            </button>
          </form>
        )}

        {step === 6 && (
          <div className="text-center">
            <CheckCircle2 size={100} className="text-green-500 mx-auto" />
            <h2 className="text-4xl font-bold mt-4">Access Granted</h2>
            <p>Redirecting to dashboard...</p>
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
