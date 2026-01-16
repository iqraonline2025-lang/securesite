import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Fetch alerts for a specific email
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const [alerts] = await db.query(
      "SELECT * FROM scam_alerts WHERE user_email = ? ORDER BY created_at DESC", 
      [email]
    );

    res.status(200).json(alerts);
  } catch (err) {
    console.error("Alerts Fetch Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;