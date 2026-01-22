// ✅ Switch to "import" to match your Controller's style
import admin from "../configs/firebase.js"; // Check if folder is 'config' or 'configs'
import DeviceToken from "../models/DeviceToken.js";

/**
 * Finds the user's device token and sends a notification.
 * @param {string} userId - The Clerk User ID
 * @param {string} title - The notification title
 * @param {string} body - The notification body
 */
export const sendNotification = async (userId, title, body) => {
  try {
    // 1. Find the token internally (keeps your controller clean)
    const userDevice = await DeviceToken.findOne({ userId });

    // 2. Send only if token exists
    if (userDevice && userDevice.token) {
      await admin.messaging().send({
        token: userDevice.token,
        // Using 'data' is usually better for custom handling in frontend background workers
        data: { title, body }, 
      });
      console.log(`✅ Notification sent to ${userId}`);
    }
  } catch (error) {
    // Log error but don't crash the app
    console.error("⚠️ Notification Error:", error.message);
  }
};