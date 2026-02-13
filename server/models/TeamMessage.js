import mongoose from "mongoose";

const teamMessageSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    channel: { type: String, default: "General" },
    sender: { type: String, ref: "User", required: true },

    content: { type: String }, // This will store the CAPTION/MESSAGE for files
    rawText: { type: String }, // optional plain text

    type: {
      type: String,
      enum: ["text", "post", "image", "file", "call_link", "rich_text"],
      default: "text"
    },

    edited: { type: Boolean, default: false }, 
    deleted: { type: Boolean, default: false },

    attachmentUrl: String,
    linkData: Object,
    
    // ✅ ADD THESE MISSING FIELDS for file messages
    fileName: { type: String }, // Store original filename
    fileSize: { type: Number }, // Store file size in bytes
    mimeType: { type: String }, // Store MIME type for proper handling
    
    // ✅ ADD THIS to distinguish between caption and filename
    originalName: { type: String } // Store the original filename separately
  },
  { timestamps: true }
);

const TeamMessage = mongoose.model("TeamMessage", teamMessageSchema);
export default TeamMessage;