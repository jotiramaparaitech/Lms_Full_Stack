import express from "express";
import Stripe from "stripe";
import { protect } from "../middlewares/authMiddleware.js"; // corrected path
import Course from "../models/Course.js"; // corrected model import

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -------------------- Create Stripe Checkout Session --------------------
router.post("/stripe-session", protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user; // user object from protect middleware

    if (!courseId || !user?._id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing courseId or userId" });
    }

    // Fetch course
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Calculate amount in cents
    const amount = Math.round(
      (course.coursePrice - (course.discount * course.coursePrice) / 100) * 100
    );

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: process.env.CURRENCY?.toLowerCase() || "usd",
            product_data: {
              name: course.courseTitle,
              description: course.courseDescription?.slice(0, 200) || "",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user._id.toString(),
        courseId: course._id.toString(),
      },
      success_url: `${process.env.FRONTEND_URL}/course/${courseId}?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/course/${courseId}?payment=cancel`,
    });

    res.status(200).json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("❌ Stripe session error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
