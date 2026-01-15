import { clerkClient } from "@clerk/express";

// ✅ Middleware: Protect General Authenticated Routes
export const protect = async (req, res, next) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no user found" });
    }

    // Optionally verify the user exists in Clerk
    const user = await clerkClient.users.getUser(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Attach user data to request
    req.user = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      role: user.publicMetadata?.role || "student",
    };

    next();
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Auth middleware error",
        error: error.message,
      });
  }
};

// ✅ Middleware: Protect Educator Routes
export const protectEducator = async (req, res, next) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no user found" });
    }

    const response = await clerkClient.users.getUser(userId);

    if (response.publicMetadata.role !== "educator") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized Access: Educators only",
        });
    }

    // Attach educator user info to request
    req.user = {
      id: response.id,
      email: response.emailAddresses[0]?.emailAddress || "",
      role: response.publicMetadata.role,
    };

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Middleware: Alias for Educator Role Check (for courseRoute.js compatibility)
export const isEducator = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "educator") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: Educators only" });
    }
    next();
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
