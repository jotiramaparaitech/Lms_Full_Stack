import mongoose from "mongoose";

const projectSubmissionSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            ref: "User",
            required: false, // Optional for now, in case we want to allow guest submissions or if auth is flaky
        },
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        contactNumber: { type: String, required: true },
        domain: { type: String, required: true },
        reviewDate: { type: String, required: true },
        reviewMode: { type: String, enum: ["Online", "Offline"], required: true },
        projectTitle: { type: String, required: true },
        githubLink: { type: String, required: true },
        linkedinLink: { type: String, required: true },
        videoLink: { type: String, required: true },
        zipFileUrl: { type: String, required: false }, // URL from Cloudinary

        // Status tracking
        isSyncedToSheet: { type: Boolean, default: false },
        sheetResponse: { type: String, default: "" }, // Store error/success message from Google Script
    },
    { timestamps: true }
);

const ProjectSubmission = mongoose.model("ProjectSubmission", projectSubmissionSchema);

export default ProjectSubmission;
