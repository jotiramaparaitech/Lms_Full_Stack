import Team from "../models/Team.js";
import TeamMessage from "../models/TeamMessage.js";
import { v2 as cloudinary } from "cloudinary";

export const uploadTeamFile = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    const { teamId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    // ✅ Only leader or admin can upload
    const isAllowed =
      team.leader === userId ||
      team.members.some(
        (m) => m.userId === userId && m.role === "admin"
      );

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "teams",
          resource_type: "auto" // 🔥 important for pdf/ppt/etc
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const fileType = uploadResult.resource_type === "image" ? "image" : "file";

    const message = await TeamMessage.create({
      teamId,
      sender: userId,
      type: fileType,
      attachmentUrl: uploadResult.secure_url,
      content: req.file.originalname
    });

    await message.populate("sender", "name imageUrl");

    res.json({ success: true, message });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
