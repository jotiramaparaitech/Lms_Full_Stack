import express from "express";
import {
  addCourse,
  updateCourse,
  deleteCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
  removeStudentAccess,
  getAllStudents,
  assignCourse,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { ClerkExpressRequireAuth } from "@clerk/express";

const educatorRouter = express.Router();

// -----------------------------
// Add Educator Role
// -----------------------------
educatorRouter.get(
  "/update-role",
  ClerkExpressRequireAuth(),
  updateRoleToEducator
);

// -----------------------------
// Add Course
// -----------------------------
educatorRouter.post(
  "/add-course",
  ClerkExpressRequireAuth(),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  addCourse
);

// -----------------------------
// Get Educator Courses
// -----------------------------
educatorRouter.get("/courses", ClerkExpressRequireAuth(), getEducatorCourses);

// -----------------------------
// Update Course
// -----------------------------
educatorRouter.put(
  "/course/:id",
  ClerkExpressRequireAuth(),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  updateCourse
);

// -----------------------------
// Delete Course
// -----------------------------
educatorRouter.delete("/course/:id", ClerkExpressRequireAuth(), deleteCourse);

// -----------------------------
// Educator Dashboard Data
// -----------------------------
educatorRouter.get(
  "/dashboard",
  ClerkExpressRequireAuth(),
  educatorDashboardData
);

// -----------------------------
// Get Enrolled Students Data
// -----------------------------
educatorRouter.get(
  "/enrolled-students",
  ClerkExpressRequireAuth(),
  getEnrolledStudentsData
);

// -----------------------------
// Remove Student Access from Course
// -----------------------------
educatorRouter.delete(
  "/remove-student/:courseId/:studentId",
  ClerkExpressRequireAuth(),
  removeStudentAccess
);

// -----------------------------
// Get All Students
// -----------------------------
educatorRouter.get("/all-students", ClerkExpressRequireAuth(), getAllStudents);

// -----------------------------
// Assign Course to Student
// -----------------------------
educatorRouter.post("/assign-course", ClerkExpressRequireAuth(), assignCourse);

export default educatorRouter;
