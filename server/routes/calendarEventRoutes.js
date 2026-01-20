import express from "express";
import { requireAuth } from "@clerk/express";
import {
  createEvent,
  deleteEvent,
  getMyTeamEvents,
  updateEvent,
} from "../controllers/calendarEventController.js";
import { isTeamLeader } from "../middlewares/isTeamLeader.js";

const calendarRouter = express.Router();

// 👀 Student + Leader both can view
calendarRouter.get("/my-team-events", requireAuth(), getMyTeamEvents);

// 👑 Only leader can create
calendarRouter.post("/create", requireAuth(), isTeamLeader, createEvent);

// 👑 Only leader can update/delete
calendarRouter.put("/update/:id", requireAuth(), isTeamLeader, updateEvent);
calendarRouter.delete("/delete/:id", requireAuth(), isTeamLeader, deleteEvent);

export default calendarRouter;
