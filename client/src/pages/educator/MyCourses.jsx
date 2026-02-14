import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MyCourses = () => {
  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setCourses(data.courses);
        setFilteredCourses(data.courses);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load courses");
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      const token = await getToken();
      const { data } = await axios.delete(
        `${backendUrl}/api/educator/course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Project removed successfully!");
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
        setFilteredCourses((prev) => prev.filter((c) => c._id !== courseId));
      } else {
        toast.error("Failed to remove project.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting project");
    }
  };

  const handleEditCourse = (courseId) => {
    navigate(`/educator/course/${courseId}/edit`);
  };

  // Search filter function - projects starting with search term
  useEffect(() => {
    if (courses) {
      if (searchTerm.trim() === "") {
        setFilteredCourses(courses);
      } else {
        const filtered = courses.filter((course) =>
          course.courseTitle.toLowerCase().startsWith(searchTerm.toLowerCase())
        );
        setFilteredCourses(filtered);
      }
    }
  }, [searchTerm, courses]);

  useEffect(() => {
    if (isEducator) fetchEducatorCourses();
  }, [isEducator]);

  if (!courses) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col items-center md:p-12 p-4 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[-120px] left-[-50px] w-80 h-80 bg-blue-300/30 blur-3xl rounded-full animate-pulse -z-10"></div>
      <div className="absolute bottom-[-120px] right-[-50px] w-96 h-96 bg-cyan-400/30 blur-3xl rounded-full animate-pulse -z-10"></div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl mb-6"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pl-12 pr-10 rounded-2xl border border-gray-300 bg-white/80 backdrop-blur-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
          />
          <svg
            className="absolute left-4 top-3.5 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {filteredCourses && (
          <div className="flex justify-between items-center mt-2 ml-2">
            <p className="text-sm text-gray-600">
              Showing {filteredCourses.length} of {courses.length} projects
            </p>
            {searchTerm && (
              <p className="text-xs text-gray-500 bg-white/60 px-3 py-1 rounded-full">
                Showing projects starting with "{searchTerm}"
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* TABLE VIEW (Visible on md and above) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden md:block w-full max-w-6xl overflow-x-auto rounded-3xl bg-white/80 border border-gray-200 shadow-[0_10px_40px_rgba(56,189,248,0.25)] hover:shadow-[0_20px_60px_rgba(56,189,248,0.35)] transition-all"
      >
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-gray-800 bg-gradient-to-r from-sky-100 to-blue-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">Earnings</th>
              <th className="px-4 py-3 font-semibold text-center">Students</th>
              <th className="px-4 py-3 font-semibold">Published On</th>
              <th className="px-4 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <motion.tr
                  key={course._id}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(224, 242, 254, 0.5)",
                  }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="border-b border-gray-200 cursor-pointer"
                >
                  <td className="px-4 py-3 flex items-center gap-3 truncate">
                    <img
                      src={course.courseThumbnail}
                      alt="Course"
                      className="w-16 h-12 object-cover rounded-lg border shadow-md hover:scale-105 transition-transform"
                    />
                    <span className="truncate font-medium text-gray-800">
                      {course.courseTitle}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-blue-600 whitespace-nowrap">
                    {currency}{" "}
                    {Math.floor(
                      course.enrolledStudents.length *
                        (course.coursePrice -
                          (course.discount * course.coursePrice) / 100)
                    )}
                  </td>

                  <td className="px-4 py-3 text-center font-medium text-gray-800">
                    {course.enrolledStudents.length}
                  </td>

                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 flex justify-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditCourse(course._id)}
                      className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md shadow-md hover:shadow-lg transition"
                    >
                      Edit
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRemoveCourse(course._id)}
                      className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md shadow-md hover:shadow-lg transition"
                    >
                      Remove
                    </motion.button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No projects found starting with "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* MOBILE CARD VIEW (Visible below md) */}
      <div className="block md:hidden w-full max-w-md mt-4 space-y-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <motion.div
              key={course._id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white/80 border border-gray-200 rounded-2xl shadow-md p-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={course.courseThumbnail}
                  alt="Course"
                  className="w-20 h-16 object-cover rounded-lg shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {course.courseTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {currency}{" "}
                    {Math.floor(
                      course.enrolledStudents.length *
                        (course.coursePrice -
                          (course.discount * course.coursePrice) / 100)
                    )}{" "}
                    • {course.enrolledStudents.length} Students
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditCourse(course._id)}
                  className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md shadow-sm"
                >
                  Edit
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRemoveCourse(course._id)}
                  className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md shadow-sm"
                >
                  Remove
                </motion.button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white/80 rounded-2xl border border-gray-200 p-4">
            No projects found starting with "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
