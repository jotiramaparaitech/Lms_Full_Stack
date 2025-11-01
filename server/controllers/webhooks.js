import { Webhook } from "svix";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

// API Controller Function to Manage Clerk User with database
export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
          resume: "",
        };
        await User.create(userData);
        res.json({});
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }
      default:
        break;
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------------------------------------
// Test Payment / Dummy Webhook (Simulates Stripe success)
// ---------------------------------------------
export const stripeWebhooks = async (req, res) => {
  try {
    console.log("✅ Test payment webhook received.");

    const { courseId, userId, amount } = req.body;

    if (!courseId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing courseId or userId" });
    }

    // Record purchase in DB
    const newPurchase = await Purchase.create({
      courseId,
      userId,
      amount: amount || 0,
      status: "completed",
      paymentId: "test-payment",
    });

    // Add student to course enrollment
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId },
    });

    // Add course to user's enrolledCourses array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    res.json({
      success: true,
      message: "Test payment recorded successfully",
      purchase: newPurchase,
    });
  } catch (error) {
    console.error("❌ Test payment error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
