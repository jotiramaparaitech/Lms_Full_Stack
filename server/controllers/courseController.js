import Course from "../models/Course.js";
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

    // ✅ Validate fields
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

    // ✅ Create PDF object
    const newPdf = {
      pdfId: uuidv4(),
      pdfTitle: pdfTitle || "Untitled PDF",
      pdfDescription: pdfDescription || "",
      pdfUrl,
      allowDownload: allowDownload === "true" || allowDownload === true,
    };

    // ✅ Save PDF resource directly to MongoDB
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

// ------------------------- Educator Dashboard -------------------------
export const getEducatorDashboard = async (req, res) => {
  try {
    const educatorId = req.user?._id;

    if (!educatorId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Educator ID missing" });
    }

    // ✅ Fetch courses created by the educator
    const courses = await Course.find({ educator: educatorId })
      .populate("enrolledStudents", "name email")
      .select("-courseContent");

    // ✅ Calculate total enrolled students
    const totalEnrolledStudents = courses.reduce(
      (sum, course) => sum + (course.enrolledStudents?.length || 0),
      0
    );

    res.status(200).json({
      success: true,
      educatorId,
      totalCourses: courses.length,
      totalEnrolledStudents,
      courses: courses.map((course) => ({
        _id: course._id,
        courseTitle: course.courseTitle,
        isPublished: course.isPublished,
        enrolledCount: course.enrolledStudents?.length || 0,
        enrolledStudents: course.enrolledStudents,
      })),
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
