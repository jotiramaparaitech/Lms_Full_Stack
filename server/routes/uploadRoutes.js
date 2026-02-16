import express from "express";
import upload from "../configs/multer.js";
import { uploadFile } from "../controllers/uploadController.js";

const uploadRouter = express.Router();

uploadRouter.post("/project", upload.single("file"), uploadFile);

export default uploadRouter;
