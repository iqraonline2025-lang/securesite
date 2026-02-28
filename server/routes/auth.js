// routes/auth.js
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

/* ================= EMAIL SETUP ================= */
let sendEmail;

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  sendEmail = async (to, subject, html) => {
    await sgMail.send({ to, from: process.env.EMAIL_FROM, subject, html });
  };
} else {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  };
}

/* ================= HELPERS ================= */

const normalizePlan = (plan) =>
  plan ? plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase() : null;

const getPriceInCents = (tier) =>
  ({
    Business: 4900,     // $49
    Disability: 2500,   // $25
  }[tier] || null);

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendVerificationEmail = async (email, code) => {
  await sendEmail(
    email,
    "Your Verification Code",
    `
      <h2>Verification Required</h2>
      <p>Your secure verification code:</p>
      <h1>${code}</h1>
      <p>This code expires in 10 minutes.</p>
    `
  );
};

/* =========================================================
   CREATE PAYMENT INTENT (Business + Disability only)
========================================================= */
router.post("/create-payment-intent", async (req, res) => {
  const { planTier, email } = req.body;
  const plan = normalizePlan(planTier);

  const amount = getPriceInCents(plan);
  if (!amount) {
    return res.status(400).json({ message: "Invalid paid plan" });
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        user_email: email,
        planTier: plan,
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("STRIPE ERROR:", err.message);
    res.status(500).json({ message: "Payment failed" });
  }
});

/* =========================================================
   SIGNUP
========================================================= */
router.post("/signup", async (req, res) => {
  const { name, email, password, planTier } = req.body;
  const plan = normalizePlan(planTier) || "Individual";

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const isPaidPlan = ["Business", "Disability"].includes(plan);

    const user = new User({
      full_name: name,
      email,
      password_hash: hash,
      plan_tier: plan,
      verified: plan === "Individual", // free users auto verified
    });

    // If paid plan → send verification code AFTER payment later
    if (isPaidPlan) {
      user.verified = false;
    }

    await user.save();

    const userData = user.toObject();
    delete userData.password_hash;

    res.status(201).json({
      user: userData,
      redirectTo:
        plan === "Individual" ? "dashboard" : "payment",
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err.message);
    res.status(500).json({ message: "Signup failed" });
  }
});

/* =========================================================
   GOOGLE LOGIN
========================================================= */
router.post("/google-login", async (req, res) => {
  const { token, planTier } = req.body;
  const plan = normalizePlan(planTier) || "Individual";

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        full_name: name,
        email,
        plan_tier: plan,
        verified: plan === "Individual",
      });
    }

    const needsPayment =
      ["Business", "Disability"].includes(plan) &&
      user.plan_tier === "Individual";

    const userData = user.toObject();
    delete userData.password_hash;

    res.json({
      user: { ...userData, avatar: picture },
      redirectTo: needsPayment ? "payment" : "dashboard",
    });
  } catch (err) {
    console.error("GOOGLE ERROR:", err.message);
    res.status(401).json({ message: "Google login failed" });
  }
});

/* =========================================================
   VERIFY PAYMENT → SEND CODE
========================================================= */
router.post("/verify-payment", async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const email = intent.metadata.user_email;
    const plan = intent.metadata.planTier;

    const code = generateCode();

    const user = await User.findOneAndUpdate(
      { email },
      {
        plan_tier: plan,
        verification_code: code,
        verification_expires: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
      },
      { new: true }
    );

    await sendVerificationEmail(email, code);

    res.json({ success: true, redirectTo: "verify" });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

/* =========================================================
   VERIFY CODE
========================================================= */
router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (
      !user ||
      user.verification_code !== code ||
      user.verification_expires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.verified = true;
    user.verification_code = null;
    user.verification_expires = null;

    await user.save();

    const userData = user.toObject();
    delete userData.password_hash;

    res.json({ success: true, user: userData, redirectTo: "dashboard" });
  } catch (err) {
    console.error("VERIFY CODE ERROR:", err.message);
    res.status(500).json({ message: "Verification failed" });
  }
});

export default router;
