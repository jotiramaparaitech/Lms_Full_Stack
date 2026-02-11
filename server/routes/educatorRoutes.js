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
  assignTeamLeader,
  getTeamLeaders,
  assignToTeam, // ✅ NEW
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { protect } from "../middlewares/authMiddleware.js";

const educatorRouter = express.Router();

// -----------------------------
// Add Educator Role
// -----------------------------
educatorRouter.get("/update-role", protect, updateRoleToEducator);

// -----------------------------
// Add Course
// -----------------------------
educatorRouter.post(
  "/add-course",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  addCourse,
);

// -----------------------------
// Get Educator Courses
// -----------------------------
educatorRouter.get("/courses", protect, getEducatorCourses);

// -----------------------------
// Get Single Educator Course
// -----------------------------
educatorRouter.get("/course/:id", protect, getEducatorCourseById);

// -----------------------------
// Update Course
// -----------------------------
educatorRouter.put(
  "/course/:id",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  updateCourse,
);

// -----------------------------
// Delete Course
// -----------------------------
educatorRouter.delete("/course/:id", protect, deleteCourse);

// -----------------------------
// Educator Dashboard Data
// -----------------------------
educatorRouter.get("/dashboard", protect, educatorDashboardData);

// -----------------------------
// Get Enrolled Students Data
// -----------------------------
educatorRouter.get(
  "/enrolled-students",
  protect,
  getEnrolledStudentsData,
);

// -----------------------------
// Remove Student Access from Course
// -----------------------------
educatorRouter.delete(
  "/remove-student/:courseId/:studentId",
  protect,
  removeStudentAccess,
);

// -----------------------------
// Get All Students
// -----------------------------
educatorRouter.get("/all-students", protect, getAllStudents);

// -----------------------------
// Assign Course to Student
// -----------------------------
educatorRouter.post("/assign-course", protect, assignCourse);

// -----------------------------
// Assign Student to Team
// -----------------------------
educatorRouter.post("/assign-to-team", protect, assignToTeam);

// -----------------------------
// Assign Team Leader
// -----------------------------
educatorRouter.post("/assign-team-leader", protect, assignTeamLeader);

// -----------------------------
// Get Team Leaders
// -----------------------------
educatorRouter.get("/team-leaders", protect, getTeamLeaders);

export default educatorRouter;
