import React, { useContext, useMemo } from "react";
import { AppContext } from "../../context/AppContext";

const AllProjects = ({ onClose }) => {
  const { allCourses, navigate } = useContext(AppContext);

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

  const handleProjectClick = (courseId) => {
    navigate(`/course/${courseId}`);
    if (onClose) onClose();
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 overflow-y-auto flex-1">
        {/* Header */}
        <div className="mb-4 sticky top-0 bg-white pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">All Projects</h1>
            {onClose && (
              <button
                onClick={onClose}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100 border border-gray-300"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Domains - Horizontal at Top */}
        {domains.length > 0 && (
          <div className="mb-4 pb-3 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {domains.map((domain) => (
                <div
                  key={domain}
                  className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 border border-gray-300"
                >
                  {domain} ({groupedByDomain[domain].length})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Projects List */}
        <div className="space-y-2">
          {allCourses && allCourses.length > 0 ? (
            allCourses.map((course, index) => (
              <button
                key={course._id || index}
                onClick={() => handleProjectClick(course._id)}
                className="w-full text-left px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all"
              >
                <p className="font-medium text-gray-800 text-sm">
                  {course.courseTitle}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {course.customDomain || "Uncategorized"}
                </p>
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No projects available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProjects;
