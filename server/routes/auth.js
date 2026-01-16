import express from "express";
import bcrypt from "bcrypt";
import db from "../config/db.js";
import { OAuth2Client } from "google-auth-library";
import Stripe from "stripe";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- 1. CREATE PAYMENT INTENT ---
router.post("/create-payment-intent", async (req, res) => {
  const { planTier, email } = req.body;
  const prices = { "Premium": 900, "Business": 4900, "Lab": 2500 };
  const amount = prices[planTier];

  if (!amount) return res.status(400).json({ message: "Invalid plan tier" });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      metadata: { user_email: email, planTier: planTier },
      automatic_payment_methods: { enabled: true },
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ message: "Stripe Error" });
  }
});

// --- 2. SIGNUP ---
router.post("/signup", async (req, res) => {
  const { name, email, password, planTier } = req.body;
  try {
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalTier = planTier || "Free";
    
    await db.query(
      "INSERT INTO users (full_name, email, password_hash, plan_tier) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, finalTier]
    );

    const [newUser] = await db.query("SELECT id, full_name, email, plan_tier FROM users WHERE email = ?", [email]);
    const redirectTo = (finalTier !== "Free") ? "payment" : "dashboard";
    
    res.status(201).json({ user: newUser[0], redirectTo });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Signup Error" });
  }
});

// --- 3. LOGIN ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(400).json({ message: "User not found" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const { password_hash, ...userData } = user;
    const redirectTo = (user.plan_tier !== "Free") ? "payment" : "dashboard";
    
    res.status(200).json({ user: userData, redirectTo });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login Error" });
  }
});

// --- 4. VERIFY PAYMENT ---
router.post("/verify-payment", async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status === "succeeded") {
      const email = intent.metadata.user_email;
      const plan = intent.metadata.planTier;
      await db.query("UPDATE users SET plan_tier = ? WHERE email = ?", [plan, email]);
      res.status(200).json({ success: true, plan: plan });
    } else {
      res.status(400).json({ success: false, message: "Payment incomplete" });
    }
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ message: "Verification Error" });
  }
});

// --- 5. GOOGLE LOGIN ---
router.post("/google-login", async (req, res) => {
  const { token, planTier } = req.body; 
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email, name, picture } = ticket.getPayload();
    let [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    let user = users[0];

    if (!user) {
      const selectedTier = planTier || "Free";
      const [result] = await db.query(
        "INSERT INTO users (full_name, email, plan_tier) VALUES (?, ?, ?)",
        [name, email, selectedTier]
      );
      const [newUser] = await db.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
      user = newUser[0];
    }

    const redirectTo = (user.plan_tier !== "Free") ? "payment" : "dashboard";
    const { password_hash, ...userData } = user;
    
    res.status(200).json({ 
      user: { ...userData, avatar: picture }, 
      redirectTo 
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ message: "Google auth failed" });
  }
});

// --- 6. GET SCAM ALERTS ---
router.get("/alerts/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM alerts WHERE user_email = ? ORDER BY created_at DESC", 
      [email]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch Alerts Error:", err);
    res.status(500).json({ message: "Failed to fetch threat intelligence" });
  }
});

// --- 7. UPDATE PASSWORD ---
router.post("/update-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE email = ?", [hashedPassword, email]);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update Password Error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// --- 8. UPGRADE PLAN ---
router.post("/upgrade-plan", async (req, res) => {
  const { email, newTier } = req.body;
  try {
    await db.query("UPDATE users SET plan_tier = ? WHERE email = ?", [newTier, email]);
    res.json({ message: `System upgraded to ${newTier}` });
  } catch (err) {
    console.error("Upgrade Plan Error:", err);
    res.status(500).json({ error: "Upgrade failed" });
  }
});

export default router;