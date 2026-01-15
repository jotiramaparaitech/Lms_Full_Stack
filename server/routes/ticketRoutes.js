import express from "express";
import {
  createTicket,
  getAllTickets,
  markTicketSolved,
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

export default router;
