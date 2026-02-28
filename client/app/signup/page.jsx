"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Zap,
  Building2,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Mail,
  Lock
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import dogImage from "../public/dog-4.png";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://securesite-2fow.onrender.com";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

/* ================= MAIN PLANS ================= */

const PLANS = [
  {
    id: "individual",
    tier: "Individual",
    icon: <User className="text-blue-400" size={24} />,
    price: "$0",
    desc: "Personal protection & scam alerts",
    color: "from-blue-500/20"
  },
  {
    id: "business",
    tier: "Business",
    icon: <Building2 className="text-purple-400" size={24} />,
    price: "$3000",
    desc: "Enterprise robotic security solution",
    color: "from-purple-500/20"
  },
  {
    id: "accessibility",
    tier: "Accessibility & Disability",
    icon: <Zap className="text-emerald-400" size={24} />,
    price: "$500",
    desc: "Social impact partnership model",
    color: "from-emerald-500/20"
  }
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
  const [planView, setPlanView] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    verificationCode: ""
  });
  const [dogCode, setDogCode] = useState("");
  const [dogError, setDogError] = useState("");

  useEffect(() => {
    if (step === 6) {
      const t = setTimeout(() => router.push("/dashboard"), 3000);
      return () => clearTimeout(t);
    }
  }, [step, router]);

  /* ================= PAYMENT ================= */

  const initPayment = async (tier, email) => {
    try {
      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier, email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setClientSecret(data.clientSecret);
      setStep(3);
    } catch (err) {
      alert(err.message || "Payment initialization failed");
    }
  };

  /* ================= GOOGLE AUTH ================= */

  const handleGoogleAuth = async cred => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cred.credential,
          planTier: selectedPlan.tier
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (selectedPlan.id === "individual") {
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

  /* ================= EMAIL AUTH ================= */

  const handleAuthSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/login" : "/api/signup";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, planTier: selectedPlan.tier })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (selectedPlan.id === "individual") {
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

  const handlePaymentSuccess = user => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData(prev => ({ ...prev, verificationCode: code }));
    localStorage.setItem("user", JSON.stringify(user));
    setStep(4);
  };

  const handleDogCodeSubmit = e => {
    e.preventDefault();
    if (dogCode === formData.verificationCode) {
      setStep(6);
    } else {
      setDogError("Invalid verification code");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <AnimatePresence mode="wait">

        {/* STEP 1 — MAIN PLANS */}
        {step === 1 && (
          <motion.div key="1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl w-full">
            <h1 className="text-5xl font-black text-center mb-10">
              CHOOSE YOUR PLAN
            </h1>
            <div className="grid md:grid-cols-3 gap-6">
              {PLANS.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPlan(p);
                    setPlanView(p.id);
                    setStep(7);
                  }}
                  className="p-8 rounded-3xl bg-zinc-900 border border-white/10 cursor-pointer hover:bg-zinc-800"
                >
                  {p.icon}
                  <h3 className="text-xl font-bold mt-4">{p.tier}</h3>
                  <p className="text-zinc-400 text-sm">{p.desc}</p>
                  <p className="text-2xl font-black mt-4">{p.price}/mo</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 7 — DETAILS */}
        {step === 7 && (
          <motion.div key="7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl w-full">
            <button onClick={() => setStep(1)} className="mb-8 text-zinc-400">
              ← Back
            </button>

            {planView === "individual" && (
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Free Plan",
                    price: "£0/month",
                    desc: "Basic scam alerts, basic tips, limited dashboard"
                  },
                  {
                    name: "Pro Plan",
                    price: "£5/month",
                    desc:
                      "Priority alerts, faster notifications, extra resources, ad-free"
                  },
                  {
                    name: "Premium Plan",
                    price: "£7/month",
                    desc:
                      "Advanced detection, analytics dashboard, scam history, early features, priority support"
                  }
                ].map((plan, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-zinc-900 border border-white/10">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-zinc-400 text-sm my-3">{plan.desc}</p>
                    <p className="text-2xl font-black mb-6">{plan.price}</p>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full bg-blue-600 py-3 rounded-2xl font-bold"
                    >
                      Get Started
                    </button>
                  </div>
                ))}
              </div>
            )}

            {planView === "business" && (
              <div className="p-10 rounded-3xl bg-zinc-900 border border-white/10">
                <h2 className="text-3xl font-bold mb-4">
                  Monthly Business Plan (£3,000–£6,000/month)
                </h2>
                <p className="text-zinc-400 mb-6">
                  Includes robotic dogs, dashboard, maintenance, monitoring,
                  alerts, patrol routes and full enterprise support.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="bg-purple-600 px-8 py-3 rounded-2xl font-bold"
                >
                  Partnership With Us
                </button>
              </div>
            )}

            {planView === "accessibility" && (
              <div className="p-10 rounded-3xl bg-zinc-900 border border-white/10">
                <h2 className="text-3xl font-bold mb-4">
                  Accessibility & Disability Plan
                </h2>
                <p className="text-zinc-400 mb-6">
                  Supports disabled and vulnerable users who cannot afford
                  security technology. Social-impact partnership model.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="bg-emerald-600 px-8 py-3 rounded-2xl font-bold"
                >
                  Partnership With Us
                </button>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

/* Loading Screen */

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );
}
