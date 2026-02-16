import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Lock, Unlock, Eye, EyeOff } from "lucide-react";

const MyCourses = () => {
  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [showLockModal, setShowLockModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const DASHBOARD_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || "Aparaitech123@";
  const navigate = useNavigate();

  // ✅ Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError(null);
      if (!courses) {
        fetchEducatorCourses();
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
  }, [courses]);

  // ✅ Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const fetchEducatorCourses = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);
    
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setCourses(data.courses);
        setLoadingProgress(100);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load courses");
      toast.error(error.response?.data?.message || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      const token = await getToken();
      const { data } = await axios.delete(
        `${backendUrl}/api/educator/course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Project removed successfully!");
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      } else {
        toast.error("Failed to remove project.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting project");
    }
  };

  const handleEditCourse = (courseId) => {
    navigate(`/educator/course/${courseId}/edit`);
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      setIsLocked(false);
      setShowLockModal(false);
      setPassword("");
      toast.success("Unlocked successfully!");
    } else {
      toast.error("Incorrect password");
    }
  };

  const toggleLock = () => {
    if (isLocked) {
      setShowLockModal(true);
    } else {
      setIsLocked(true);
      toast.info("Locked successfully");
    }
  };

  useEffect(() => {
    if (isEducator) fetchEducatorCourses();
  }, [isEducator]);

  // YouTube-style skeleton loaders
  const SkeletonRow = () => (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-gray-200"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-16 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg" />
          <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-12 mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-center gap-2">
          <div className="h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md" />
          <div className="h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md" />
        </div>
      </td>
    </motion.tr>
  );

  const SkeletonMobileCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 border border-gray-200 rounded-2xl shadow-md p-4"
    >
      <div className="flex items-center gap-4">
        <div className="w-20 h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
          <div className="h-4 w-1/2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
          <div className="h-3 w-1/3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <div className="h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md" />
        <div className="h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md" />
      </div>
    </motion.div>
  );

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="min-h-screen flex flex-col items-center md:p-12 p-4 bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* YouTube-style loading bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: `${loadingProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Search bar skeleton */}
      <div className="w-full max-w-6xl mb-6">
        <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-2xl" />
      </div>

      {/* Lock button skeleton */}
      <div className="w-full max-w-6xl mb-4 flex justify-end">
        <div className="h-10 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg" />
      </div>

      {/* Table skeleton (desktop) */}
      <div className="hidden md:block w-full max-w-6xl">
        <div className="bg-white/80 rounded-3xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-sky-100 to-blue-100 border-b border-gray-200">
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile cards skeleton */}
      <div className="block md:hidden w-full max-w-md mt-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonMobileCard key={i} />
        ))}
      </div>
    </div>
  );

  // Error/Offline state
  const ErrorState = ({ message, isOffline }) => (
    <div className="min-h-screen flex flex-col items-center justify-center md:p-12 p-4 bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="inline-block p-8 bg-white rounded-2xl shadow-lg border border-blue-100">
          {isOffline ? (
            <svg
              className="w-20 h-20 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-3.536 0a9 9 0 012.828-6.364m0 0l2.829 2.829m-2.829-2.829L3 3"
              />
            </svg>
          ) : (
            <svg
              className="w-20 h-20 text-red-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {isOffline ? "You're offline" : "Something went wrong"}
          </h3>
          
          <p className="text-gray-500 mb-6">
            {message || (isOffline 
              ? "Please check your internet connection and try again." 
              : "We couldn't load your courses. Please try again.")}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchEducatorCourses}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  // Empty state (no courses)
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="inline-block p-8 bg-white rounded-2xl shadow-lg border border-blue-100">
        <svg
          className="w-20 h-20 text-blue-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Courses Yet
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You haven't created any courses yet. Start by adding your first course!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/educator/add-course")}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Add Your First Course
        </motion.button>
      </div>
    </motion.div>
  );

  if (isLoading || !courses) return <LoadingIndicator />;
  if (isOffline) return <ErrorState isOffline={true} />;
  if (error) return <ErrorState message={error} isOffline={false} />;

  const filteredCourses = courses.filter((course) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const title = (course.courseTitle || "").toLowerCase().trim();
    return title.includes(query);
  });

  return (
    <div className="min-h-screen flex flex-col items-center md:p-12 p-4 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
      {/* Add shimmer animation styles */}
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
            background-size: 200% 100%;
          }
        `}
      </style>

      {/* Background glow blobs */}
      <div className="absolute top-[-120px] left-[-50px] w-80 h-80 bg-blue-300/30 blur-3xl rounded-full animate-pulse -z-10"></div>
      <div className="absolute bottom-[-120px] right-[-50px] w-96 h-96 bg-cyan-400/30 blur-3xl rounded-full animate-pulse -z-10"></div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by project title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/80 border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500"
              >
                {filteredCourses?.length || 0} result{filteredCourses?.length !== 1 ? 's' : ''}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Lock/Unlock Button */}
      <motion.div 
        className="w-full max-w-6xl mb-4 flex justify-end"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={toggleLock}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all shadow-md ${
            isLocked ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isLocked ? (
            <>
              <Lock size={18} />
              Locked
            </>
          ) : (
            <>
              <Unlock size={18} />
              Unlocked
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Password Modal */}
      <AnimatePresence>
        {showLockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Password to Unlock</h3>
              <form onSubmit={handleUnlock}>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    autoFocus
                  />
                  <EyeOff className="absolute right-3 top-2.5 text-gray-400" size={18} />
                </div>
                <div className="flex justify-end gap-2">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowLockModal(false);
                      setPassword("");
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Unlock
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABLE VIEW (Visible on md and above) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="hidden md:block w-full max-w-6xl overflow-x-auto rounded-3xl bg-white/80 border border-gray-200 shadow-[0_10px_40px_rgba(56,189,248,0.25)] hover:shadow-[0_20px_60px_rgba(56,189,248,0.35)] transition-all"
      >
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-gray-800 bg-gradient-to-r from-sky-100 to-blue-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">Earnings</th>
              <th className="px-4 py-3 font-semibold text-center">Students</th>
              <th className="px-4 py-3 font-semibold">Published On</th>
              <th className="px-4 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            <AnimatePresence mode="wait">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <motion.tr
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 200 
                    }}
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: "rgba(224, 242, 254, 0.5)",
                      transition: { type: "spring", stiffness: 400 }
                    }}
                    className="border-b border-gray-200 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <motion.div 
                        className="flex items-center gap-3 truncate"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <motion.img
                          whileHover={{ scale: 1.1, rotate: 2 }}
                          src={course.courseThumbnail}
                          alt="Course"
                          className="w-16 h-12 object-cover rounded-lg border shadow-md"
                        />
                        <span className="truncate font-medium text-gray-800">
                          {course.courseTitle}
                        </span>
                      </motion.div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-blue-600 whitespace-nowrap">
                      {isLocked ? (
                        <motion.span
                          initial={{ filter: "blur(4px)" }}
                          animate={{ filter: "blur(0px)" }}
                          className="inline-block"
                        >
                          ••••••
                        </motion.span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {currency}{" "}
                          {Math.floor(
                            course.enrolledStudents?.length *
                            (course.coursePrice -
                              (course.discount * course.coursePrice) / 100) || 0
                          )}
                        </motion.span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center font-medium text-gray-800">
                      {isLocked ? (
                        <motion.span
                          initial={{ filter: "blur(4px)" }}
                          animate={{ filter: "blur(0px)" }}
                        >
                          ••••
                        </motion.span>
                      ) : (
                        course.enrolledStudents?.length || 0
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditCourse(course._id)}
                          className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md shadow-md hover:shadow-lg transition"
                        >
                          Edit
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveCourse(course._id)}
                          className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md shadow-md hover:shadow-lg transition"
                        >
                          Remove
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="flex flex-col items-center justify-center gap-2"
                    >
                      <Search className="w-10 h-10 text-gray-300" />
                      <p className="font-medium">No projects found matching "{searchQuery}"</p>
                    </motion.div>
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      {/* MOBILE CARD VIEW (Visible below md) */}
      <div className="block md:hidden w-full max-w-md mt-4 space-y-4">
        <AnimatePresence mode="wait">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 200 
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                className="bg-white/80 border border-gray-200 rounded-2xl shadow-md p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <motion.img
                    whileHover={{ scale: 1.1, rotate: 2 }}
                    src={course.courseThumbnail}
                    alt="Course"
                    className="w-20 h-16 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {course.courseTitle}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {isLocked ? (
                        <>
                          <span className="filter blur-[2px]">••••••</span> •{" "}
                          <span className="filter blur-[2px]">••••</span> Students
                        </>
                      ) : (
                        <>
                          {currency}{" "}
                          {Math.floor(
                            course.enrolledStudents?.length *
                            (course.coursePrice -
                              (course.discount * course.coursePrice) / 100) || 0
                          )}{" "}
                          • {course.enrolledStudents?.length || 0} Students
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditCourse(course._id)}
                    className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md shadow-sm"
                  >
                    Edit
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemoveCourse(course._id)}
                    className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md shadow-sm"
                  >
                    Remove
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center p-8 text-gray-500 bg-white/80 rounded-2xl border border-gray-200 shadow-sm backdrop-blur-sm"
            >
              <Search className="w-10 h-10 text-gray-300 mb-2" />
              <p className="font-medium text-center">No projects found matching "{searchQuery}"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Course Button (Floating) */}
      {courses.length === 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/educator/add-course")}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold hover:shadow-xl transition-all z-40"
        >
          +
        </motion.button>
      )}
    </div>
  );
};

export default MyCourses;