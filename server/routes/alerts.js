// routes/alerts.js
import express from "express";
import ScamAlert from "../models/ScamAlert.js";

const router = express.Router();

// Fetch alerts for a specific email
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const alerts = await ScamAlert.find({ userEmail: email })
      .sort({ createdAt: -1 }) // newest first
      .lean();

    res.status(200).json(alerts);
  } catch (err) {
    console.error("Alerts Fetch Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;