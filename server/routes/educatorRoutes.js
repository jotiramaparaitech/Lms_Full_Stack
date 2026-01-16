import express from "express";
import {
  addProject,
  updateProject,
  deleteProject,
  educatorDashboardData,
  getEducatorProjects,
  getEducatorProjectById,
  getEnrolledStudentsData,
  updateRoleToEducator,
  removeStudentAccess,
  getAllStudents,
  assignProject,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { requireAuth } from "@clerk/express"; // ✅ FIXED IMPORT

const educatorRouter = express.Router();

// -----------------------------
// Add Educator Role
// -----------------------------
educatorRouter.get("/update-role", requireAuth(), updateRoleToEducator);

// -----------------------------
// Add Project
// -----------------------------
educatorRouter.post(
  "/add-project",
  requireAuth(),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  addProject
);

// -----------------------------
// Get Educator Projects
// -----------------------------
educatorRouter.get("/projects", requireAuth(), getEducatorProjects);

// -----------------------------
// Get Single Educator Project
// -----------------------------
educatorRouter.get("/project/:id", requireAuth(), getEducatorProjectById);

// -----------------------------
// Update Project
// -----------------------------
educatorRouter.put(
  "/project/:id",
  requireAuth(),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  updateProject
);

// -----------------------------
// Delete Project
// -----------------------------
educatorRouter.delete("/project/:id", requireAuth(), deleteProject);

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
// Remove Student Access from Project
// -----------------------------
educatorRouter.delete(
  "/remove-student/:projectId/:studentId",
  requireAuth(),
  removeStudentAccess
);

// -----------------------------
// Get All Students
// -----------------------------
educatorRouter.get("/all-students", requireAuth(), getAllStudents);

// -----------------------------
// Assign Project to Student
// -----------------------------
educatorRouter.post("/assign-project", requireAuth(), assignProject);

export default educatorRouter;
