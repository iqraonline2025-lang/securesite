import express from "express";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

const getPriceInCents = (tier) => {
  const prices = { "Pro": 500, "Ultra": 1000, "Enterprise": 300000, "Universal": 50000 };
  return prices[tier] || null;
};

// STRIPE INTENT
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

// GOOGLE AUTH
router.post("/google-auth", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture } = ticket.getPayload();
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({ email, full_name: name, avatar: picture, verified: true });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ message: "Google auth failed" });
  }
});

// FINALIZE SIGNUP / LOGIN
router.post("/finalize-auth", async (req, res) => {
  const { email, password, planTier, isLogin } = req.body;

  try {
    let user = await User.findOne({ email });

    if (isLogin) {
      if (!user) return res.status(404).json({ message: "User not found" });
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ message: "Invalid password" });
      return res.json({ success: true, user });
    }

    if (user) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    user = new User({
      email,
      password_hash: hash,
      plan_tier: planTier || "Free",
      verified: true
    });

    await user.save();
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
