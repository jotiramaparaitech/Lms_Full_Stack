import mongoose from "mongoose";

const teamMessageSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    channel: { type: String, default: "General" }, // 🔥 NEW
    sender: { type: String, ref: "User", required: true },

    content: { type: String }, // HTML content (Quill)
    rawText: { type: String }, // optional plain text

    type: {
      type: String,
      enum: ["text", "post", "image", "file", "call_link", "rich_text"],
      default: "text"
    },

    edited: { type: Boolean, default: false }, 
    deleted: { type: Boolean, default: false },

    attachmentUrl: String,
    linkData: Object
  },
  { timestamps: true }
);


const TeamMessage = mongoose.model("TeamMessage", teamMessageSchema);
export default TeamMessage;
