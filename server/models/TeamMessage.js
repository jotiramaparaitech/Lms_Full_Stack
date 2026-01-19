import mongoose from "mongoose";

const teamMessageSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },
    sender: {
      type: String, // Clerk User ID
      ref: "User",
      required: true
    },
    content: { type: String, default: "" },
    type: {
      type: String,
      enum: ["text", "image", "video", "file", "audio", "call_link"],
      default: "text"
    },
    attachmentUrl: { type: String, default: "" }, // URL for media/files
    linkData: {
      // Optional metadata for call links
      title: String,
      url: String
    }
  },
  { timestamps: true }
);

const TeamMessage = mongoose.model("TeamMessage", teamMessageSchema);
export default TeamMessage;
