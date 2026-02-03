import express from "express";
import {
  createTeam,
  deleteTeam,
  getMessages,
  getTeams,
  joinTeamRequest,
  manageRequest,
  removeMember,
  sendMessage,
  getStudentInfo,
  updateStudentProgress,
  getMyTeamProgress, // ✅ NEW
} from "../controllers/teamController.js";

import { requireAuth } from "@clerk/express";

const teamRouter = express.Router();

// Public/Protected
teamRouter.get("/list", requireAuth(), getTeams);

// Team Management
teamRouter.post("/create", requireAuth(), createTeam);
teamRouter.delete("/delete/:teamId", requireAuth(), deleteTeam);
teamRouter.post("/manage-request", requireAuth(), manageRequest);
teamRouter.post("/remove-member", requireAuth(), removeMember);

// Member Actions
teamRouter.post("/join-request", requireAuth(), joinTeamRequest);

// Messaging
teamRouter.post("/message/send", requireAuth(), sendMessage);
teamRouter.get("/messages/:teamId", requireAuth(), getMessages);

// Student Info (Leader Only)
teamRouter.get("/student-info", requireAuth(), getStudentInfo);
teamRouter.put("/update-progress", requireAuth(), updateStudentProgress);

// ✅ NEW: Student progress fetch
teamRouter.get("/my-progress", requireAuth(), getMyTeamProgress);

export default teamRouter;