import Attendance from "../models/Attendance.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

/**
 * 🔹 DEPLOYMENT-SAFE IST TIME FUNCTION
 */
const getISTDate = () => {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
};


/**
 * @desc    Student marks attendance (LOGIN / LOGOUT)
 * @route   POST /api/attendance/mark
 * @access  Protected (Student)
 */
export const markAttendance = async (req, res) => {
  try {
    const auth = req.auth();
    const studentId = auth?.userId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    const { courseId, session } = req.body;

    if (!courseId || !session) {
      return res.status(400).json({
        success: false,
        message: "courseId and session are required",
      });
    }

    if (!["LOGIN", "LOGOUT"].includes(session)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session type",
      });
    }

    // ✅ User check
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // ✅ Enrollment check
    const isEnrolled = student.enrolledCourses
      .map(id => id.toString())
      .includes(courseId);

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // ✅ IST TIME (PRODUCTION SAFE)
    const istNow = getISTDate();

    const hours = istNow.getHours();
    const minutes = istNow.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    // ✅ FIXED TIME WINDOWS
    const LOGIN_START = 9 * 60 + 30;   
    const LOGIN_END = 19 * 60 + 30;    
    const LOGOUT_START = 20 * 60;      
    const LOGOUT_END = 21 * 60;        

    if (
      (session === "LOGIN" &&
        (currentMinutes < LOGIN_START || currentMinutes > LOGIN_END)) ||
      (session === "LOGOUT" &&
        (currentMinutes < LOGOUT_START || currentMinutes > LOGOUT_END))
    ) {
      return res.status(403).json({
        success: false,
        message: "Attendance can only be marked during allowed time windows",
      });
    }

    // ✅ Attendance date
    const today = istNow.toLocaleDateString("en-CA"); // YYYY-MM-DD


    // ✅ Save attendance
    const attendance = await Attendance.create({
      studentId,
      courseId,
      date: today,
      session,
      time: istNow.toLocaleTimeString("en-IN", { hour12: true }),
    });

    res.status(201).json({
      success: true,
      message: `Attendance marked successfully for ${session}`,
      attendance,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked for this session today!",
      });
    }

    console.error("Mark Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Get student attendance history and today's status
 * @route   GET /api/attendance/history/:courseId
 */
export const getAttendanceHistory = async (req, res) => {
  try {
    const auth = req.auth();
    const studentId = auth?.userId;
    const { courseId } = req.params;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const istNow = getISTDate();
    const todayStr = istNow.toLocaleDateString("en-CA"); // YYYY-MM-DD


    const allRecords = await Attendance.find({ studentId, courseId })
      .sort({ createdAt: -1 });

    const todaysRecords = allRecords.filter(
      rec => rec.date === todayStr
    );

    res.status(200).json({
      success: true,
      statusToday: {
        loginDone: todaysRecords.some(r => r.session === "LOGIN"),
        logoutDone: todaysRecords.some(r => r.session === "LOGOUT"),
      },
      attendance: allRecords,
    });

  } catch (error) {
    console.error("Fetch History Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Get detailed attendance stats for a student in a course
 * @route   GET /api/attendance/stats/:courseId
 */
export const getStudentCourseStats = async (req, res) => {
  try {
    const auth = req.auth();
    const studentId = auth?.userId;
    const { courseId } = req.params;

    const records = await Attendance.find({ studentId, courseId })
      .sort({ date: -1 });

    const attendanceMap = records.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = {
          date: curr.date,
          login: false,
          logout: false,
        };
      }
      if (curr.session === "LOGIN") acc[curr.date].login = true;
      if (curr.session === "LOGOUT") acc[curr.date].logout = true;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      stats: {
        totalDaysPresent: Object.keys(attendanceMap).length,
        history: Object.values(attendanceMap),
      },
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
