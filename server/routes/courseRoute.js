import express from "express";
import {
  getAllCourse,
  getCourseId,
  uploadCoursePdf,
  getEducatorDashboard,
} from "../controllers/courseController.js";

import {
  createOrder,
  verifyPayment,
} from "../controllers/razorpayController.js";
import { protect, isEducator } from "../middlewares/authMiddleware.js";

const courseRouter = express.Router();

// Get all courses
courseRouter.get("/all", getAllCourse);

// Get single course
courseRouter.get("/:id", getCourseId);

// Add PDF
courseRouter.post("/:courseId/add-pdf", protect, isEducator, uploadCoursePdf);

// Educator dashboard
courseRouter.get(
  "/educator/dashboard",
  protect,
  isEducator,
  getEducatorDashboard
);

// Razorpay order creation
courseRouter.post("/purchase/create-order", protect, createOrder);

// Razorpay payment verification
courseRouter.post("/purchase/verify-payment", protect, verifyPayment);

export default courseRouter;
