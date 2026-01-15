import Ticket from "../models/Ticket.js";
import { ensureUserExists } from "./userController.js";

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
      userId: clerkUserId, // ✅ Clerk ID (string)
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
