import Razorpay from "razorpay";
import crypto from "crypto";
import Course from "../models/Course.js";
import User from "../models/User.js";

// -------------------- Initialize Razorpay --------------------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ====================== CREATE ORDER ======================
export const createOrder = async (req, res) => {
  try {
    const userId = req.user?._id;
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

    const price = course.coursePrice || 0;
    const discount = course.discount || 0;

    const finalAmount = price - (discount * price) / 100;
    const amountInPaise = Math.round(finalAmount * 100);

    if (amountInPaise <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid course price" });

    // create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        courseId: course._id.toString(),
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
        message: "Missing Razorpay payment details",
      });
    }

    // Verify signature
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

    // Fetch order to get metadata
    const razorOrder = await razorpay.orders.fetch(razorpay_order_id);
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

    // Prevent duplicate enrollment
    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    return res.json({
      success: true,
      message: "Payment verified & student enrolled successfully",
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
