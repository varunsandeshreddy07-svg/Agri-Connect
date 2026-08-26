import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

import authRoutes from "./src/server/routes/auth.js";
import listingRoutes from "./src/server/routes/listings.js";
import messageRoutes from "./src/server/routes/messages.js";
import notificationRoutes from "./src/server/routes/notifications.js";
import marketRoutes from "./src/server/routes/market.js";
import uploadRoutes from "./src/server/routes/upload.js";
import weatherRoutes from "./src/server/routes/weather.js";
import aiRoutes from "./src/server/routes/ai.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json({ limit: "10mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/ai", aiRoutes);

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
    weatherApiEnabled: Boolean(process.env.OPENWEATHER_API_KEY),
    version: "1.0.0",
  });
});

// Vite Middleware (dev) or Static serving (production)
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌾 AgriConnect Server running on http://localhost:${PORT}`);
  });
}

start();
