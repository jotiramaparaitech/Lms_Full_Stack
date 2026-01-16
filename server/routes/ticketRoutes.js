import express from "express";
import {
  createTicket,
  getAllTickets,
  markTicketSolved,
  deleteTicket, // <--- THIS WAS MISSING. I ADDED IT HERE.
} from "../controllers/ticketController.js";

import {
  protect,
  protectEducator,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Student → Create ticket
router.post("/", protect, createTicket);

// Educator (Admin) → View all tickets
router.get("/educator", protectEducator, getAllTickets);

// Educator (Admin) → Mark ticket as solved
router.put("/:id/solve", protectEducator, markTicketSolved);

// Owner/Admin → Delete ticket
router.delete("/:id", protect, deleteTicket);

export default router;