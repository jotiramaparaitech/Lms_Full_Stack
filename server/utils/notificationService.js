// utils/notificationService.js
import admin from "../config/firebase.js"; // ✅ Fixed: Use 'import' and add .js

/**
 * Sends a push notification to a specific device token.
 * Uses "data-only" payload so the Service Worker handles the UI.
 */
const sendNotification = async (token, title, body, extraData = {}) => {
  try {
    await admin.messaging().send({
      token: token,
      // ✅ Fixed: Use 'data' instead of 'notification'
      // This ensures your Service Worker (onBackgroundMessage) actually runs.
      data: {
        title: title,
        body: body,
        ...extraData        // Allow passing a URL or Ticket ID
      }
    });
    console.log("✅ Notification Sent!");
  } catch (error) {
    console.error("❌ Failed to send notification:", error);
  }
};

export default sendNotification;