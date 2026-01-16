import Project from "../models/Project.js";
import { ProjectProgress } from "../models/ProjectProgress.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

// ---------------- Helper: Ensure User Exists in DB ----------------
export const ensureUserExists = async (userId) => {
  if (!userId) {
    console.error("ensureUserExists: userId is missing");
    return null;
  }

  let user = await User.findById(userId);

  if (!user) {
    // User doesn't exist in DB, fetch from Clerk and create
    try {
      const clerkUser = await clerkClient.users.getUser(userId);

      if (clerkUser) {
        const firstName = clerkUser.firstName || "";
        const lastName = clerkUser.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim();

        const userData = {
          _id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: fullName || clerkUser.username || "User",
          imageUrl: clerkUser.imageUrl || "",
          role: clerkUser.publicMetadata?.role || "student",
        };

        try {
          user = await User.create(userData);
          console.log(`✅ User created in DB: ${userId}`);
        } catch (createError) {
          // Handle duplicate key error (user might have been created by webhook)
          if (
            createError.code === 11000 ||
            createError.name === "MongoServerError"
          ) {
            console.log(
              `⚠️ User might already exist, trying to fetch: ${userId}`
            );
            user = await User.findById(userId);
            if (!user) {
              // If still not found, try to update instead
              user = await User.findByIdAndUpdate(userId, userData, {
                new: true,
                upsert: true,
              });
            }
          } else {
            console.error("Error creating user from Clerk:", createError);
            throw createError;
          }
        }
      } else {
        console.error(`Clerk user not found for userId: ${userId}`);
      }
    } catch (error) {
      console.error("Error fetching/creating user from Clerk:", error);
      // Don't return null immediately, try one more time to find the user
      user = await User.findById(userId);
      if (!user) {
        console.error(`Failed to create user after retry: ${userId}`);
        return null;
      }
    }
  }

  return user;
};

// ---------------- Get User Data ----------------
export const getUserData = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in again.",
      });
    }

    // Try to ensure user exists (will create if needed)
    let user = await ensureUserExists(userId);

    // If still not found, try one more time after a short delay
    if (!user) {
      console.log(`Retrying user creation for: ${userId}`);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
      user = await ensureUserExists(userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Unable to create user account. Please try logging in again or contact support.",
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error in getUserData:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching user data.",
    });
  }
};

// ---------------- Users Enrolled Projects ----------------
export const userEnrolledProjects = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId;
    const userData = await ensureUserExists(userId);

    if (!userData) {
      return res.json({ success: true, enrolledProjects: [] });
    }

    // Populate enrolled projects
    await userData.populate("enrolledProjects");
    res.json({
      success: true,
      enrolledProjects: userData.enrolledProjects || [],
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Update User Project Progress ----------------
export const updateUserProjectProgress = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId;
    const { projectId, lectureId } = req.body;

    const progressData = await ProjectProgress.findOne({ userId, projectId });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({
          success: true,
          message: "Lecture Already Completed",
        });
      }

      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await ProjectProgress.create({
        userId,
        projectId,
        lectureCompleted: [lectureId],
      });
    }

    res.json({ success: true, message: "Progress Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Get User Project Progress ----------------
export const getUserProjectProgress = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId;
    const { projectId } = req.body;

    const progressData = await ProjectProgress.findOne({ userId, projectId });

    res.json({ success: true, progressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Add User Ratings ----------------
export const addUserRating = async (req, res) => {
  const auth = req.auth();
  const userId = auth.userId;
  const { projectId, rating } = req.body;

  if (!projectId || !userId || !rating || rating < 1 || rating > 5) {
    return res.json({ success: false, message: "Invalid Details" });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.json({ success: false, message: "Project not found." });
    }

    const user = await ensureUserExists(userId);
    if (!user || !user.enrolledProjects.includes(projectId)) {
      return res.json({
        success: false,
        message: "User has not purchased this project.",
      });
    }

    const existingRatingIndex = project.courseRatings.findIndex(
      (r) => r.userId === userId
    );

    if (existingRatingIndex > -1) {
      project.courseRatings[existingRatingIndex].rating = rating;
    } else {
      project.courseRatings.push({ userId, rating });
    }

    await project.save();

    return res.json({ success: true, message: "Rating added" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
