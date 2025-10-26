import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

// -----------------------------
// Update Role to Educator
// -----------------------------
export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: "educator" },
    });

    res.json({ success: true, message: "You can publish a course now" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// -----------------------------
// Add New Course
// -----------------------------
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    // files come from upload.fields -> req.files
    const imageFile = req.files?.image?.[0];
    const pdfFiles = req.files?.pdfs || [];
    const educatorId = req.auth.userId;

    if (!imageFile) {
      return res.json({ success: false, message: "Thumbnail Not Attached" });
    }

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = educatorId;
    // prepare pdfResources array: merge any provided metadata with uploaded files
    let pdfResources = [];
    if (
      parsedCourseData.pdfResources &&
      Array.isArray(parsedCourseData.pdfResources)
    ) {
      pdfResources = parsedCourseData.pdfResources.map((p) => ({ ...p }));
    }

    const newCourse = await Course.create(parsedCourseData);

    // Support both disk-storage (file.path) and memory-storage (file.buffer) for thumbnail
    if (imageFile.buffer) {
      // upload from buffer using upload_stream
      const uploadFromBuffer = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "courses" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          Readable.from(buffer).pipe(stream);
        });

      const imageUpload = await uploadFromBuffer(imageFile.buffer);
      newCourse.courseThumbnail = imageUpload.secure_url;
    } else if (imageFile.path) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      newCourse.courseThumbnail = imageUpload.secure_url;
    }

    // Upload any pdf files (Cloudinary raw uploads)
    if (pdfFiles.length > 0) {
      for (const file of pdfFiles) {
        // upload buffer or path
        let uploadResult;
        if (file.buffer) {
          uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "raw", folder: "course_pdfs" },
              (err, result) => (err ? reject(err) : resolve(result))
            );
            Readable.from(file.buffer).pipe(stream);
          });
        } else if (file.path) {
          uploadResult = await cloudinary.uploader.upload(file.path, {
            resource_type: "raw",
            folder: "course_pdfs",
          });
        }

        if (uploadResult) {
          pdfResources.push({
            pdfId: file.originalname || file.filename,
            pdfTitle: file.originalname || file.filename,
            pdfDescription: "",
            pdfUrl: uploadResult.secure_url,
          });
        }
      }
    }

    // attach pdfResources if any
    if (pdfResources.length > 0) newCourse.pdfResources = pdfResources;

    await newCourse.save();

    res.json({ success: true, message: "Course Added", course: newCourse });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get Educator Courses
// -----------------------------
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// -----------------------------
// Update Course
// -----------------------------
export const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const educatorId = req.auth.userId;

    const course = await Course.findOne({
      _id: courseId,
      educator: educatorId,
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    if (req.body.courseData) {
      const parsedCourseData = JSON.parse(req.body.courseData);
      Object.assign(course, parsedCourseData);
    }
    // handle uploaded files (from upload.fields)
    const imageFile = req.files?.image?.[0];
    const pdfFiles = req.files?.pdfs || [];

    if (imageFile) {
      // handle buffer (memoryStorage) or path (disk)
      if (imageFile.buffer) {
        const uploadFromBuffer = (buffer) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "courses" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            Readable.from(buffer).pipe(stream);
          });

        const imageUpload = await uploadFromBuffer(imageFile.buffer);
        course.courseThumbnail = imageUpload.secure_url;
      } else if (imageFile.path) {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        course.courseThumbnail = imageUpload.secure_url;
      }
    }
    // handle uploaded pdf files (merge into course.pdfResources)
    if (pdfFiles.length > 0) {
      const pdfResources = Array.isArray(course.pdfResources)
        ? course.pdfResources
        : [];
      for (const file of pdfFiles) {
        let uploadResult;
        if (file.buffer) {
          uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "raw", folder: "course_pdfs" },
              (err, result) => (err ? reject(err) : resolve(result))
            );
            Readable.from(file.buffer).pipe(stream);
          });
        } else if (file.path) {
          uploadResult = await cloudinary.uploader.upload(file.path, {
            resource_type: "raw",
            folder: "course_pdfs",
          });
        }

        if (uploadResult) {
          pdfResources.push({
            pdfId: file.originalname || file.filename,
            pdfTitle: file.originalname || file.filename,
            pdfDescription: "",
            pdfUrl: uploadResult.secure_url,
          });
        }
      }

      course.pdfResources = pdfResources;
    }
    await course.save();
    res.json({ success: true, message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Delete Course
// -----------------------------
export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const educatorId = req.auth.userId;

    const course = await Course.findOne({
      _id: courseId,
      educator: educatorId,
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    await course.deleteOne();
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Educator Dashboard Data
// -----------------------------
export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;
    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );

    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await User.find(
        { _id: { $in: course.enrolledStudents } },
        "name imageUrl"
      );
      students.forEach((student) => {
        enrolledStudentsData.push({ courseTitle: course.courseTitle, student });
      });
    }

    res.json({
      success: true,
      dashboardData: { totalEarnings, enrolledStudentsData, totalCourses },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get Enrolled Students with Purchase Data
// -----------------------------
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
