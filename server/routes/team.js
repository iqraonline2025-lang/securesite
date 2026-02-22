import express from "express";
import TeamMember from "../models/TeamMember.js";

const router = express.Router();

// GET: All team members for a business owner
router.get("/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const members = await TeamMember.find({ ownerId }).sort({ createdAt: -1 }).lean();
    res.json(members);
  } catch (err) {
    console.error("Team Fetch Error:", err);
    res.status(500).json({ message: "Error fetching team" });
  }
});

// POST: Add a new team member
router.post("/add", async (req, res) => {
  try {
    const { ownerId, name, email } = req.body;

    const newMember = await TeamMember.create({
      ownerId,
      memberName: name,
      memberEmail: email
    });

    res.status(201).json({ success: true, member: newMember });
  } catch (err) {
    console.error("Add Member Error:", err);
    res.status(500).json({ message: "Error adding member" });
  }
});

export default router;