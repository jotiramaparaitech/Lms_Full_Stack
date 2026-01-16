import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-[90vh] bg-gradient-to-br from-gray-50 to-white text-gray-800 overflow-hidden">
      {/* Background accents - Light version */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full px-4 sm:px-6 py-20 flex flex-col md:flex-row items-center gap-16">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-1/2 space-y-6 text-center md:text-left px-4 sm:px-6 lg:px-8"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium border border-blue-100">
            Learn • Build • Grow
          </span>

          <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight text-gray-900">
            Projects That Shape<br />Your Future
          </h1>

          <p className="text-gray-600 text-lg max-w-xl mx-auto md:mx-0">
            Industry-ready projects with exclusive opportunities. Master in-demand skills.
          </p>

          {/* PROJECTS OVERVIEW - Two Columns */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { name: "DevOps Projects", color: "bg-blue-500" },
              { name: "Data Analyst Projects", color: "bg-purple-500" },
              { name: "AutoCAD Projects", color: "bg-green-500" },
              { name: "Artificial Intelligence Projects", color: "bg-pink-500" },
              { name: "Cyber Security Projects", color: "bg-red-500" },
              { name: "Web Development Projects", color: "bg-indigo-500" }
            ].map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className={`w-2 h-2 rounded-full ${project.color}`}></div>
                <span className="text-gray-700 font-medium text-sm">{project.name}</span>
              </motion.div>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center md:justify-start">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSdV28Z8FaTpOCm54BpChAh0tleDwQaoWWsSBNUI4uCNSbsQMA/viewform", "_blank")}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
            >
              Register Now
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/project-list")}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              View All Projects
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </div>

          {/* TRUSTED BY */}
          <div className="pt-8">
            <p className="text-sm text-gray-500 mb-3">Trusted by professionals from</p>
            <div className="flex flex-wrap gap-3">
              {["Microsoft", "Adobe", "Meta", "Amazon", "Walmart", "Accenture", "PayPal", "Oracle"].map((company, index) => (
                <motion.span
                  key={company}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-gray-600 font-medium text-sm px-3 py-1 bg-gray-100 rounded-full"
                >
                  {company}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="w-full md:w-1/2 flex justify-center px-4 sm:px-6 lg:px-8"
        >
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-0 rounded-3xl bg-blue-50 blur-xl"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 w-full">
              <img
                src="https://res.cloudinary.com/dfytp36ni/image/upload/v1767678590/Gemini_Generated_Image_ldu3tb.png"
                alt="Learning illustration"
                className="w-full h-auto"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;