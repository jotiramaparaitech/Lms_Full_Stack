import express from "express";
import { submitProject } from "../controllers/projectController.js";

const projectRouter = express.Router();

projectRouter.post("/submit", submitProject);

export default projectRouter;
