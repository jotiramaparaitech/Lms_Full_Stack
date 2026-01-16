import crypto from "crypto";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";
import { ensureUserExists } from "./userController.js";
import {
  getRazorpayClient,
  RazorpayConfigError,
} from "../utils/razorpayClient.js";

// ============================================================
//                 CREATE RAZORPAY ORDER
// ============================================================
export const createRazorpayOrder = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId; // Clerk user
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

    if (!projectId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing projectId or userId" });
    }

    const project = await Project.findById(projectId);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const user = await ensureUserExists(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const amount =
      project.coursePrice - (project.discount * project.coursePrice) / 100;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        projectId,
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
    const projectId = order.notes.projectId;

    const project = await Project.findById(projectId);
    const user = await ensureUserExists(userId);

    if (!project || !user) {
      return res.status(404).json({
        success: false,
        message: "User or Project not found",
      });
    }

    // ============================================================
    //              RECORD PURCHASE IN DATABASE
    // ============================================================
    const amountPaid = order.amount / 100; // convert to INR

    await Purchase.create({
      projectId,
      userId,
      amount: amountPaid,
      status: "completed",
      paymentId: razorpay_payment_id,
    });

    // ============================================================
    //              ENROLL USER IN THE PROJECT
    // ============================================================
    await Project.findByIdAndUpdate(projectId, {
      $addToSet: { enrolledStudents: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledProjects: projectId },
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
