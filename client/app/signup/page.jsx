"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  Accessibility,
  CheckCircle2,
  ArrowLeft,
  Loader2,
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

export default function SignupPage() {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <SignupFlow />
    </GoogleOAuthProvider>
  );
}

function SignupFlow() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [mainPlan, setMainPlan] = useState(null);
  const [subPlan, setSubPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  /* ===================== PAYMENT ===================== */

  const initPayment = async (email) => {
    const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planTier: mainPlan, email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setClientSecret(data.clientSecret);
    setStep(5);
  };

  /* ===================== EMAIL SIGNUP ===================== */

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, planTier: mainPlan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("user", JSON.stringify(data.user));

      if (mainPlan === "Individual") {
        setStep(7);
      } else {
        await initPayment(formData.email);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== GOOGLE SIGNUP ===================== */

  const handleGoogle = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
          planTier: mainPlan,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("user", JSON.stringify(data.user));

      if (mainPlan === "Individual") {
        setStep(7);
      } else {
        await initPayment(data.user.email);
      }
    } catch (err) {
      setError(err.message || "Google failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== VERIFY CODE ===================== */

  const verifyCode = async () => {
    const res = await fetch(`${API_BASE}/api/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        code: verificationCode,
      }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.message);

    setStep(7);
  };

  useEffect(() => {
    if (step === 7) {
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }, [step]);

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white flex items-center justify-center p-6">
      <AnimatePresence mode="wait">

        {/* STEP 1 - MAIN PLANS */}
        {step === 1 && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-3 gap-6 max-w-5xl w-full"
          >
            {[
              { name: "Individual", icon: <User size={28} /> },
              { name: "Business", icon: <Building2 size={28} /> },
              { name: "Disability", icon: <Accessibility size={28} /> },
            ].map((plan) => (
              <div
                key={plan.name}
                onClick={() => {
                  setMainPlan(plan.name);
                  setStep(2);
                }}
                className="bg-zinc-900/70 border border-zinc-800 p-10 rounded-3xl cursor-pointer hover:scale-105 transition"
              >
                {plan.icon}
                <h3 className="text-2xl font-bold mt-4">{plan.name}</h3>
                <p className="text-zinc-400 mt-2">
                  Tailored protection for {plan.name.toLowerCase()} users.
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* STEP 2 - PLAN DETAILS */}
        {step === 2 && (
          <motion.div
            key="details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900/80 border border-zinc-800 p-10 rounded-3xl max-w-lg w-full"
          >
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-zinc-400 mb-6"
            >
              <ArrowLeft size={16} /> Back
            </button>

            {mainPlan === "Individual" ? (
              <>
                <h2 className="text-2xl font-bold mb-6">
                  Choose Individual Plan
                </h2>
                {["Free", "Pro", "Plus"].map((p) => (
                  <div
                    key={p}
                    onClick={() => {
                      setSubPlan(p);
                      setStep(3);
                    }}
                    className="border border-zinc-700 p-4 rounded-xl mb-4 cursor-pointer hover:bg-zinc-800"
                  >
                    <h3 className="font-semibold">{p}</h3>
                  </div>
                ))}
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold">{mainPlan} Plan</h2>
                <p className="text-4xl font-black mt-4">
                  {mainPlan === "Business" ? "$49/mo" : "$25/mo"}
                </p>
                <ul className="mt-6 space-y-2 text-zinc-400">
                  <li>✔ AI monitoring</li>
                  <li>✔ Real-time protection</li>
                  <li>✔ Priority support</li>
                </ul>
                <button
                  onClick={() => setStep(3)}
                  className="mt-8 w-full bg-blue-600 p-3 rounded-xl"
                >
                  Continue
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* STEP 3 - AUTH */}
        {step === 3 && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900/80 border border-zinc-800 p-10 rounded-3xl max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-6">Create Account</h2>

            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setError("Google failed")}
              />
            </div>

            <div className="text-center text-zinc-500 mb-4">OR</div>

            <input
              placeholder="Name"
              className="w-full p-3 mb-3 bg-black border border-zinc-800 rounded"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <input
              placeholder="Email"
              className="w-full p-3 mb-3 bg-black border border-zinc-800 rounded"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-3 bg-black border border-zinc-800 rounded"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-blue-600 p-3 rounded-xl"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Sign Up"}
            </button>
          </motion.div>
        )}

        {/* STEP 5 - STRIPE */}
        {step === 5 && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onSuccess={() => setStep(6)} />
          </Elements>
        )}

        {/* STEP 6 - VERIFY CODE */}
        {step === 6 && (
          <div className="bg-zinc-900 p-8 rounded-3xl text-center">
            <h2 className="text-xl mb-4">Enter Verification Code</h2>
            <input
              className="p-3 bg-black border border-zinc-800 rounded"
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button
              onClick={verifyCode}
              className="mt-4 bg-blue-600 px-6 py-3 rounded"
            >
              Verify
            </button>
          </div>
        )}

        {/* STEP 7 - SUCCESS */}
        {step === 7 && (
          <div className="text-center">
            <CheckCircle2 size={100} className="text-green-500 mx-auto" />
            <h2 className="text-4xl font-bold mt-6">Access Granted</h2>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
