import Project, { transformProjectFields } from "../models/Project.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import {
  getRazorpayClient,
  RazorpayConfigError,
} from "../utils/razorpayClient.js";

// ------------------------- Get All Published Projects -------------------------
export const getAllProject = async (req, res) => {
  try {
    const projects = await Project.find({ isPublished: true })
      // ✅ Ensure trending projects appear first, then newest first
      .sort({ isTrending: -1, createdAt: -1 })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({
        path: "educator",
        select: "name email imageUrl",
        strictPopulate: false,
      })
      .lean();

    // Handle projects where educator might be null (educator user doesn't exist in DB)
    // Transform old field names (courseTitle, etc.) to new field names (projectTitle, etc.)
    const projectsWithEducator = projects.map((project) => {
      if (!project.educator) {
        // Set default educator info if educator user doesn't exist
        project.educator = {
          name: "Unknown Educator",
          email: "",
          imageUrl: "",
        };
      }
      // Transform field names from course* to project*
      return transformProjectFields(project);
    });

    // Ensure projects is always an array
    const response = {
      success: true,
      projects: Array.isArray(projectsWithEducator) ? projectsWithEducator : [],
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Error fetching all projects:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------- Get Project by ID -------------------------
export const getProjectId = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;

  try {
    const projectData = await Project.findById(id).populate({
      path: "educator",
      select: "-password",
    });

    if (!projectData) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Transform field names before processing
    const transformedProject = transformProjectFields(projectData.toObject ? projectData.toObject() : projectData);
    
    transformedProject.projectContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) lecture.lectureUrl = "";
      });
    });

    const isEducator =
      transformedProject.educator?._id?.toString() === userId?.toString();
    const isEnrolled = transformedProject.enrolledStudents?.includes(userId);

    if (!isEducator && !isEnrolled) {
      transformedProject.pdfResources = transformedProject.pdfResources.map((pdf) => ({
        pdfId: pdf.pdfId,
        pdfTitle: pdf.pdfTitle,
        pdfDescription: pdf.pdfDescription,
        allowDownload: false,
        pdfUrl: "",
      }));
    }

    res.json({ success: true, projectData: transformedProject });
  } catch (error) {
    console.error("❌ Error fetching project by ID:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------- Add Project PDF (via direct link) -------------------------
export const uploadProjectPdf = async (req, res) => {
  try {
    const { pdfTitle, pdfDescription, pdfUrl, allowDownload } = req.body;
    const { projectId } = req.params;

    if (!pdfUrl) {
      return res
        .status(400)
        .json({ success: false, message: "PDF URL is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const newPdf = {
      pdfId: uuidv4(),
      pdfTitle: pdfTitle || "Untitled PDF",
      pdfDescription: pdfDescription || "",
      pdfUrl,
      allowDownload: allowDownload === "true" || allowDownload === true,
    };

    project.pdfResources = [...(project.pdfResources || []), newPdf];
    await project.save();

    res.status(200).json({
      success: true,
      message: "📄 PDF added successfully",
      pdf: newPdf,
      pdfResources: project.pdfResources,
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

// ------------------------- Educator Dashboard (Projects + Enrollments) -------------------------
export const getEducatorDashboard = async (req, res) => {
  try {
    const educatorId = req.user._id;

    const projects = await Project.find({ educator: educatorId })
      .populate({
        path: "enrolledStudents",
        select: "name email imageUrl createdAt",
      })
      .sort({ createdAt: -1 });

    if (!projects.length) {
      return res.json({
        success: true,
        message: "No projects found for this educator",
        projects: [],
        totalStudents: 0,
        latestEnrollments: [],
      });
    }

    const totalStudents = projects.reduce(
      (acc, project) => acc + project.enrolledStudents.length,
      0
    );

    const allEnrollments = [];
    projects.forEach((project) => {
      project.enrolledStudents.forEach((student) => {
        allEnrollments.push({
          projectTitle: project.courseTitle, // Map from old field name
          studentName: student.name,
          studentEmail: student.email,
          enrolledAt: student.createdAt,
        });
      });
    });

    const latestEnrollments = allEnrollments
      .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
      .slice(0, 10);

    // Transform projects to use new field names
    const transformedProjects = transformProjectFields(projects);
    
    res.json({
      success: true,
      projects: transformedProjects,
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
    const { projectId } = req.body;
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

    const project = await Project.findById(projectId);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const price =
      project.coursePrice - (project.discount / 100) * project.coursePrice;

    const amountInPaise = Math.round(price * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        projectId: project._id.toString(),
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
    const projectId = order.notes.projectId;

    const project = await Project.findById(projectId);

    // avoid duplicate
    if (!project.enrolledStudents.includes(userId)) {
      project.enrolledStudents.push(userId);
      await project.save();
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
