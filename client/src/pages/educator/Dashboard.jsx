import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";

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

  return dashboardData ? (
    <div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-gradient-to-b from-sky-50 via-cyan-50 to-white transition-all">
      <div className="space-y-6 w-full">
        {/* Top Statistic Cards */}
        <div className="flex flex-wrap gap-6 items-center justify-start">
          {/* Card 1 */}
          <div className="flex items-center gap-4 bg-gradient-to-tr from-sky-400 to-cyan-500 text-white p-5 w-60 rounded-2xl shadow-[0_10px_25px_rgba(56,189,248,0.4)] hover:shadow-[0_15px_35px_rgba(56,189,248,0.5)] transition-all transform hover:-translate-y-1 cursor-pointer">
            <img
              src={assets.patients_icon}
              alt="enrolments"
              className="w-10 h-10 bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-inner"
            />
            <div>
              <p className="text-3xl font-bold">
                {dashboardData.enrolledStudentsData.length}
              </p>
              <p className="text-base opacity-90 font-medium">
                Total Enrolments
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-center gap-4 bg-gradient-to-tr from-blue-400 to-sky-500 text-white p-5 w-60 rounded-2xl shadow-[0_10px_25px_rgba(59,130,246,0.4)] hover:shadow-[0_15px_35px_rgba(59,130,246,0.5)] transition-all transform hover:-translate-y-1 cursor-pointer">
            <img
              src={assets.appointments_icon}
              alt="courses"
              className="w-10 h-10 bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-inner"
            />
            <div>
              <p className="text-3xl font-bold">{dashboardData.totalCourses}</p>
              <p className="text-base opacity-90 font-medium">Total Projects</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-center gap-4 bg-gradient-to-tr from-cyan-500 to-blue-500 text-white p-5 w-60 rounded-2xl shadow-[0_10px_25px_rgba(14,165,233,0.4)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.5)] transition-all transform hover:-translate-y-1 cursor-pointer">
            <img
              src={assets.earning_icon}
              alt="earnings"
              className="w-10 h-10 bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-inner"
            />
            <div>
              <p className="text-3xl font-bold">
                {currency}
                {Math.floor(dashboardData.totalEarnings)}
              </p>
              <p className="text-base opacity-90 font-medium">Total Earnings</p>
            </div>
          </div>
        </div>

        {/* Latest Enrolments Table */}
        <div className="w-full">
          <h2 className="pb-4 text-xl font-semibold text-gray-800">
            Latest Enrolments
          </h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-xl bg-white/80 backdrop-blur-lg border border-gray-200 shadow-md hover:shadow-lg transition-all">
            <table className="table-fixed md:table-auto w-full overflow-hidden">
              <thead className="text-gray-900 bg-gradient-to-r from-sky-100 to-cyan-100 border-b border-gray-200 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Project Title</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {dashboardData.enrolledStudentsData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-sky-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {index + 1}
                    </td>
                    <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                      <img
                        src={item.student.imageUrl}
                        alt="Profile"
                        className="w-9 h-9 rounded-full shadow-sm"
                      />
                      <span className="truncate font-medium">
                        {item.student.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 truncate">{item.courseTitle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Dashboard;
