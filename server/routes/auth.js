import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ================= HELPERS ================= */

const sendError = (res, status, message) => {
  console.error(`❌ [Response ${status}]: ${message}`);
  return res.status(status).json({ success: false, message });
};

/* ================= NEW: DEV WIPE ROUTE ================= */

// Use this ONLY for development testing to reset your flow
router.delete("/dev-wipe-user", async (req, res) => {
  const { email } = req.body;
  
  // Extra safety check: verify we are in dev mode
  if (process.env.NODE_ENV === 'production') {
    return sendError(res, 403, "Wipe disallowed in production.");
  }

  if (!email) return sendError(res, 400, "Email required for wipe.");

  try {
    console.log(`🧹 Wiping user from DB: ${email}`);
    const result = await User.findOneAndDelete({ email });
    
    if (!result) return sendError(res, 404, "User not found to wipe.");
    
    res.json({ success: true, message: "Operative cleared from system." });
  } catch (err) {
    sendError(res, 500, `Wipe Error: ${err.message}`);
  }
});

/* ================= EXISTING ROUTES ================= */

// 1. Google Auth Sync
router.post("/google-login", async (req, res) => {
  const { token, planTier } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, sub: googleId } = ticket.getPayload();

    let user = await User.findOneAndUpdate(
      { email },
      { googleId, plan_tier: planTier || 'free' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, user: { email: user.email, plan_tier: user.plan_tier } });
  } catch (err) {
    sendError(res, 500, `Google Auth Failed: ${err.message}`);
  }
});

// 2. Manual Sign-In / Sign-Up Logic
const handleSignin = async (req, res) => {
  const { email, password, planTier, isNewUser } = req.body;
  if (!email || !password) return sendError(res, 400, "Email and password are required.");

  try {
    let user = await User.findOne({ email });

    if (isNewUser) {
      if (user) return sendError(res, 400, "User already exists. Please sign in.");
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ email, password: hashedPassword, plan_tier: planTier || 'free' });
      await user.save();
    } else {
      if (!user) return sendError(res, 404, "Account not found.");
      if (!user.password) return sendError(res, 400, "This account uses Google Login.");
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return sendError(res, 401, "Invalid credentials.");
      
      if (planTier && user.plan_tier !== planTier) {
        user.plan_tier = planTier;
        await user.save();
      }
    }

    res.json({ success: true, user: { email: user.email, plan_tier: user.plan_tier } });
  } catch (err) {
    sendError(res, 500, `Internal Server Error: ${err.message}`);
  }
};

router.post("/signup", (req, res) => { req.body.isNewUser = true; handleSignin(req, res); });
router.post("/signin", handleSignin);
router.post("/login", handleSignin);

// 3. Stripe: Create Intent
router.post("/create-payment-intent", async (req, res) => {
  const { planTier } = req.body;
  if (!stripe) return sendError(res, 500, "Stripe is not configured.");
  const prices = { pro: 500, premium: 700, business: 300000, accessibility: 50000 };
  const amount = prices[planTier];
  if (!amount) return sendError(res, 400, "Invalid plan selected.");

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    sendError(res, 500, `Stripe Intent Error: ${err.message}`);
  }
});

// 4. Stripe: Verify Payment
router.post("/verify-payment", async (req, res) => {
  const { paymentIntentId } = req.body;
  if (!stripe) return sendError(res, 500, "Stripe is not configured.");
  if (!paymentIntentId) return sendError(res, 400, "Payment Intent ID is required.");

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    res.json({ success: intent.status === "succeeded", status: intent.status });
  } catch (err) {
    sendError(res, 500, `Stripe Verify Error: ${err.message}`);
  }
});

export default router;