import express from "express";
import UserAsset from "../models/UserAsset.js";

const router = express.Router();

router.get("/:email", async (req, res) => {
  try {
    const assets = await UserAsset.find({ ownerEmail: req.params.email })
      .sort({ createdAt: -1 }) // newest first
      .lean();

    res.status(200).json(assets);
  } catch (err) {
    console.error("Assets Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

export default router;