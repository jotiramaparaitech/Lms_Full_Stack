import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import { motion } from "framer-motion";

const TeamLeaders = () => {
  const { backendUrl, getToken, isEducator } = useContext(AppContext);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Fetch Team Leaders
  // -----------------------------
  const fetchTeamLeaders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/educator/team-leaders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setTeamLeaders(data.teamLeaders);
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
  // Remove Team Leader
  // -----------------------------
  const removeTeamLeader = async (studentId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to remove this user from Team Leaders?"
      );
      if (!confirm) return;

      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/educator/assign-team-leader`,
        { userId: studentId, isTeamLeader: false },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Team Leader removed successfully");
        setTeamLeaders((prev) => prev.filter((leader) => leader._id !== studentId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isEducator) fetchTeamLeaders();
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
          <h2 className="text-2xl font-bold text-gray-800">Team Leaders</h2>
          <p className="text-gray-500 text-sm mt-1">List of all active Team Leaders.</p>
        </div>

        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-gray-800 bg-gradient-to-r from-sky-100 to-blue-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-center w-16">#</th>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Assigned Project</th> {/* ✅ NEW Column */}
              <th className="px-6 py-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {teamLeaders.map((leader, index) => (
              <motion.tr
                key={leader._id}
                whileHover={{ scale: 1.01, backgroundColor: "rgba(224, 242, 254, 0.4)" }}
                className="border-b border-gray-200 transition-all cursor-default"
              >
                <td className="px-6 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                <td className="px-6 py-4 flex items-center gap-4">
                  <img
                    src={leader.imageUrl || "/default-avatar.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full shadow-sm object-cover"
                  />
                  <span className="font-semibold text-gray-800">{leader.name}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{leader.email}</td>
                <td className="px-6 py-4 text-gray-600">
                    {leader.assignedProject?.courseTitle || <span className="text-gray-400 italic">None</span>}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => removeTeamLeader(leader._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    Remove Access
                  </button>
                </td>
              </motion.tr>
            ))}
            {teamLeaders.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No Team Leaders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default TeamLeaders;
