"use client";
import React, { useState, useEffect } from "react";
import { PaymentElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2, ShieldCheck } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/dashboard" },
      redirect: "if_required",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (paymentIntent.status === "succeeded") {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      });
      const data = await res.json();
      if (data.success) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ theme: 'night' }} />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button disabled={loading} className="w-full bg-blue-600 py-4 rounded-xl font-bold flex justify-center items-center gap-2">
        {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Confirm {amount}
      </button>
    </form>
  );
}

export default function StripeWrapper({ planTier, onSuccess }) {
  const [clientSecret, setClientSecret] = useState("");
  const amounts = { pro: "£5", premium: "£7", business: "£3000", accessibility: "£500" };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planTier }),
    })
    .then(res => res.json())
    .then(data => setClientSecret(data.clientSecret));
  }, [planTier]);

  if (!clientSecret) return <div className="text-center p-10"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm amount={amounts[planTier]} onSuccess={onSuccess} />
    </Elements>
  );
}