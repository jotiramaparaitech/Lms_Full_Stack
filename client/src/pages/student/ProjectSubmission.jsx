import React, { useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import { toast } from "react-toastify";
import { Send, Calendar, User, Phone, Mail, Globe, CheckCircle, Type, Link, FileUp, Video } from "lucide-react";


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
        videoFile: null,
    });

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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting Project Form:", formData);

        // Simulate submission
        if (!formData.reviewMode) {
            toast.error("Please select a review mode");
            return;
        }

        toast.success("Project submitted successfully!");
        // Reset form or redirect logic here
    };

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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400"
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400"
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400"
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400"
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-gray-600"
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
                  ${formData.reviewMode === "Offline"
                                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                                        : "border-gray-200 hover:border-cyan-200 text-gray-600"}
                `}>
                                    <input
                                        type="radio"
                                        name="reviewMode"
                                        value="Offline"
                                        checked={formData.reviewMode === "Offline"}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.reviewMode === "Offline" ? "border-cyan-500" : "border-gray-300"}`}>
                                        {formData.reviewMode === "Offline" && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>}
                                    </div>
                                    <span className="font-medium">Offline</span>
                                </label>

                                <label className={`
                  flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${formData.reviewMode === "Online"
                                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                                        : "border-gray-200 hover:border-cyan-200 text-gray-600"}
                `}>
                                    <input
                                        type="radio"
                                        name="reviewMode"
                                        value="Online"
                                        checked={formData.reviewMode === "Online"}
                                        onChange={handleChange}
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400"
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400"
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Upload Zip File */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Upload Zip File <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-cyan-500 transition-colors bg-gray-50/50">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <FileUp className="text-gray-400 mb-2" size={32} />
                                    <p className="text-sm text-gray-600 mb-1">
                                        Upload 1 supported file. Max 100 MB.
                                    </p>
                                    <label className="cursor-pointer mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-cyan-600 font-medium transition-all">
                                        <FileUp size={16} />
                                        <span>Add file</span>
                                        <input
                                            type="file"
                                            name="zipFile"
                                            onChange={handleChange}
                                            accept=".zip,.rar,.7z"
                                            className="hidden"
                                            required
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

                        {/* Output Video File */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Output Video File <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-cyan-500 transition-colors bg-gray-50/50">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <Video className="text-gray-400 mb-2" size={32} />
                                    <p className="text-sm text-gray-600 mb-1">
                                        Upload 1 supported file. Max 10 MB.
                                    </p>
                                    <label className="cursor-pointer mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-cyan-600 font-medium transition-all">
                                        <Video size={16} />
                                        <span>Add file</span>
                                        <input
                                            type="file"
                                            name="videoFile"
                                            onChange={handleChange}
                                            accept="video/*"
                                            className="hidden"
                                            required
                                        />
                                    </label>
                                    {formData.videoFile && (
                                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                                            <CheckCircle size={14} />
                                            {formData.videoFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <Send size={20} />
                                Submit Project
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
