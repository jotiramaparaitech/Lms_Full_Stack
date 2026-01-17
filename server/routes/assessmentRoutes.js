import express from "express";
import {
  generateTest,
  submitTest,
  getHistory,
} from "../controllers/assessmentController.js";

// Using your existing auth middleware
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Student → Generate AI Questions
router.post("/generate", protect, generateTest);

// Student → Submit Test Results
router.post("/submit", protect, submitTest);

// Student → Get Past Test History
router.get("/history", protect, getHistory);

export default router;