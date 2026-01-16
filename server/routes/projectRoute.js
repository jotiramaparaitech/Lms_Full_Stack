import express from "express";
import {
  getAllProject,
  getProjectId,
  uploadProjectPdf,
  getEducatorDashboard,
} from "../controllers/projectController.js";

import {
  createOrder,
  verifyPayment,
  checkRazorpayConfig,
} from "../controllers/razorpayController.js";

import { protect, isEducator } from "../middlewares/authMiddleware.js";

const projectRouter = express.Router();

// Get all projects
projectRouter.get("/all", getAllProject);

// Debug endpoint - get all projects (including unpublished) - remove in production
projectRouter.get("/debug/all", async (req, res) => {
  try {
    const Project = (await import("../models/Project.js")).default;
    const allProjects = await Project.find({}).select("projectTitle isPublished educator").lean();
    res.json({ 
      success: true, 
      total: allProjects.length,
      published: allProjects.filter(p => p.isPublished).length,
      unpublished: allProjects.filter(p => !p.isPublished).length,
      projects: allProjects 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a single project
projectRouter.get("/:id", getProjectId);

// Upload PDF
projectRouter.post("/:projectId/add-pdf", protect, isEducator, uploadProjectPdf);

// Educator dashboard
projectRouter.get(
  "/educator/dashboard",
  protect,
  isEducator,
  getEducatorDashboard
);

// Razorpay health check (for debugging)
projectRouter.get("/purchase/check-config", checkRazorpayConfig);

// Razorpay order (create)
projectRouter.post("/purchase/create-order", protect, createOrder);

// Razorpay payment verify
projectRouter.post("/purchase/verify-payment", protect, verifyPayment);

export default projectRouter;
