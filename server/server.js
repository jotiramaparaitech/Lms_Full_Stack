import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";

import { clerkMiddleware, requireAuth } from "@clerk/express";

import userRouter from "./routes/userRoutes.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import razorpayRoute from "./routes/razorpayRoute.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import teamRouter from "./routes/teamRoutes.js";
import todoRouter from "./routes/todoRoutes.js";
import calendarRouter from "./routes/calendarEventRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import webhookRouter from "./routes/webhookRoutes.js";

import admin from "./configs/firebase.js";

import http from "http";
import { Server } from "socket.io";

// ------------------ APP INIT ------------------
const app = express();
const server = http.createServer(app);

// ------------------ DB & CLOUDINARY ------------------
await connectDB();
await connectCloudinary();

// ------------------ CORS ------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : [
    "http://localhost:5173",
    "https://www.aparaitech.org",
    "https://aparaitech.org",
    "https://lms.aparaitech.org",
  ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ------------------ PREFLIGHT ------------------
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.sendStatus(200);
});



app.use("/api/webhooks", webhookRouter);

app.use(clerkMiddleware());

// ------------------ BASE ROUTE ------------------
app.get("/", (req, res) => res.send("API Working ✅"));




// ------------------ API ROUTES ------------------
app.use("/api/educator", express.json(), requireAuth(), educatorRouter);
app.use("/api/course", express.json(), courseRouter);
app.use("/api/razorpay", express.json(), razorpayRoute);
app.use("/api/tickets", express.json(), ticketRoutes);
app.use("/api/assessment", express.json(), assessmentRoutes);
app.use("/api/teams", express.json(), teamRouter);
app.use("/api/todo", express.json(), requireAuth(), todoRouter);
app.use("/api/user", express.json(), requireAuth(), userRouter);
app.use("/api/calendar-event", express.json(), calendarRouter);
app.use("/api/notifications", express.json(), notificationRoutes);
app.use("/api/attendance", express.json(), requireAuth(), attendanceRoutes);

app.use("/api", subscribeRoutes);
app.use("/api", supportRoutes);

// ------------------ SOCKET.IO ------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);

  socket.on("join-team", (teamId) => {
    socket.join(teamId);
  });

  socket.on("disconnect", () => {
  });
});

// ------------------ SERVER START ------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running with Socket.IO on port ${PORT}`)
);
