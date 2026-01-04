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
    const userId = req.auth?.userId;

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user ID found" });

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: "educator" },
    });

    res.json({ success: true, message: "You can publish a course now" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// -----------------------------
// Add New Course
// -----------------------------
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.files?.image?.[0];
    const pdfFiles = req.files?.pdfs || [];
    const educatorId = req.auth?.userId;

    if (!educatorId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized educator" });

    if (!imageFile)
      return res.json({ success: false, message: "Thumbnail not attached" });

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = educatorId;

    let pdfResources = Array.isArray(parsedCourseData.pdfResources)
      ? [...parsedCourseData.pdfResources]
      : [];

    const newCourse = await Course.create(parsedCourseData);

    // ✅ Upload thumbnail
    const uploadFromBuffer = (buffer, folder, resource_type = "image") =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        Readable.from(buffer).pipe(stream);
      });

    if (imageFile.buffer) {
      const imageUpload = await uploadFromBuffer(imageFile.buffer, "courses");
      newCourse.courseThumbnail = imageUpload.secure_url;
    } else if (imageFile.path) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "courses",
      });
      newCourse.courseThumbnail = imageUpload.secure_url;
    }

    // ✅ Upload PDFs
    for (const file of pdfFiles) {
      let uploadResult;
      if (file.buffer) {
        uploadResult = await uploadFromBuffer(
          file.buffer,
          "course_pdfs",
          "raw"
        );
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

    if (pdfResources.length > 0) newCourse.pdfResources = pdfResources;
    await newCourse.save();

    res.json({ success: true, message: "Course added", course: newCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get Educator Courses
// -----------------------------
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth?.userId;
    if (!educator)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized educator" });

    const courses = await Course.find({ educator });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get Single Educator Course
// -----------------------------
export const getEducatorCourseById = async (req, res) => {
  try {
    const educator = req.auth?.userId;
    const { id } = req.params;

    if (!educator)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized educator" });

    const course = await Course.findOne({ _id: id, educator });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Update Course
// -----------------------------
export const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const educatorId = req.auth?.userId;

    if (!educatorId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user ID found" });
    }

    const course = await Course.findOne({
      _id: courseId,
      educator: educatorId,
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found or unauthorized" });

    // Parse courseData with error handling
    let parsedCourseData = {};
    if (req.body.courseData) {
      try {
        // Handle both string and object formats
        if (typeof req.body.courseData === "string") {
          parsedCourseData = JSON.parse(req.body.courseData);
        } else {
          parsedCourseData = req.body.courseData;
        }
        console.log("✅ Course data parsed successfully");
        console.log("  Fields received:", Object.keys(parsedCourseData));
      } catch (parseError) {
        console.error("❌ Error parsing courseData:", parseError);
        console.error("  Raw courseData type:", typeof req.body.courseData);
        console.error("  Raw courseData length:", req.body.courseData?.length);
        console.error(
          "  Raw courseData preview:",
          typeof req.body.courseData === "string"
            ? req.body.courseData.substring(0, 200)
            : JSON.stringify(req.body.courseData).substring(0, 200)
        );
        return res.status(400).json({
          success: false,
          message: "Invalid course data format",
          error: parseError.message,
        });
      }
    } else {
      console.warn("⚠️ No courseData in request body");
      console.log("  Request body keys:", Object.keys(req.body));
    }

    // Explicitly update all fields to ensure they're saved
    if (parsedCourseData.courseTitle !== undefined) {
      course.courseTitle = parsedCourseData.courseTitle;
    }
    if (parsedCourseData.customDomain !== undefined) {
      course.customDomain = parsedCourseData.customDomain;
    }
    if (parsedCourseData.courseDescription !== undefined) {
      // Ensure description is not empty (required field)
      const description = parsedCourseData.courseDescription?.trim() || "";
      if (description === "" || description === "<p><br></p>") {
        return res.status(400).json({
          success: false,
          message: "Course description is required and cannot be empty",
        });
      }
      course.courseDescription = description;
    }
    if (parsedCourseData.coursePrice !== undefined) {
      course.coursePrice = Number(parsedCourseData.coursePrice) || 0;
    }
    if (parsedCourseData.discount !== undefined) {
      course.discount = Number(parsedCourseData.discount) || 0;
    }
    if (parsedCourseData.courseContent !== undefined) {
      course.courseContent = Array.isArray(parsedCourseData.courseContent)
        ? parsedCourseData.courseContent
        : course.courseContent;
    }
    if (parsedCourseData.pdfResources !== undefined) {
      course.pdfResources = Array.isArray(parsedCourseData.pdfResources)
        ? parsedCourseData.pdfResources
        : course.pdfResources;
    }
    // courseThumbnail is handled separately below if imageFile is provided
    if (
      parsedCourseData.courseThumbnail !== undefined &&
      !req.files?.image?.[0]
    ) {
      course.courseThumbnail = parsedCourseData.courseThumbnail;
    }

    const imageFile = req.files?.image?.[0];
    const pdfFiles = req.files?.pdfs || [];

    const uploadFromBuffer = (buffer, folder, resource_type = "image") =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        Readable.from(buffer).pipe(stream);
      });

    if (imageFile) {
      try {
        const uploadResult = imageFile.buffer
          ? await uploadFromBuffer(imageFile.buffer, "courses")
          : await cloudinary.uploader.upload(imageFile.path, {
              folder: "courses",
            });
        if (uploadResult && uploadResult.secure_url) {
          course.courseThumbnail = uploadResult.secure_url;
        }
      } catch (imageError) {
        console.error("❌ Error uploading image:", imageError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
          error: imageError.message,
        });
      }
    }

    // Handle PDF file uploads - append to existing PDFs
    if (pdfFiles.length > 0) {
      const pdfResources = Array.isArray(course.pdfResources)
        ? [...course.pdfResources]
        : [];
      for (const file of pdfFiles) {
        try {
          const uploadResult = file.buffer
            ? await uploadFromBuffer(file.buffer, "course_pdfs", "raw")
            : await cloudinary.uploader.upload(file.path, {
                resource_type: "raw",
                folder: "course_pdfs",
              });

          if (uploadResult) {
            pdfResources.push({
              pdfId: file.originalname || file.filename,
              pdfTitle: file.originalname || file.filename,
              pdfDescription: "",
              pdfUrl: uploadResult.secure_url,
            });
          }
        } catch (pdfError) {
          console.error("❌ Error uploading PDF:", pdfError);
          // Continue with other PDFs even if one fails
        }
      }
      course.pdfResources = pdfResources;
    }

    // Save the course
    try {
      // Validate course before saving
      const validationError = course.validateSync();
      if (validationError) {
        console.error("❌ Course validation error:", validationError);
        return res.status(400).json({
          success: false,
          message: "Course validation failed",
          error: validationError.message,
          details: validationError.errors,
        });
      }

      await course.save();
      console.log("✅ Course updated successfully:", courseId);
      console.log("  Updated fields:", {
        title: course.courseTitle,
        descriptionLength: course.courseDescription?.length || 0,
        price: course.coursePrice,
        chaptersCount: course.courseContent?.length || 0,
      });
      res.json({
        success: true,
        message: "Course updated successfully",
        course,
      });
    } catch (saveError) {
      console.error("❌ Error saving course:", saveError);
      console.error("  Error name:", saveError.name);
      console.error("  Error message:", saveError.message);
      if (saveError.errors) {
        console.error("  Validation errors:", saveError.errors);
      }
      return res.status(500).json({
        success: false,
        message: "Failed to save course",
        error: saveError.message,
        errorType: saveError.name,
      });
    }
  } catch (error) {
    console.error("❌ Error in updateCourse:", error);
    console.error("  Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      error: error.name,
    });
  }
};

// -----------------------------
// Delete Course
// -----------------------------
export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const educatorId = req.auth?.userId;

    const course = await Course.findOne({
      _id: courseId,
      educator: educatorId,
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found or unauthorized" });

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
    const educator = req.auth?.userId;
    if (!educator)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized educator" });

    const courses = await Course.find({ educator });
    const totalCourses = courses.length;
    const courseIds = courses.map((c) => c._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await User.find(
        { _id: { $in: course.enrolledStudents } },
        "name imageUrl"
      );
      // Filter out null/undefined students (deleted users)
      students
        .filter((s) => s && s._id) // Only include valid users
        .forEach((s) => {
          enrolledStudentsData.push({
            courseTitle: course.courseTitle,
            student: s,
          });
        });
    }

    res.json({
      success: true,
      dashboardData: { totalEarnings, enrolledStudentsData, totalCourses },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get Enrolled Students Data
// -----------------------------
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth?.userId;
    if (!educator)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized educator" });

    const courses = await Course.find({ educator });
    const courseIds = courses.map((c) => c._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    // Filter out purchases where user has been deleted (userId is null or user doesn't exist)
    const enrolledStudents = purchases
      .filter((p) => p.userId && p.userId._id) // Only include purchases with valid users
      .map((p) => ({
        student: p.userId,
        courseId: p.courseId?._id,
        courseTitle: p.courseId?.courseTitle,
        purchaseDate: p.createdAt,
      }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Remove Student Access
// -----------------------------
export const removeStudentAccess = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const educatorId = req.auth?.userId;

    const course = await Course.findOne({
      _id: courseId,
      educator: educatorId,
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found or unauthorized" });

    course.enrolledStudents = course.enrolledStudents.filter(
      (id) => id.toString() !== studentId
    );
    await course.save();

    await Promise.all([
      User.findByIdAndUpdate(studentId, {
        $pull: { enrolledCourses: courseId },
      }),
      Purchase.deleteMany({ courseId, userId: studentId }),
    ]);

    res.json({
      success: true,
      message: "Student access removed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get All Students
// -----------------------------
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({}, "name email imageUrl");
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Assign Course to Student
// -----------------------------
export const assignCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    const educatorId = req.auth?.userId;

    const course = await Course.findOne({
      _id: courseId,
      educator: educatorId,
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found or unauthorized" });

    const student = await User.findById(studentId);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    if (course.enrolledStudents.includes(studentId))
      return res.json({
        success: false,
        message: "Student already enrolled in this course",
      });

    // ✅ Add student to course enrollment
    course.enrolledStudents.push(studentId);
    await course.save();

    // ✅ Add course to student's enrolledCourses if not already present
    if (!student.enrolledCourses.includes(courseId)) {
      student.enrolledCourses.push(courseId);
      await student.save();
    }

    // ✅ Create purchase record (manual assignment)
    await Purchase.create({
      userId: studentId,
      courseId,
      status: "completed",
      amount: 0,
      paymentId: "manual-assignment",
    });

    res.json({
      success: true,
      message: "Course successfully assigned to student",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
