import Ticket from "../models/Ticket.js";
import { ensureUserExists } from "./userController.js";

// ✅ NEW IMPORTS FOR NOTIFICATIONS
import DeviceToken from "../models/DeviceToken.js";
import admin from "../configs/firebase.js";

/**
 * @desc    Student creates a support ticket
 * @route   POST /api/tickets
 * @access  Protected (Clerk)
 */
export const createTicket = async (req, res) => {
  try {
    const auth = req.auth();
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    const { query } = req.body;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const user = await ensureUserExists(clerkUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or could not be created",
      });
    }

    const ticket = await Ticket.create({
      userId: clerkUserId,
      name: user.name,
      email: user.email,
      query,
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Educator (Admin) gets all tickets
 * @route   GET /api/tickets/educator
 * @access  Educator only
 */
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Get Tickets Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Educator marks ticket as solved
 * @route   PUT /api/tickets/:id/solve
 * @access  Educator only
 */
export const markTicketSolved = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.status = "solved";
    await ticket.save();

    // ======================================================
    // 🔔 START: NOTIFICATION LOGIC (UPDATED)
    // ======================================================
    try {
      // 1. Find the student's device token
      const userDevice = await DeviceToken.findOne({ userId: ticket.userId });

      // 2. Send Notification if token exists
      if (userDevice && userDevice.token) {
        await admin.messaging().send({
          token: userDevice.token,
          // ✅ CHANGED: We use 'data' so your Service Worker handles the UI
          data: {
            title: "Ticket Resolved ✅",
            body: `Your ticket regarding "${ticket.query.substring(0, 20)}..." has been resolved.`,
          }
        });
        console.log(`✅ Data notification sent to user ${ticket.userId}`);
      }
    } catch (notifError) {
      // We log the error but don't stop the request
      console.error("⚠️ Failed to send notification:", notifError);
    }
    // ======================================================
    // 🔔 END: NOTIFICATION LOGIC
    // ======================================================

    res.status(200).json({
      success: true,
      message: "Ticket marked as solved",
      ticket,
    });
  } catch (error) {
    console.error("Solve Ticket Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Delete a ticket
 * @route   DELETE /api/tickets/:id
 * @access  Protected (Owner or Educator)
 */
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get User ID from Token
    const auth = req.auth();
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 2. Find the Ticket
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // 3. Determine User Role
    // PRIORITY: Check req.user (from Middleware) -> Fallback: Check Database
    let userRole = "student";

    if (req.user && req.user.role) {
      // Use role from Clerk Metadata (via protect middleware)
      userRole = req.user.role;
    } else {
      // Fallback: Fetch from DB if middleware didn't populate req.user
      const user = await ensureUserExists(clerkUserId);
      if (user && user.role) userRole = user.role;
    }

    // Normalize for case-insensitive check
    userRole = String(userRole).toLowerCase();

    // 4. Permissions Check
    const isOwner = String(ticket.userId) === String(clerkUserId);
    const isEducatorOrAdmin = userRole === "educator" || userRole === "admin";

    // Debug Log
    console.log(`[DEBUG] Delete: User=${clerkUserId} | Role=${userRole} | TicketOwner=${ticket.userId} | Auth=${isOwner || isEducatorOrAdmin}`);

    if (!isOwner && !isEducatorOrAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Educators or the Ticket Owner can delete this.",
      });
    }

    // 5. Delete the ticket
    await ticket.deleteOne();

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });

  } catch (error) {
    console.error("Delete Ticket Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};