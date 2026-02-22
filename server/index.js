// index.js
import "dotenv/config"; // ⭐ MUST be first
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import alertRoutes from "./routes/alerts.js";
import assetRoutes from "./routes/assets.js";
import reportRoutes from "./routes/reports.js";

import { connectDB } from "./config/db.js";

const app = express();

// -------------------------
// 1️⃣ Allowed Origins (CORS)
// -------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://securesite-6sge.vercel.app",   // your Vercel frontend
  "https://securesite-5.onrender.com"     // backend self (if needed)
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS blocked"));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// -------------------------
// 2️⃣ COOP / COEP headers for Google login / postMessage
// -------------------------
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// -------------------------
// 3️⃣ Middleware
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------
// 4️⃣ Static uploads
// -------------------------
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------
// 5️⃣ API Routes
// -------------------------
app.use("/api", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/reports", reportRoutes);

// -------------------------
// 6️⃣ Test MongoDB
// -------------------------
app.get("/test-db", async (req, res) => {
  try {
    const mongoose = await connectDB();
    const serverStatus = await mongoose.connection.db.admin().serverStatus();
    res.json({ mongoTime: serverStatus.localTime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// 7️⃣ Serve React frontend (Express 5 safe)
// -------------------------
const clientBuildPath = path.join(__dirname, "client/build");
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  // Important: catch-all route for React SPA
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// -------------------------
// 8️⃣ Root route
// -------------------------
app.get("/", (req, res) => {
  res.send("🚀 Shield Backend is Running with MongoDB!");
});

// -------------------------
// 9️⃣ Error handling
// -------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// -------------------------
// 🔟 Environment settings
// -------------------------
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// -------------------------
// 1️⃣1️⃣ Connect DB → Start server
// -------------------------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Shield Server running on port ${PORT}`);
  });
});
