import express from "express";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import User from "../models/User.js";

const router = express.Router();

/* ================= SERVICES ================= */
if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY missing");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

/* ================= HELPERS ================= */
const getPriceInCents = (tier) => {
  const prices = { "Pro": 500, "Ultra": 1000, "Enterprise": 300000, "Universal": 50000 };
  return prices[tier] || null;
};

/* ================= ROUTES ================= */

// 1. STRIPE PAYMENT INTENT
router.post("/create-payment-intent", async (req, res) => {
  const { planTier, email } = req.body;
  const amount = getPriceInCents(planTier);
  
  if (!amount) return res.status(400).json({ message: "Invalid plan tier" });

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      metadata: { user_email: email, planTier },
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("STRIPE ERROR:", err.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
});

// 2. FINALIZE DB RECORD
// This is called after the user passes the local "Dog" verification
router.post("/finalize-auth", async (req, res) => {
  const { email, planTier, isLogin } = req.body;

  try {
    let user = await User.findOne({ email });

    if (isLogin) {
      if (!user) return res.status(404).json({ message: "Account not found" });
      return res.json({ success: true, user });
    }

    if (user) return res.status(400).json({ message: "Account already exists" });

    // Create new user
    user = new User({
      email,
      plan_tier: planTier || "Free",
      verified: true,
      full_name: email.split('@')[0], // Default name from email
    });

    await user.save();
    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error("DB ERROR:", err.message);
    res.status(500).json({ message: "Database synchronization failed" });
  }
});

export default router;
