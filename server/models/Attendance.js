import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: String, // Clerk user ID (same as User._id)
      ref: "User",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD (IST)
      required: true,
    },

    session: {
      type: String,
      enum: ["LOGIN", "LOGOUT"], // Morning / Evening
      required: true,
    },

    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/**
 * 🚫 Prevent duplicate attendance
 * One student → one session → one day → one course
 */
attendanceSchema.index(
  { studentId: 1, courseId: 1, date: 1, session: 1 },
  { unique: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
