import express from "express";
import {
  addCourse,
  updateCourse,
  deleteCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEducatorCourseById,
  getEnrolledStudentsData,
  updateRoleToEducator,
  removeStudentAccess,
  getAllStudents,
  assignCourse,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { requireAuth } from "@clerk/express"; // ✅ FIXED IMPORT

const educatorRouter = express.Router();

// -----------------------------
// Add Educator Role
// -----------------------------
educatorRouter.get("/update-role", requireAuth(), updateRoleToEducator);

// -----------------------------
// Add Course
// -----------------------------
educatorRouter.post(
  "/add-course",
  requireAuth(),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  addCourse
);

// -----------------------------
// Get Educator Courses
// -----------------------------
educatorRouter.get("/courses", requireAuth(), getEducatorCourses);

// -----------------------------
// Get Single Educator Course
// -----------------------------
educatorRouter.get("/course/:id", requireAuth(), getEducatorCourseById);

// -----------------------------
// Update Course
// -----------------------------
educatorRouter.put(
  "/course/:id",
  requireAuth(),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  updateCourse
);

// -----------------------------
// Delete Course
// -----------------------------
educatorRouter.delete("/course/:id", requireAuth(), deleteCourse);

// -----------------------------
// Educator Dashboard Data
// -----------------------------
educatorRouter.get("/dashboard", requireAuth(), educatorDashboardData);

// -----------------------------
// Get Enrolled Students Data
// -----------------------------
educatorRouter.get(
  "/enrolled-students",
  requireAuth(),
  getEnrolledStudentsData
);

// -----------------------------
// Remove Student Access from Course
// -----------------------------
educatorRouter.delete(
  "/remove-student/:courseId/:studentId",
  requireAuth(),
  removeStudentAccess
);

// -----------------------------
// Get All Students
// -----------------------------
educatorRouter.get("/all-students", requireAuth(), getAllStudents);

// -----------------------------
// Assign Course to Student
// -----------------------------
educatorRouter.post("/assign-course", requireAuth(), assignCourse);

export default educatorRouter;
