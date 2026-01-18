import express from "express";
import bcrypt from "bcrypt";
import db from "../config/db.js";
import { OAuth2Client } from "google-auth-library";
import Stripe from "stripe";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper to convert plan names to cents
const getPriceInCents = (tier) => {
  const prices = { Premium: 900, Business: 4900, Lab: 2500 };
  return prices[tier] || null;
};

// 1️⃣ CREATE PAYMENT INTENT
router.post("/create-payment-intent", async (req, res) => {
  const { planTier, email } = req.body;
  const amount = getPriceInCents(planTier);

  if (!amount) return res.status(400).json({ message: "Invalid plan tier" });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { user_email: email, planTier },
      automatic_payment_methods: { enabled: true },
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: "Stripe Error: " + err.message });
  }
});

// 2️⃣ SIGNUP (Initial user creation)
router.post("/signup", async (req, res) => {
  const { name, email, password, planTier } = req.body;
  try {
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // We default to 'Free' initially. If they chose a paid plan, 
    // the frontend will detect the mismatch and trigger payment.
    await db.query(
      "INSERT INTO users (full_name, email, password_hash, plan_tier) VALUES (?, ?, ?, 'Free')",
      [name, email, hashedPassword]
    );

    const [user] = await db.query("SELECT id, full_name, email, plan_tier FROM users WHERE email = ?", [email]);
    
    res.status(201).json({ 
      user: user[0],
      redirectTo: planTier !== "Free" ? "payment" : "dashboard" 
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});

// 3️⃣ MANUAL LOGIN (Added)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const { password_hash, ...userData } = user;
    
    // Logic: If they are on a Free tier but previously tried to sign up for Premium,
    // you could check a 'pending_tier' column here. For now, we assume simple login.
    res.status(200).json({ 
      user: userData,
      redirectTo: "dashboard"
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// 4️⃣ GOOGLE LOGIN (Updated with redirect logic)
router.post("/google-login", async (req, res) => {
  const { token, planTier } = req.body; // planTier comes from frontend selection
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture } = ticket.getPayload();

    let [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    let user = users[0];

    if (!user) {
      const [result] = await db.query(
        "INSERT INTO users (full_name, email, plan_tier) VALUES (?, ?, 'Free')",
        [name, email]
      );
      const [newUser] = await db.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
      user = newUser[0];
    }

    const { password_hash, ...userData } = user;

    // Check if they need to pay: If they selected a paid plan but the DB says 'Free'
    const needsPayment = planTier && planTier !== "Free" && user.plan_tier === "Free";

    res.status(200).json({ 
      user: { ...userData, avatar: picture },
      redirectTo: needsPayment ? "payment" : "dashboard"
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Google Auth failed" });
  }
});

// 5️⃣ VERIFY PAYMENT & UPGRADE
router.post("/verify-payment", async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status === "succeeded") {
      const email = intent.metadata.user_email;
      const plan = intent.metadata.planTier;
      
      await db.query("UPDATE users SET plan_tier = ? WHERE email = ?", [plan, email]);
      const [updated] = await db.query("SELECT id, full_name, email, plan_tier FROM users WHERE email = ?", [email]);
      
      res.status(200).json({ success: true, user: updated[0] });
    } else {
      res.status(400).json({ message: "Payment not verified" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;