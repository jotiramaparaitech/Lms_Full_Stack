import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isEducator) fetchDashboardData();
  }, [isEducator]);

  const cards = [
    {
      icon: assets.patients_icon,
      value: dashboardData?.enrolledStudentsData.length,
      label: "Total Enrolments",
      gradient: "from-pink-500 to-red-500",
      shadow: "rgba(239,68,68,0.5)",
    },
    {
      icon: assets.appointments_icon,
      value: dashboardData?.totalCourses,
      label: "Total Projects",
      gradient: "from-green-400 to-teal-500",
      shadow: "rgba(34,197,94,0.5)",
    },
    {
      icon: assets.earning_icon,
      value: `${currency}${Math.floor(dashboardData?.totalEarnings)}`,
      label: "Total Earnings",
      gradient: "from-blue-400 to-indigo-500",
      shadow: "rgba(59,130,246,0.5)",
    },
  ];

  return dashboardData ? (
    <div className="min-h-screen flex flex-col gap-10 md:p-12 p-6 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background 3D Glows */}
      <div className="absolute top-[-100px] left-[10%] w-72 h-72 bg-blue-400/20 blur-3xl rounded-full animate-pulse -z-10"></div>
      <div className="absolute bottom-[-100px] right-[5%] w-96 h-96 bg-purple-400/20 blur-3xl rounded-full animate-pulse -z-10"></div>

      {/* Top Statistic Cards */}
      <div className="flex flex-wrap gap-8 items-center justify-start">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.08, rotateY: 5 }}
            transition={{ type: "spring", stiffness: 200 }}
            className={`flex items-center gap-5 bg-gradient-to-tr ${card.gradient} text-white p-6 w-64 rounded-3xl shadow-[0_10px_35px_${card.shadow}] hover:shadow-[0_20px_50px_${card.shadow}] backdrop-blur-md transform transition-all cursor-pointer`}
          >
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-lg shadow-inner">
              <img src={card.icon} alt="icon" className="w-10 h-10" />
            </div>
            <div>
              <p className="text-3xl font-bold drop-shadow-md">{card.value}</p>
              <p className="text-base opacity-90 font-medium">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Latest Enrolments Table */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-5xl"
      >
        <h2 className="pb-4 text-2xl font-semibold text-gray-800">
          Latest Enrolments
        </h2>
        <div className="overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all">
          <table className="table-auto w-full">
            <thead className="bg-gradient-to-r from-sky-100 to-cyan-100 text-gray-800 text-sm">
              <tr>
                <th className="px-6 py-3 font-semibold text-center hidden sm:table-cell">
                  #
                </th>
                <th className="px-6 py-3 font-semibold">Student Name</th>
                <th className="px-6 py-3 font-semibold">Project Title</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {dashboardData.enrolledStudentsData
                .filter(
                  (item) =>
                    item &&
                    item.student &&
                    item.student._id &&
                    item.student.name
                )
                .map((item, index) => (
                  <motion.tr
                    key={index}
                    whileHover={{ scale: 1.02, backgroundColor: "#E0F2FE" }}
                    className="border-b border-gray-200 transition-all"
                  >
                    <td className="px-6 py-3 text-center hidden sm:table-cell">
                      {index + 1}
                    </td>
                    <td className="px-6 py-3 flex items-center gap-3">
                      <img
                        src={item.student.imageUrl || "/default-avatar.png"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full shadow-md ring-2 ring-sky-300"
                      />
                      <span className="font-medium">{item.student.name}</span>
                    </td>
                    <td className="px-6 py-3 truncate">{item.courseTitle}</td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  ) : (
    <Loading />
  );
};

export default Dashboard;
