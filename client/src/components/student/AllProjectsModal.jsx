import React, { useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { AppContext } from "../../context/AppContext";

const AllProjectsModal = ({ isOpen, onClose }) => {
  const { allCourses, navigate } = useContext(AppContext);
  const [selectedDomain, setSelectedDomain] = useState("All");

  // Group courses by domain
  const groupedByDomain = useMemo(() => {
    if (!allCourses || allCourses.length === 0) return {};

    return allCourses.reduce((acc, course) => {
      const domain = course.customDomain || "Uncategorized";
      if (!acc[domain]) {
        acc[domain] = [];
      }
      acc[domain].push(course);
      return acc;
    }, {});
  }, [allCourses]);

  // Get all unique domains
  const domains = Object.keys(groupedByDomain);

  // Reset to "All" when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedDomain("All");
    }
  }, [isOpen]);

  // Get filtered courses based on selected domain
  const filteredCourses = useMemo(() => {
    if (selectedDomain === "All") {
      return allCourses || [];
    }
    return groupedByDomain[selectedDomain] || [];
  }, [selectedDomain, allCourses, groupedByDomain]);

  const handleProjectClick = (courseId) => {
    navigate(`/course/${courseId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden pointer-events-auto border border-white/20 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-20 blur-xl -z-10"></div>

              {/* Header */}
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-800">
                  All Projects
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Domains - Horizontal at Top */}
              {domains.length > 0 && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-wrap gap-3">
                    {/* All Projects Button */}
                    <button
                      onClick={() => setSelectedDomain("All")}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        selectedDomain === "All"
                          ? "bg-cyan-600 text-white shadow-md"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      All ({allCourses?.length || 0})
                    </button>
                    {/* Domain Buttons */}
                    {domains.map((domain) => (
                      <button
                        key={domain}
                        onClick={() => setSelectedDomain(domain)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          selectedDomain === domain
                            ? "bg-cyan-600 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                      >
                        {domain} ({groupedByDomain[domain].length})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects List */}
              <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-6">
                {filteredCourses && filteredCourses.length > 0 ? (
                  <div className="space-y-3">
                    {filteredCourses.map((course, index) => (
                      <button
                        key={course._id || index}
                        onClick={() => handleProjectClick(course._id)}
                        className="w-full text-left px-4 py-3 rounded-lg bg-white border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all"
                      >
                        <p className="font-medium text-gray-800">
                          {course.courseTitle}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {course.customDomain || "Uncategorized"}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No projects available.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AllProjectsModal;
