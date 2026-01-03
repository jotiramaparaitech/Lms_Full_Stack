// import React, {
//   useContext,
//   useRef,
//   useState,
//   useEffect,
//   useCallback,
// } from "react";
// import { AppContext } from "../../context/AppContext";
// import CourseCard from "./CourseCard";
// import { Link } from "react-router-dom";

// const CoursesSection = () => {
//   const { allCourses } = useContext(AppContext);
//   const scrollContainerRef = useRef(null);
//   const [canScrollLeft, setCanScrollLeft] = useState(false);
//   const [canScrollRight, setCanScrollRight] = useState(true);
//   const [mobileCardWidth, setMobileCardWidth] = useState(280);
//   const [isMobile, setIsMobile] = useState(false);

//   // Filter out invalid courses, but keep courses even if educator is missing (backend handles this)
//   const validCourses =
//     allCourses && allCourses.length > 0
//       ? allCourses.filter((course) => course && course.courseTitle)
//       : [];

//   // Check scroll position - memoized with useCallback
//   const checkScroll = useCallback(() => {
//     if (scrollContainerRef.current) {
//       const { scrollLeft, scrollWidth, clientWidth } =
//         scrollContainerRef.current;
//       // Always allow scrolling if there are more than 1 course
//       if (validCourses.length > 1) {
//         setCanScrollLeft(scrollLeft > 10);
//         setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
//       } else {
//         setCanScrollLeft(false);
//         setCanScrollRight(false);
//       }
//     }
//   }, [validCourses.length]);

//   // Calculate mobile card width based on container
//   useEffect(() => {
//     const updateMobileCardWidth = () => {
//       const mobile = window.innerWidth < 640;
//       setIsMobile(mobile);
//       if (scrollContainerRef.current && mobile) {
//         const container = scrollContainerRef.current;
//         // Get the exact client width of the scrollable container
//         // Use both clientWidth and getBoundingClientRect for accuracy
//         const containerWidth = container.clientWidth;
//         const rect = container.getBoundingClientRect();
//         const calculatedWidth = Math.min(containerWidth, rect.width);

//         if (calculatedWidth > 0) {
//           setMobileCardWidth(calculatedWidth);
//           // Reset scroll position after width is set
//           container.scrollLeft = 0;
//         }
//       }
//     };

//     // Use requestAnimationFrame for better timing
//     const rafId = requestAnimationFrame(() => {
//       updateMobileCardWidth();
//       // Multiple attempts to ensure container is rendered
//       setTimeout(() => {
//         updateMobileCardWidth();
//         if (scrollContainerRef.current) {
//           scrollContainerRef.current.scrollLeft = 0;
//         }
//       }, 50);
//       setTimeout(() => {
//         updateMobileCardWidth();
//         if (scrollContainerRef.current) {
//           scrollContainerRef.current.scrollLeft = 0;
//         }
//       }, 200);
//       setTimeout(() => {
//         updateMobileCardWidth();
//         if (scrollContainerRef.current) {
//           scrollContainerRef.current.scrollLeft = 0;
//         }
//       }, 500);
//     });

//     window.addEventListener("resize", updateMobileCardWidth);
//     return () => {
//       cancelAnimationFrame(rafId);
//       window.removeEventListener("resize", updateMobileCardWidth);
//     };
//   }, [validCourses.length]);

//   // Reset scroll position when courses change or component mounts
//   useEffect(() => {
//     const resetScroll = () => {
//       if (scrollContainerRef.current) {
//         scrollContainerRef.current.scrollLeft = 0;
//         checkScroll();
//       }
//     };

//     // Reset immediately and after a short delay to ensure DOM is ready
//     resetScroll();
//     const timeoutId = setTimeout(resetScroll, 100);
//     const timeoutId2 = setTimeout(resetScroll, 300);

//     return () => {
//       clearTimeout(timeoutId);
//       clearTimeout(timeoutId2);
//     };
//   }, [validCourses.length, checkScroll]);

//   // All hooks must be called before any early returns
//   useEffect(() => {
//     checkScroll();
//     const container = scrollContainerRef.current;
//     if (container) {
//       // Ensure we start at the beginning - multiple attempts
//       container.scrollLeft = 0;
//       setTimeout(() => {
//         if (container) container.scrollLeft = 0;
//       }, 0);
//       setTimeout(() => {
//         if (container) container.scrollLeft = 0;
//       }, 100);

//       container.addEventListener("scroll", checkScroll);
//       window.addEventListener("resize", checkScroll);
//       return () => {
//         container.removeEventListener("scroll", checkScroll);
//         window.removeEventListener("resize", checkScroll);
//       };
//     }
//   }, [checkScroll]);

//   // Early returns after all hooks
//   if (!allCourses || allCourses.length === 0) {
//     return (
//       <div className="py-20 md:px-40 px-8 text-center text-gray-400 animate-pulse">
//         <p>
//           No projects available.{" "}
//           {allCourses?.length === 0
//             ? "No courses found in database."
//             : "Loading projects..."}
//         </p>
//       </div>
//     );
//   }

//   // Scroll functions with proper loop handling
//   const scrollLeft = () => {
//     if (scrollContainerRef.current && validCourses.length > 1) {
//       const container = scrollContainerRef.current;
//       const cardWidth =
//         container.querySelector(".course-card")?.offsetWidth || 400;
//       // Get computed gap from window size (0px mobile, 16px tablet, 24px desktop)
//       const isMobile = window.innerWidth < 640;
//       const isTablet = window.innerWidth >= 640 && window.innerWidth < 768;
//       const gap = isMobile ? 0 : isTablet ? 16 : 24;
//       const scrollAmount = cardWidth + gap;

//       container.scrollBy({
//         left: -scrollAmount,
//         behavior: "smooth",
//       });
//     }
//   };

//   const scrollRight = () => {
//     if (scrollContainerRef.current && validCourses.length > 1) {
//       const container = scrollContainerRef.current;
//       const cardWidth =
//         container.querySelector(".course-card")?.offsetWidth || 400;
//       // Get computed gap from window size (0px mobile, 16px tablet, 24px desktop)
//       const isMobile = window.innerWidth < 640;
//       const isTablet = window.innerWidth >= 640 && window.innerWidth < 768;
//       const gap = isMobile ? 0 : isTablet ? 16 : 24;
//       const scrollAmount = cardWidth + gap;

//       container.scrollBy({
//         left: scrollAmount,
//         behavior: "smooth",
//       });
//     }
//   };

//   if (validCourses.length === 0) {
//     return (
//       <section className="relative py-20 md:px-36 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-100 overflow-hidden">
//         <div className="text-center">
//           <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 pb-5 via-purple-600 to-pink-500">
//             Projects That Shape the Future
//           </h2>
//           <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
//             No projects available at the moment. Please check back later.
//           </p>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section
//       id="courses-section"
//       className="relative py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-36 bg-gradient-to-b from-gray-50 via-white to-gray-100 overflow-hidden"
//     >
//       {/* Subtle floating background blobs */}
//       <div className="absolute top-0 left-1/3 w-80 h-80 bg-blue-300/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
//       <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-300/20 blur-3xl rounded-full -z-10 animate-pulse"></div>

//       {/* Heading - Reduced Spacing */}
//       <div className="text-center mb-4 md:mb-6">
//         <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 pb-2 via-purple-600 to-pink-500 animate-text px-2">
//           Projects That Shape the Future
//         </h2>
//         <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 max-w-2xl mx-auto px-2">
//           Step into the world of next-gen innovation — explore live projects,
//           engineered with precision and creativity. Learn, innovate, and push
//           boundaries with every line of code.
//         </p>
//       </div>

//       {/* Courses Carousel with Arrows */}
//       <div className="relative px-12 sm:px-8 md:px-16 lg:px-20 overflow-visible">
//         {/* Left Arrow */}
//         {validCourses.length > 1 && (
//           <button
//             onClick={scrollLeft}
//             className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={!canScrollLeft}
//             aria-label="Scroll left"
//           >
//             <svg
//               className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-700"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//           </button>
//         )}

//         {/* Scrollable Container - Shows 1 card on mobile, 3 cards on desktop */}
//         <div
//           ref={scrollContainerRef}
//           className="courses-scroll-container flex gap-0 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4"
//           style={{
//             scrollbarWidth: "none",
//             msOverflowStyle: "none",
//             WebkitOverflowScrolling: "touch",
//             overflowX: "auto",
//             overflowY: "hidden",
//             scrollPaddingLeft: "0",
//             scrollPaddingRight: "0",
//           }}
//         >
//           {validCourses.map((course, index) => (
//             <div
//               key={course._id || `${course.courseTitle}-${index}`}
//               className="course-card flex-shrink-0 sm:w-[380px] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4rem)/3)] max-w-[450px] snap-start"
//               style={{
//                 width:
//                   isMobile && mobileCardWidth > 0
//                     ? `${mobileCardWidth}px`
//                     : undefined,
//                 minWidth:
//                   isMobile && mobileCardWidth > 0
//                     ? `${mobileCardWidth}px`
//                     : undefined,
//                 maxWidth:
//                   isMobile && mobileCardWidth > 0
//                     ? `${mobileCardWidth}px`
//                     : undefined,
//                 flexShrink: 0,
//               }}
//             >
//               <CourseCard course={course} />
//             </div>
//           ))}
//         </div>

//         {/* Right Arrow */}
//         {validCourses.length > 1 && (
//           <button
//             onClick={scrollRight}
//             className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={!canScrollRight}
//             aria-label="Scroll right"
//           >
//             <svg
//               className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-700"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 5l7 7-7 7"
//               />
//             </svg>
//           </button>
//         )}
//       </div>

//       {/* Hide scrollbar for webkit browsers */}
//       <style>{`
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//         @media (max-width: 639px) {
//           .course-card {
//             flex: 0 0 auto !important;
//           }
//         }
//       `}</style>

//       {/* Show All Button */}
//       <div className="flex justify-center mt-6 sm:mt-8 md:mt-12 px-4">
//         <Link
//           to={"/course-list"}
//           onClick={() => scrollTo(0, 0)}
//           className="relative inline-block px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden group w-full sm:w-auto text-center"
//         >
//           <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500"></span>
//           <span className="relative z-10">Show All Projects</span>
//         </Link>
//       </div>

//       {/* Text Gradient Animation */}
//       <style>{`
//         @keyframes text {
//           0%, 100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }
//         .animate-text {
//           background-size: 200% auto;
//           animation: text 5s ease infinite;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default CoursesSection;

import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./CourseCard";
import { Link } from "react-router-dom";

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const validCourses =
    allCourses?.filter((course) => course && course.courseTitle) || [];

  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollLeft = 0;
    checkScroll();

    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  if (!allCourses || allCourses.length === 0) {
    return (
      <div className="py-20 px-8 text-center text-gray-400 animate-pulse">
        No projects available.
      </div>
    );
  }

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({
      left: -400,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({
      left: 400,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="courses-section"
      className="relative py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-36 bg-gradient-to-b from-gray-50 via-white to-gray-100 overflow-hidden"
    >
      {/* Heading */}
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
          Projects That Shape the Future
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 max-w-2xl mx-auto">
          Explore live industry-ready projects and sharpen your skills.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Left Arrow (hidden on mobile) */}
        {validCourses.length > 1 && (
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg disabled:opacity-40"
          >
            ◀
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="
            flex overflow-x-auto scroll-smooth scrollbar-hide
            gap-4 sm:gap-6
            snap-x snap-mandatory
          "
        >
          {validCourses.map((course, index) => (
            <div
              key={course._id || index}
              className="
                flex-shrink-0
                w-full
                sm:w-[380px]
                md:w-[calc((100%-3rem)/3)]
                lg:w-[calc((100%-4rem)/3)]
                snap-start
              "
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {/* Right Arrow (hidden on mobile) */}
        {validCourses.length > 1 && (
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg disabled:opacity-40"
          >
            ▶
          </button>
        )}
      </div>

      {/* Show All */}
      <div className="flex justify-center mt-8">
        <Link
          to="/course-list"
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
        >
          Show All Projects
        </Link>
      </div>
    </section>
  );
};

export default CoursesSection;
