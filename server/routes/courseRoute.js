import express from "express";
import {
  getAllCourse,
  getCourseId,
  uploadCoursePdf,
  getEducatorDashboard,
} from "../controllers/courseController.js";
import { createStripeSession } from "../controllers/stripeController.js"; // ✅ Stripe controller
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
courseRouter.post("/purchase/stripe-session", protect, createStripeSession);

export default courseRouter;
