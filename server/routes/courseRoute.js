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
  checkRazorpayConfig,
} from "../controllers/razorpayController.js";

import { protect, isEducator } from "../middlewares/authMiddleware.js";

const courseRouter = express.Router();

// Get all courses
courseRouter.get("/all", getAllCourse);

// Debug endpoint - get all courses (including unpublished) - remove in production
courseRouter.get("/debug/all", async (req, res) => {
  try {
    const Course = (await import("../models/Course.js")).default;
    const allCourses = await Course.find({}).select("courseTitle isPublished educator").lean();
    res.json({ 
      success: true, 
      total: allCourses.length,
      published: allCourses.filter(c => c.isPublished).length,
      unpublished: allCourses.filter(c => !c.isPublished).length,
      courses: allCourses 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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

// Razorpay health check (for debugging)
courseRouter.get("/purchase/check-config", checkRazorpayConfig);

// Razorpay order (create)
courseRouter.post("/purchase/create-order", protect, createOrder);

// Razorpay payment verify
courseRouter.post("/purchase/verify-payment", protect, verifyPayment);

export default courseRouter;
