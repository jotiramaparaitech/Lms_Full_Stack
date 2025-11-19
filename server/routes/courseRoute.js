import express from "express";
import {
  getAllCourse,
  getCourseId,
  uploadCoursePdf,
  getEducatorDashboard,
} from "../controllers/courseController.js";

import { protect, isEducator } from "../middlewares/authMiddleware.js";

// ⬅️ NEW Razorpay controllers
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/razorpayPurchaseController.js";

const courseRouter = express.Router();

// -------------------- Get All Courses --------------------
courseRouter.get("/all", getAllCourse);

// -------------------- Get Course by ID --------------------
courseRouter.get("/:id", getCourseId);

// -------------------- Add / Update Course PDF Link --------------------
courseRouter.post("/:courseId/add-pdf", protect, isEducator, uploadCoursePdf);

// -------------------- Educator Dashboard --------------------
courseRouter.get(
  "/educator/dashboard",
  protect,
  isEducator,
  getEducatorDashboard
);

// -------------------- Razorpay Order Creation --------------------
courseRouter.post("/purchase/create-order", protect, createRazorpayOrder);

// -------------------- Razorpay Payment Verification --------------------
courseRouter.post("/purchase/verify-payment", protect, verifyRazorpayPayment);

export default courseRouter;
