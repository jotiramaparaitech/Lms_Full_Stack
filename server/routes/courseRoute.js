import express from "express";
import {
  getAllCourse,
  getCourseId,
  uploadCoursePdf,
  getEducatorDashboard,
  // createStripeSession, // ❌ Removed: not present in courseController.js
} from "../controllers/courseController.js";
import { protect, isEducator } from "../middlewares/authMiddleware.js";

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

// -------------------- Stripe Checkout Session --------------------
// If you move createStripeSession to courseController.js, uncomment below
// courseRouter.post("/purchase/stripe-session", protect, createStripeSession);

export default courseRouter;
