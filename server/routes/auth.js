// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import Stripe from "stripe";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

/* ================= ENV CHECK ================= */
if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY missing");
if (!process.env.GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID missing");
if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASS)
  throw new Error("Gmail credentials missing");

/* ================= SERVICES ================= */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

/* ================= EMAIL (Gmail SMTP) ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) console.error("SMTP ERROR:", err);
  else console.log("GMAIL SMTP READY ✅");
});

// numeric 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// send verification email
const sendVerificationEmail = async (email, code) => {
  try {
    await transporter.sendMail({
      from: `"Shield Security" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Shield Verification Code",
      html: `
        <h2>Verification Required</h2>
        <p>Your secure access code:</p>
        <h1>${code}</h1>
        <p>Expires in 10 minutes</p>
      `,
    });
    console.log(`✅ Verification code sent to ${email}`);
    return true;
  } catch (err) {
    console.error("EMAIL SEND ERROR:", err.message);
    console.log(`Fallback code for ${email}: ${code}`);
    return false;
  }
};

/* ================= HELPERS ================= */
const getPriceInCents = (tier) => ({ Premium: 900, Business: 4900, Lab: 2500 }[tier] || null);
const normalizePlan = (plan) => plan?.charAt(0).toUpperCase() + plan?.slice(1).toLowerCase();

/* ================= ROUTES ================= */

// CREATE PAYMENT INTENT
router.post("/create-payment-intent", async (req, res) => {
  const planTier = normalizePlan(req.body.planTier);
  const email = req.body.email;
  const amount = getPriceInCents(planTier);
  if (!amount) return res.status(400).json({ message: "Invalid plan" });

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { user_email: email, planTier },
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("PAYMENT ERROR:", err.message);
    res.status(500).json({ message: "Payment failed", error: err.message });
  }
});

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password, planTier } = req.body;
  const plan = normalizePlan(planTier);

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User exists" });

    const hash = await bcrypt.hash(password, 10);
    const isRestricted = ["Business", "Lab"].includes(plan);

    const user = new User({
      full_name: name,
      email,
      password_hash: hash,
      plan_tier: plan || "Free",
      verified: !isRestricted,
    });

    if (isRestricted) {
      const code = generateCode();
      user.verification_code = code;
      user.verification_expires = new Date(Date.now() + 10 * 60 * 1000);
      await sendVerificationEmail(email, code);
    }

    await user.save();

    const userData = user.toObject();
    delete userData.password_hash;
    delete userData.verification_code;

    res.status(201).json({ user: userData, redirectTo: isRestricted ? "verify" : "dashboard" });
  } catch (err) {
    console.error("SIGNUP ERROR:", err.message);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash || "");
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.verified) return res.status(403).json({ message: "User not verified" });

    const userData = user.toObject();
    delete userData.password_hash;

    res.json({ user: userData, redirectTo: "dashboard" });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// SEND CODE (for verification)
router.post("/send-code", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const code = generateCode();
    user.verification_code = code;
    user.verification_expires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();
    await sendVerificationEmail(email, code);

    res.json({ success: true, message: "Code sent" });
  } catch (err) {
    console.error("SEND CODE ERROR:", err.message);
    res.status(500).json({ message: "Failed to send code", error: err.message });
  }
});

// VERIFY CODE
router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.verification_code !== code)
      return res.status(400).json({ message: "Invalid code" });

    if (user.verification_expires < new Date())
      return res.status(400).json({ message: "Code expired" });

    user.verified = true;
    user.verification_code = null;
    user.verification_expires = null;

    await user.save();

    const userData = user.toObject();
    delete userData.password_hash;

    res.json({ success: true, user: userData, redirectTo: "dashboard" });
  } catch (err) {
    console.error("VERIFY CODE ERROR:", err.message);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

// GOOGLE LOGIN
router.post("/google-login", async (req, res) => {
  const { token, planTier } = req.body;
  const plan = normalizePlan(planTier);

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user)
      user = await User.create({ full_name: name, email, plan_tier: "Free", verified: true });

    const userData = user.toObject();
    delete userData.password_hash;

    const needsPayment = plan && plan !== "Free" && user.plan_tier === "Free";

    res.json({ user: { ...userData, avatar: picture }, redirectTo: needsPayment ? "payment" : "dashboard" });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err.message);
    res.status(401).json({ message: "Google auth failed", error: err.message });
  }
});

// VERIFY PAYMENT
router.post("/verify-payment", async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded")
      return res.status(400).json({ message: "Payment not completed" });

    const email = intent.metadata.user_email;
    const plan = intent.metadata.planTier;

    const user = await User.findOneAndUpdate({ email }, { plan_tier: plan }, { new: true });

    const userData = user.toObject();
    delete userData.password_hash;

    res.json({ success: true, user: userData });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err.message);
    res.status(500).json({ message: "Payment verification failed", error: err.message });
  }
});

export default router;
