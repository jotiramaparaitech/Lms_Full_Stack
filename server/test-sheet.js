import fetch from "node-fetch";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwNGdzNJHxV9OGX_BZ7VnBhBqNz78ZwgxRsgQmq7PHzy9NuORdeXX-S-sjDtldcx2ip0Q/exec";

const testSync = async () => {
    console.log("🚀 Testing Google Sheet Sync...");

    const formData = new URLSearchParams();
    formData.append("fullName", "Test User");
    formData.append("email", "test@example.com");
    formData.append("contactNumber", "1234567890");
    formData.append("domain", "Test Domain");
    formData.append("reviewDate", "2024-01-01");
    formData.append("reviewMode", "Online");
    formData.append("projectTitle", "Test Project");
    formData.append("githubLink", "https://github.com/test");
    formData.append("linkedinLink", "https://linkedin.com/test");
    formData.append("videoLink", "https://drive.google.com/test");
    formData.append("zipFile", "https://cloudinary.com/test.zip");

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: formData,
            redirect: "follow" // Explicitly follow redirects
        });

        console.log("Create Response Status:", response.status);
        console.log("Create Response Text:", await response.text());

    } catch (error) {
        console.error("❌ Error:", error);
    }
};

testSync();
