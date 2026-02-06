import { Webhook } from "svix";
import User from "../models/User.js";
import Team from "../models/Team.js";
import TeamMessage from "../models/TeamMessage.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const payload = req.body;
    const headers = req.headers;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const evt = wh.verify(payload, headers);

    const { type, data } = evt;

    // ✅ USER DELETED
    if (type === "user.deleted") {
      const clerkId = data.id;

      console.log("🔥 Clerk user deleted:", clerkId);

      const user = await User.findOneAndDelete({ clerkId });

      if (user) {
        const userId = user._id;

        // Remove from teams
        await Team.updateMany(
          {},
          {
            $pull: {
              members: { userId },
              pendingRequests: userId,
            },
          }
        );

        // Remove messages
        await TeamMessage.deleteMany({ sender: userId });

        console.log("✅ MongoDB user + related data removed");
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    res.status(400).json({ success: false });
  }
};
