import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

  // Data for the Pie Chart (User Activity)
  const activityData = [
    { name: 'Completed', value: 400, color: '#22c55e' },
    { name: 'In Progress', value: 300, color: '#3b82f6' },
    { name: 'Not Started', value: 100, color: '#94a3b8' },
  ];

  const cards = [
    { label: "Total Students", value: dashboardData?.enrolledStudentsData.length || 0, icon: assets.patients_icon, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Projects", value: dashboardData?.totalCourses || 0, icon: assets.appointments_icon, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Enrollments Today", value: "120", icon: assets.earning_icon, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Earnings", value: `${currency}${Math.floor(dashboardData?.totalEarnings || 0)}`, icon: assets.earning_icon, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return dashboardData ? (
    <div className="min-h-screen p-6 bg-[#F8FAFC]">
      
      {/* 1. Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
              <img src={card.icon} alt="" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Top Courses Performance (Left - 8 Columns) */}
        <div className="lg:col-span-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold">Top Performing Projects</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-8">
            {[
              { name: 'JavaScript Mastery', students: 1250, color: 'bg-blue-500', percent: 85 },
              { name: 'Machine Learning A-Z', students: 980, color: 'bg-emerald-500', percent: 70 },
              { name: 'Graphic Design Essentials', students: 875, color: 'bg-orange-500', percent: 60 }
            ].map((course, i) => (
              <div key={i} className="group">
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full ${course.color}`}></div>
                     <span className="text-sm font-semibold text-gray-700">{course.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">{course.students} Enrolled</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${course.percent}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${course.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. User Activity & Approvals (Right - 4 Columns) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Pie Chart Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-center">User Activity</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={activityData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
               {activityData.map((item, i) => (
                 <div key={i} className="flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                   <span className="text-[10px] text-gray-500 font-medium">{item.name}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Pending Approvals Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">Pending Approvals</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-blue-50 transition-colors cursor-pointer">
                <span className="text-sm font-medium text-gray-600">Course Review Requests</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">5</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-purple-50 transition-colors cursor-pointer">
                <span className="text-sm font-medium text-gray-600">Instructor Applications</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">2</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4. Latest Enrolments (Full Width Bottom) */}
        <div className="lg:col-span-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold">Latest Enrolments</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Search students..." className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-400" />
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-8 py-4">Student</th>
                <th className="px-8 py-4">Project Title</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dashboardData.enrolledStudentsData.slice(0, 5).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4 flex items-center gap-3">
                    <img src={item.student.imageUrl || "/default-avatar.png"} className="w-8 h-8 rounded-full ring-2 ring-gray-100" />
                    <span className="text-sm font-semibold text-gray-700">{item.student.name}</span>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-600">{item.courseTitle}</td>
                  <td className="px-8 py-4 text-sm text-gray-400">April 20, 2024</td>
                  <td className="px-8 py-4 text-center">
                    <button className="text-gray-400 hover:text-blue-600">•••</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Dashboard;