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
      unique: true, // This automatically creates a high-performance index
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },

    // Matches the field name used in your bcrypt logic in auth.js
    password: {
      type: String,
      default: null
    },

    plan_tier: {
      type: String,
      enum: ["free", "pro", "premium", "business", "accessibility", "lab"],
      lowercase: true, 
      default: "free"
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

// Removed the manual index here to fix the "Duplicate schema index" warning.

export default mongoose.model("User", userSchema);