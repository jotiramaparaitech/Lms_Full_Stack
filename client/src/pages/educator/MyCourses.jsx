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
  const navigate = useNavigate();

  // Fetch educator courses
  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setCourses(data.courses);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load courses");
    }
  };

  // Remove course
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
      } else {
        toast.error("Failed to remove project.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting project");
    }
  };

  // Navigate to edit page
  const handleEditCourse = (courseId) => {
    navigate(`/educator/edit-course/${courseId}`);
  };

  useEffect(() => {
    if (isEducator) fetchEducatorCourses();
  }, [isEducator]);

  if (!courses) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col items-center md:p-12 p-6 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[-120px] left-[-50px] w-80 h-80 bg-blue-300/30 blur-3xl rounded-full animate-pulse -z-10"></div>
      <div className="absolute bottom-[-120px] right-[-50px] w-96 h-96 bg-cyan-400/30 blur-3xl rounded-full animate-pulse -z-10"></div>

      {/* Table Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white/80 backdrop-blur-none border border-gray-200 shadow-[0_10px_40px_rgba(56,189,248,0.25)] hover:shadow-[0_20px_60px_rgba(56,189,248,0.35)] transition-all"
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
            {courses.map((course) => (
              <motion.tr
                key={course._id}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(224, 242, 254, 0.5)",
                }}
                transition={{ type: "spring", stiffness: 200 }}
                className="border-b border-gray-200 cursor-pointer"
              >
                {/* Project */}
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

                {/* Earnings */}
                <td className="px-4 py-3 font-semibold text-blue-600">
                  {currency}{" "}
                  {Math.floor(
                    course.enrolledStudents.length *
                      (course.coursePrice -
                        (course.discount * course.coursePrice) / 100)
                  )}
                </td>

                {/* Students */}
                <td className="px-4 py-3 text-center font-medium text-gray-800">
                  {course.enrolledStudents.length}
                </td>

                {/* Published On */}
                <td className="px-4 py-3 text-gray-700">
                  {new Date(course.createdAt).toLocaleDateString()}
                </td>

                {/* Actions */}
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
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default MyCourses;
