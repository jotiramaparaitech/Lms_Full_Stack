import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  FolderOpen,
  ExternalLink,
  TrendingUp,
  WifiOff,
  AlertCircle
} from "lucide-react";
import StudentLayout from "../../components/student/StudentLayout";
import { motion, AnimatePresence } from "framer-motion";

const MyProjects = () => {
  const {
    userData,
    enrolledCourses,
    fetchUserEnrolledCourses,
    navigate,
    teamProgress,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // ✅ Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError(null);
      if (enrolledCourses.length === 0) {
        fetchUserEnrolledCourses();
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setError("No internet connection. Please check your network.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enrolledCourses]);

  // ✅ Simulate loading progress (YouTube style) - Smoother increments
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 5; // Slower increment (5% instead of 10%)
        });
      }, 150); // Slightly faster interval but smaller increments = smoother

      return () => clearInterval(interval);
    }
  }, [loading]);

  // ✅ Strip HTML tags
  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").trim();
  };

  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses()
        .catch(err => {
          setError(err.message || "Failed to load projects");
        })
        .finally(() => {
          setLoading(false);
          setLoadingProgress(100);
        });
    }
  }, [userData]);

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

  // Handle card click
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

  // Handle button click
  const handleButtonClick = (courseId, e) => {
    e.stopPropagation();
    navigate("/player/" + courseId);
  };

  // YouTube-style skeleton card with smoother shimmer
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Thumbnail skeleton */}
      <div className="h-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer" />
      
      {/* Content skeleton */}
      <div className="p-5 space-y-4">
        {/* Title and badge row */}
        <div className="flex items-start justify-between">
          <div className="h-7 w-3/4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
          <div className="h-6 w-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-full" />
        </div>
        
        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
          <div className="h-4 w-5/6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-lg" />
          <div className="w-12 h-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-lg" />
        </div>
      </div>
    </div>
  );

  // Loading indicator with YouTube-style progress bar
  const LoadingIndicator = () => (
    <StudentLayout>
      <div className="p-4 md:p-6">
        {/* YouTube-style top loading bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 via-gray-600 to-red-600"
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
        </div>

        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-lg mb-2" />
          <div className="h-5 w-80 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </StudentLayout>
  );

  // Error/Offline state
  const ErrorState = ({ message, isOffline }) => (
    <StudentLayout>
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-md"
        >
          <div className="inline-block p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
            {isOffline ? (
              <WifiOff className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            )}
            
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {isOffline ? "You're offline" : "Something went wrong"}
            </h3>
            
            <p className="text-gray-500 mb-6">
              {message || (isOffline 
                ? "Please check your internet connection and try again." 
                : "We couldn't load your projects. Please try again.")}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setLoading(true);
                fetchUserEnrolledCourses().finally(() => setLoading(false));
              }}
              className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    </StudentLayout>
  );

  if (loading) return <LoadingIndicator />;
  if (isOffline) return <ErrorState isOffline={true} />;
  if (error) return <ErrorState message={error} isOffline={false} />;

  return (
    <StudentLayout>
      {/* Add smooth shimmer animation styles */}
      <style>
        {`
          @keyframes smoothShimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          .animate-smooth-shimmer {
            animation: smoothShimmer 2.5s infinite ease-in-out;
            background-size: 200% 100%;
          }
          
          /* Prevent layout shifts during animation */
          .motion-safe {
            will-change: transform, opacity;
          }
        `}
      </style>

      <div className="p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-500">
            My Projects
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-gray-600 mt-2"
          >
            {enrolledCourses.length > 0
              ? `You're enrolled in ${enrolledCourses.length} project${
                  enrolledCourses.length > 1 ? "s" : ""
                }`
              : "Explore and enroll in projects to get started"}
          </motion.p>
        </motion.div>

        {/* Enrolled Courses Grid */}
        {enrolledCourses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="wait">
              {enrolledCourses.map((course, index) => {
                const progress = teamProgress ?? 0;
                const statusColor = getStatusColor(progress);
                const statusText = getStatusText(progress);

                return (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.08,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      y: -5, 
                      scale: 1.02,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    onClick={(e) => handleCardClick(course._id, e)}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group motion-safe"
                  >
                    {/* Course Thumbnail */}
                    <div className="h-48 relative overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                      {course.courseThumbnail ? (
                        <img
                          src={course.courseThumbnail}
                          alt={course.courseTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.08 + 0.2, duration: 0.4, ease: "easeOut" }}
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {statusText}
                      </motion.div>

                      {/* Trending Badge */}
                      {course.isTrending && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.08 + 0.25, type: "spring", stiffness: 200, damping: 15 }}
                          className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 shadow-lg"
                        >
                          <TrendingUp size={12} />
                          Trending
                        </motion.div>
                      )}
                    </div>

                    {/* Course Details */}
                    <div className="p-5">
                      <motion.div 
                        className="flex items-start justify-between mb-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 + 0.15, duration: 0.4, ease: "easeOut" }}
                      >
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-cyan-700 transition-colors duration-300">
                          {course.courseTitle}
                        </h3>
                      </motion.div>

                      {/* Description */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.08 + 0.2, duration: 0.4, ease: "easeOut" }}
                        className="text-gray-600 text-sm mb-4 line-clamp-2"
                      >
                        {stripHtml(course.courseDescription || "").substring(0, 120)}
                        {stripHtml(course.courseDescription || "").length > 120 ? "..." : ""}
                      </motion.p>

                      {/* Action Buttons */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 + 0.25, duration: 0.4, ease: "easeOut" }}
                        className="flex gap-3"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          onClick={(e) => handleButtonClick(course._id, e)}
                          className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-cyan-700 hover:to-teal-600 transition-all duration-300 text-center flex items-center justify-center gap-2 no-click shadow-md hover:shadow-lg"
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
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          onClick={(e) => handleButtonClick(course._id, e)}
                          className="px-4 py-2.5 border border-cyan-600 text-cyan-600 rounded-lg font-medium hover:bg-cyan-50 transition-all duration-300 flex items-center justify-center no-click"
                        >
                          <ExternalLink size={18} />
                        </motion.button>
                      </motion.div>

                      {/* Progress Update Info */}
                      {progress > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 + 0.3, duration: 0.4, ease: "easeOut" }}
                          className="mt-4 pt-4 border-t border-gray-100"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 flex items-center gap-1">
                              <CheckCircle size={16} className="text-green-500" />
                              Team Leader Progress: {progress}%
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* No Projects Found */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={() => navigate("/courses")}
                className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white py-3 px-8 rounded-lg font-medium hover:from-cyan-700 hover:to-teal-600 transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <BookOpen size={20} />
                Browse Projects
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
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