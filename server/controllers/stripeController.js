import Stripe from "stripe";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -------------------- Create Stripe Checkout Session --------------------
export const createStripeSession = async (req, res) => {
  try {
    // ✅ Get user ID from protect middleware (authenticated user)
    const userId = req.user?._id || req.userId;

    // Get courseId from request body
    const { courseId } = req.body;

    // Validate
    if (!courseId || !userId) {
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

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
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
              description: course.courseDescription?.slice(0, 200) || "", // short desc
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/course/${courseId}?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/course/${courseId}?payment=cancel`,
      metadata: {
        userId: user._id.toString(),
        courseId: course._id.toString(),
      },
    });

    // Respond with session URL
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("❌ Stripe session error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
