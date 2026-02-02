import express from "express";
import { sendSupportMessage } from "../controllers/supportController.js";

const router = express.Router();

// public route
router.post("/support", express.json(), sendSupportMessage);

export default router;
