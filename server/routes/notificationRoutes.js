import express from "express";
import { requireAuth } from "@clerk/express"; // ✅ Using the correct Clerk import
import { saveToken } from "../controllers/notificationController.js";

const router = express.Router();

// -------------------- Save Notification Token --------------------
// POST http://localhost:5000/api/notifications/save-token
router.post("/save-token", requireAuth(), saveToken);

export default router;