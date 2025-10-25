import express from "express";
import {
  getAllCourse,
  getCourseId,
  uploadCoursePdf, // handles saving PDF links to MongoDB
} from "../controllers/courseController.js";
import { protect, isEducator } from "../middlewares/authMiddleware.js";

const courseRouter = express.Router();

// -------------------- Get All Courses --------------------
courseRouter.get("/all", getAllCourse);

// -------------------- Get Course by ID --------------------
courseRouter.get("/:id", getCourseId);

// -------------------- Add Course PDF (via direct link) --------------------
// ✅ No multer, no Cloudinary — saves directly in MongoDB
courseRouter.post("/:courseId/add-pdf", protect, isEducator, uploadCoursePdf);

export default courseRouter;
