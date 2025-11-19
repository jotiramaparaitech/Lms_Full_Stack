import express from "express";
import { requireAuth } from "@clerk/express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/razorpayController.js";

const router = express.Router();

// -------------------- Create Razorpay Order --------------------
router.post("/create-order", requireAuth(), createOrder);

// -------------------- Verify Razorpay Payment --------------------
router.post("/verify-payment", requireAuth(), verifyPayment);

export default router;
