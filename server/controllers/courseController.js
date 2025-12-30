import Course from "../models/Course.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import {
  getRazorpayClient,
  RazorpayConfigError,
} from "../utils/razorpayClient.js";

// ------------------------- Get All Published Courses -------------------------
export const getAllCourse = async (req, res) => {
  try {
    console.log("📥 GET /api/course/all - Request received");
    
    // First check total courses in database
    const totalCourses = await Course.countDocuments({});
    console.log(`📊 Total courses in database: ${totalCourses}`);
    
    const publishedCount = await Course.countDocuments({ isPublished: true });
    console.log(`📊 Published courses: ${publishedCount}`);
    
    const courses = await Course.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({ 
        path: "educator", 
        select: "name email imageUrl",
        strictPopulate: false
      })
      .lean();

    console.log(`✅ Found ${courses.length} published courses after query`);

    // Handle courses where educator might be null (educator user doesn't exist in DB)
    const coursesWithEducator = courses.map(course => {
      if (!course.educator) {
        // Set default educator info if educator user doesn't exist
        course.educator = {
          name: "Unknown Educator",
          email: "",
          imageUrl: ""
        };
      }
      return course;
    });

    console.log(`📤 Sending ${coursesWithEducator.length} courses to client`);
    
    // Ensure courses is always an array
    const response = {
      success: true,
      courses: Array.isArray(coursesWithEducator) ? coursesWithEducator : []
    };
    
    console.log("📤 Response structure:", {
      success: response.success,
      coursesCount: response.courses.length,
      firstCourse: response.courses[0] ? {
        id: response.courses[0]._id,
        title: response.courses[0].courseTitle,
        educator: response.courses[0].educator?.name
      } : null
    });
    
    res.json(response);
  } catch (error) {
    console.error("❌ Error fetching all courses:", error);
    console.error("Error stack:", error.stack);
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

// ------------------------- Razorpay Payment (Replaces Stripe) -------------------------

// ⭐ Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { courseId } = req.body;
    let razorpay;
    try {
      razorpay = getRazorpayClient();
    } catch (error) {
      if (error instanceof RazorpayConfigError) {
        return res.status(503).json({
          success: false,
          message: error.message,
        });
      }
      throw error;
    }

    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const price =
      course.coursePrice - (course.discount / 100) * course.coursePrice;

    const amountInPaise = Math.round(price * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: course._id.toString(),
        userId: userId.toString(),
      },
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error("❌ Razorpay order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating Razorpay order",
    });
  }
};

// ⭐ Verify Razorpay Signature + Enroll Student
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    let razorpay;
    try {
      razorpay = getRazorpayClient();
    } catch (error) {
      if (error instanceof RazorpayConfigError) {
        return res.status(503).json({
          success: false,
          message: error.message,
        });
      }
      throw error;
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);

    const userId = order.notes.userId;
    const courseId = order.notes.courseId;

    const course = await Course.findById(courseId);

    // avoid duplicate
    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    res.json({
      success: true,
      message: "Payment verified & enrollment successful",
    });
  } catch (error) {
    console.log("❌ Razorpay verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};
