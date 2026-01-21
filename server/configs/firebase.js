import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

let serviceAccount;

try {
  // 🔹 PRIORITY 1: Check Environment Variable (Production/Deployment)
  // This is how we fix the "missing file" error on Vercel/Render
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // We expect the ENV variable to be a stringified JSON object
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  // 🔹 PRIORITY 2: Check Local File (Local Development)
  // This runs if you are on your laptop and haven't set the specific ENV var
  else {
    serviceAccount = require("../service-account.json");
  }
} catch (error) {
  console.error("❌ Firebase Credential Error:", error.message);
  console.error(
    "👉 Make sure 'service-account.json' exists locally OR 'FIREBASE_SERVICE_ACCOUNT' env var is set.",
  );
}

// Initialize Firebase
if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin Initialized");
}

export default admin;
