import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    logo: {
      type: String,
      default: "", // Cloudinary URL
    },
    banner: { type: String, default: "" },
    leader: {
      type: String,
      required: true,
      ref: "User",
    },
    members: [
      {
        userId: { type: String, ref: "User" },
        role: { type: String, enum: ["member", "admin"], default: "member" },

        // ✅ NEW FIELDS
        progress: { type: Number, default: 0 },
        projectName: { type: String, default: "" },
        projectSubmissionUnlocked: { type: Boolean, default: false },
        lorUnlocked: { type: Boolean, default: false },

        joinedAt: { type: Date, default: Date.now },
      },
    ],
    channels: [
      {
        name: { type: String, required: true },
        createdBy: { type: String, ref: "User" },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    pendingRequests: [{ type: String, ref: "User" }],
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;
