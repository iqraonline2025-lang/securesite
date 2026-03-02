import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Google Auth Sync (Fixed logic)
router.post("/google-login", async (req, res) => {
  const { token, planTier } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, sub: googleId } = ticket.getPayload();

    // Use findOneAndUpdate to link googleId and update plan
    let user = await User.findOneAndUpdate(
      { email },
      { googleId, plan_tier: planTier },
      { upsert: true, new: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    console.error("Google Auth Error:", err.message);
    res.status(500).json({ success: false, error: "Authentication failed" });
  }
});

// 2. Manual Sign-In / Sign-Up (Fixed)
const handleSignin = async (req, res) => {
  const { email, password, planTier, isNewUser } = req.body;
  
  // Input Validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    let user = await User.findOne({ email });

    if (isNewUser) {
      if (user) return res.status(400).json({ message: "User already exists. Please sign in." });
      
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ 
        email, 
        password: hashedPassword, 
        plan_tier: planTier || 'free' 
      });
      await user.save();
    } else {
      // LOGIN LOGIC
      if (!user) return res.status(404).json({ message: "Account not found." });
      
      // Safety check: User might have signed up with Google and has no password
      if (!user.password) {
        return res.status(400).json({ message: "This account uses Google Login. Please use 'Sign in with Google'." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      
      // Update plan if they chose a new one
      if (planTier && user.plan_tier !== planTier) {
        user.plan_tier = planTier;
        await user.save();
      }
    }

    res.json({ 
      success: true, 
      user: { email: user.email, plan_tier: user.plan_tier } 
    });

  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

router.post("/signin", handleSignin);
router.post("/login", handleSignin);

// 3. Stripe & Verification
router.post("/create-payment-intent", async (req, res) => {
  const { planTier } = req.body;
  const prices = { pro: 500, premium: 700, business: 300000, accessibility: 50000 };
  const amount = prices[planTier];
  
  if (!amount) return res.status(400).json({ message: "Invalid plan" });

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify-payment", async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    res.json({ success: intent.status === "succeeded" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
