import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, BookOpen, Calendar, XCircle, WifiOff, AlertCircle } from "lucide-react";

const StudentsEnrolled = () => {
  const { backendUrl, getToken, isEducator } = useContext(AppContext);
  const [enrolledStudents, setEnrolledStudents] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // ✅ Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError(null);
      if (!enrolledStudents) {
        fetchEnrolledStudents();
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
  }, [enrolledStudents]);

  // ✅ Simulate loading progress (Smoother increments)
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 5; // Slower increment (5% instead of 10%)
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // -----------------------------
  // Fetch Enrolled Students
  // -----------------------------
  const fetchEnrolledStudents = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);
    
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/educator/enrolled-students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setEnrolledStudents(data.enrolledStudents.reverse());
        setLoadingProgress(100);
      } else {
        setError(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      setError(error.message || "Failed to load enrolled students");
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------
  // Remove Student Access
  // -----------------------------
  const handleRemoveAccess = async (courseId, studentId, studentName) => {
    if (!courseId || !studentId) {
      toast.error("Missing course or student ID");
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to remove ${studentName || "this student"}'s access?`
    );
    if (!confirm) return;

    try {
      const token = await getToken();
      const { data } = await axios.delete(
        `${backendUrl}/api/educator/remove-student/${courseId}/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Student access removed successfully");
        setEnrolledStudents((prev) =>
          prev.filter(
            (item) =>
              !(item.courseId === courseId && item.student?._id === studentId)
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to remove access");
    }
  };

  // -----------------------------
  // Fetch on mount (if educator)
  // -----------------------------
  useEffect(() => {
    if (isEducator) fetchEnrolledStudents();
  }, [isEducator]);

  // Smooth shimmer animation keyframes
  const smoothShimmerKeyframes = `
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
  `;

  // YouTube-style skeleton loaders with smoother animation
  const SkeletonRow = () => (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        <div className="h-5 w-8 mx-auto bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-full" />
          <div className="h-5 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="h-5 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="h-9 w-28 mx-auto bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-lg" />
      </td>
    </tr>
  );

  const SkeletonMobileCard = () => (
    <div className="bg-white/80 border border-gray-200 rounded-2xl shadow-md p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-full" />
        <div className="flex-1">
          <div className="h-5 w-3/4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded mb-2" />
          <div className="h-4 w-1/2 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
        <div className="h-4 w-2/3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
      </div>
      <div className="flex justify-end">
        <div className="h-9 w-28 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-lg" />
      </div>
    </div>
  );

  // Loading indicator component - ONLY animation during loading
  const LoadingIndicator = () => (
    <div className="min-h-screen flex flex-col items-center md:p-12 p-6 bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* YouTube-style loading bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: `${loadingProgress}%` }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
      </div>

      <style>{smoothShimmerKeyframes}</style>

      {/* Search bar skeleton */}
      <div className="w-full max-w-6xl mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="w-full h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-2xl" />
        </div>
        <div className="w-full md:w-48 h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-2xl" />
      </div>

      {/* Table skeleton (desktop) */}
      <div className="hidden md:block w-full max-w-5xl">
        <div className="bg-white/80 rounded-3xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-sky-100 to-blue-100 border-b border-gray-200">
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
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
      <div className="block md:hidden w-full max-w-md mt-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonMobileCard key={i} />
        ))}
      </div>
    </div>
  );

  // Error/Offline state
  const ErrorState = ({ message, isOffline }) => (
    <div className="min-h-screen flex flex-col items-center justify-center md:p-12 p-6 bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="text-center max-w-md">
        <div className="inline-block p-8 bg-white rounded-2xl shadow-lg border border-blue-100">
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
              : "We couldn't load the enrolled students. Please try again.")}
          </p>

          <button
            onClick={fetchEnrolledStudents}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="inline-block p-8 bg-white rounded-2xl shadow-lg border border-blue-100">
        <User className="w-20 h-20 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Students Enrolled
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You don't have any enrolled students yet. Once students enroll in your courses, they'll appear here.
        </p>
      </div>
    </div>
  );

  if (isLoading || !enrolledStudents) return <LoadingIndicator />;
  if (isOffline) return <ErrorState isOffline={true} />;
  if (error) return <ErrorState message={error} isOffline={false} />;

  // Filter students based on search query
  const filteredStudents = enrolledStudents
    ?.filter(
      (item) =>
        item && item.student && item.student._id && item.student.name
    )
    .filter((item) => {
      // Search filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();

      const studentName = (item.student?.name || "").toLowerCase().trim();
      const courseTitle = (item.courseTitle || "").toLowerCase().trim();

      if (filterType === "name") return studentName.includes(query);
      if (filterType === "title") return courseTitle.includes(query);
      return studentName.includes(query) || courseTitle.includes(query);
    });

  // -----------------------------
  // UI - Static with NO animations for better performance
  // -----------------------------
  return (
    <div className="min-h-screen flex flex-col items-center md:p-12 p-6 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
      {/* Add smooth shimmer animation styles - only used in loading state */}
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
        `}
      </style>

      {/* Background glow blobs - static */}
      <div className="absolute top-[-100px] left-[-50px] w-72 h-72 bg-blue-300/30 blur-3xl rounded-full -z-10"></div>
      <div className="absolute bottom-[-120px] right-[-50px] w-96 h-96 bg-cyan-400/30 blur-3xl rounded-full -z-10"></div>

      {/* Search Bar - Static */}
      <div className="w-full max-w-6xl mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by student name or project title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/80 border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
          />
          {searchQuery && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {filteredStudents?.length || 0} result{filteredStudents?.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="relative w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-48 px-4 py-3 rounded-2xl bg-white/80 border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 cursor-pointer appearance-none"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
              backgroundPosition: `right 0.5rem center`, 
              backgroundRepeat: `no-repeat`, 
              backgroundSize: `1.5em 1.5em`, 
              paddingRight: '2.5rem' 
            }}
          >
            <option value="all">All Fields</option>
            <option value="name">Student Name</option>
            <option value="title">Project Title</option>
          </select>
        </div>
      </div>

      {/* Table Container - Static */}
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white/80 border border-gray-200 shadow-[0_10px_40px_rgba(56,189,248,0.25)] transition-all">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-gray-800 bg-gradient-to-r from-sky-100 to-blue-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">
                #
              </th>
              <th className="px-4 py-3 font-semibold">Student Name</th>
              <th className="px-4 py-3 font-semibold">Project Title</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                Date
              </th>
              <th className="px-4 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {filteredStudents && filteredStudents.length > 0 ? (
              filteredStudents.map((item, index) => (
                <tr
                  key={`${item.student?._id}-${item.courseId}-${index}`}
                  className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors"
                >
                  {/* Index */}
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {index + 1}
                  </td>

                  {/* Student Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.student?.imageUrl || "/default-avatar.png"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full shadow-md object-cover"
                      />
                      <span className="truncate font-medium text-gray-800">
                        {item.student?.name || "Unknown Student"}
                      </span>
                    </div>
                  </td>

                  {/* Project Title */}
                  <td className="px-4 py-3">
                    <span className="truncate font-medium text-gray-700 block">
                      {item.courseTitle || "Untitled Course"}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={14} />
                      <span>
                        {item.purchaseDate
                          ? new Date(item.purchaseDate).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </td>

                  {/* Remove Access Button */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        handleRemoveAccess(
                          item.courseId, 
                          item.student?._id,
                          item.student?.name
                        )
                      }
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                    >
                      <XCircle size={14} />
                      Remove Access
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    {searchQuery ? (
                      <>
                        <Search size={48} className="text-gray-300" />
                        <p className="text-gray-500 font-medium">
                          No students found matching "{searchQuery}"
                        </p>
                        <p className="text-sm text-gray-400">
                          Try searching with a different keyword or filter
                        </p>
                      </>
                    ) : (
                      <EmptyState />
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats Card */}
      {filteredStudents && filteredStudents.length > 0 && (
        <div className="mt-6 w-full max-w-5xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 shadow-md">
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-xl font-bold text-gray-800">
                    {new Set(filteredStudents.map(s => s.student?._id)).size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Enrolled Courses</p>
                  <p className="text-xl font-bold text-gray-800">
                    {new Set(filteredStudents.map(s => s.courseId)).size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Enrollments</p>
                  <p className="text-xl font-bold text-gray-800">
                    {filteredStudents.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsEnrolled;