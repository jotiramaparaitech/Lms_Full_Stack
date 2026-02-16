import { v2 as cloudinary } from "cloudinary";

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        console.log("📁 File upload request:", {
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
        });

        // Determine resource type based on mime type
        const fileMimeType = req.file.mimetype;
        let resourceType = "auto";

        if (fileMimeType === "application/pdf" ||
            fileMimeType.includes("msword") ||
            fileMimeType.includes("document") ||
            fileMimeType.includes("excel") ||
            fileMimeType.includes("spreadsheet") ||
            fileMimeType === "text/plain" ||
            fileMimeType.includes("zip") ||
            fileMimeType.includes("rar") ||
            fileMimeType.includes("compressed")) {
            resourceType = "raw";
        } else if (fileMimeType.startsWith("image/")) {
            resourceType = "image";
        } else if (fileMimeType.startsWith("video/")) {
            resourceType = "video";
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "project_submissions",
                    resource_type: resourceType,
                    use_filename: true,
                    unique_filename: false,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        console.log("✅ Cloudinary upload successful:", uploadResult.secure_url);

        return res.json({
            success: true,
            message: "File uploaded successfully",
            fileUrl: uploadResult.secure_url,
            fileName: req.file.originalname,
            fileType: fileMimeType,
        });

    } catch (error) {
        console.error("❌ Upload error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
