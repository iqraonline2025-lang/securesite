import express from "express";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import User from "../models/User.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getPriceInCents = (tier) => {
  const prices = { "Pro": 500, "Ultra": 1000, "Enterprise": 300000, "Universal": 50000 };
  return prices[tier] || null;
};

// CREATE PAYMENT
router.post("/create-payment-intent", async (req, res) => {
  const { planTier, email } = req.body;
  const amount = getPriceInCents(planTier);
  
  if (!amount) return res.status(400).json({ message: "Invalid plan" });

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      metadata: { user_email: email, planTier },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ message: "Stripe error" });
  }
});

// FINAL SYNC
router.post("/finalize-auth", async (req, res) => {
  const { email, password, planTier, isLogin } = req.body;
  try {
    let user = await User.findOne({ email });

    if (isLogin) {
      if (!user) return res.status(404).json({ message: "User not found" });
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });
      return res.json({ success: true, user });
    }

    if (user) return res.status(400).json({ message: "User exists" });

    const hash = await bcrypt.hash(password, 10);
    user = new User({ email, password_hash: hash, plan_tier: planTier, verified: true });
    await user.save();
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "DB Error" });
  }
});

export default router;
