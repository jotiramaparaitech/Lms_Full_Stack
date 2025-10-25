import express from "express";
import {
  addCourse,
  updateCourse,
  deleteCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authMiddleware.js";

const educatorRouter = express.Router();

// -----------------------------
// Add Educator Role
// -----------------------------
educatorRouter.get("/update-role", updateRoleToEducator);

// -----------------------------
// Add Course
// -----------------------------
educatorRouter.post(
  "/add-course",
  protectEducator,
  // accept one image file (thumbnail) and multiple pdf files (field name: 'pdfs')
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  addCourse
);

// -----------------------------
// Get Educator Courses
// -----------------------------
educatorRouter.get("/courses", protectEducator, getEducatorCourses);

// -----------------------------
// Update Course
// -----------------------------
educatorRouter.put(
  "/course/:id",
  protectEducator,
  // allow updating thumbnail and PDF uploads
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  updateCourse
);

// -----------------------------
// Delete Course
// -----------------------------
educatorRouter.delete("/course/:id", protectEducator, deleteCourse);

// -----------------------------
// Educator Dashboard Data
// -----------------------------
educatorRouter.get("/dashboard", protectEducator, educatorDashboardData);

// -----------------------------
// Get Enrolled Students Data
// -----------------------------
educatorRouter.get(
  "/enrolled-students",
  protectEducator,
  getEnrolledStudentsData
);

export default educatorRouter;
