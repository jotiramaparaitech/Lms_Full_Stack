import React, { useContext, useEffect, useState } from "react";
import Footer from "../../components/student/Footer";
import { assets } from "../../assets/assets";
import CourseCard from "../../components/student/CourseCard";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import SearchBar from "../../components/student/SearchBar";
import { motion } from "framer-motion";

const CoursesList = () => {
  const { input } = useParams();
  const { allCourses, navigate, fetchCourses } = useContext(AppContext);

  const [filteredCourse, setFilteredCourse] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // ✅ Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError(null);
      // Retry fetching courses when back online
      if (!allCourses || allCourses.length === 0) {
        retryFetchCourses();
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
  }, [allCourses]);

  // ✅ Function to retry fetching courses
  const retryFetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);
    
    try {
      if (fetchCourses) {
        await fetchCourses();
      }
    } catch (err) {
      setError(err.message || "Failed to load courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  // ✅ Handle course loading
  useEffect(() => {
    const loadCourses = async () => {
      // Don't show error if we're still loading or if courses exist
      if (allCourses && allCourses.length > 0) {
        setIsLoading(false);
        setLoadingProgress(100);
        setError(null);
        return;
      }

      // If we have an empty array but fetchCourses exists, try to fetch
      if (allCourses && allCourses.length === 0 && fetchCourses) {
        try {
          await fetchCourses();
        } catch (err) {
          setError(err.message || "Failed to load courses. Please try again.");
          setIsLoading(false);
        }
        return;
      }

      // If allCourses is undefined or null, wait for it
      if (!allCourses) {
        // Don't set error immediately, wait a bit
        const timeout = setTimeout(() => {
          if (!allCourses && !isOffline) {
            setError("Unable to load courses. Please try again.");
            setIsLoading(false);
          }
        }, 5000);

        return () => clearTimeout(timeout);
      }
    };

    loadCourses();
  }, [allCourses, fetchCourses, isOffline]);

  // ✅ Extract unique domains (with null check)
  const uniqueDomains = Array.isArray(allCourses) 
    ? Array.from(new Set(allCourses.map((course) => course.customDomain).filter(Boolean)))
    : [];

  // ✅ Filter courses
  useEffect(() => {
    if (Array.isArray(allCourses) && allCourses.length > 0) {
      let tempCourses = [...allCourses];

      if (input) {
        tempCourses = tempCourses.filter((item) =>
          item.courseTitle?.toLowerCase().includes(input.toLowerCase())
        );
      }

      if (selectedDomain !== "All") {
        tempCourses = tempCourses.filter(
          (item) => item.customDomain === selectedDomain
        );
      }

      setFilteredCourse(tempCourses);
    } else {
      setFilteredCourse([]);
    }
  }, [allCourses, input, selectedDomain]);

  // ✅ Group by domain (with null check)
  const groupedByDomain = (Array.isArray(filteredCourse) ? filteredCourse : []).reduce((acc, course) => {
    const domain = course.customDomain || 'Uncategorized';
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(course);
    return acc;
  }, {});

  // Refined card animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.98,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        mass: 1,
        duration: 0.6,
      },
    },
  };

  // Hover animation variant
  const hoverVariants = {
    rest: {
      scale: 1,
      y: 0,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    },
    hover: {
      scale: 1.03,
      y: -6,
      boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  // Container animation for staggered cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  // Domain header animation
  const domainHeaderVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.5,
      },
    },
  };

  // YouTube-style skeleton loader
  const SkeletonCard = () => (
    <div className="w-full max-w-[340px] bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="relative">
        {/* Thumbnail skeleton */}
        <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Title skeleton - 2 lines */}
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4" />
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/2" />
          </div>
          
          {/* Meta info skeleton */}
          <div className="flex items-center space-x-2">
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16" />
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-12" />
          </div>
          
          {/* Price skeleton */}
          <div className="flex items-center justify-between pt-2">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20" />
            <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="w-full">
      {/* YouTube-style loading bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: `${loadingProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="space-y-8 mt-8">
        {/* Domain header skeleton */}
        <div className="flex items-center space-x-4">
          <div className="h-8 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
        </div>

        {/* Grid of skeleton cards */}
        <div className="grid gap-6 md:gap-8
                     grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                     justify-items-start">
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    </div>
  );

  // Offline/Error component
  const ErrorState = ({ message, isOffline }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="inline-block p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 max-w-md">
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
            : "We couldn't load the courses. Please try again.")}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={retryFetchCourses}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Try Again
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Add shimmer animation to global styles */}
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

      {/* 🌈 Background Wrapper */}
      <div className="relative min-h-screen pt-20 overflow-hidden bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50">
        {/* Background orbs */}
        <div className="absolute top-[-150px] left-[-80px] w-[300px] h-[300px] bg-blue-400/20 blur-3xl rounded-full animate-pulse -z-10"></div>
        <div className="absolute bottom-[-150px] right-[-80px] w-[350px] h-[350px] bg-cyan-400/30 blur-3xl rounded-full animate-pulse -z-10"></div>

        {/* ✅ Centered Content Container */}
        <div className="max-w-7xl mx-auto md:px-10 px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex md:flex-row flex-col gap-6 items-start justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Project List
              </h1>
              <p className="text-gray-600 mt-2">
                <span
                  onClick={() => navigate("/")}
                  className="text-blue-600 font-medium cursor-pointer hover:underline"
                >
                  Home
                </span>{" "}
                / Project List
              </p>
            </div>
            <SearchBar data={input} />
          </motion.div>

          {/* Domain Filter Section - Hide during loading */}
          {!isLoading && !error && !isOffline && Array.isArray(allCourses) && allCourses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4 mt-10 p-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <label className="text-gray-700 font-medium text-sm sm:text-base">
                  Filter Projects by Domain
                </label>
              </div>

              <div className="relative flex-1 max-w-md">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 bg-white/90 shadow-sm 
                           focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none 
                           text-gray-700 font-medium text-sm sm:text-base
                           appearance-none cursor-pointer
                           transition-all duration-200 hover:border-blue-300"
                >
                  <option value="All" className="py-2">
                    🌐 All Domains
                  </option>
                  {uniqueDomains.map((domain, index) => (
                    <option key={index} value={domain} className="py-2">
                      {domain}
                    </option>
                  ))}
                </select>

                {/* Custom dropdown arrow */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Filter icon inside select */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
              </div>

              {/* Active filter indicator */}
              {selectedDomain !== "All" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-full"
                >
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Active: {selectedDomain}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Active Search Tag */}
          {input && !isLoading && !error && !isOffline && Array.isArray(allCourses) && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-4 px-4 py-2 border mt-6 text-gray-600 bg-white/70 rounded-lg shadow backdrop-blur-md"
            >
              <p>{input}</p>
              <img
                src={assets.cross_icon}
                alt="clear"
                onClick={() => navigate("/course-list")}
                className="w-4 h-4 cursor-pointer hover:rotate-90 transition-transform"
              />
            </motion.div>
          )}

          {/* Main Content Area */}
          {isLoading ? (
            <LoadingIndicator />
          ) : isOffline ? (
            <ErrorState message="No internet connection. Please check your network." isOffline={true} />
          ) : error ? (
            <ErrorState message={error} isOffline={false} />
          ) : !Array.isArray(allCourses) ? (
            <LoadingIndicator />
          ) : allCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <div className="inline-block p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Projects Available
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  There are no courses available at the moment. Please check back later.
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Courses */}
              {Object.keys(groupedByDomain).length > 0 ? (
                Object.entries(groupedByDomain).map(([domain, courses]) => (
                  <div key={domain} className="my-16">
                    {/* Domain Heading with animation */}
                    <motion.h2
                      variants={domainHeaderVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-2xl font-semibold text-gray-800 mb-8 border-l-4 border-blue-500 pl-4 relative"
                    >
                      {domain}
                      <motion.span
                        className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "60%" }}
                        transition={{
                          delay: 0.3,
                          duration: 0.8,
                          ease: "easeOut",
                        }}
                      />
                    </motion.h2>

                    {/* Grid */}
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid gap-6 md:gap-8
                                 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                                 justify-items-start"
                    >
                      {courses.map((course, index) => (
                        <motion.div
                          key={course._id || index}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                          onClick={() => navigate(`/course/${course._id}`)}
                          className="w-full max-w-[340px] relative cursor-pointer"
                        >
                          {/* Elegant hover overlay */}
                          <motion.div
                            className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0"
                            variants={{
                              hover: {
                                opacity: 1,
                                transition: { duration: 0.3 },
                              },
                            }}
                          />

                          {/* Main card container with subtle effects */}
                          <motion.div
                            variants={hoverVariants}
                            initial="rest"
                            whileHover="hover"
                            className="relative w-full rounded-xl overflow-hidden bg-white shadow-lg"
                            style={{
                              transformStyle: "preserve-3d",
                            }}
                          >
                            {/* Card content wrapper */}
                            <div className="relative">
                              <CourseCard course={course} />

                              {/* Subtle shine effect on hover */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
                                variants={{
                                  hover: {
                                    opacity: 1,
                                    x: ["0%", "200%"],
                                    transition: {
                                      x: {
                                        duration: 0.8,
                                        ease: "easeInOut",
                                      },
                                      opacity: {
                                        duration: 0.3,
                                      },
                                    },
                                  },
                                }}
                              />
                            </div>
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-20"
                >
                  <div className="inline-block p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Projects Found
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Try adjusting your search or filter criteria to find what
                      you're looking for.
                    </p>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CoursesList;