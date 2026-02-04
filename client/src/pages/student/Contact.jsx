import React, { useState } from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets";
import Footer from "../../components/student/Footer";
import { toast } from "react-toastify";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/support`,
        {
          name: formData.name,
          email: formData.email,
          message: `
Subject: ${formData.subject || "General Inquiry"}
Phone: ${formData.phone || "Not provided"}

Message:
${formData.message}
        `,
        }
      );

      toast.success("Message sent successfully! We'll get back to you soon.");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Have a question or want to learn more? We'd love to hear from you.
            Send us a message and we'll respond as soon as possible.
          </motion.p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form - 3D Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            {/* 3D Card Effect */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20 transform transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-2">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-20 blur-xl -z-10"></div>

              {/* Inner Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-100/50 via-transparent to-purple-100/50 opacity-50"></div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-cyan-600" />
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Your full name"
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="your.email@example.com"
                  />
                </motion.div>

                {/* Phone Field */}
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="+1 (555) 123-4567"
                  />
                </motion.div>

                {/* Subject Field */}
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="What's this about?"
                  />
                </motion.div>

                {/* Message Field */}
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-700 via-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info & Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col gap-8"
          >
            {/* Contact Information Cards */}
            <div className="space-y-6">
              {/* Email Card */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex items-start gap-4 hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Email Us</h3>
                  <p className="text-gray-600 text-sm">
                    Send us an email anytime
                  </p>
                  <a
                    href="mailto:info@aparaitechsoftware.org"
                    className="text-cyan-600 hover:text-cyan-700 font-medium text-sm mt-1 block"
                  >
                    info@aparaitechsoftware.org
                  </a>
                </div>
              </motion.div>

              {/* Phone Card */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex items-start gap-4 hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl shadow-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Call Us</h3>
                  <p className="text-gray-600 text-sm">
                    Mon to Sat, 10am to 9pm
                  </p>
                  <a
                    href="tel:+916364326342"
                    className="text-cyan-600 hover:text-cyan-700 font-medium text-sm mt-1 block"
                  >
                    +91 6364326342
                  </a>
                </div>
              </motion.div>

              {/* Location Card */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex items-start gap-4 hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Visit Us</h3>
                  <p className="text-gray-600 text-sm">
                    Come say hello at our office
                  </p>
                  <p className="text-gray-700 font-medium text-sm mt-1">
                    360, Neeladri Rd, Karuna Nagar, Electronic City Phase I,
                    Electronic City, Bengaluru, Karnataka 560100
                  </p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex items-start gap-4 hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Visit Us</h3>
                  <p className="text-gray-600 text-sm">
                    Come say hello at our office
                  </p>
                  <p className="text-gray-700 font-medium text-sm mt-1">
                    New Branch Baramati Mukti Complex Near Prahashkiya bhawan
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Contact Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl group"
            >
              {/* Background Image with Overlay */}
              <div className="relative h-64 md:h-80 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600">
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-20">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: "40px 40px",
                    }}
                  ></div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="text-center"
                  >
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">
                      We're Here to Help
                    </h3>
                    <p className="text-white/90 text-sm md:text-base">
                      Your success is our priority. Reach out anytime!
                    </p>
                  </motion.div>
                </div>

                {/* Animated Gradient Border */}
                <div className="absolute inset-0 border-4 border-white/30 rounded-3xl group-hover:border-white/50 transition-all duration-300"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
};

export default Contact;
