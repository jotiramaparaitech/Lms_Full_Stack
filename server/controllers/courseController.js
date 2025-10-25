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
