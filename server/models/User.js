// server/models/User.js
import mongoose from "mongoose";

/* ==============================
   👤 User Schema
============================== */
const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      default: "New Operator",
      trim: true,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },

    // For manual login (null for Google users)
    password_hash: {
      type: String,
      default: null
    },

    plan_tier: {
      type: String,
      enum: ["Free", "Premium", "Business", "Lab"],
      default: "Free"
    },

    total_alerts: {
      type: Number,
      default: 0,
      min: 0
    },

    risk_score: {
      type: Number,
      default: 85,
      min: 0,
      max: 100
    },

    /* ==============================
       📧 Email Verification
    ============================= */
    verification_code: {
      type: String,
      default: null
    },

    verification_expires: {
      type: Date,
      default: null
    },

    verified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

/* ==============================
   📧 Index for fast email lookup
============================== */
userSchema.index({ email: 1 });

export default mongoose.model("User", userSchema);