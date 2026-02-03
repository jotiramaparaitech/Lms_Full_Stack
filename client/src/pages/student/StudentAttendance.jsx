import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { 
  CalendarCheck, 
  CheckCircle, 
  XCircle, 
  LogIn, 
  LogOut, 
  AlertCircle, 
  Clock, 
  Calendar,
  History,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import StudentSidebar from "../../components/student/StudentSidebar";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";

const StudentAttendance = () => {
  // ---------- CONTEXT & STATE ----------
  const { 
  userData, 
  enrolledCourses, 
  backendUrl,
  getToken // <--- Use the function provided by Clerk
} = useContext(AppContext);
  
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dynamic Course ID (Takes the first enrolled course)
  const courseId = enrolledCourses?.length > 0 ? enrolledCourses[0]._id : null;

  // ---------- TIME LOGIC (IST) ----------
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const istNow = new Date(currentTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const minutesNow = istNow.getHours() * 60 + istNow.getMinutes();

  const LOGIN_START = 570;   
  const LOGIN_END = 1120;     
  const LOGOUT_START = 1120; 
  const LOGOUT_END = 1140;   

  const LOGIN_ALLOWED = minutesNow >= LOGIN_START && minutesNow <= LOGIN_END; 
  const LOGOUT_ALLOWED = minutesNow >= LOGOUT_START && minutesNow <= LOGOUT_END;
  const today = istNow.toISOString().split("T")[0];

  // ---------- API CALLS ----------
const fetchAttendance = async () => {
    if (!courseId) {
        setIsLoading(false);
        return;
    }
    try {
      // Get token here too
      const token = await getToken();

      const { data } = await axios.get(
        `${backendUrl}/api/attendance/history/${courseId}`, 
        {
           headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (data.success) {
        const recordList = data.attendance || data.history || [];
        setAttendance(recordList.length > 0 ? [...recordList].reverse() : []);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      // specific error handling...
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchAttendance();
    } else if (enrolledCourses && enrolledCourses.length === 0) {
        setIsLoading(false);
    }
  }, [courseId, enrolledCourses]);

const markAttendance = async (session) => {
    if (!courseId) return toast.error("No enrolled course found.");

    try {
      setMarking(true);

      // 1. GET THE TOKEN FROM CLERK
      const token = await getToken(); 
      
      if (!token) {
        toast.error("Authentication failed. Please reload.");
        return;
      }

      // 2. USE THE TOKEN IN THE HEADER
      const { data } = await axios.post(
        `${backendUrl}/api/attendance/mark`,
        { courseId, session },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Now this works!
          },
        }
      );

      if (data.success) {
        toast.success(data.message || `🎉 ${session} marked successfully!`);
        fetchAttendance(); 
      }
    } catch (error) {
      console.error("Mark Error:", error);
      const message = error.response?.data?.message || "Failed to mark attendance.";
      toast.error(message);
    } finally {
      setMarking(false);
    }
  };

  // ---------- UPDATED CALCULATIONS ----------
  const todayRecords = attendance.filter(a => {
    const recordDate = new Date(a.date).toISOString().split("T")[0];
    return recordDate === today;
  });
  
  const alreadyLoggedIn = todayRecords.some((a) => a.session === "LOGIN");
  const alreadyLoggedOut = todayRecords.some((a) => a.session === "LOGOUT");
  
  const canLogout = alreadyLoggedIn && !alreadyLoggedOut;
  const loginWindowPassed = minutesNow > LOGIN_END; 
  const presentDays = new Set(attendance.map(a => new Date(a.date).toISOString().split("T")[0])).size; 

  let statusText = "Pending";
  let statusColor = "text-gray-300";
  let StatusIcon = AlertCircle;

  if (alreadyLoggedOut) {
      statusText = "Completed";
      statusColor = "text-green-300";
      StatusIcon = CheckCircle;
  } else if (alreadyLoggedIn) {
      statusText = "Half-Day / Active";
      statusColor = "text-blue-300";
      StatusIcon = Clock;
  } else if (loginWindowPassed) {
      statusText = "Absent";
      statusColor = "text-red-300";
      StatusIcon = XCircle;
  }

  if (isLoading) return <Loading />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />

      <div className="flex-1 min-w-0">
        <main className="p-4 md:p-6 pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* 1. WELCOME BANNER */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                    Attendance Portal <Sparkles className="text-yellow-300" size={24} />
                  </h1>
                  <p className="text-blue-100 mb-4">
                    Welcome, <span className="font-bold text-white capitalize">{userData?.name || "Student"}</span>. 
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      <Calendar size={14} /> 
                      {istNow.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      <Clock size={14} /> 
                      {istNow.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl min-w-[220px]">
                  <p className="text-xs text-blue-100 uppercase font-semibold tracking-wider mb-1">Status Today</p>
                  <div className={`flex items-center gap-2 font-bold text-xl ${statusColor}`}>
                    <StatusIcon size={24} />
                    <span className="text-white">
                        {statusText}
                    </span>
                  </div>
                  {alreadyLoggedIn && !alreadyLoggedOut && (
                    <p className="text-[10px] text-blue-200 mt-1 italic">
                      * Complete logout at 06:00 PM
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 2. ACTION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                disabled={!LOGIN_ALLOWED || alreadyLoggedIn || marking || !courseId}
                onClick={() => markAttendance("LOGIN")}
                whileHover={(!LOGIN_ALLOWED || alreadyLoggedIn) ? {} : { scale: 1.01 }}
                className={`relative overflow-hidden p-6 rounded-xl shadow-md border text-left transition-all w-full
                  ${alreadyLoggedIn 
                    ? "bg-green-50 border-green-200 cursor-default" 
                    : LOGIN_ALLOWED 
                      ? "bg-white border-blue-100 hover:border-blue-400" 
                      : "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
                  }`}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className={`p-3 rounded-xl w-fit mb-4 ${alreadyLoggedIn ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                      {alreadyLoggedIn ? <CheckCircle size={24} /> : <LogIn size={24} />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Morning Login</h3>
                    <p className="text-sm text-gray-500 mt-1">Window: 09:30 AM - 10:30 AM</p>
                  </div>
                  {alreadyLoggedIn && <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded">MARKED</span>}
                </div>
              </motion.button>

              <motion.button
                 disabled={!LOGOUT_ALLOWED || !canLogout || marking || !courseId}
                 onClick={() => markAttendance("LOGOUT")}
                 whileHover={(!LOGOUT_ALLOWED || !canLogout) ? {} : { scale: 1.01 }}
                 className={`relative overflow-hidden p-6 rounded-xl shadow-md border text-left transition-all w-full
                  ${alreadyLoggedOut
                    ? "bg-green-50 border-green-200 cursor-default"
                    : (LOGOUT_ALLOWED && canLogout)
                      ? "bg-white border-indigo-100 hover:border-indigo-400"
                      : "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
                  }`}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className={`p-3 rounded-xl w-fit mb-4 ${alreadyLoggedOut ? "bg-green-100 text-green-600" : "bg-indigo-100 text-indigo-600"}`}>
                      {alreadyLoggedOut ? <CheckCircle size={24} /> : <LogOut size={24} />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Evening Logout</h3>
                    <p className="text-sm text-gray-500 mt-1">Window: 06:00 PM - 07:00 PM</p>
                  </div>
                  {alreadyLoggedOut && <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded">MARKED</span>}
                </div>
              </motion.button>
            </div>

            {/* 3. SUMMARY & HISTORY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-blue-600" size={20} />
                    <h2 className="text-lg font-bold text-gray-800">Analytics</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total Present Days</span>
                      <span className="font-bold text-gray-800">{presentDays}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Today's Progress</span>
                      <span className={alreadyLoggedIn ? "text-blue-600 font-bold" : "text-gray-400"}>
                        {alreadyLoggedOut ? "Completed" : alreadyLoggedIn ? "Active" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                   <div className="flex items-center gap-3 mb-6">
                    <History className="text-blue-600" size={20} />
                    <h2 className="text-lg font-bold text-gray-800">Recent History</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-400 text-sm uppercase">
                          <th className="pb-4 font-medium">Date</th>
                          <th className="pb-4 font-medium">Session</th>
                          <th className="pb-4 font-medium">Time</th>
                          <th className="pb-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 divide-y">
                        {attendance.length > 0 ? (
                          attendance.slice(0, 10).map((record, idx) => {
                            const isToday = new Date(record.date).toISOString().split("T")[0] === today;
                            const isSessionActive = isToday && record.session === 'LOGIN' && !alreadyLoggedOut;

                            return (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4">{new Date(record.date).toLocaleDateString()}</td>
                                <td className="py-4">
                                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${record.session === 'LOGIN' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {record.session}
                                  </span>
                                </td>
                                <td className="py-4">
                                  {record.time || new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-4">
                                  <span className={`flex items-center gap-1 text-sm ${isSessionActive ? 'text-blue-600' : 'text-green-600'}`}>
                                    {isSessionActive ? (
                                      <>
                                        <Clock size={14} /> Active
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle size={14} /> Present
                                      </>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-10 text-center text-gray-400">No records found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentAttendance;