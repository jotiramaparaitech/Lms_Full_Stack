import React, { useState, useContext, useEffect } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import { toast } from "react-toastify";
import { Send, Calendar, User, Phone, Mail, Globe, CheckCircle, Type, Link, FileUp, Video, Loader2, Lock as LockIcon } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";


const ProjectSubmission = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        contactNumber: "",
        domain: "",
        reviewDate: "",
        reviewMode: "",
        projectTitle: "",
        githubLink: "",
        linkedinLink: "",
        zipFile: null,
        videoLink: "",
    });

    const { backendUrl, getToken } = useContext(AppContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [projectSubmissionUnlocked, setProjectSubmissionUnlocked] = useState(false);
    const [loadingAccess, setLoadingAccess] = useState(true);

    useEffect(() => {
        checkProjectAccess();
    }, []);

    const checkProjectAccess = async () => {
        try {
            const token = await getToken();
            const res = await axios.get(`${backendUrl}/api/teams/my-progress`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const teams = res.data.teams || [];
                const isUnlocked = teams.some(t => t.projectSubmissionUnlocked);
                setProjectSubmissionUnlocked(isUnlocked);
            }
        } catch (error) {
            console.error("Error checking Project Submission Access:", error);
        } finally {
            setLoadingAccess(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setFormData((prev) => ({
                ...prev,
                [name]: files[0],
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!projectSubmissionUnlocked) {
            toast.error("Project submission is locked. Please contact your Team Leader.");
            return;
        }

        console.log("Submitting Project Form:", formData);

        if (!formData.reviewMode) {
            toast.error("Please select a review mode");
            return;
        }

        setIsSubmitting(true);

        try {
            let zipFileUrl = "";

            // 1. Upload file if it exists
            if (formData.zipFile) {
                const toastId = toast.loading("Uploading project file...");
                try {
                    const fileData = new FormData();
                    fileData.append("file", formData.zipFile);

                    const uploadResponse = await axios.post(
                        `${backendUrl}/api/upload/project`,
                        fileData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );

                    if (uploadResponse.data.success) {
                        zipFileUrl = uploadResponse.data.fileUrl;
                        toast.update(toastId, { render: "File uploaded successfully!", type: "success", isLoading: false, autoClose: 2000 });
                    } else {
                        throw new Error(uploadResponse.data.message || "File upload failed");
                    }
                } catch (uploadError) {
                    console.error("Upload Error:", uploadError);
                    toast.update(toastId, { render: "File upload failed. Please try again.", type: "error", isLoading: false, autoClose: 3000 });
                    setIsSubmitting(false);
                    return;
                }
            }

            // 2. Submit to Backend (which saves to DB and sends to Sheet)
            const submissionData = {
                ...formData,
                zipFileUrl: zipFileUrl, // Send URL
            };
            // Delete raw file object before sending JSON
            delete submissionData.zipFile;

            const response = await axios.post(
                `${backendUrl}/api/project/submit`,
                submissionData
            );

            if (response.data.success) {
                toast.success(response.data.message);

                // Optional: Show sheet sync status warning if it failed but DB save worked
                if (!response.data.sheetSync?.success) {
                    toast.warning("Project saved, but sheet sync failed: " + response.data.sheetSync?.message);
                }

                // Reset form
                setFormData({
                    fullName: "",
                    email: "",
                    contactNumber: "",
                    domain: "",
                    reviewDate: "",
                    reviewMode: "",
                    projectTitle: "",
                    githubLink: "",
                    linkedinLink: "",
                    zipFile: null,
                    videoLink: "",
                });
            } else {
                toast.error(response.data.message || "Submission failed");
            }

        } catch (error) {
            console.error("Error!", error);
            toast.error(error.response?.data?.message || "Submission failed. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingAccess) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (

        <StudentLayout>
            <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-3">
                            <Send className="text-cyan-600" size={32} />
                            Project Submission
                        </h1>
                        <p className="text-gray-500 mt-2 ml-1">
                            Submit your project details for review.
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {/* Status Banner */}
                        {!projectSubmissionUnlocked && (
                            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                <div className="p-1 bg-amber-100 rounded-full text-amber-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-amber-800">Project Submission Locked</h3>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Your Team Leader has not unlocked project submission for you yet. Please request access to submit your project.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Your answer"
                                        required
                                        disabled={!projectSubmissionUnlocked}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400 ${!projectSubmissionUnlocked && "bg-gray-50 text-gray-400"}`}
                                    />
                                </div>
                            </div>

                            {/* Email ID */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Email ID <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Your answer"
                                        required
                                        disabled={!projectSubmissionUnlocked}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400 ${!projectSubmissionUnlocked && "bg-gray-50 text-gray-400"}`}
                                    />
                                </div>
                            </div>

                            {/* Contact Number */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Contact Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        placeholder="Your answer"
                                        required
                                        disabled={!projectSubmissionUnlocked}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400 ${!projectSubmissionUnlocked && "bg-gray-50 text-gray-400"}`}
                                    />
                                </div>
                            </div>

                            {/* Domain */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Domain <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="domain"
                                        value={formData.domain}
                                        onChange={handleChange}
                                        placeholder="Your answer"
                                        required
                                        disabled={!projectSubmissionUnlocked}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400 ${!projectSubmissionUnlocked && "bg-gray-50 text-gray-400"}`}
                                    />
                                </div>
                            </div>

                            {/* Review Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Review Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        name="reviewDate"
                                        value={formData.reviewDate}
                                        onChange={handleChange}
                                        required
                                        disabled={!projectSubmissionUnlocked}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-gray-600 ${!projectSubmissionUnlocked && "bg-gray-50 text-gray-400"}`}
                                    />
                                </div>
                            </div>

                            {/* Review Mode */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Review Mode <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <label className={`
                  flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${!projectSubmissionUnlocked ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" :
                                            formData.reviewMode === "Offline"
                                                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                                                : "border-gray-200 hover:border-cyan-200 text-gray-600"}
                `}>
                                        <input
                                            type="radio"
                                            name="reviewMode"
                                            value="Offline"
                                            checked={formData.reviewMode === "Offline"}
                                            onChange={handleChange}
                                            disabled={!projectSubmissionUnlocked}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.reviewMode === "Offline" ? "border-cyan-500" : "border-gray-300"}`}>
                                            {formData.reviewMode === "Offline" && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>}
                                        </div>
                                        <span className="font-medium">Offline</span>
                                    </label>

                                    <label className={`
                  flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${!projectSubmissionUnlocked ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" :
                                            formData.reviewMode === "Online"
                                                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                                                : "border-gray-200 hover:border-cyan-200 text-gray-600"}
                `}>
                                        <input
                                            type="radio"
                                            name="reviewMode"
                                            value="Online"
                                            checked={formData.reviewMode === "Online"}
                                            onChange={handleChange}
                                            disabled={!projectSubmissionUnlocked}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.reviewMode === "Online" ? "border-cyan-500" : "border-gray-300"}`}>
                                            {formData.reviewMode === "Online" && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>}
                                        </div>
                                        <span className="font-medium">Online</span>
                                    </label>
                                </div>
                            </div>

                            {/* Project Title */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Project Title <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="projectTitle"
                                        value={formData.projectTitle}
                                        onChange={handleChange}
                                        placeholder="Your answer"
                                        required
                                        disabled={!projectSubmissionUnlocked}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400 ${!projectSubmissionUnlocked && "bg-gray-50 text-gray-400"}`}
                                    />
                                </div>
                            </div>

                            {/* GitHub Link */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    GitHub Project Repository Link <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="url"
                                        name="githubLink"
                                        value={formData.githubLink}
                                        onChange={handleChange}
                                        placeholder="Your answer"
                                        required
                                        disabled={!projectSubmissionUnlocked}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400 ${!projectSubmissionUnlocked && "bg-gray-50 text-gray-400"}`}
                                    />
                                </div>
                            </div>

                            {/* LinkedIn Link */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    LinkedIn Project Post Link <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="url"
                                        name="linkedinLink"
                                        value={formData.linkedinLink}
                                        onChange={handleChange}
                                        placeholder="Your answer"
                                        required
                                        disabled={!projectSubmissionUnlocked}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400 ${!projectSubmissionUnlocked && "bg-gray-50 text-gray-400"}`}
                                    />
                                </div>
                            </div>

                            {/* Output Video Drive Link */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Output Video Drive Link <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="url"
                                        name="videoLink"
                                        value={formData.videoLink}
                                        onChange={handleChange}
                                        placeholder="Paste your video drive link here"
                                        required
                                        disabled={!projectSubmissionUnlocked}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400 ${!projectSubmissionUnlocked && "bg-gray-50 text-gray-400"}`}
                                    />
                                </div>
                            </div>

                            {/* Upload Zip File */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Upload Zip File <span className="text-red-500">*</span>
                                </label>
                                <div className={`border-2 border-dashed border-gray-300 rounded-xl p-6 transition-colors ${!projectSubmissionUnlocked ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50/50 hover:border-cyan-500"}`}>
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <FileUp className="text-gray-400 mb-2" size={32} />
                                        <p className="text-sm text-gray-600 mb-1">
                                            Upload 1 supported file. Max 100 MB.
                                        </p>
                                        <label className={`cursor-pointer mt-2 inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg shadow-sm font-medium transition-all ${!projectSubmissionUnlocked ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-50 text-cyan-600"}`}>
                                            <FileUp size={16} />
                                            <span>Add file</span>
                                            <input
                                                type="file"
                                                name="zipFile"
                                                onChange={handleChange}
                                                accept=".zip,.rar,.7z"
                                                className="hidden"
                                                required
                                                disabled={!projectSubmissionUnlocked}
                                            />
                                        </label>
                                        {formData.zipFile && (
                                            <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                                                <CheckCircle size={14} />
                                                {formData.zipFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !projectSubmissionUnlocked}
                                    className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 
                                        ${!projectSubmissionUnlocked
                                            ? "bg-gray-400 text-white cursor-not-allowed"
                                            : isSubmitting
                                                ? "bg-gradient-to-r from-cyan-600 to-cyan-500 opacity-70 cursor-not-allowed"
                                                : "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Submitting...
                                        </>
                                    ) : !projectSubmissionUnlocked ? (
                                        <>
                                            <LockIcon size={20} />
                                            Need Access from Team Lead
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Submit Project
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default ProjectSubmission;
