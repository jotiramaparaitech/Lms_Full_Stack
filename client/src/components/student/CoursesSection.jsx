import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./CourseCard";
import { Link } from "react-router-dom";

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);

  const validCourses = allCourses?.filter((c) => c && c.courseTitle) || [];

  if (!validCourses.length) {
    return (
      <div className="py-20 text-center text-gray-400">
        No projects available.
      </div>
    );
  }

  return (
    <section className="w-full py-14 px-4 sm:px-8 md:px-16">
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-transparent bg-clip-text">
          Projects That Shape the Future
        </h2>
        <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          Explore live industry-ready projects and sharpen your skills.
        </p>
      </div>

      {/* Cards Grid (LIKE COMPANIES PAGE) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {validCourses.slice(0, 3).map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>

      {/* Show All */}
      <div className="flex justify-center mt-12">
        <Link
          to="/course-list"
          className="px-8 py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow hover:scale-105 transition-transform"
        >
          Show All Projects
        </Link>
      </div>
    </section>
  );
};

export default CoursesSection;
