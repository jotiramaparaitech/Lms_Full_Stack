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

// ---------- Project Schema ----------
// Note: Using old field names (courseTitle, etc.) for database compatibility
// The code will map these to projectTitle, etc. in the application layer
const projectSchema = new mongoose.Schema(
  {
    // Using old field names for backward compatibility with existing database
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String },
    coursePrice: { type: Number, required: true },
    isPublished: { type: Boolean, default: true },

    // ✅ Pricing & visibility
    discount: { type: Number, required: true, min: 0, max: 100 },
    isLocked: {
      type: Boolean,
      default: false, // When true, project can be viewed but NOT purchased
    },
    isTrending: {
      type: Boolean,
      default: false, // When true, project is prioritized in listings
    },

    // ✅ Custom Domain (required)
    customDomain: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ PDF Resources (array) — supports multiple PDFs per project
    pdfResources: [
      {
        pdfId: { type: String },
        pdfTitle: { type: String },
        pdfDescription: { type: String },
        pdfUrl: { type: String },
      },
    ],

    // ✅ Project Content (Chapters + Lectures) - using old field name for compatibility
    courseContent: [chapterSchema],

    educator: {
      type: String,
      ref: "User",
      required: true,
    },

    // ✅ Ratings - using old field name for compatibility
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

// Helper function to transform old field names to new field names
export const transformProjectFields = (project) => {
  if (!project) return project;
  if (Array.isArray(project)) {
    return project.map(transformProjectFields);
  }
  const transformed = { ...project };
  if (project.courseTitle !== undefined) transformed.projectTitle = project.courseTitle;
  if (project.courseDescription !== undefined) transformed.projectDescription = project.courseDescription;
  if (project.courseThumbnail !== undefined) transformed.projectThumbnail = project.courseThumbnail;
  if (project.coursePrice !== undefined) transformed.projectPrice = project.coursePrice;
  if (project.courseContent !== undefined) transformed.projectContent = project.courseContent;
  if (project.courseRatings !== undefined) transformed.projectRatings = project.courseRatings;
  return transformed;
};

// Use the same collection name as Course to maintain database compatibility
// This allows existing data in "courses" collection to be accessible
const Project = mongoose.model("Project", projectSchema, "courses");
export default Project;
