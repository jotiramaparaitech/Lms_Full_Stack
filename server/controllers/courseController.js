import Course from "../models/Course.js";
import User from "../models/User.js"; // ✅ To fetch student info
import { v4 as uuidv4 } from "uuid";

// ------------------------- Get All Published Courses -------------------------
export const getAllCourse = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({ path: "educator", select: "-password" });

    res.json({ success: true, courses });
  } catch (error) {
    console.error("❌ Error fetching all courses:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------- Get Course by ID -------------------------
export const getCourseId = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id; // ✅ available if user logged in via protect middleware

  try {
    const courseData = await Course.findById(id).populate({
      path: "educator",
      select: "-password",
    });

    if (!courseData) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Hide paid lecture URLs for security
    courseData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) lecture.lectureUrl = "";
      });
    });

    // ✅ Allow full PDF access only to enrolled students or educator
    const isEducator =
      courseData.educator?._id?.toString() === userId?.toString();
    const isEnrolled = courseData.enrolledStudents?.includes(userId);

    if (!isEducator && !isEnrolled) {
      // Hide actual pdfUrl for unauthorized users
      courseData.pdfResources = courseData.pdfResources.map((pdf) => ({
        pdfId: pdf.pdfId,
        pdfTitle: pdf.pdfTitle,
        pdfDescription: pdf.pdfDescription,
        allowDownload: false,
        pdfUrl: "", // 🚫 Hide the real link
      }));
    }

    res.json({ success: true, courseData });
  } catch (error) {
    console.error("❌ Error fetching course by ID:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------- Add Course PDF (via direct link) -------------------------
export const uploadCoursePdf = async (req, res) => {
  try {
    const { pdfTitle, pdfDescription, pdfUrl, allowDownload } = req.body;
    const { courseId } = req.params;

    if (!pdfUrl) {
      return res
        .status(400)
        .json({ success: false, message: "PDF URL is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const newPdf = {
      pdfId: uuidv4(),
      pdfTitle: pdfTitle || "Untitled PDF",
      pdfDescription: pdfDescription || "",
      pdfUrl,
      allowDownload: allowDownload === "true" || allowDownload === true,
    };

    course.pdfResources = [...(course.pdfResources || []), newPdf];
    await course.save();

    res.status(200).json({
      success: true,
      message: "📄 PDF added successfully",
      pdf: newPdf,
      pdfResources: course.pdfResources,
    });
  } catch (error) {
    console.error("❌ Error adding PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error adding PDF resource",
      error: error.message,
    });
  }
};

// ------------------------- Educator Dashboard (Courses + Enrollments) -------------------------
export const getEducatorDashboard = async (req, res) => {
  try {
    const educatorId = req.user._id;

    const courses = await Course.find({ educator: educatorId })
      .populate({
        path: "enrolledStudents",
        select: "name email imageUrl createdAt",
      })
      .sort({ createdAt: -1 });

    if (!courses.length) {
      return res.json({
        success: true,
        message: "No courses found for this educator",
        courses: [],
        totalStudents: 0,
        latestEnrollments: [],
      });
    }

    const totalStudents = courses.reduce(
      (acc, course) => acc + course.enrolledStudents.length,
      0
    );

    const allEnrollments = [];
    courses.forEach((course) => {
      course.enrolledStudents.forEach((student) => {
        allEnrollments.push({
          courseTitle: course.courseTitle,
          studentName: student.name,
          studentEmail: student.email,
          enrolledAt: student.createdAt,
        });
      });
    });

    const latestEnrollments = allEnrollments
      .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
      .slice(0, 10);

    res.json({
      success: true,
      courses,
      totalStudents,
      latestEnrollments,
    });
  } catch (error) {
    console.error("❌ Error fetching educator dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching educator dashboard",
      error: error.message,
    });
  }
};
