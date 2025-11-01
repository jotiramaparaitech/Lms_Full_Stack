import Stripe from "stripe";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -------------------- Create Stripe Checkout Session --------------------
export const createStripeSession = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.body;

    if (!courseId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing courseId or userId" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const amount = Math.round(
      (course.coursePrice - (course.discount * course.coursePrice) / 100) * 100
    ); // amount in cents

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.courseTitle,
              description: course.courseDescription,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/course/${courseId}?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/course/${courseId}?payment=cancel`,
      metadata: {
        userId,
        courseId,
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Stripe Webhook --------------------
export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, // must use raw body (configure in Express)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata.userId;
    const courseId = session.metadata.courseId;
    const amount = session.amount_total / 100; // convert cents to dollars

    try {
      // Record purchase in DB
      const newPurchase = await Purchase.create({
        courseId,
        userId,
        amount,
        status: "completed",
        paymentId: session.id,
      });

      // Enroll user
      await Course.findByIdAndUpdate(courseId, {
        $addToSet: { enrolledStudents: userId },
      });
      await User.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: courseId },
      });

      console.log("✅ Stripe payment processed successfully");
    } catch (error) {
      console.error("Error processing Stripe webhook:", error);
    }
  }

  res.json({ received: true });
};
