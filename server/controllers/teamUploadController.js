// teamUploadController.js - FIXED VERSION
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

    // ✅ DETECT FILE TYPE FOR CLOUDINARY
    const fileMimeType = req.file.mimetype;
    let resourceType = "auto"; // Default
    
    if (fileMimeType === "application/pdf") {
      resourceType = "raw"; // ✅ CRITICAL: PDFs must be "raw"
    } else if (fileMimeType.startsWith("image/")) {
      resourceType = "image";
    } else if (fileMimeType.includes("msword") || fileMimeType.includes("document")) {
      resourceType = "raw"; // Word docs as raw
    } else if (fileMimeType.includes("excel") || fileMimeType.includes("spreadsheet")) {
      resourceType = "raw"; // Excel as raw
    } else if (fileMimeType === "text/plain") {
      resourceType = "raw"; // Text files as raw
    }

    // ✅ Upload to Cloudinary with correct resource type
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "teams",
          resource_type: resourceType, // ✅ Use detected resource type
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    // ✅ Determine file type for database
    let fileType = "file";
    if (fileMimeType.startsWith("image/")) {
      fileType = "image";
    }

    const message = await TeamMessage.create({
      teamId,
      sender: userId,
      type: fileType,
      attachmentUrl: uploadResult.secure_url,
      content: req.file.originalname,
      mimeType: fileMimeType // ✅ Store MIME type
    });

    await message.populate("sender", "name imageUrl");

    res.json({ success: true, message });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};