import multer from "multer";

// Minimal storage setup
const storage = multer.memoryStorage(); // store files in memory temporarily

const upload = multer({ storage });

export default upload;
