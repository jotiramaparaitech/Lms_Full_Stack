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
      left: window.innerWidth < 640 ? -300 : -400,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({
      left: window.innerWidth < 640 ? 300 : 400,
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
        {/* Left Arrow */}
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
            px-2 sm:px-0
          "
        >
          {validCourses.map((course, index) => (
            <div
              key={course._id || index}
              className="
                flex-shrink-0
                w-[88%]                /* MOBILE CARD WIDTH */
                sm:w-[380px]
                md:w-[calc((100%-3rem)/3)]
                lg:w-[calc((100%-4rem)/3)]
                snap-center sm:snap-start
                mx-auto sm:mx-0
              "
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
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
