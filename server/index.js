import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import { connectDB } from "./config/db.js";

const app = express();

/* ================= 1. CORS SETUP ================= */

const allowedOrigins = [
  "http://localhost:3000",
  "https://iqraonline2025-lang-securesite.vercel.app",
  "https://securesite-12.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`🚫 CORS Blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

/* ================= 2. MIDDLEWARE ================= */

app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`📡 ${req.method} → ${req.url}`);
  next();
});

/* ================= 3. ROUTES ================= */

// ✅ ROOT ROUTE (fixes your issue)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running 🚀"
  });
});

// ✅ API ROUTES
app.use("/api", authRoutes);

/* ================= 4. ERROR HANDLING ================= */

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* ================= 5. SERVER START ================= */

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB CONNECTION FAILED:", err.message);
    process.exit(1);
  });
