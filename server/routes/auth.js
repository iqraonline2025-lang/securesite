import express from "express";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import Stripe from "stripe";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

const router = express.Router();

/* ================= ENV CHECK ================= */
if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY missing");
if (!process.env.GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID missing");

/* ================= SERVICES ================= */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

/* ================= HELPERS ================= */

// Matches frontend "tier" strings to Stripe amounts in pence
const getPriceInCents = (tier) => {
  const prices = {
    "Basic": 0,
    "Pro": 500,          // £5
    "Ultra": 1000,       // £10
    "Enterprise": 300000, // £3000
    "Universal": 50000,   // £500
    "Business": 4900,    // Legacy fallback
    "Disability": 2500,  // Legacy fallback
  };
  return prices[tier] || null;
};

const normalizePlan = (plan) =>
  plan ? plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase() : "Individual";

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ================= ROUTES ================= */

router.post("/create-payment-intent", async (req, res) => {
  const { planTier, email } = req.body;
  const plan = normalizePlan(planTier);
  const amount = getPriceInCents(plan);

  if (!amount || amount === 0) {
    return res.status(400).json({ message: "Invalid paid plan selected" });
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp", // Set to GBP to match frontend
      metadata: { user_email: email, planTier: plan },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("STRIPE ERROR:", err.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
});

router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.verification_code !== code) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }
    user.verified = true;
    await user.save();
    res.json({ success: true, redirectTo: "dashboard" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

export default router;
