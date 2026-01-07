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
  const { allCourses, navigate } = useContext(AppContext);

  const [filteredCourse, setFilteredCourse] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("All");

  // ✅ Extract unique domains
  const uniqueDomains = Array.from(
    new Set(allCourses?.map((course) => course.customDomain))
  );

  // ✅ Filter courses
  useEffect(() => {
    if (allCourses?.length > 0) {
      let tempCourses = [...allCourses];

      if (input) {
        tempCourses = tempCourses.filter((item) =>
          item.courseTitle.toLowerCase().includes(input.toLowerCase())
        );
      }

      if (selectedDomain !== "All") {
        tempCourses = tempCourses.filter(
          (item) => item.customDomain === selectedDomain
        );
      }

      setFilteredCourse(tempCourses);
    }
  }, [allCourses, input, selectedDomain]);

  // ✅ Group by domain
  const groupedByDomain = filteredCourse.reduce((acc, course) => {
    if (!acc[course.customDomain]) acc[course.customDomain] = [];
    acc[course.customDomain].push(course);
    return acc;
  }, {});

  return (
    <>
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

          {/* Domain Filter */}
          <div className="flex items-center gap-4 mt-10">
            <label className="text-gray-700 font-medium">
              Filter by Domain:
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="All">All Domains</option>
              {uniqueDomains.map((domain, index) => (
                <option key={index} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>

          {/* Active Search Tag */}
          {input && (
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

          {/* Courses */}
          {Object.keys(groupedByDomain).length > 0 ? (
            Object.entries(groupedByDomain).map(([domain, courses]) => (
              <div key={domain} className="my-16">
                {/* Domain Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl font-semibold text-gray-800 mb-6 border-l-4 border-blue-500 pl-3"
                >
                  {domain}
                </motion.h2>

                {/* ✅ Balanced Grid */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8 place-items-center"
                >
                  {courses.map((course, index) => (
                    <motion.div
                      key={index}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 12px 30px rgba(59,130,246,0.35)",
                      }}
                      transition={{ type: "spring", stiffness: 180 }}
                      className="w-full flex justify-center"
                    >
                      <CourseCard course={course} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-16 text-lg">
              No projects found for the selected domain or search.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CoursesList;
