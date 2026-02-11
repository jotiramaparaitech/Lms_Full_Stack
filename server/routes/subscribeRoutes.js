import express from "express";
import { subscribe } from "../controllers/subscribe.controller.js";

const router = express.Router();

// PUBLIC route (no auth, no clerk)
router.post("/subscribe", express.json(), subscribe);

export default router;
