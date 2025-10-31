import express from "express";
import os from "os";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import { clerkMiddleware, requireAuth } from "@clerk/express"; // ✅ FIXED import
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";

// Initialize Express
const app = express();

// Connect to database & cloudinary
await connectDB();
await connectCloudinary();

// ✅ Global CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173",
      "https://lms-full-stack-beta-nine.vercel.app",
      "https://lms-full-stack-server-ten-navy.vercel.app",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle preflight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.sendStatus(200);
});

// ✅ Initialize Clerk middleware
app.use(clerkMiddleware());

// ---------------- ROUTES ----------------
app.get("/", (req, res) => res.send("API Working ✅"));

// ✅ Webhooks (public)
app.post("/clerk", express.json(), clerkWebhooks);
app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// ✅ Protected Routes
app.use("/api/educator", express.json(), requireAuth(), educatorRouter);
app.use("/api/user", express.json(), requireAuth(), userRouter);

// ✅ Public Routes
app.use("/api/course", express.json(), courseRouter);

// ✅ Debug route
app.get("/api/network", (req, res) => res.json(os.networkInterfaces()));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
