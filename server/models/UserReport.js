import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  analysis_result: { type: String, required: true }, // e.g., "Malicious", "Safe"
  details: { type: String },
}, { timestamps: true });

export default mongoose.model("UserReport", reportSchema);