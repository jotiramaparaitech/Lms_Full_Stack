import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import { motion } from "framer-motion";

const StudentsEnrolled = () => {
  const { backendUrl, getToken, isEducator } = useContext(AppContext);
  const [enrolledStudents, setEnrolledStudents] = useState(null);

  // -----------------------------
  // Fetch Enrolled Students
  // -----------------------------
  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/educator/enrolled-students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setEnrolledStudents(data.enrolledStudents.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // -----------------------------
  // Remove Student Access
  // -----------------------------
  const handleRemoveAccess = async (courseId, studentId) => {
    if (!courseId || !studentId) {
      toast.error("Missing course or student ID");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to remove this student's access?"
    );
    if (!confirm) return;

    try {
      const token = await getToken();
      const { data } = await axios.delete(
        `${backendUrl}/api/educator/remove-student/${courseId}/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Student access removed successfully");
        setEnrolledStudents((prev) =>
          prev.filter(
            (item) =>
              !(item.courseId === courseId && item.student?._id === studentId)
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to remove access");
    }
  };

  // -----------------------------
  // Fetch on mount (if educator)
  // -----------------------------
  useEffect(() => {
    if (isEducator) fetchEnrolledStudents();
  }, [isEducator]);

  if (!enrolledStudents) return <Loading />;

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen flex flex-col items-center md:p-12 p-6 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[-100px] left-[-50px] w-72 h-72 bg-blue-300/30 blur-3xl rounded-full animate-pulse -z-10"></div>
      <div className="absolute bottom-[-120px] right-[-50px] w-96 h-96 bg-cyan-400/30 blur-3xl rounded-full animate-pulse -z-10"></div>

      {/* Table Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white/80 border border-gray-200 shadow-[0_10px_40px_rgba(56,189,248,0.25)] hover:shadow-[0_20px_60px_rgba(56,189,248,0.35)] transition-all"
      >
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-gray-800 bg-gradient-to-r from-sky-100 to-blue-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">
                #
              </th>
              <th className="px-4 py-3 font-semibold">Student Name</th>
              <th className="px-4 py-3 font-semibold">Course Title</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                Date
              </th>
              <th className="px-4 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {enrolledStudents
              ?.filter((item) => item && item.student)
              .map((item, index) => (
                <motion.tr
                  key={`${item.student?._id}-${item.courseId}`}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(224, 242, 254, 0.5)",
                  }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="border-b border-gray-200 cursor-pointer"
                >
                  {/* Index */}
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {index + 1}
                  </td>

                  {/* Student Name */}
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img
                      src={item.student?.imageUrl || "/default-avatar.png"}
                      alt="Profile"
                      className="w-10 h-10 rounded-full shadow-md object-cover"
                    />
                    <span className="truncate font-medium text-gray-800">
                      {item.student?.name || "Unknown Student"}
                    </span>
                  </td>

                  {/* Course Title */}
                  <td className="px-4 py-3 truncate font-medium text-gray-700">
                    {item.courseTitle || "Untitled Course"}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                    {item.purchaseDate
                      ? new Date(item.purchaseDate).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* Remove Access Button */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        handleRemoveAccess(item.courseId, item.student?._id)
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                      Remove Access
                    </button>
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default StudentsEnrolled;
