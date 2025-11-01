import Course from "../models/Course.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
  const userId = req.user?._id;

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

    courseData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) lecture.lectureUrl = "";
      });
    });

    const isEducator =
      courseData.educator?._id?.toString() === userId?.toString();
    const isEnrolled = courseData.enrolledStudents?.includes(userId);

    if (!isEducator && !isEnrolled) {
      courseData.pdfResources = courseData.pdfResources.map((pdf) => ({
        pdfId: pdf.pdfId,
        pdfTitle: pdf.pdfTitle,
        pdfDescription: pdf.pdfDescription,
        allowDownload: false,
        pdfUrl: "",
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

// ------------------------- Create Stripe Checkout Session -------------------------
export const createStripeSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: course.courseTitle },
            unit_amount: Math.round(
              (course.coursePrice -
                ((course.discount || 0) * course.coursePrice) / 100) *
                100
            ),
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: course._id.toString(),
        userId: userId.toString(),
      },
      success_url: `${process.env.FRONTEND_URL}/course/${course._id}?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/course/${course._id}?payment=cancel`,
    });

    res.status(200).json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("❌ Stripe session error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating Stripe session",
      error: error.message,
    });
  }
};
