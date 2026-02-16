import fetch from "node-fetch";
import ProjectSubmission from "../models/ProjectSubmission.js";

// The same script URL from the frontend
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwNGdzNJHxV9OGX_BZ7VnBhBqNz78ZwgxRsgQmq7PHzy9NuORdeXX-S-sjDtldcx2ip0Q/exec";

export const submitProject = async (req, res) => {
    try {
        console.log("📥 Received Project Submission Request");
        console.log("Body:", req.body);

        const {
            studentId,
            fullName,
            email,
            contactNumber,
            domain,
            reviewDate,
            reviewMode,
            projectTitle,
            githubLink,
            linkedinLink,
            videoLink,
            zipFileUrl
        } = req.body;

        // 1. Save to MongoDB
        console.log("💾 Saving to MongoDB...");
        let newSubmission;
        try {
            newSubmission = await ProjectSubmission.create({
                studentId,
                fullName,
                email,
                contactNumber,
                domain,
                reviewDate,
                reviewMode,
                projectTitle,
                githubLink,
                linkedinLink,
                videoLink,
                zipFileUrl
            });
            console.log("✅ Project saved to MongoDB:", newSubmission._id);
        } catch (dbError) {
            console.error("❌ MongoDB Save Error:", dbError);
            return res.status(500).json({
                success: false,
                message: "Database Save Failed",
                error: dbError.message
            });
        }

        // 2. Prepare Data for Google Sheet
        const formData = new URLSearchParams();
        formData.append("fullName", fullName);
        formData.append("email", email);
        formData.append("contactNumber", contactNumber);
        formData.append("domain", domain);
        formData.append("reviewDate", reviewDate);
        formData.append("reviewMode", reviewMode);
        formData.append("projectTitle", projectTitle);
        formData.append("githubLink", githubLink);
        formData.append("linkedinLink", linkedinLink);
        formData.append("videoLink", videoLink);
        formData.append("zipFile", zipFileUrl || ""); // Send URL

        // 3. Send to Google Sheet
        let sheetSuccess = false;
        let sheetMsg = "";

        console.log("🌐 Sending to Google Sheet...", GOOGLE_SCRIPT_URL);
        try {
            const sheetResponse = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                body: formData,
            });

            const text = await sheetResponse.text();
            console.log("📄 Google Sheet Response:", text);

            if (sheetResponse.ok || text.includes("success") || text.includes("Success")) {
                sheetSuccess = true;
                sheetMsg = "Synced successfully";
            } else {
                sheetMsg = `Status: ${sheetResponse.status} - ${text.substring(0, 100)}`;
            }

        } catch (sheetError) {
            console.error("❌ Google Sheet Error:", sheetError);
            sheetMsg = sheetError.message;
        }

        // 4. Update MongoDB with Sync Status
        try {
            newSubmission.isSyncedToSheet = sheetSuccess;
            newSubmission.sheetResponse = sheetMsg;
            await newSubmission.save();
            console.log("✅ MongoDB updated with sync status");
        } catch (updateError) {
            console.error("⚠️ Failed to update sync status:", updateError);
        }

        return res.status(201).json({
            success: true,
            message: "Project submitted successfully!",
            submission: newSubmission,
            sheetSync: {
                success: sheetSuccess,
                message: sheetMsg
            }
        });

    } catch (error) {
        console.error("❌ Project Submission Critical Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during submission.",
            error: error.message
        });
    }
};
