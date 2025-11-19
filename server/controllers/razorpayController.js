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

// ====================== CREATE ORDER ======================
export const createOrder = async (req, res) => {
  try {
    const userId = req.auth.userId; // ✅ FIXED for Clerk
    const { courseId } = req.body;

    if (!courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing courseId or userId",
      });
    }

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        message: "Course or User not found",
      });
    }

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
    console.error("❌ Razorpay order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== VERIFY PAYMENT ======================
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

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
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        message: "User or Course not found",
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

    return res.json({
      success: true,
      message: "Payment verified & student enrolled successfully",
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
