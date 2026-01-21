// controllers/notificationController.js
import DeviceToken from "../models/DeviceToken.js";

export const saveToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    // ✅ CLERK SPECIFIC: User ID is inside req.auth.userId
    const userId = req.auth.userId; 

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    // ✅ FIXED: Find by 'userId' AND update 'updatedAt'
    await DeviceToken.findOneAndUpdate(
      { userId: userId },             // 1. Find the User
      { 
        userId: userId, 
        token: token,
        updatedAt: Date.now() // ⬅️ CRITICAL: Resets the 60-day expiry timer
      }, 
      { upsert: true, new: true }     // 3. Create if doesn't exist
    );

    res.status(200).json({ success: true, message: "Token saved" });
  } catch (error) {
    console.error("Save Token Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};