import { Webhook } from "svix";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

// --------------------------------------------------------------------
//              CLERK WEBHOOK (USER CREATE / UPDATE / DELETE)
// --------------------------------------------------------------------
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
        return res.json({});
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        return res.json({});
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        return res.json({});
      }

      default:
        return res.json({});
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
//     ❌ REMOVED: Stripe Webhook (No longer needed for Razorpay)
// --------------------------------------------------------------------

// NOTE:
// Razorpay does NOT use server-side webhooks in your setup.
// Payments are verified using verifyRazorpayPayment() controller.
// So you DO NOT need any Razorpay webhook here.
