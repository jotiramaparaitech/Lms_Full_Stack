import express from "express";
import {
  addCourse,
  updateCourse,
  deleteCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
  removeStudentAccess, // ✅ new import
  getAllStudents, // ✅ added
  assignCourse, // ✅ added
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

// -----------------------------
// Remove Student Access from Course ✅
// -----------------------------
educatorRouter.delete(
  "/remove-student/:courseId/:studentId",
  protectEducator,
  removeStudentAccess
);

// -----------------------------
// ✅ Get All Students
// -----------------------------
educatorRouter.get("/all-students", protectEducator, getAllStudents);

// -----------------------------
// ✅ Assign Course to Student
// -----------------------------
educatorRouter.post("/assign-course", protectEducator, assignCourse);

export default educatorRouter;
