import crypto from "crypto";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";
import { ensureUserExists } from "./userController.js";
import {
  getRazorpayClient,
  RazorpayConfigError,
} from "../utils/razorpayClient.js";

// ====================== HEALTH CHECK ======================
export const checkRazorpayConfig = async (req, res) => {
  try {
    const rawKeyId = process.env.RAZORPAY_KEY_ID;
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;

    const config = {
      keyId: {
        exists: !!rawKeyId,
        length: rawKeyId?.length || 0,
        preview: rawKeyId ? `${rawKeyId.substring(0, 10)}...` : "NOT SET",
        isValidFormat: rawKeyId?.startsWith("rzp_") || false,
      },
      keySecret: {
        exists: !!rawKeySecret,
        length: rawKeySecret?.length || 0,
        preview: rawKeySecret ? "***SET***" : "NOT SET",
        isValidLength: (rawKeySecret?.length || 0) >= 20,
      },
      status: rawKeyId && rawKeySecret ? "configured" : "missing",
    };

    // Try to initialize client
    try {
      const razorpay = getRazorpayClient();
      config.clientInitialized = true;
      config.message = "Razorpay is properly configured";
      config.status = "ready";
    } catch (error) {
      config.clientInitialized = false;
      config.error = error.message;
      config.errorType = error.name;
      config.message = "Razorpay configuration error";
      config.status = "error";

      // Add specific error details
      if (error.message.includes("Authentication key")) {
        config.details =
          "The Razorpay SDK rejected the authentication keys. Check that keys are correct and properly formatted.";
      } else if (error.message.includes("Missing")) {
        config.details = "One or both Razorpay keys are missing or empty.";
      } else {
        config.details = "Unknown configuration error.";
      }
    }

    res.json({
      success: config.clientInitialized,
      config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.name,
    });
  }
};

// ====================== CREATE ORDER ======================
export const createOrder = async (req, res) => {
  try {
    // Get userId from either Clerk auth or protect middleware
    const userId = req.auth?.userId || req.user?.id || req.user?._id;
    let razorpay;
    try {
      razorpay = getRazorpayClient();
    } catch (error) {
      if (error instanceof RazorpayConfigError) {
        return res.status(503).json({
          success: false,
          message:
            error.message ||
            "Payment Failed because of a configuration error. Authentication key was missing during initialization.",
          error: "RAZORPAY_CONFIG_ERROR",
        });
      }
      // If it's any other error during initialization, treat it as config error
      return res.status(503).json({
        success: false,
        message: `Payment Failed because of a configuration error. ${
          error.message ||
          "Authentication key was missing during initialization."
        }`,
        error: "RAZORPAY_CONFIG_ERROR",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing courseId",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated. Please login again.",
      });
    }

    const course = await Course.findById(courseId);
    const user = await ensureUserExists(userId);

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        message: "Course or User not found",
      });
    }

    // ⛔ Block purchase when course is locked by admin
    if (course.isLocked) {
      return res.status(403).json({
        success: false,
        message:
          "This project is currently locked by the admin and cannot be purchased.",
        error: "COURSE_LOCKED",
      });
    }

    const alreadyEnrolled =
      user.enrolledCourses?.some(
        (enrolledCourseId) =>
          enrolledCourseId.toString() === courseId.toString()
      ) || false;

    if (alreadyEnrolled) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course.",
      });
    }

    await Purchase.deleteMany({ userId, courseId, status: "pending" });

    // FINAL PRICE
    const price = course.coursePrice;
    const discount = course.discount || 0;
    const finalAmount = price - (discount * price) / 100;

    const amountInPaise = Math.round(finalAmount * 100);
    if (amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course price",
      });
    }

    // Save a purchase entry
    const purchase = await Purchase.create({
      courseId,
      userId,
      amount: finalAmount,
      status: "pending",
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${purchase._id}`,
      notes: {
        purchaseId: purchase._id.toString(),
        userId,
        courseId,
      },
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      purchaseId: purchase._id,
    });
  } catch (error) {
    // Check if it's a Razorpay API error
    if (error.statusCode || error.error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message:
          error.error?.description || error.message || "Razorpay API error",
        error: "RAZORPAY_API_ERROR",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      error: "INTERNAL_ERROR",
    });
  }
};

// ====================== VERIFY PAYMENT ======================
export const verifyPayment = async (req, res) => {
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
          message:
            error.message ||
            "Payment Failed because of a configuration error. Authentication key was missing during initialization.",
          error: "RAZORPAY_CONFIG_ERROR",
        });
      }
      // If it's any other error during initialization, treat it as config error
      return res.status(503).json({
        success: false,
        message: `Payment Failed because of a configuration error. ${
          error.message ||
          "Authentication key was missing during initialization."
        }`,
        error: "RAZORPAY_CONFIG_ERROR",
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // Signature verification
    const signString = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signString)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Fetch Razorpay order
    const razorOrder = await razorpay.orders.fetch(razorpay_order_id);

    const purchaseId = razorOrder.notes.purchaseId;
    const userId = razorOrder.notes.userId;
    const courseId = razorOrder.notes.courseId;

    const course = await Course.findById(courseId);
    const user = await ensureUserExists(userId);

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        message: "User or Course not found",
      });
    }

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase record not found",
      });
    }

    if (purchase.status === "completed") {
      // Still return enrolled courses even if payment was already verified
      await user.populate({
        path: "enrolledCourses",
        options: { sort: { createdAt: -1 } },
      });
      const updatedUser = user.toObject();

      return res.json({
        success: true,
        message: "Payment already verified",
        enrolledCourses: updatedUser?.enrolledCourses || [],
      });
    }

    // Update purchase status
    await Purchase.findByIdAndUpdate(purchaseId, {
      status: "completed",
      paymentId: razorpay_payment_id,
    });

    // Enroll user
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    // Populate enrolled courses for response
    await user.populate({
      path: "enrolledCourses",
      options: { sort: { createdAt: -1 } },
    });
    const updatedUser = user.toObject();

    return res.json({
      success: true,
      message: "Payment verified & student enrolled successfully",
      enrolledCourses: updatedUser?.enrolledCourses || [],
    });
  } catch (error) {
    console.error("❌ Razorpay verification error:", error);
    
    // Handle Razorpay API errors
    if (error.statusCode || error.error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.error?.description || error.message || "Razorpay API error",
        error: "RAZORPAY_API_ERROR",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      error: "VERIFICATION_ERROR",
    });
  }
};
