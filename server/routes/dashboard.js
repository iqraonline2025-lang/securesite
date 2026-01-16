import express from "express";
import db from "../config/db.js";

const router = express.Router();

// --- 1. GET DASHBOARD CONFIGURATION ---
router.get("/config/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Search for the user in the database
    let [users] = await db.query(
      "SELECT id, full_name, plan_tier, total_alerts, risk_score FROM users WHERE email = ?", 
      [email]
    );

    // AUTO-CREATE: If the email is NOT in the database, add it as a new "Free" user
    if (users.length === 0) {
      await db.query(
        "INSERT INTO users (full_name, email, plan_tier, total_alerts, risk_score) VALUES (?, ?, 'Free', 0, 85)",
        ["New Operator", email] 
      );

      [users] = await db.query(
        "SELECT id, full_name, plan_tier, total_alerts, risk_score FROM users WHERE email = ?", 
        [email]
      );
    }

    const user = users[0];
    
    // Normalize the Tier (Ensures 'free' becomes 'Free')
    const rawTier = user.plan_tier || "Free";
    const tier = rawTier.charAt(0).toUpperCase() + rawTier.slice(1).toLowerCase();

    // Build the response with REAL stats from SQL
    const dashboardConfig = {
      email: email, // Returned so frontend can use it for scans
      name: user.full_name,
      tier: tier, 
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
        threatsBlocked: user.total_alerts || 0,
        safetyScore: user.risk_score || 0,
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
    // Generate some "simulated" scan results
    const newThreatsFound = Math.floor(Math.random() * 4) + 1; // 1-4 new threats
    const scoreBoost = 2; // Improve safety score by 2% per scan

    // Update the database
    // total_alerts increases, risk_score increases (maxes at 100)
    const [result] = await db.query(
      `UPDATE users 
       SET total_alerts = total_alerts + ?, 
           risk_score = LEAST(risk_score + ?, 100) 
       WHERE email = ?`,
      [newThreatsFound, scoreBoost, email]
    );

    if (result.affectedRows === 0) {
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