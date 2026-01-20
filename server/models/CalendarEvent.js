import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },

    createdBy: { type: String, required: true }, // Clerk userId (leader)

    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    type: {
      type: String,
      enum: [
        "team-meeting",
        "class",
        "deadline",
        "presentation",
        "review",
        "mentor-session",
        "workshop",
        "social",
      ],
      default: "team-meeting",
    },

    location: { type: String, default: "TBD" },

    reminders: { type: [Number], default: [] },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }
);

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);
export default CalendarEvent;
