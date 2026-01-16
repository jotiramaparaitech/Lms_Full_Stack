import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { Line } from "rc-progress";
import Footer from "../../components/student/Footer";
import { motion } from "framer-motion"; // ✅ for smooth hover and depth animation
import { toast } from "react-hot-toast"; // optional, if used globally

const MyEnrollments = () => {
  const {
    userData,
    enrolledCourses,
    fetchUserEnrolledCourses,
    navigate,
    backendUrl,
    getToken,
    calculateCourseDuration,
    calculateNoOfLectures,
  } = useContext(AppContext);

  const [progressArray, setProgressData] = useState([]);

  const getProjectProgress = async () => {
    try {
      const token = await getToken();

      const tempProgressArray = await Promise.all(
        enrolledProjects.map(async (project) => {
          const { data } = await axios.post(
            `${backendUrl}/api/user/get-project-progress`,
            { projectId: project._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          let totalLectures = calculateNoOfLectures(project);
          const lectureCompleted = data.progressData
            ? data.progressData.lectureCompleted.length
            : 0;
          return { totalLectures, lectureCompleted };
        })
      );

      setProgressData(tempProgressArray);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (userData) fetchUserEnrolledProjects();
  }, [userData]);

  useEffect(() => {
    if (enrolledProjects.length > 0) getProjectProgress();
  }, [enrolledProjects]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-gray-100 relative overflow-hidden">
      {/* Floating glow background blobs */}
      <div className="absolute top-10 left-1/3 w-80 h-80 bg-blue-400/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-400/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>

      {/* Main content */}
      <div className="md:px-36 px-6 pt-16 flex-1">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 animate-text">
          My Enrollments
        </h1>

        <div className="mt-10 overflow-x-auto">
          <table className="min-w-full rounded-xl overflow-hidden backdrop-blur-sm bg-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm text-left hidden sm:table-header-group">
              <tr>
                <th className="px-6 py-3 font-semibold">Projects</th>
                <th className="px-6 py-3 font-semibold">Duration</th>
                <th className="px-6 py-3 font-semibold">Completed</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {enrolledProjects.map((project, index) => (
                <motion.tr
                  key={index}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-200 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
                >
                  <td className="px-4 sm:px-6 py-4 flex items-center gap-4">
                    <img
                      src={project.projectThumbnail}
                      alt={project.projectTitle}
                      className="w-14 sm:w-24 md:w-28 rounded-xl shadow-md hover:shadow-blue-300/50 transition-all duration-300"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-1 max-sm:text-sm">
                        {project.projectTitle}
                      </p>
                      <Line
                        className="bg-gray-200 rounded-full"
                        strokeWidth={3}
                        trailWidth={3}
                        strokeColor="#3b82f6"
                        percent={
                          progressArray[index]
                            ? (progressArray[index].lectureCompleted * 100) /
                              progressArray[index].totalLectures
                            : 0
                        }
                      />
                    </div>
                  </td>

                  <td className="px-4 sm:px-6 py-3 text-gray-700 max-sm:hidden">
                    {calculateProjectDuration(project)}
                  </td>

                  <td className="px-4 sm:px-6 py-3 text-gray-700 max-sm:hidden">
                    {progressArray[index] &&
                      `${progressArray[index].lectureCompleted} / ${progressArray[index].totalLectures}`}
                    <span className="text-xs ml-1">Lectures</span>
                  </td>

                  <td className="px-4 sm:px-6 py-3 text-right">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/player/" + project._id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {progressArray[index] &&
                      progressArray[index].lectureCompleted /
                        progressArray[index].totalLectures ===
                        1
                        ? "Completed"
                        : "On Going"}
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Gradient animation for title */}
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
    </div>
  );
};

export default MyEnrollments;
