import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Get all team members for a business owner
router.get("/:ownerId", async (req, res) => {
  try {
    const [members] = await db.query(
      "SELECT * FROM team_members WHERE owner_id = ?", 
      [req.params.ownerId]
    );
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Error fetching team" });
  }
});

// Add a new member
router.post("/add", async (req, res) => {
  const { ownerId, name, email } = req.body;
  try {
    await db.query(
      "INSERT INTO team_members (owner_id, member_name, member_email) VALUES (?, ?, ?)",
      [ownerId, name, email]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error adding member" });
  }
});

export default router;