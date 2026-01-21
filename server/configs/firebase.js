// server/config/firebase.js
import admin from "firebase-admin";
import { createRequire } from "module";

// 1. Create a 'require' function specifically to load JSON files
const require = createRequire(import.meta.url);

// 2. Load the Service Account Key
const serviceAccount = require("../service-account.json");

// 3. Initialize Firebase
// (Check if apps.length is 0 to prevent "App already exists" errors during hot-reloads)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
//hello
