import express from "express";
import {
  getAllCourse,
  getCourseId,
  uploadCoursePdf, // ✅ handles saving PDF link to MongoDB
  getEducatorDashboard, // ✅ new controller added
} from "../controllers/courseController.js";
import { protect, isEducator } from "../middlewares/authMiddleware.js";

const courseRouter = express.Router();

// -------------------- Get All Courses --------------------
courseRouter.get("/all", getAllCourse);

// -------------------- Get Course by ID --------------------
courseRouter.get("/:id", getCourseId);

// -------------------- Add / Update Course PDF Link --------------------
// ✅ Educators only — saves or updates `pdfLink` field in the Course document
courseRouter.post("/:courseId/add-pdf", protect, isEducator, uploadCoursePdf);

// -------------------- Educator Dashboard --------------------
// ✅ Shows courses added & total enrolled students for logged-in educator
courseRouter.get(
  "/educator/dashboard",
  protect,
  isEducator,
  getEducatorDashboard
);

export default courseRouter;
