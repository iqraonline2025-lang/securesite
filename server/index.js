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
  "https://securesite-tend.onrender.com",
  "https://securesite-send.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
  },
  credentials: true
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

app.get("/", (req, res) => {
  res.send("🚀 Shield Backend is Running...");
});

// -------------------------
// 5️⃣ Error Handling
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
  console.log(`🚀 Shield Server running on port ${PORT}`);
});
