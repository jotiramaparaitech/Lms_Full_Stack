import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./CourseCard";
import { Link } from "react-router-dom";

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);

  if (!allCourses || allCourses.length === 0) {
    return (
      <div className="py-20 md:px-40 px-8 text-center text-gray-400 animate-pulse">
        <p>Loading projects...</p>
      </div>
    );
  }

  // Filter out invalid courses, but keep courses even if educator is missing (backend handles this)
  const validCourses = allCourses.filter((course) => course && course.courseTitle);

  return (
    <section
      id="courses-section"
      className="relative py-20 md:px-36 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-100 overflow-hidden"
    >
      {/* Subtle floating background blobs */}
      <div className="absolute top-0 left-1/3 w-80 h-80 bg-blue-300/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-300/20 blur-3xl rounded-full -z-10 animate-pulse"></div>

      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 pb-5 via-purple-600 to-pink-500 animate-text">
          Projects That Shape the Future
        </h2>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Step into the world of next-gen innovation — explore live projects,
          engineered with precision and creativity. Learn, innovate, and push
          boundaries with every line of code.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-0">
        {validCourses.slice(0, 4).map((course, index) => (
          <div
            key={index}
            className="group transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-200/50 rounded-2xl bg-white p-2"
          >
            <CourseCard course={course} />
          </div>
        ))}
      </div>

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
