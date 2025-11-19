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

// Get a single course
courseRouter.get("/:id", getCourseId);

// Upload PDF
courseRouter.post("/:courseId/add-pdf", protect, isEducator, uploadCoursePdf);

// Educator dashboard
courseRouter.get(
  "/educator/dashboard",
  protect,
  isEducator,
  getEducatorDashboard
);

// Razorpay order (create)
courseRouter.post("/purchase/create-order", protect, createOrder);

// Razorpay payment verify
courseRouter.post("/purchase/verify-payment", protect, verifyPayment);

export default courseRouter;
