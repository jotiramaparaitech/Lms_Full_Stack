import Team from "../models/Team.js";
import TeamMessage from "../models/TeamMessage.js";
import { v2 as cloudinary } from "cloudinary";

export const uploadTeamFile = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    const { teamId, content } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    console.log("📁 File upload request:", {
      teamId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      caption: content || "(no caption)"
    });

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    // ✅ Check permissions
    const isAllowed =
      team.leader === userId ||
      team.members.some((m) => m.userId === userId && m.role === "admin");

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // ✅ Upload to Cloudinary
    const fileMimeType = req.file.mimetype;
    let resourceType = "auto";
    
    if (fileMimeType === "application/pdf" || 
        fileMimeType.includes("msword") || 
        fileMimeType.includes("document") ||
        fileMimeType.includes("excel") ||
        fileMimeType.includes("spreadsheet") ||
        fileMimeType === "text/plain") {
      resourceType = "raw";
    } else if (fileMimeType.startsWith("image/")) {
      resourceType = "image";
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "teams",
          resource_type: resourceType,
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

    console.log("✅ Cloudinary upload successful:", uploadResult.secure_url);

    // ✅ Determine file type for database
    let fileType = "file";
    if (fileMimeType.startsWith("image/")) {
      fileType = "image";
    }

    // ✅ CRITICAL FIX: Save caption as content, NOT the filename!
    let messageContent = "";
    if (content && content.trim() !== "") {
      messageContent = content.trim(); // ✅ User's typed message/caption
    } else {
      messageContent = ""; // ✅ Empty if no caption (don't save filename here)
    }

    // ✅ Create message with ALL fields
    const messageData = {
      teamId,
      sender: userId,
      type: fileType,
      content: messageContent, // ✅ THIS IS THE CAPTION (EMPTY IF NO CAPTION)
      attachmentUrl: uploadResult.secure_url,
      mimeType: fileMimeType,
      fileName: req.file.originalname, // ✅ Store filename separately
      fileSize: req.file.size,
      originalName: req.file.originalname, // ✅ Backup of original name
      edited: false,
      deleted: false
    };

    console.log("💬 Saving message with:", {
      content: messageContent || "(empty - no caption)",
      fileName: req.file.originalname,
      type: fileType
    });

    const message = await TeamMessage.create(messageData);
    await message.populate("sender", "name imageUrl");

    // ✅ Emit socket events
    try {
      const io = req.app.get("io");
      if (io) {
        io.to(teamId).emit("receive-message", message);
        io.to(teamId).emit("receive-file", message);
      }
    } catch (socketError) {
      console.error("Socket emission error:", socketError);
    }

    return res.json({
      success: true,
      message: message,
      uploadedMessage: message
    });

  } catch (error) {
    console.error("❌ Upload error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ FIXED: Edit team message with caption support
export const editTeamMessage = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    const { messageId, content, teamId } = req.body;

    const message = await TeamMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Check permissions
    const team = await Team.findById(message.teamId);
    const isAllowed = 
      message.sender === userId ||
      team.leader === userId ||
      team.members.some(m => m.userId === userId && m.role === "admin");

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // ✅ Update caption/content
    if (content !== undefined) {
      message.content = content;
      message.edited = true;
    }

    // ✅ Update file if provided
    if (req.file) {
      const fileMimeType = req.file.mimetype;
      let resourceType = "auto";
      
      if (fileMimeType === "application/pdf" || 
          fileMimeType.includes("msword") || 
          fileMimeType.includes("document") ||
          fileMimeType.includes("excel") ||
          fileMimeType.includes("spreadsheet") ||
          fileMimeType === "text/plain") {
        resourceType = "raw";
      } else if (fileMimeType.startsWith("image/")) {
        resourceType = "image";
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "teams",
            resource_type: resourceType,
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

      message.attachmentUrl = uploadResult.secure_url;
      message.mimeType = fileMimeType;
      message.fileName = req.file.originalname;
      message.fileSize = req.file.size;
      message.originalName = req.file.originalname;
      message.type = fileMimeType.startsWith("image/") ? "image" : "file";
      message.edited = true;
    }

    await message.save();
    await message.populate("sender", "name imageUrl");

    // Emit socket event
    try {
      const io = req.app.get("io");
      if (io) {
        io.to(message.teamId.toString()).emit("message-updated", message);
      }
    } catch (socketError) {
      console.error("Socket emission error:", socketError);
    }

    return res.json({
      success: true,
      message: "Message updated successfully",
      updatedMessage: message
    });

  } catch (error) {
    console.error("❌ Edit message error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};