import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import { motion } from "framer-motion";

const AssignTeamLeader = () => {
  const { backendUrl, getToken, isEducator } = useContext(AppContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Fetch All Students
  // -----------------------------
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/educator/all-students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setStudents(data.students);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Toggle Team Leader Status
  // -----------------------------
  const toggleTeamLeader = async (studentId, currentStatus) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/educator/assign-team-leader`,
        { userId: studentId, isTeamLeader: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        // Optimize: Update local state instead of refetching
        setStudents((prev) =>
          prev.map((s) =>
            s._id === studentId ? { ...s, isTeamLeader: !currentStatus } : s
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isEducator) fetchStudents();
  }, [isEducator]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col items-center md:p-12 p-6 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-50px] w-72 h-72 bg-blue-300/30 blur-3xl rounded-full animate-pulse -z-10"></div>
      <div className="absolute bottom-[-120px] right-[-50px] w-96 h-96 bg-cyan-400/30 blur-3xl rounded-full animate-pulse -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white/80 border border-gray-200 shadow-[0_10px_40px_rgba(56,189,248,0.25)]"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Assign Team Leader</h2>
          <p className="text-gray-500 text-sm mt-1">Select users to promote to Team Leader.</p>
        </div>

        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-gray-800 bg-gradient-to-r from-sky-100 to-blue-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Student Name</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {students.map((student) => (
              <motion.tr
                key={student._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors"
              >
                <td className="px-6 py-4 flex items-center gap-4">
                  <img
                    src={student.imageUrl || "/default-avatar.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full shadow-sm object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{student.name}</p>
                    <p className="text-gray-500 text-xs">{student.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      student.isTeamLeader
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {student.isTeamLeader ? "Team Leader" : "Student"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleTeamLeader(student._id, student.isTeamLeader)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all ${
                      student.isTeamLeader
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {student.isTeamLeader ? "Remove Role" : "Make Leader"}
                  </button>
                </td>
              </motion.tr>
            ))}
            {students.length === 0 && (
               <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                  No students found.
                </td>
               </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default AssignTeamLeader;
