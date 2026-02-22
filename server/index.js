// index.js
import "dotenv/config";
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
// 1️⃣ CORS Setup (fixed for Express 5)
// -------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://securesite-6sge.vercel.app",
  "https://securesite-5.onrender.com"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS blocked"));
  },
  credentials: true,
  optionsSuccessStatus: 200 // lets preflight requests succeed
}));

// -------------------------
// 2️⃣ Middleware
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------
// 3️⃣ Static Files
// -------------------------
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------
// 4️⃣ Routes
// -------------------------
app.use("/api", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/reports", reportRoutes);

// -------------------------
// 5️⃣ Test Route (MongoDB)
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
// 6️⃣ Serve React Frontend (Express 5 safe)
// -------------------------
const clientBuildPath = path.join(__dirname, "client/build");
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// -------------------------
// 7️⃣ Root
// -------------------------
app.get("/", (req, res) => {
  res.send("🚀 Shield Backend is Running with MongoDB!");
});

// -------------------------
// 8️⃣ Error Handling
// -------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message
  });
});

// -------------------------
// 9️⃣ Environment Settings
// -------------------------
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// -------------------------
// 🔟 Connect DB → Start Server
// -------------------------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Shield Server running on port ${PORT}`);
  });
});
