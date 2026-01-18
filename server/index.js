import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import alertRoutes from "./routes/alerts.js";
import assetRoutes from "./routes/assets.js";
import reportRoutes from "./routes/reports.js";

dotenv.config();
const app = express();

// -------------------------
// 1️⃣ CORS Setup
// -------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://securesite-2fow.vercel.app",
  "https://securesite-tend.onrender.com"
];

app.use(cors({
<<<<<<< HEAD
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
=======
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://securesite-2fow.vercel.app', 'https://securesite-send.onrender.com'] 
    : 'http://localhost:3000',
>>>>>>> d3fa03ea06916ccb0905d0d4a5a60cdaa8b2ff7a
  credentials: true
}));

// -------------------------
// 2️⃣ Middleware
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Good for form submissions

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

app.get("/", (req, res) => {
  res.send("🚀 Shield Backend is Running...");
});

// -------------------------
// 5️⃣ Error Handling (The Missing Piece)
// -------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// -------------------------
// 6️⃣ Environment Settings
// -------------------------
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`🚀 Shield Server running on port ${PORT}`);
});
=======
  console.log(`🚀 Shield Server running on http://localhost:${PORT}`);
});
>>>>>>> d3fa03ea06916ccb0905d0d4a5a60cdaa8b2ff7a
