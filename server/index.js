import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // Required for static files
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import alertRoutes from "./routes/alerts.js";
import assetRoutes from "./routes/assets.js";
import reportRoutes from "./routes/reports.js"; // NEW: Import Report/Analysis Routes

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://securesite-sd8e.vercel.app', 'https://securesite-server.onrender.com'] 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// NEW: Make the 'uploads' folder public so screenshots can be viewed in the UI
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/reports", reportRoutes); // NEW: Attach Report Routes

app.get("/", (req, res) => {
  res.send("Shield Backend is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Shield Server running on http://localhost:${PORT}`);
});
