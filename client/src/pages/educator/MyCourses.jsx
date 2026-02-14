import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const MyCourses = () => {
  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [showLockModal, setShowLockModal] = useState(false);
  const [password, setPassword] = useState("");
  const DASHBOARD_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || "Aparaitech123@";

  const navigate = useNavigate();

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      setIsLocked(false);
      setShowLockModal(false);
      setPassword("");
      toast.success("Unlocked successfully!");
    } else {
      toast.error("Incorrect password");
    }
  };

  const toggleLock = () => {
    if (isLocked) {
      setShowLockModal(true);
    } else {
      setIsLocked(true);
      toast.info("Locked successfully");
    }
  };

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

  const handleEditCourse = (courseId) => {
    navigate(`/educator/course/${courseId}/edit`);
  };

  useEffect(() => {
    if (isEducator) fetchEducatorCourses();
  }, [isEducator]);

  if (!courses) return <Loading />;

  const filteredCourses = courses.filter((course) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const title = (course.courseTitle || "").toLowerCase().trim();
    console.log(`Search: "${query}" vs "${title}" -> ${title.startsWith(query)}`);
    return title.startsWith(query);
  });

  return (
    <div className="min-h-screen flex flex-col items-center md:p-12 p-4 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[-120px] left-[-50px] w-80 h-80 bg-blue-300/30 blur-3xl rounded-full animate-pulse -z-10"></div>
      <div className="absolute bottom-[-120px] right-[-50px] w-96 h-96 bg-cyan-400/30 blur-3xl rounded-full animate-pulse -z-10"></div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by project title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/80 border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
          />
          {searchQuery && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {filteredCourses?.length || 0} result{filteredCourses?.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </motion.div>

      {/* Lock/Unlock Button */}
      <div className="w-full max-w-6xl mb-4 flex justify-end">
        <button
          onClick={toggleLock}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all shadow-md ${isLocked ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
        >
          {isLocked ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Locked
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Unlocked
            </>
          )}
        </button>
      </div>

      {/* Password Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Password to Unlock</h3>
            <form onSubmit={handleUnlock}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLockModal(false);
                    setPassword("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Unlock
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
                    {isLocked ? "****" : (
                      <>
                        {currency}{" "}
                        {Math.floor(
                          course.enrolledStudents.length *
                          (course.coursePrice -
                            (course.discount * course.coursePrice) / 100)
                        )}
                      </>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center font-medium text-gray-800">
                    {isLocked ? "****" : course.enrolledStudents.length}
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
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-10 h-10 text-gray-300" />
                    <p className="font-medium">No projects found matching "{searchQuery}"</p>
                  </div>
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
                    {isLocked ? "****" : (
                      <>
                        {currency}{" "}
                        {Math.floor(
                          course.enrolledStudents.length *
                          (course.coursePrice -
                            (course.discount * course.coursePrice) / 100)
                        )}
                      </>
                    )}{" "}
                    • {isLocked ? "****" : course.enrolledStudents.length} Students
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
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-white/80 rounded-2xl border border-gray-200 shadow-sm backdrop-blur-sm">
            <Search className="w-10 h-10 text-gray-300 mb-2" />
            <p className="font-medium text-center">No projects found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;