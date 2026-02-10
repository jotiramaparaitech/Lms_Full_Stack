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
  getMyTeamProgress,
  updateTeamName,
  updateTeamDetails,
  editMessage,
  deleteMessageById,
  getTeamFiles,
  getAllTeamsForAdmin
} from "../controllers/teamController.js";

import { requireAuth } from "@clerk/express";
import upload from "../configs/multer.js";
import { uploadTeamFile } from "../controllers/teamUploadController.js";

const teamRouter = express.Router();

// ================= TEAM LIST =================
// For students / team leaders (own teams only)
teamRouter.get("/list", requireAuth(), getTeams);

// For admin / educator (ALL teams)
teamRouter.get("/admin/list", requireAuth(), getAllTeamsForAdmin);

// ================= TEAM CREATE =================
teamRouter.post(
  "/create",
  requireAuth(),
  upload.single("logo"),
  createTeam
);

// ================= TEAM MANAGEMENT =================
teamRouter.delete("/delete/:teamId", requireAuth(), deleteTeam);
teamRouter.put("/update-name", requireAuth(), updateTeamName);
teamRouter.post("/manage-request", requireAuth(), manageRequest);
teamRouter.post("/remove-member", requireAuth(), removeMember);
teamRouter.post("/join-request", requireAuth(), joinTeamRequest);
teamRouter.put("/update", requireAuth(), upload.single("logo"), updateTeamDetails);

// ================= MESSAGING =================
teamRouter.post("/message/send", requireAuth(), sendMessage);
teamRouter.get("/messages/:teamId", requireAuth(), getMessages);

// Get team files endpoint
teamRouter.get("/files/:teamId", requireAuth(), getTeamFiles);

teamRouter.post(
  "/message/upload",
  requireAuth(),
  upload.single("file"),
  uploadTeamFile
);
teamRouter.put(
  "/message/edit",
  requireAuth(),
  upload.single("file"),
  editMessage
);
teamRouter.delete("/message/delete/:messageId", requireAuth(), deleteMessageById);

// ================= STUDENT =================
teamRouter.get("/student-info", requireAuth(), getStudentInfo);
teamRouter.put("/update-progress", requireAuth(), updateStudentProgress);
teamRouter.get("/my-progress", requireAuth(), getMyTeamProgress);

export default teamRouter;