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

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const tempCourses = allCourses.slice();

      input
        ? setFilteredCourse(
            tempCourses.filter((item) =>
              item.courseTitle.toLowerCase().includes(input.toLowerCase())
            )
          )
        : setFilteredCourse(tempCourses);
    }
  }, [allCourses, input]);

  return (
    <>
      <div className="relative min-h-screen md:px-36 px-8 pt-20 text-left overflow-hidden bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50">
        {/* ✨ Animated gradient background orbs */}
        <div className="absolute top-[-150px] left-[-80px] w-[300px] h-[300px] bg-blue-400/20 blur-3xl rounded-full animate-pulse -z-10"></div>
        <div className="absolute bottom-[-150px] right-[-80px] w-[350px] h-[350px] bg-cyan-400/30 blur-3xl rounded-full animate-pulse -z-10"></div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex md:flex-row flex-col gap-6 items-start justify-between w-full"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-md">
              Project List
            </h1>
            <p className="text-gray-600 mt-2">
              <span
                onClick={() => navigate("/")}
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Home
              </span>{" "}
              / <span>Project List</span>
            </p>
          </div>
          <SearchBar data={input} />
        </motion.div>

        {/* Active Search Tag */}
        {input && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600 bg-white/70 rounded-lg shadow-sm backdrop-blur-md hover:shadow-md"
          >
            <p>{input}</p>
            <img
              onClick={() => navigate("/course-list")}
              className="cursor-pointer w-4 h-4 hover:rotate-90 transition-transform"
              src={assets.cross_icon}
              alt=""
            />
          </motion.div>
        )}

        {/* 3D Grid Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-6"
        >
          {filteredCourse.map((course, index) => (
            <motion.div
              key={index}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: -3,
                boxShadow:
                  "0 10px 30px rgba(56,189,248,0.4), 0 0 15px rgba(59,130,246,0.3)",
              }}
              transition={{ type: "spring", stiffness: 200 }}
              className="transform-gpu"
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default CoursesList;
