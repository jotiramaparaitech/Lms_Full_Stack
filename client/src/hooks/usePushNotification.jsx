import { useEffect, useContext } from "react";
import { requestForToken, onMessageListener } from "../firebase";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const usePushNotification = () => {
  // ✅ Access values specifically from your AppContext
  const { backendUrl, getToken, userData } = useContext(AppContext);

  useEffect(() => {
    // 🛑 If user data isn't loaded yet, don't try to register token
    if (!userData) return;

    const initializePushNotifications = async () => {
      try {
        // 🔑 Get the Clerk JWT Token securely using your AppContext function
        const jwtToken = await getToken();
        
        // 🔥 Get the Firebase Cloud Messaging Token
        const fcmToken = await requestForToken();

        // 🚀 Send to Backend
        if (fcmToken && jwtToken) {
          await axios.post(
            `${backendUrl}/api/notifications/save-token`,
            { token: fcmToken },
            { 
              headers: { Authorization: `Bearer ${jwtToken}` } // Send JWT for requireAuth()
            }
          );
          console.log("✅ FCM Token saved/updated in database.");
        }
      } catch (error) {
        console.error("❌ Error setting up notifications:", error);
      }
    };

    initializePushNotifications();

    // 🔔 Listen for Incoming Messages (UPDATED)
    // We removed .then() because onMessageListener now takes a callback directly.
    const unsubscribe = onMessageListener((payload) => {
      
      // ✅ PRIORITY CHECK: Look for 'data' first, then 'notification'
      // This ensures it works with the "data-only" messages from your backend
      const title = payload.data?.title || payload.notification?.title || "New Notification";
      const body = payload.data?.body || payload.notification?.body || "You have a new update.";

      // Display Toast
      toast.info(
        <div>
          <strong>{title}</strong>
          <p className="text-sm mt-1">{body}</p>
        </div>, 
        { position: "top-right", autoClose: 5000 }
      );
    });

    // 🧹 Cleanup: Unsubscribe when the component unmounts or userData changes
    return () => {
      if (unsubscribe) unsubscribe();
    };
      
  }, [userData]); // 🔄 Re-run only when userData loads (login success)
};

export default usePushNotification;