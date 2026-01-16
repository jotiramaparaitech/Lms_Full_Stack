import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import Project, { transformProjectFields } from "../models/Project.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

// -----------------------------
// Update Role to Educator
// -----------------------------
export const updateRoleToEducator = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user ID found" });

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: "educator" },
    });

    res.json({ success: true, message: "You can publish a project now" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// -----------------------------
// Add New Project
// -----------------------------
export const addProject = async (req, res) => {
  try {
    // Accept both projectData and courseData for backward compatibility
    const { projectData, courseData } = req.body;
    const dataToUse = projectData || courseData;
    const imageFile = req.files?.image?.[0];
    const pdfFiles = req.files?.pdfs || [];
    const auth = req.auth();
    const educatorId = auth?.userId;

    if (!educatorId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized educator" });

    if (!imageFile)
      return res.json({ success: false, message: "Thumbnail not attached" });

    if (!dataToUse)
      return res.json({ success: false, message: "Project data not provided" });

    const parsedProjectData = typeof dataToUse === "string" ? JSON.parse(dataToUse) : dataToUse;
    parsedProjectData.educator = educatorId;

    // Map new field names to old field names for database storage
    const dbProjectData = {
      ...parsedProjectData,
      courseTitle: parsedProjectData.projectTitle || parsedProjectData.courseTitle,
      courseDescription: parsedProjectData.projectDescription || parsedProjectData.courseDescription,
      coursePrice: parsedProjectData.projectPrice || parsedProjectData.coursePrice,
      courseContent: parsedProjectData.projectContent || parsedProjectData.courseContent,
      courseRatings: parsedProjectData.projectRatings || parsedProjectData.courseRatings || [],
    };
    // Remove new field names if they exist
    delete dbProjectData.projectTitle;
    delete dbProjectData.projectDescription;
    delete dbProjectData.projectPrice;
    delete dbProjectData.projectContent;
    delete dbProjectData.projectRatings;

    let pdfResources = Array.isArray(parsedProjectData.pdfResources)
      ? [...parsedProjectData.pdfResources]
      : [];

    const newProject = await Project.create(dbProjectData);

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
      const imageUpload = await uploadFromBuffer(imageFile.buffer, "projects");
      newProject.courseThumbnail = imageUpload.secure_url;
    } else if (imageFile.path) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "projects",
      });
      newProject.courseThumbnail = imageUpload.secure_url;
    }

    // ✅ Upload PDFs
    for (const file of pdfFiles) {
      let uploadResult;
      if (file.buffer) {
        uploadResult = await uploadFromBuffer(
          file.buffer,
          "project_pdfs",
          "raw"
        );
      } else if (file.path) {
        uploadResult = await cloudinary.uploader.upload(file.path, {
          resource_type: "raw",
          folder: "project_pdfs",
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

    if (pdfResources.length > 0) newProject.pdfResources = pdfResources;
    await newProject.save();

    // Transform to use new field names
    const transformedProject = transformProjectFields(newProject.toObject ? newProject.toObject() : newProject);
    res.json({ success: true, message: "Project added", project: transformedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get Educator Projects
// -----------------------------
export const getEducatorProjects = async (req, res) => {
  try {
    const auth = req.auth();
    const educator = auth?.userId;
    if (!educator)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized educator" });

    const projects = await Project.find({ educator });
    // Transform to use new field names
    const transformedProjects = transformProjectFields(projects);
    res.json({ success: true, projects: transformedProjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get Single Educator Project
// -----------------------------
export const getEducatorProjectById = async (req, res) => {
  try {
    const auth = req.auth();
    const educator = auth?.userId;
    const { id } = req.params;

    if (!educator)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized educator" });

    const project = await Project.findOne({ _id: id, educator });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Transform to use new field names
    const transformedProject = transformProjectFields(project.toObject ? project.toObject() : project);
    res.json({ success: true, project: transformedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Update Project
// -----------------------------
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const auth = req.auth();
    const educatorId = auth?.userId;

    if (!educatorId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user ID found" });
    }

    const project = await Project.findOne({
      _id: projectId,
      educator: educatorId,
    });
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found or unauthorized" });

    // Parse projectData with error handling
    let parsedProjectData = {};
    // Accept both projectData and courseData for backward compatibility
    const dataToUse = req.body.projectData || req.body.courseData;
    if (dataToUse) {
      try {
        // Handle both string and object formats
        if (typeof dataToUse === "string") {
          parsedProjectData = JSON.parse(dataToUse);
        } else {
          parsedProjectData = dataToUse;
        }
        console.log("✅ Project data parsed successfully");
        console.log("  Fields received:", Object.keys(parsedProjectData));
      } catch (parseError) {
        console.error("❌ Error parsing project data:", parseError);
        console.error("  Raw data type:", typeof dataToUse);
        console.error("  Raw data length:", dataToUse?.length);
        console.error(
          "  Raw data preview:",
          typeof dataToUse === "string"
            ? dataToUse.substring(0, 200)
            : JSON.stringify(dataToUse).substring(0, 200)
        );
        return res.status(400).json({
          success: false,
          message: "Invalid project data format",
          error: parseError.message,
        });
      }
    } else {
      console.warn("⚠️ No projectData or courseData in request body");
      console.log("  Request body keys:", Object.keys(req.body));
    }

    // Explicitly update all fields to ensure they're saved
    // Map new field names (projectTitle) to old field names (courseTitle) for database
    if (parsedProjectData.projectTitle !== undefined || parsedProjectData.courseTitle !== undefined) {
      project.courseTitle = parsedProjectData.projectTitle || parsedProjectData.courseTitle;
    }
    if (parsedProjectData.customDomain !== undefined) {
      project.customDomain = parsedProjectData.customDomain;
    }
    if (parsedProjectData.projectDescription !== undefined || parsedProjectData.courseDescription !== undefined) {
      // Ensure description is not empty (required field)
      const description = (parsedProjectData.projectDescription || parsedProjectData.courseDescription)?.trim() || "";
      if (description === "" || description === "<p><br></p>") {
        return res.status(400).json({
          success: false,
          message: "Project description is required and cannot be empty",
        });
      }
      project.courseDescription = description;
    }
    if (parsedProjectData.projectPrice !== undefined || parsedProjectData.coursePrice !== undefined) {
      project.coursePrice = Number(parsedProjectData.projectPrice || parsedProjectData.coursePrice) || 0;
    }
    if (parsedProjectData.discount !== undefined) {
      project.discount = Number(parsedProjectData.discount) || 0;
    }
    if (parsedProjectData.isLocked !== undefined) {
      project.isLocked = Boolean(parsedProjectData.isLocked);
    }
    if (parsedProjectData.isTrending !== undefined) {
      project.isTrending = Boolean(parsedProjectData.isTrending);
    }
    if (parsedProjectData.projectContent !== undefined || parsedProjectData.courseContent !== undefined) {
      project.courseContent = Array.isArray(parsedProjectData.projectContent || parsedProjectData.courseContent)
        ? (parsedProjectData.projectContent || parsedProjectData.courseContent)
        : project.courseContent;
    }
    if (parsedProjectData.pdfResources !== undefined) {
      project.pdfResources = Array.isArray(parsedProjectData.pdfResources)
        ? parsedProjectData.pdfResources
        : project.pdfResources;
    }
    // projectThumbnail is handled separately below if imageFile is provided
    if (
      (parsedProjectData.projectThumbnail !== undefined || parsedProjectData.courseThumbnail !== undefined) &&
      !req.files?.image?.[0]
    ) {
      project.courseThumbnail = parsedProjectData.projectThumbnail || parsedProjectData.courseThumbnail;
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
          ? await uploadFromBuffer(imageFile.buffer, "projects")
          : await cloudinary.uploader.upload(imageFile.path, {
              folder: "projects",
            });
        if (uploadResult && uploadResult.secure_url) {
          project.courseThumbnail = uploadResult.secure_url;
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
      const pdfResources = Array.isArray(project.pdfResources)
        ? [...project.pdfResources]
        : [];
      for (const file of pdfFiles) {
        try {
          const uploadResult = file.buffer
            ? await uploadFromBuffer(file.buffer, "project_pdfs", "raw")
            : await cloudinary.uploader.upload(file.path, {
                resource_type: "raw",
                folder: "project_pdfs",
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
      project.pdfResources = pdfResources;
    }

    // Save the project
    try {
      // Validate project before saving
      const validationError = project.validateSync();
      if (validationError) {
        console.error("❌ Project validation error:", validationError);
        return res.status(400).json({
          success: false,
          message: "Project validation failed",
          error: validationError.message,
          details: validationError.errors,
        });
      }

      await project.save();
      console.log("✅ Project updated successfully:", projectId);
      console.log("  Updated fields:", {
        title: project.courseTitle,
        descriptionLength: project.courseDescription?.length || 0,
        price: project.coursePrice,
        chaptersCount: project.courseContent?.length || 0,
      });
      // Transform to use new field names
      const transformedProject = transformProjectFields(project.toObject ? project.toObject() : project);
      res.json({
        success: true,
        message: "Project updated successfully",
        project: transformedProject,
      });
    } catch (saveError) {
      console.error("❌ Error saving project:", saveError);
      console.error("  Error name:", saveError.name);
      console.error("  Error message:", saveError.message);
      if (saveError.errors) {
        console.error("  Validation errors:", saveError.errors);
      }
      return res.status(500).json({
        success: false,
        message: "Failed to save project",
        error: saveError.message,
        errorType: saveError.name,
      });
    }
  } catch (error) {
    console.error("❌ Error in updateProject:", error);
    console.error("  Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      error: error.name,
    });
  }
};

// -----------------------------
// Delete Project
// -----------------------------
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const auth = req.auth();
    const educatorId = auth?.userId;

    const project = await Project.findOne({
      _id: projectId,
      educator: educatorId,
    });
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found or unauthorized" });

    await project.deleteOne();
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Educator Dashboard Data
// -----------------------------
export const educatorDashboardData = async (req, res) => {
  try {
    const auth = req.auth();
    const educator = auth?.userId;
    if (!educator)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized educator" });

    const projects = await Project.find({ educator });
    const totalProjects = projects.length;
    const projectIds = projects.map((p) => p._id);

    const purchases = await Purchase.find({
      projectId: { $in: projectIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    const enrolledStudentsData = [];
    for (const project of projects) {
      const students = await User.find(
        { _id: { $in: project.enrolledStudents } },
        "name imageUrl"
      );
      // Filter out null/undefined students (deleted users)
      students
        .filter((s) => s && s._id) // Only include valid users
        .forEach((s) => {
          enrolledStudentsData.push({
            projectTitle: project.courseTitle, // Use old field name from DB
            student: s,
          });
        });
    }

    res.json({
      success: true,
      dashboardData: { totalEarnings, enrolledStudentsData, totalProjects },
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
    const auth = req.auth();
    const educator = auth?.userId;
    if (!educator)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized educator" });

    const projects = await Project.find({ educator });
    const projectIds = projects.map((p) => p._id);

    const purchases = await Purchase.find({
      projectId: { $in: projectIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("projectId", "courseTitle");

    // Filter out purchases where user has been deleted (userId is null or user doesn't exist)
    const enrolledStudents = purchases
      .filter((p) => p.userId && p.userId._id) // Only include purchases with valid users
      .map((p) => ({
        student: p.userId,
        projectId: p.projectId?._id,
        projectTitle: p.projectId?.courseTitle, // Use old field name from DB
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
    const { projectId, studentId } = req.params;
    const auth = req.auth();
    const educatorId = auth?.userId;

    const project = await Project.findOne({
      _id: projectId,
      educator: educatorId,
    });
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found or unauthorized" });

    project.enrolledStudents = project.enrolledStudents.filter(
      (id) => id.toString() !== studentId
    );
    await project.save();

    await Promise.all([
      User.findByIdAndUpdate(studentId, {
        $pull: { enrolledProjects: projectId },
      }),
      Purchase.deleteMany({ projectId, userId: studentId }),
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
// Assign Project to Student
// -----------------------------
export const assignProject = async (req, res) => {
  try {
    const { studentId, projectId } = req.body;
    const auth = req.auth();
    const educatorId = auth?.userId;

    const project = await Project.findOne({
      _id: projectId,
      educator: educatorId,
    });
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found or unauthorized" });

    const student = await User.findById(studentId);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    if (project.enrolledStudents.includes(studentId))
      return res.json({
        success: false,
        message: "Student already enrolled in this project",
      });

    // ✅ Add student to project enrollment
    project.enrolledStudents.push(studentId);
    await project.save();

    // ✅ Add project to student's enrolledProjects if not already present
    if (!student.enrolledProjects.includes(projectId)) {
      student.enrolledProjects.push(projectId);
      await student.save();
    }

    // ✅ Create purchase record (manual assignment)
    await Purchase.create({
      userId: studentId,
      projectId,
      status: "completed",
      amount: 0,
      paymentId: "manual-assignment",
    });

    res.json({
      success: true,
      message: "Project successfully assigned to student",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
