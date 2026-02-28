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

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Plans (names exactly as requested)
  const plans = [
    { id: "basic", name: "Individual Basic", price: 0 },
    { id: "pro", name: "Individual Pro", price: 5 },
    { id: "plus", name: "Individual Plus", price: 7 },
    { id: "business", name: "Business Pro", price: 3000 },
    { id: "disability", name: "Disability Support", price: 500 },
  ];

  // Create Stripe Payment Intent
  const createPaymentIntent = async (plan) => {
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: plan.price * 100 }),
    });

    const data = await res.json();
    setClientSecret(data.clientSecret);
    setStep(4);
  };

  // Handle Signup Continue
  const handleContinue = async () => {
    if (!selectedPlan) return;

    if (selectedPlan.price === 0) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      setStep(5);
    } else {
      await createPaymentIntent(selectedPlan);
    }
  };

  // Verify Code
  const handleVerify = () => {
    if (enteredCode === verificationCode) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: formData.email,
          plan: selectedPlan.name,
        })
      );
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">

        {/* STEP 1: PLAN SELECTION */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-center">Select Plan</h2>
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  setSelectedPlan(plan);
                  setStep(2);
                }}
                className="w-full p-3 border border-white/20 rounded hover:border-white"
              >
                {plan.name} - ${plan.price}/month
              </button>
            ))}
          </>
        )}

        {/* STEP 2: ACCOUNT FORM */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-center">
              Create Account
            </h2>

            <input
              type="email"
              placeholder="Email"
              required
              className="w-full p-3 bg-black border border-white/20 rounded"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              required
              className="w-full p-3 bg-black border border-white/20 rounded"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 py-3 rounded font-bold"
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 3: STRIPE PAYMENT */}
        {step === 4 && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              setVerificationCode={setVerificationCode}
              setStep={setStep}
            />
          </Elements>
        )}

        {/* STEP 4: CODE VERIFICATION */}
        {step === 5 && (
          <>
            <h2 className="text-xl font-bold text-center">
              Enter Verification Code
            </h2>

            <p className="text-center text-gray-400">
              Your Code: {verificationCode}
            </p>

            <input
              type="text"
              className="w-full p-3 bg-black border border-white/20 rounded"
              onChange={(e) => setEnteredCode(e.target.value)}
            />

            <button
              onClick={handleVerify}
              className="w-full bg-green-600 py-3 rounded font-bold"
            >
              Verify & Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CheckoutForm({ setVerificationCode, setStep }) {
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
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      setStep(5);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-3 border border-white/20 rounded" />
      <button
        type="submit"
        className="w-full bg-purple-600 py-3 rounded font-bold"
      >
        Complete Payment
      </button>
    </form>
  );
}
