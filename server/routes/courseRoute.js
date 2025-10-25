import express from "express";
import {
  getAllCourse,
  getCourseId,
  uploadCoursePdf, // ✅ handles saving PDF link to MongoDB
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

export default courseRouter;
