import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import { connectDB } from "./config/db.js";

const app = express();

/* ================= 1. FIXED CORS SETUP ================= */

const allowedOrigins = [
  "http://localhost:3000",
  "https://securesite-eta.vercel.app", // FIXED: Removed the trailing slash "/"
  "https://securesite-12.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // This will show up in your Render logs if a request is blocked
        console.error(`🚫 CORS Blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ================= 2. MIDDLEWARE ================= */

app.use(express.json());

// Request Logger: Check your Render logs to see if requests are hitting the server
app.use((req, res, next) => {
  console.log(`📡 ${req.method} → ${req.url}`);
  next();
});

/* ================= 3. ROUTES ================= */

app.use("/api", authRoutes);

/* ================= 4. ERROR HANDLING ================= */

// Handles 404s for missing routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found.` 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.stack);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || "Internal Server Error" 
  });
});

/* ================= 5. SERVER START ================= */

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB CONNECTION FAILED:", err.message);
    process.exit(1);
  });