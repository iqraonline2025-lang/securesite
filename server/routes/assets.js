import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/:email", async (req, res) => {
  try {
    const [assets] = await db.query(
      "SELECT * FROM user_assets WHERE owner_email = ?", 
      [req.params.email]
    );
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

export default router;