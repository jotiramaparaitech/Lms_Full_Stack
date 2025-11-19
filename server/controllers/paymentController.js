import Razorpay from "razorpay";
import crypto from "crypto";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";

// -------------------- Initialize Razorpay --------------------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ============================================================
//                 CREATE RAZORPAY ORDER
// ============================================================
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.auth.userId; // Clerk user
    const { courseId } = req.body;

    if (!courseId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing courseId or userId" });
    }

    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const amount =
      course.coursePrice - (course.discount * course.coursePrice) / 100;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        courseId,
      },
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("❌ Razorpay order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating Razorpay order",
    });
  }
};

// ============================================================
//                 VERIFY PAYMENT + ENROLL USER
// ============================================================
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // -------------------- Verify Signature --------------------
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

    // -------------------- Fetch Order Notes --------------------
    const order = await razorpay.orders.fetch(razorpay_order_id);

    const userId = order.notes.userId;
    const courseId = order.notes.courseId;

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        message: "User or Course not found",
      });
    }

    // ============================================================
    //              RECORD PURCHASE IN DATABASE
    // ============================================================
    const amountPaid = order.amount / 100; // convert to INR

    await Purchase.create({
      courseId,
      userId,
      amount: amountPaid,
      status: "completed",
      paymentId: razorpay_payment_id,
    });

    // ============================================================
    //              ENROLL USER IN THE COURSE
    // ============================================================
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    return res.json({
      success: true,
      message: "Payment verified & user enrolled successfully",
    });
  } catch (error) {
    console.error("❌ Razorpay verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};
