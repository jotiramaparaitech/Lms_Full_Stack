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

    // Verify using rawBody captured in server.js
    await whook.verify(req.rawBody, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        try {
          const firstName = data.first_name || "";
          const lastName = data.last_name || "";
          const fullName = `${firstName} ${lastName}`.trim();

          const userData = {
            _id: data.id,
            email: data.email_addresses[0]?.email_address || "",
            name: fullName || data.username || "User",
            imageUrl: data.image_url || "",
            role: data.public_metadata?.role || "student",
          };

          // Use findOneAndUpdate with upsert to avoid duplicate key errors
          await User.findOneAndUpdate(
            { _id: data.id },
            userData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          console.log(`✅ User created via webhook: ${data.id}`);
          return res.json({ success: true, message: "User created successfully" });
        } catch (error) {
          console.error("Error in user.created webhook:", error);
          // If user already exists, that's okay - webhook might have been called twice
          if (error.code === 11000 || error.name === "MongoServerError") {
            console.log(`User ${data.id} already exists, skipping creation`);
            return res.json({ success: true, message: "User already exists" });
          }
          throw error;
        }
      }

      case "user.updated": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
        console.log(`✅ User updated via webhook: ${data.id}`);
        return res.json({ success: true, message: "User updated" });
      }

      case "user.deleted": {
        const userId = data.id;

        // Delete user from database
        await User.findByIdAndDelete(userId);
        console.log(`✅ User deleted via webhook: ${userId}`);

        // Remove user from all course enrollments
        await Course.updateMany(
          { enrolledStudents: userId },
          { $pull: { enrolledStudents: userId } }
        );

        // Delete all purchases by this user
        await Purchase.deleteMany({ userId });

        // Note: We keep the purchase records for historical purposes, but mark them as deleted
        // Alternatively, you can delete them completely with the line above

        return res.json({
          success: true,
          message: "User deleted and cleaned up successfully",
        });
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
