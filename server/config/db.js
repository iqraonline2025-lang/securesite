// server/config/db.js
import mongoose from "mongoose";

/* ==============================
   🚀 MongoDB Connection
============================== */
export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI missing in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if DB unreachable
      socketTimeoutMS: 45000
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    /* ==============================
       📡 Connection Events (optional but useful)
    ============================== */

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
    });

    return mongoose; // used by /test-db route

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};