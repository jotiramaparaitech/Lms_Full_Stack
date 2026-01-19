import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    banner: { type: String, default: "" }, // URL for team banner image
    leader: {
      type: String, // Clerk User ID
      required: true,
      ref: "User"
    },
    members: [
      {
        userId: { type: String, ref: "User" }, // Clerk User ID
        role: { type: String, enum: ["member", "admin"], default: "member" },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    pendingRequests: [
      { type: String, ref: "User" } // Array of User IDs requesting to join
    ],
    isPublic: { type: Boolean, default: true } // If false, invite-only (future scope)
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;
