import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";


const RegistrationForm = ({ isOpen, onClose, onSubmit, isSubmitting, courseName, coursePrice, currency, userData }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        college: "",
        projectOpted: "Web Development", // Default or dynamic
        monthOpted: "",
        yearOfGraduation: "",
        stream: "",
        scholarshipId: "",
        language: "",
    });

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle Submit
    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.fullName || !formData.email || !formData.phone || !formData.college || !formData.monthOpted || !formData.yearOfGraduation || !formData.stream) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (formData.phone.length < 10) {
            toast.error("Please enter a valid phone number.");
            return;
        }

        onSubmit(formData);
    };

    // Dropdown Options
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
    // const gradYears = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i); // e.g. 2024-2029
    const gradYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];

    const projects = ["Web Development", "App Development", "Data Science", "Machine Learning", "Cyber Security", "Cloud Computing"]; // Example projects, can be dynamic

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] pointer-events-auto flex flex-col md:flex-row"
                            onClick={(e) => e.stopPropagation()}
                        >

                            {/* Left Side - Info */}
                            <div className="hidden md:flex flex-col justify-between w-1/3 bg-gray-50 p-8 border-r border-gray-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <img src={assets.logo} alt="Company Logo" className="h-10 w-auto object-contain" />
                                        <span className="text-xl font-bold text-gray-800 ml-2">Aparaitech Software</span>
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                        Tech Program: 3 Month with Live Projects
                                    </h2>
                                    <div className="h-1 w-10 bg-blue-600 mb-6"></div>

                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Final-Registration Form</h3>
                                    <p className="text-gray-500 text-sm mb-6 border-b border-gray-200 pb-4 border-dashed">
                                        ----------------------------------------
                                    </p>

                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                        Join our 3-month online Live program designed to equip you with the latest industry skills. Gain hands-on experience with 10+ live projects under the guidance of FAANG Team Leader.
                                    </p>

                                    <div className="text-sm text-gray-700 space-y-2 mb-6">
                                        <p className="font-semibold">Program Highlights:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>10+ Live Projects reflecting real-world scenarios</li>
                                            <li>Expert Mentorship from top industry professionals</li>
                                        </ul>
                                    </div>


                                </div>

                                <div className="mt-8 text-xs text-gray-500 space-y-1">
                                    <p className="font-bold text-gray-700">Contact Us:</p>
                                    <p>📧 info@aparaitechsoftware.org</p>
                                    <p>📞 +916364326342</p>
                                </div>
                            </div>

                            {/* Right Side - Form */}
                            <div className="flex-1 flex flex-col h-full bg-white relative">
                                {/* Close Button Mobile */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition md:hidden"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>

                                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">Payment Details</h2>
                                            <div className="h-1 w-10 bg-blue-900 mt-2"></div>
                                        </div>
                                        <button onClick={onClose} className="hidden md:block text-gray-400 hover:text-gray-600">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">

                                        {/* Full Name */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <label className="text-gray-500 text-sm">Full Name to be displayed on certificate</label>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    placeholder="Enter your full name"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <label className="text-gray-500 text-sm">Email</label>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="Enter your email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <label className="text-gray-500 text-sm">Phone</label>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="Enter your phone number"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                                />
                                            </div>
                                        </div>

                                        {/* College Name */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <label className="text-gray-500 text-sm">College Name</label>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    name="college"
                                                    placeholder="Enter your college name"
                                                    value={formData.college}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                                />
                                            </div>
                                        </div>

                                        {/* Project Opted */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <label className="text-gray-500 text-sm">Project Domain</label>
                                            <div className="md:col-span-2">
                                                <select
                                                    name="projectOpted"
                                                    value={formData.projectOpted}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white"
                                                >
                                                    <option value="">--Select--</option>
                                                    {projects.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Month Opted */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <label className="text-gray-500 text-sm">Start Month</label>
                                            <div className="md:col-span-2">
                                                <select
                                                    name="monthOpted"
                                                    value={formData.monthOpted}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white"
                                                >
                                                    <option value="">--Select--</option>
                                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Year Of Graduation */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <label className="text-gray-500 text-sm">Year Of Graduation</label>
                                            <div className="md:col-span-2">
                                                <select
                                                    name="yearOfGraduation"
                                                    value={formData.yearOfGraduation}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white"
                                                >
                                                    <option value="">--Select--</option>
                                                    {gradYears.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Stream Pursuing */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <label className="text-gray-500 text-sm">Stream Pursuing</label>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    name="stream"
                                                    placeholder="e.g. Computer Science"
                                                    value={formData.stream}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                                />
                                            </div>
                                        </div>


                                        {/* Language to speak */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <label className="text-gray-500 text-sm">Language to speak</label>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    name="language"
                                                    placeholder="e.g. Hindi, English"
                                                    value={formData.language}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                                />
                                            </div>
                                        </div>

                                    </form>
                                </div>

                                {/* Sticky Footer for Pay Button */}
                                <div className="p-6 bg-gray-50 border-t border-gray-200 mt-auto flex items-center justify-between">
                                    <div className="flex gap-4">
                                        {/* Payment Icons */}
                                        <div className="flex gap-2">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1024px-UPI-Logo-vector.svg.png" alt="UPI" className="h-4 object-contain" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="VISA" className="h-4 object-contain" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 object-contain" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 object-contain" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-gray-800 text-white px-8 py-3 rounded hover:bg-gray-900 transition flex items-center gap-2 font-medium"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                        Pay {currency} {coursePrice}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RegistrationForm;
