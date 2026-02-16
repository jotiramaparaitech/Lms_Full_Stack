import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./CourseCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CoursesSection = () => {
  const { allCourses, fetchCourses } = useContext(AppContext);
  
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
      setError(err.message || "Failed to load projects. Please try again.");
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
          setError(err.message || "Failed to load projects. Please try again.");
          setIsLoading(false);
        }
        return;
      }

      // If allCourses is undefined or null, wait for it
      if (!allCourses) {
        // Don't set error immediately, wait a bit
        const timeout = setTimeout(() => {
          if (!allCourses && !isOffline) {
            setError("Unable to load projects. Please try again.");
            setIsLoading(false);
          }
        }, 5000);

        return () => clearTimeout(timeout);
      }
    };

    loadCourses();
  }, [allCourses, fetchCourses, isOffline]);

  // ✅ Filter valid courses
  const courses = Array.isArray(allCourses) 
    ? allCourses.filter((c) => c?.courseTitle).slice(0, 3)
    : [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  const headerVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.5,
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 20px 30px rgba(79, 70, 229, 0.3)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  // YouTube-style skeleton card
  const SkeletonCard = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
    >
      <div className="relative">
        {/* Thumbnail skeleton */}
        <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        
        {/* Content skeleton */}
        <div className="p-5 space-y-4">
          {/* Title skeleton - 2 lines */}
          <div className="space-y-2">
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4" />
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/2" />
          </div>
          
          {/* Meta info skeleton */}
          <div className="flex items-center space-x-3">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16" />
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20" />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full" />
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-5/6" />
          </div>
          
          {/* Button skeleton */}
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg w-full mt-4" />
        </div>
      </div>
    </motion.div>
  );

  // Loading indicator
  const LoadingIndicator = () => (
    <div className="w-full">
      {/* YouTube-style loading bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ width: "0%" }}
          animate={{ width: `${loadingProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="pb-20 px-4 md:px-8 bg-white">
        {/* Header skeleton */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="text-center"
        >
          <div className="h-12 w-3/4 mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg mb-4" />
          <div className="h-6 w-1/2 mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
        </motion.div>

        {/* Cards grid skeleton */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10 mt-16 px-3 sm:px-10 md:px-20"
        >
          {[...Array(3)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </motion.div>

        {/* Button skeleton */}
        <div className="flex justify-center mt-16">
          <div className="h-12 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );

  // Error/Offline state
  const ErrorState = ({ message, isOffline }) => (
    <section className="pb-20 px-4 md:px-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-20"
      >
        <div className="inline-block p-8 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100 max-w-md">
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
              className="w-20 h-20 text-purple-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          )}
          
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {isOffline ? "You're offline" : "No Projects Available"}
          </h3>
          
          <p className="text-gray-500 mb-6">
            {message || (isOffline 
              ? "Please check your internet connection and try again." 
              : "There are no projects available at the moment. Please check back later.")}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={retryFetchCourses}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </section>
  );

  // Empty state (no projects in database)
  const EmptyState = () => (
    <section className="pb-20 px-4 md:px-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-20"
      >
        <div className="inline-block p-8 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100 max-w-md">
          <svg
            className="w-20 h-20 text-purple-400 mx-auto mb-4"
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
          
          <p className="text-gray-500">
            There are no projects in the database at the moment. Please check back later.
          </p>
        </div>
      </motion.div>
    </section>
  );

  // Main render
  return (
    <>
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

      {isLoading ? (
        <LoadingIndicator />
      ) : isOffline ? (
        <ErrorState isOffline={true} />
      ) : error ? (
        <ErrorState message={error} isOffline={false} />
      ) : !Array.isArray(allCourses) ? (
        <LoadingIndicator />
      ) : allCourses.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="pb-20 px-4 md:px-8 bg-white overflow-hidden">
          {/* Section Header with animation */}
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-extrabold pt-9 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-wide"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Projects That Shape the Future
            </motion.h2>
            <motion.p 
              className="md:text-lg text-base text-gray-600 text-center mt-3 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Explore live industry-ready projects and sharpen your skills.
            </motion.p>
          </motion.div>

          {/* Cards Grid with staggered animation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10 mt-16 px-3 sm:px-10 md:px-20"
          >
            {courses.map((course) => (
              <motion.div
                key={course._id}
                variants={itemVariants}
                whileHover={{ 
                  y: -8,
                  transition: { type: "spring", stiffness: 400 }
                }}
                className="h-full"
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button with animation */}
          <motion.div 
            className="flex justify-center mt-16"
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
          >
            <Link to="/course-list">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="px-8 py-3 text-base font-semibold
                           bg-gradient-to-r from-blue-600 to-purple-600
                           text-white rounded-xl shadow-md
                           hover:shadow-lg transition-all duration-300
                           relative overflow-hidden group"
              >
                <span className="relative z-10">Show All Projects</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                />
              </motion.button>
            </Link>
          </motion.div>
        </section>
      )}
    </>
  );
};

export default CoursesSection;