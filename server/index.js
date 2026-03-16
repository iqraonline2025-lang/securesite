import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import { connectDB } from "./config/db.js";

const app = express();

/* ================= CORS ================= */

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // Use a clear name for your frontend URL
  process.env.NEXT_PUBLIC_API_URL, 
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      // Fixed: uses indexOf or includes to check the array properly
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ================= BODY PARSING ================= */

app.use(express.json());

/* ================= REQUEST LOGGER ================= */

app.use((req, res, next) => {
  console.log(`📡 ${req.method} → ${req.url}`);
  next();
});

/* ================= ROUTES ================= */

app.use("/api", authRoutes);

/* ================= 404 HANDLER (FIXES THE JSON ERROR) ================= */

// This ensures if a route is missing (like /api/verify-payment), 
// you get JSON back instead of HTML.
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found.` 
  });
});

/* ================= GLOBAL ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || "Internal Server Error" 
  });
});

/* ================= SERVER START ================= */

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB CONNECTION FAILED:", err.message);
    process.exit(1);
  });