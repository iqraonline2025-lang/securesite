import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, full_name, email, plan_tier, created_at FROM users");
    const [reports] = await db.query("SELECT * FROM user_reports ORDER BY created_at DESC");
    
    // Calculate simple stats
    const stats = {
      totalUsers: users.length,
      totalReports: reports.length,
      maliciousFound: reports.filter(r => r.analysis_result === 'Malicious').length
    };

    res.json({ users, reports, stats });
  } catch (err) {
    res.status(500).json({ error: "Admin data fetch failed" });
  }
});

export default router;