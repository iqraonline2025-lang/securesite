import express from "express";
import multer from "multer";
import path from "path";
import UserReport from "../models/UserReport.js";

const router = express.Router();

// Configure storage for screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// POST: Submit a new scam for analysis
router.post("/check", upload.single("screenshot"), async (req, res) => {
  try {
    const { email, phone, message } = req.body;
    const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Simulated AI Logic
    const keywords = ["urgent", "bank", "password", "winner", "click", "locked", "verify"];
    const isScam = keywords.some(word => message?.toLowerCase().includes(word));
    const result = isScam ? "Malicious" : "Suspicious";

    await UserReport.create({
      userEmail: email,
      analysis_result: result,
      details: message,
      screenshotUrl
    });

    res.json({
      result,
      message: isScam ? "High-risk threat detected!" : "Analysis complete."
    });

  } catch (err) {
    console.error("Report Submission Error:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// GET: History of reports for a specific user
router.get("/history/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const reports = await UserReport.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .lean();

    res.json(reports);

  } catch (err) {
    console.error("Report History Error:", err);
    res.status(500).json({ error: "Could not fetch report history" });
  }
});

export default router;