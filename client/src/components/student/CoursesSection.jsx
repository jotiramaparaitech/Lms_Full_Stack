import React, { useContext, useRef, useState, useEffect, useCallback } from "react";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./CourseCard";
import { Link } from "react-router-dom";

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter out invalid courses, but keep courses even if educator is missing (backend handles this)
  const validCourses = allCourses && allCourses.length > 0
    ? allCourses.filter((course) => course && course.courseTitle)
    : [];

  // Check scroll position - memoized with useCallback
  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // Always allow scrolling if there are more than 3 courses
      if (validCourses.length > 3) {
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      } else {
        setCanScrollLeft(false);
        setCanScrollRight(false);
      }
    }
  }, [validCourses.length]);

  // All hooks must be called before any early returns
  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll]);

  // Early returns after all hooks
  if (!allCourses || allCourses.length === 0) {
    return (
      <div className="py-20 md:px-40 px-8 text-center text-gray-400 animate-pulse">
        <p>
          No projects available.{" "}
          {allCourses?.length === 0
            ? "No courses found in database."
            : "Loading projects..."}
        </p>
      </div>
    );
  }

  // Scroll functions with proper loop handling
  const scrollLeft = () => {
    if (scrollContainerRef.current && validCourses.length > 3) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector(".course-card")?.offsetWidth || 400;
      const gap = 24;
      const scrollAmount = cardWidth + gap;
      
      container.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && validCourses.length > 3) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector(".course-card")?.offsetWidth || 400;
      const gap = 24;
      const scrollAmount = cardWidth + gap;
      
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (validCourses.length === 0) {
    return (
      <section className="relative py-20 md:px-36 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-100 overflow-hidden">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 pb-5 via-purple-600 to-pink-500">
            Projects That Shape the Future
          </h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            No projects available at the moment. Please check back later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="courses-section"
      className="relative py-8 md:py-12 md:px-36 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-100 overflow-hidden"
    >
      {/* Subtle floating background blobs */}
      <div className="absolute top-0 left-1/3 w-80 h-80 bg-blue-300/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-300/20 blur-3xl rounded-full -z-10 animate-pulse"></div>

      {/* Heading - Reduced Spacing */}
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 pb-2 via-purple-600 to-pink-500 animate-text">
          Projects That Shape the Future
        </h2>
        <p className="text-sm md:text-base text-gray-600 mt-2 max-w-2xl mx-auto">
          Step into the world of next-gen innovation — explore live projects,
          engineered with precision and creativity. Learn, innovate, and push
          boundaries with every line of code.
        </p>
      </div>

      {/* Courses Carousel with Arrows */}
      <div className="relative px-12 md:px-16 lg:px-20">
        {/* Left Arrow */}
        {validCourses.length > 3 && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <svg
              className="w-6 h-6 md:w-7 md:h-7 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Scrollable Container - Shows 3 cards on desktop */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {validCourses.map((course, index) => (
            <div
              key={course._id || `${course.courseTitle}-${index}`}
              className="course-card flex-shrink-0 w-[85vw] sm:w-[380px] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4rem)/3)] max-w-[450px] snap-start"
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {validCourses.length > 3 && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <svg
              className="w-6 h-6 md:w-7 md:h-7 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Hide scrollbar for webkit browsers */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Show All Button */}
      <div className="flex justify-center mt-12">
        <Link
          to={"/course-list"}
          onClick={() => scrollTo(0, 0)}
          className="relative inline-block px-10 py-3 font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500"></span>
          <span className="relative z-10">Show All Projects</span>
        </Link>
      </div>

      {/* Text Gradient Animation */}
      <style>{`
        @keyframes text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-text {
          background-size: 200% auto;
          animation: text 5s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default CoursesSection;
