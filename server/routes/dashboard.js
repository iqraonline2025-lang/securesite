// routes/dashboard.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// --- 1. GET DASHBOARD CONFIGURATION ---
router.get("/config/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Search for the user
    let user = await User.findOne({ email });

    // AUTO-CREATE if not exists
    if (!user) {
      user = await User.create({ email });
    }

    // Normalize Tier
    const rawTier = user.plan_tier || "Free";
    const tier = rawTier.charAt(0).toUpperCase() + rawTier.slice(1).toLowerCase();

    // Build dashboard config
    const dashboardConfig = {
      email: user.email,
      name: user.full_name,
      tier,
      permissions: {
        canAccessAdvancedDetection: ["Premium", "Business", "Lab"].includes(tier),
        canAccessAnalytics: ["Premium", "Business", "Lab"].includes(tier),
        canManageTeams: tier === "Business",
        canMonitorDevices: ["Business", "Lab"].includes(tier),
      },
      features: {
        scamAlerts: true,
        safetyTips: true,
        advancedDetection: ["Premium", "Business", "Lab"].includes(tier),
        analytics: ["Premium", "Business", "Lab"].includes(tier),
        multiDevice: ["Business", "Lab"].includes(tier),
        teamManagement: tier === "Business",
        labTools: tier === "Lab"
      },
      stats: {
        threatsBlocked: user.total_alerts,
        safetyScore: user.risk_score,
        scamAlerts: "Active",
        uptime: "99.9%",
        threatLevel: (user.risk_score < 50) ? "High" : "Low"
      }
    };

    res.status(200).json(dashboardConfig);

  } catch (err) {
    console.error("Dashboard Config Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// --- 2. EXECUTE SYSTEM SCAN (UPDATING STATS) ---
router.post("/scan/:email", async (req, res) => {
  const { email } = req.params;

  try {
    // Simulate scan results
    const newThreatsFound = Math.floor(Math.random() * 4) + 1; // 1-4
    const scoreBoost = 2;

    // Update user document
    const user = await User.findOneAndUpdate(
      { email },
      {
        $inc: { total_alerts: newThreatsFound },
        $min: { risk_score: 100 }, // ensure risk_score <= 100
        $set: { risk_score: Math.min(100, (await User.findOne({ email })).risk_score + scoreBoost) }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Operator not found in registry." });
    }

    res.status(200).json({ 
      message: "Deep Scan Successful",
      threatsBlocked: newThreatsFound,
      systemStatus: "Optimized"
    });

  } catch (err) {
    console.error("Scan Error:", err);
    res.status(500).json({ message: "Scan Protocol Failed" });
  }
});

export default router;