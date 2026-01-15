import express from "express";
import os from "os";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import { clerkWebhooks } from "./controllers/webhooks.js"; // Stripe removed
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";

// ⬅️ NEW — Razorpay Route
import razorpayRoute from "./routes/razorpayRoute.js";

import ticketRoutes from "./routes/ticketRoutes.js";





// Initialize Express
const app = express();

// Connect to database & cloudinary
await connectDB();
await connectCloudinary();

// Validate Razorpay configuration on startup (non-blocking)
try {
  const { getRazorpayClient } = await import("./utils/razorpayClient.js");
  getRazorpayClient();
} catch (error) {
  // Razorpay configuration error - handled silently
}

// ------------------ CORS ------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173",
      // "https://lms-full-stack-beta-nine.vercel.app",
      // "https://lms-full-stack-server-ten-navy.vercel.app",
      "https://vercel.com/jotiram-shindes-projects/lms-full-stack/GZquJrFatXvcawsjGoNuWLmJ1rcq",
      "https://lms-full-stack-tan.vercel.app",
      "https://lms-full-stack-mcq7.vercel.app",
      "https://www.aparaitech.org",
      "https://aparaitech.org",
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

// Preflight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.sendStatus(200);
});

// Clerk middleware
app.use(clerkMiddleware());

// ------------------ ROUTES ------------------
app.get("/", (req, res) => res.send("API Working ✅"));

// Webhooks (public)
app.post("/clerk", express.json(), clerkWebhooks);

// Protected routes
app.use("/api/educator", express.json(), requireAuth(), educatorRouter);
app.use("/api/user", express.json(), requireAuth(), userRouter);

// Public course routes
app.use("/api/course", express.json(), courseRouter);

// ⬅️ NEW — Razorpay Payment Routes
app.use("/api/razorpay", express.json(), razorpayRoute);

app.use("/api/tickets", express.json(), ticketRoutes);

// Debug network
app.get("/api/network", (req, res) => res.json(os.networkInterfaces()));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
