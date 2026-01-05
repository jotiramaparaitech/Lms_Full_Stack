import mongoose from "mongoose";

// ---------- Lecture Schema ----------
const lectureSchema = new mongoose.Schema(
  {
    lectureId: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    lectureDuration: { type: Number, required: true },
    lectureUrl: { type: String, required: true },
    isPreviewFree: { type: Boolean, required: true },
    lectureOrder: { type: Number, required: true },
  },
  { _id: false }
);

// ---------- Chapter Schema ----------
const chapterSchema = new mongoose.Schema(
  {
    chapterId: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: [lectureSchema],
  },
  { _id: false }
);

// ---------- Course Schema ----------
const courseSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String },
    coursePrice: { type: Number, required: true },
    isPublished: { type: Boolean, default: true },

    // ✅ Pricing & visibility
    discount: { type: Number, required: true, min: 0, max: 100 },
    isLocked: {
      type: Boolean,
      default: false, // When true, course can be viewed but NOT purchased
    },
    isTrending: {
      type: Boolean,
      default: false, // When true, course is prioritized in listings
    },

    // ✅ Custom Domain (required)
    customDomain: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ PDF Resources (array) — supports multiple PDFs per course
    pdfResources: [
      {
        pdfId: { type: String },
        pdfTitle: { type: String },
        pdfDescription: { type: String },
        pdfUrl: { type: String },
      },
    ],

    // ✅ Course Content (Chapters + Lectures)
    courseContent: [chapterSchema],

    educator: {
      type: String,
      ref: "User",
      required: true,
    },

    // ✅ Ratings
    courseRatings: [
      {
        userId: { type: String },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],

    // ✅ Enrolled Students
    enrolledStudents: [
      {
        type: String,
        ref: "User",
      },
    ],
  },
  { timestamps: true, minimize: false }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
