import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  FolderOpen,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import StudentLayout from "../../components/student/StudentLayout";
import { motion } from "framer-motion";
import { Line } from "rc-progress";

const MyProjects = () => {
  const {
    userData,
    enrolledCourses,
    fetchUserEnrolledCourses,
    navigate,
    teamProgress, // ✅ MAIN PROGRESS (Leader updated)
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);

  // ✅ Strip HTML tags like <p>, <br>, <strong> etc.
  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").trim();
  };

  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
    }
  }, [userData]);

  useEffect(() => {
    setLoading(false);
  }, [enrolledCourses]);

  const getStatusColor = (progressPercent) => {
    if (progressPercent === 100) return "bg-green-100 text-green-800";
    if (progressPercent > 0) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (progressPercent) => {
    if (progressPercent === 100) return "Completed";
    if (progressPercent > 0) return "In Progress";
    return "Not Started";
  };

  // Handle card click - navigate to course player
  const handleCardClick = (courseId, e) => {
    if (
      e.target.closest("button") ||
      e.target.closest(".no-click") ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "A"
    ) {
      return;
    }
    navigate("/player/" + courseId);
  };

  // Handle button click - stop propagation to prevent card click
  const handleButtonClick = (courseId, e) => {
    e.stopPropagation();
    navigate("/player/" + courseId);
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            My Projects
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-500"
          >
            My Projects
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 mt-2"
          >
            {enrolledCourses.length > 0
              ? `You're enrolled in ${enrolledCourses.length} project${
                  enrolledCourses.length > 1 ? "s" : ""
                }`
              : "Explore and enroll in projects to get started"}
          </motion.p>
        </div>

        {/* Enrolled Courses Grid */}
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, index) => {
              const progress = teamProgress ?? 0; // ✅ ONLY REAL PROGRESS
              const statusColor = getStatusColor(progress);
              const statusText = getStatusText(progress);

              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={(e) => handleCardClick(course._id, e)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group"
                >
                  {/* Course Thumbnail */}
                  <div className="h-48 relative overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                    {course.courseThumbnail ? (
                      <img
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen
                          size={48}
                          className="text-cyan-600 opacity-80"
                        />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                    >
                      {statusText}
                    </div>

                    {/* Progress Bar */}
                    {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center justify-between text-white mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div> */}
                  </div>

                  {/* Course Details */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-cyan-700 transition-colors duration-300">
                        {course.courseTitle}
                      </h3>
                      {course.isTrending && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 no-click">
                          <TrendingUp size={12} />
                          Trending
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {stripHtml(course.courseDescription || "").substring(
                        0,
                        120
                      )}
                      {stripHtml(course.courseDescription || "").length > 120
                        ? "..."
                        : ""}
                    </p>

                    {/* Progress Line */}
                    {/* <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Overall Progress</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <Line
                        percent={progress}
                        strokeWidth={3}
                        trailWidth={3}
                        strokeColor="#06b6d4"
                        trailColor="#e5e7eb"
                        className="rounded-full"
                      />
                    </div> */}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleButtonClick(course._id, e)}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-cyan-700 hover:to-teal-600 transition-all duration-300 text-center flex items-center justify-center gap-2 no-click"
                      >
                        {progress > 0 ? (
                          <>
                            <PlayCircle size={18} />
                            Continue
                          </>
                        ) : (
                          <>
                            <BookOpen size={18} />
                            Start Project
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleButtonClick(course._id, e)}
                        className="px-4 py-2.5 border border-cyan-600 text-cyan-600 rounded-lg font-medium hover:bg-cyan-50 transition-all duration-300 flex items-center justify-center no-click"
                      >
                        <ExternalLink size={18} />
                      </motion.button>
                    </div>

                    {/* Optional: Show text */}
                    {progress > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <CheckCircle size={16} className="text-green-500" />
                            Team Leader Progress Updated: {progress}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* No Projects Found */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen size={48} className="text-cyan-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No Projects Enrolled Yet
            </h3>

            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't enrolled in any projects yet. Browse available projects
              and start your learning journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/courses")}
                className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white py-3 px-8 rounded-lg font-medium hover:from-cyan-700 hover:to-teal-600 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                <BookOpen size={20} />
                Browse Projects
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/student/dashboard")}
                className="border border-cyan-600 text-cyan-600 py-3 px-8 rounded-lg font-medium hover:bg-cyan-50 transition-all duration-300"
              >
                Go to Dashboard
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </StudentLayout>
  );
};

export default MyProjects;
