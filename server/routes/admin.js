// routes/admin.js
import express from "express";
import User from "../models/User.js";
import UserReport from "../models/UserReport.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({}, "full_name email plan_tier createdAt").lean();

    // Fetch all reports, sorted by createdAt descending
    const reports = await UserReport.find({}).sort({ createdAt: -1 }).lean();

    // Calculate simple stats
    const stats = {
      totalUsers: users.length,
      totalReports: reports.length,
      maliciousFound: reports.filter(r => r.analysis_result === 'Malicious').length
    };

    res.json({ users, reports, stats });
  } catch (err) {
    console.error("Admin data fetch failed:", err);
    res.status(500).json({ error: "Admin data fetch failed" });
  }
});

export default router;