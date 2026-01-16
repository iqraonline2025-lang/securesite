import express from "express";
import db from "../config/db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure storage for screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage: storage });

// POST: Submit a new scam for analysis
router.post("/check", upload.single('screenshot'), async (req, res) => {
  try {
    const { email, phone, message } = req.body;
    const screenshot_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Simulated AI Logic
    const keywords = ['urgent', 'bank', 'password', 'winner', 'click', 'locked', 'verify'];
    const isScam = keywords.some(word => message?.toLowerCase().includes(word));
    const result = isScam ? 'Malicious' : 'Suspicious';

    await db.query(
      "INSERT INTO user_reports (user_email, phone_number, scam_text, screenshot_url, analysis_result) VALUES (?, ?, ?, ?, ?)",
      [email, phone, message, screenshot_url, result]
    );

    res.json({ result, message: isScam ? "High-risk threat detected!" : "Analysis complete." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// NEW: GET History of reports for a specific user
router.get("/history/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM user_reports WHERE user_email = ? ORDER BY created_at DESC",
      [email]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch report history" });
  }
});

export default router;