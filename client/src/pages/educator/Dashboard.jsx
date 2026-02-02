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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // IMPORTANT: In Vite, use import.meta.env instead of process.env
  const DASHBOARD_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || "jay_kashid";

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Debug: Log the password values (remove this in production)
    console.log("Entered password:", password);
    console.log("Expected password:", DASHBOARD_PASSWORD);
    
    // Simulate loading for better UX
    setTimeout(() => {
      if (password === DASHBOARD_PASSWORD) {
        setIsAuthenticated(true);
        toast.success("Access granted!");
      } else {
        toast.error("Incorrect password!");
        setPassword("");
      }
      setIsLoading(false);
    }, 500);
  };

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
    if (isEducator && isAuthenticated) {
      fetchDashboardData();
    }
  }, [isEducator, isAuthenticated]);

  const cards = [
    {
      icon: assets.patients_icon,
      value: dashboardData?.enrolledStudentsData?.length || 0,
      label: "Total Enrolments",
      gradient: "from-pink-500 to-red-500",
      shadow: "rgba(239,68,68,0.5)",
    },
    {
      icon: assets.appointments_icon,
      value: dashboardData?.totalCourses || 0,
      label: "Total Projects",
      gradient: "from-green-400 to-teal-500",
      shadow: "rgba(34,197,94,0.5)",
    },
    {
      icon: assets.earning_icon,
      value: `${currency}${Math.floor(dashboardData?.totalEarnings || 0)}`,
      label: "Total Earnings",
      gradient: "from-blue-400 to-indigo-500",
      shadow: "rgba(59,130,246,0.5)",
    },
  ];

  // Password protected layer
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
        {/* Background 3D Glows */}
        <div className="absolute top-[-100px] left-[10%] w-72 h-72 bg-blue-400/20 blur-3xl rounded-full animate-pulse -z-10"></div>
        <div className="absolute bottom-[-100px] right-[5%] w-96 h-96 bg-purple-400/20 blur-3xl rounded-full animate-pulse -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md mx-4"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Access</h1>
            <p className="text-gray-600">Enter password to continue</p>
            {/* Debug info - remove in production */}
            {import.meta.env.DEV && (
              <p className="text-xs text-gray-400 mt-2">
                Env password loaded: {DASHBOARD_PASSWORD ? "✓" : "✗"}
              </p>
            )}
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="Enter dashboard password"
                autoFocus
                disabled={isLoading}
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !password}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all ${
                isLoading || !password
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Access Dashboard"
              )}
            </motion.button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Contact admin if you've forgotten the password
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard content (only shown after authentication)
  return dashboardData ? (
    <div className="min-h-screen flex flex-col gap-10 md:p-12 p-6 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background 3D Glows */}
      <div className="absolute top-[-100px] left-[10%] w-72 h-72 bg-blue-400/20 blur-3xl rounded-full animate-pulse -z-10"></div>
      <div className="absolute bottom-[-100px] right-[5%] w-96 h-96 bg-purple-400/20 blur-3xl rounded-full animate-pulse -z-10"></div>

      {/* Logout button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsAuthenticated(false);
            setDashboardData(null);
            setPassword("");
            toast.info("Dashboard locked");
          }}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 font-medium transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          Lock Dashboard
        </motion.button>
      </div>

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
                <th className="px6 py-3 font-semibold">Student Name</th>
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