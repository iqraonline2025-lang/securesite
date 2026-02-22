import mongoose from "mongoose";

const scamAlertSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  severity: { type: String, default: "Medium" },
}, { timestamps: true });

export default mongoose.model("ScamAlert", scamAlertSchema);