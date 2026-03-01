import express from "express";
import Stripe from "stripe";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const router = express.Router();

/* ================= SERVICES ================= */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ================= HELPERS ================= */
const getPriceInCents = (tier) => {
  const prices = {
    "Basic": 0,
    "Pro": 500,          // £5
    "Ultra": 1000,       // £10
    "Enterprise": 300000, // £3000
    "Universal": 50000,   // £500
  };
  return prices[tier] || 0;
};

/* ================= ROUTES ================= */

// 1. Create Payment Intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { planTier, email } = req.body;
    const amount = getPriceInCents(planTier);

    if (amount === 0) {
      return res.status(400).json({ message: "Free plan does not require payment" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "gbp",
      metadata: { email, planTier },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 2. Verify Code (Optional if you want to save to DB)
router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;
  try {
    // In a real app, you'd check this code against a value stored in Redis/DB
    // For now, the frontend handles the immediate match logic.
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

export default router;
