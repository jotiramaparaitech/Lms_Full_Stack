import express from 'express';
import { 
  markAttendance, 
  getAttendanceHistory, 
  getStudentCourseStats 
} from '../controllers/attendanceController.js';

const router = express.Router();

// Route to mark attendance (LOGIN/LOGOUT)
router.post('/mark', markAttendance);

// Route to get personal history for a specific course
router.get('/history/:courseId', getAttendanceHistory);

// Route to get statistics (Total present days, etc.)
router.get('/stats/:courseId', getStudentCourseStats);

// 🔥 THIS IS THE CRITICAL LINE THAT WAS MISSING
export default router;