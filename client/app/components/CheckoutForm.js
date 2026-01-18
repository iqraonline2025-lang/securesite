"use client";
import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);

    // 1. Confirm the payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/signup?payment_intent_return=true`,
      },
      redirect: "if_required", 
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // 2. BACKEND VERIFICATION: Update the user's tier in your DB
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // 3. SUCCESS: Trigger the UI success state and pass the updated user data
          if (onSuccess) {
            onSuccess(data.user); 
          }
        } else {
          setErrorMessage(data.message || "Failed to verify upgrade. Contact support.");
          setLoading(false);
        }
      } catch (err) {
        setErrorMessage("Network error during verification.");
        setLoading(false);
      }
    } else {
      setErrorMessage("Payment status: " + (paymentIntent?.status || "unknown"));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
        <PaymentElement 
          options={{
            layout: "tabs",
            theme: 'night',
            variables: { 
              colorPrimary: '#3b82f6', 
              colorBackground: '#111111',
              colorText: '#ffffff',
              borderRadius: '12px',
            } 
          }} 
        />
      </div>
      
      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-4 rounded-xl border border-red-500/20"
        >
          Error: {errorMessage}
        </motion.div>
      )}

      <button
        disabled={!stripe || loading}
        className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-500 disabled:opacity-50 transition-all flex justify-center items-center gap-3 shadow-xl shadow-blue-500/10 active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <ShieldCheck size={18} />
            <span>Authorize ${amount} Payment</span>
          </>
        )}
      </button>

      <p className="text-center text-[9px] text-zinc-600 uppercase font-black tracking-widest">
        Payments are encrypted and secured via Stripe
      </p>
    </form>
  );
}