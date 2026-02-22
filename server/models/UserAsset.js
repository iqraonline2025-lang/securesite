import mongoose from "mongoose";

const userAssetSchema = new mongoose.Schema({
  ownerEmail: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: "Unknown" }, // e.g., device, account, etc.
  value: { type: String },
}, { timestamps: true });

export default mongoose.model("UserAsset", userAssetSchema);