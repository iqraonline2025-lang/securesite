"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import { Loader2, CheckCircle2 } from "lucide-react";

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
  const [mainPlan, setMainPlan] = useState("");
  const [subPlan, setSubPlan] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  /* ================= PAYMENT ================= */

  const initPayment = async (email) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTier: mainPlan,
          email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setClientSecret(data.clientSecret);
      setStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SIGNUP ================= */

  const handleSignup = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          planTier: mainPlan,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (mainPlan === "Individual") {
        setStep(8);
      } else {
        await initPayment(formData.email);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY CODE ================= */

  const verifyCode = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStep(8);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 8) {
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      {/* STEP 1 - MAIN PLAN */}
      {step === 1 && (
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
          {["Individual", "Business", "Disability"].map((plan) => (
            <div
              key={plan}
              onClick={() => {
                setMainPlan(plan);
                if (plan === "Individual") setStep(2);
                else setStep(3);
              }}
              className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 cursor-pointer hover:scale-105 transition"
            >
              <h2 className="text-2xl font-bold">{plan}</h2>
            </div>
          ))}
        </div>
      )}

      {/* STEP 2 - INDIVIDUAL SUB PLANS */}
      {step === 2 && (
        <div className="grid md:grid-cols-3 gap-6">
          {["Free", "Pro", "Plus"].map((p) => (
            <div
              key={p}
              onClick={() => {
                setSubPlan(p);
                setStep(4);
              }}
              className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 cursor-pointer"
            >
              <h3 className="text-xl">{p}</h3>
            </div>
          ))}
        </div>
      )}

      {/* STEP 3 - BUSINESS / DISABILITY CARD */}
      {step === 3 && (
        <div className="bg-zinc-900 p-10 rounded-3xl border border-zinc-800 text-center">
          <h2 className="text-3xl font-bold">{mainPlan} Plan</h2>
          <p className="mt-4">
            {mainPlan === "Business" ? "$49/month" : "$25/month"}
          </p>
          <button
            onClick={() => setStep(4)}
            className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 4 - SIGNUP */}
      {step === 4 && (
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 w-96">
          <h2 className="text-xl font-bold mb-6">Create Account</h2>

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

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-blue-600 p-3 rounded"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Sign Up"}
          </button>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      )}

      {/* STEP 5 - STRIPE */}
      {step === 5 && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            onSuccess={() => setStep(6)}
          />
        </Elements>
      )}

      {/* STEP 6 - SHOW CODE INPUT */}
      {step === 6 && (
        <div className="bg-zinc-900 p-8 rounded-3xl text-center">
          <h2 className="text-xl mb-4">Enter Verification Code</h2>
          <input
            className="p-3 bg-black border border-zinc-800 rounded"
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <button
            onClick={verifyCode}
            className="block mt-4 bg-blue-600 px-6 py-3 rounded"
          >
            Verify
          </button>
        </div>
      )}

      {/* STEP 8 - SUCCESS */}
      {step === 8 && (
        <div className="text-center">
          <CheckCircle2 size={80} className="text-green-500 mx-auto" />
          <h2 className="text-3xl mt-4">Access Granted</h2>
        </div>
      )}
    </div>
  );
}
