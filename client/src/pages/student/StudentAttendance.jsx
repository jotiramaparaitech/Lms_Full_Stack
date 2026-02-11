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
  Sparkles,
  Fingerprint,
  ArrowRightToLine,
  ArrowLeftToLine,
  ShieldCheck,
  ShieldAlert
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
    getToken
  } = useContext(AppContext);
  
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [blinkCheckin, setBlinkCheckin] = useState(false);
  const [blinkCheckout, setBlinkCheckout] = useState(false);

  // Dynamic Course ID (Takes the first enrolled course)
  const courseId = enrolledCourses?.length > 0 ? enrolledCourses[0]._id : null;

  // ---------- TIME LOGIC (IST) ----------
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const istNow = new Date(currentTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const minutesNow = istNow.getHours() * 60 + istNow.getMinutes();
  
  // Indian time format (24-hour)
  const currentTimeString = istNow.toLocaleTimeString("en-IN", { 
    hour: "2-digit", 
    minute: "2-digit",
    second: "2-digit",
    hour12: false 
  });
  
  // Date in Indian format
  const currentDateString = istNow.toLocaleDateString("en-IN", {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const CHECKIN_START = 570;   // 09:30 AM
  const CHECKIN_END = 630;     // 10:30 AM
  const CHECKOUT_START = 1080; // 06:00 PM (18:00)
  const CHECKOUT_END = 1140;   // 07:00 PM (19:00)

  const CHECKIN_ALLOWED = minutesNow >= CHECKIN_START && minutesNow <= CHECKIN_END; 
  const CHECKOUT_ALLOWED = minutesNow >= CHECKOUT_START && minutesNow <= CHECKOUT_END;
  const today = istNow.toISOString().split("T")[0];
  const formattedDate = istNow.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  // Convert minutes to Indian time format
  const formatIndianTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // ---------- API CALLS ----------
  const fetchAttendance = async () => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/attendance/history/${courseId}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (data.success) {
        const recordList = data.attendance || data.history || [];
        // Sort in descending order by date and time
        const sortedRecords = recordList.sort((a, b) => {
          const dateA = new Date(a.date + ' ' + (a.time || a.createdAt));
          const dateB = new Date(b.date + ' ' + (b.time || b.createdAt));
          return dateB - dateA;
        });
        setAttendance(sortedRecords);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
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
      const token = await getToken(); 
      
      if (!token) {
        toast.error("Authentication failed. Please reload.");
        return;
      }

      const { data } = await axios.post(
        `${backendUrl}/api/attendance/mark`,
        { courseId, session },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        // Custom success message with Indian time and date
        if (session === "LOGIN") {
          toast.success(`✅ Check-in successful! Time: ${currentTimeString} IST | Date: ${formattedDate}`);
        } else {
          toast.success(`✅ Check-out successful! Time: ${currentTimeString} IST | Date: ${formattedDate}`);
        }
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
  
  const alreadyCheckedIn = todayRecords.some((a) => a.session === "LOGIN");
  const alreadyCheckedOut = todayRecords.some((a) => a.session === "LOGOUT");
  
  const canCheckout = alreadyCheckedIn && !alreadyCheckedOut;
  const checkinWindowPassed = minutesNow > CHECKIN_END; 
  const presentDays = new Set(attendance.map(a => new Date(a.date).toISOString().split("T")[0])).size; 

  // ---------- BLINKING EFFECT ----------
  useEffect(() => {
    if (CHECKIN_ALLOWED && !alreadyCheckedIn) {
      const blinkInterval = setInterval(() => {
        setBlinkCheckin(prev => !prev);
      }, 1000);
      return () => clearInterval(blinkInterval);
    } else {
      setBlinkCheckin(false);
    }
  }, [CHECKIN_ALLOWED, alreadyCheckedIn]);

  useEffect(() => {
    if (CHECKOUT_ALLOWED && canCheckout) {
      const blinkInterval = setInterval(() => {
        setBlinkCheckout(prev => !prev);
      }, 1000);
      return () => clearInterval(blinkInterval);
    } else {
      setBlinkCheckout(false);
    }
  }, [CHECKOUT_ALLOWED, canCheckout]);

  let statusText = "Pending";
  let statusColor = "text-gray-300";
  let StatusIcon = AlertCircle;

  if (alreadyCheckedOut) {
    statusText = "Completed";
    statusColor = "text-green-300";
    StatusIcon = CheckCircle;
  } else if (alreadyCheckedIn) {
    statusText = "Half-Day / Active";
    statusColor = "text-blue-300";
    StatusIcon = Clock;
  } else if (checkinWindowPassed) {
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
                      {currentDateString}
                    </span>
                    <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      <Clock size={14} /> 
                      {currentTimeString} IST
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
                  {alreadyCheckedIn && !alreadyCheckedOut && (
                    <p className="text-[10px] text-blue-200 mt-1 italic">
                      * Complete checkout at 06:00 PM
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 2. ACTION CARDS - IMPROVED UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CHECK-IN CARD */}
              <div className={`relative overflow-hidden rounded-2xl shadow-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                alreadyCheckedIn 
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" 
                  : CHECKIN_ALLOWED && !alreadyCheckedIn
                    ? `bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 hover:border-blue-500 ${blinkCheckin ? 'animate-pulse shadow-blue-300' : ''}`
                    : "bg-gradient-to-br from-gray-100 to-slate-100 border-gray-300 opacity-70"
              }`}>
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${alreadyCheckedIn ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                        {alreadyCheckedIn ? <ShieldCheck size={28} /> : <ArrowRightToLine size={28} />}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Morning Check-In</h3>
                        <p className="text-sm text-gray-600">Mark your arrival</p>
                      </div>
                    </div>
                    {alreadyCheckedIn && (
                      <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-bold rounded-full flex items-center gap-2">
                        <CheckCircle size={16} /> CHECKED IN
                      </span>
                    )}
                  </div>

                  {/* Time Window */}
                  <div className="mb-6 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">Time Window</span>
                      <span className="text-sm text-gray-500">Indian Standard Time (IST)</span>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{formatIndianTime(CHECKIN_START)}</div>
                        <div className="text-xs text-gray-500">Start Time</div>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{formatIndianTime(CHECKIN_END)}</div>
                        <div className="text-xs text-gray-500">End Time</div>
                      </div>
                    </div>
                  </div>

                  {/* Current Time & Action Button */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          <Clock size={14} /> Current Time
                        </div>
                        <div className="text-2xl font-bold text-gray-800">
                          {currentTimeString} <span className="text-sm font-normal text-gray-600">IST</span>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                        CHECKIN_ALLOWED ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                      }`}>
                        {CHECKIN_ALLOWED ? "⚡ AVAILABLE" : "⏸️ CLOSED"}
                      </div>
                    </div>

                    <motion.button
                      disabled={!CHECKIN_ALLOWED || alreadyCheckedIn || marking || !courseId}
                      onClick={() => markAttendance("LOGIN")}
                      whileHover={(!CHECKIN_ALLOWED || alreadyCheckedIn) ? {} : { scale: 1.03 }}
                      whileTap={(!CHECKIN_ALLOWED || alreadyCheckedIn) ? {} : { scale: 0.98 }}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                        alreadyCheckedIn
                          ? "bg-green-100 text-green-800 cursor-default"
                          : CHECKIN_ALLOWED
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {marking ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : alreadyCheckedIn ? (
                        <>
                          <CheckCircle size={20} /> Already Checked In
                        </>
                      ) : CHECKIN_ALLOWED ? (
                        <>
                          <Fingerprint size={20} /> Click to Check-In
                        </>
                      ) : (
                        <>
                          <Clock size={20} /> Check-In Closed
                        </>
                      )}
                    </motion.button>

                    {CHECKIN_ALLOWED && !alreadyCheckedIn && (
                      <p className="text-center text-xs text-blue-600 mt-3 animate-pulse">
                        🎯 Click the button above to mark your attendance
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CHECK-OUT CARD */}
              <div className={`relative overflow-hidden rounded-2xl shadow-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                alreadyCheckedOut
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  : (CHECKOUT_ALLOWED && canCheckout)
                    ? `bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300 hover:border-indigo-500 ${blinkCheckout ? 'animate-pulse shadow-indigo-300' : ''}`
                    : "bg-gradient-to-br from-gray-100 to-slate-100 border-gray-300 opacity-70"
              }`}>
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${alreadyCheckedOut ? "bg-green-100 text-green-600" : "bg-indigo-100 text-indigo-600"}`}>
                        {alreadyCheckedOut ? <ShieldCheck size={28} /> : <ArrowLeftToLine size={28} />}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Evening Check-Out</h3>
                        <p className="text-sm text-gray-600">Mark your departure</p>
                      </div>
                    </div>
                    {alreadyCheckedOut && (
                      <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-bold rounded-full flex items-center gap-2">
                        <CheckCircle size={16} /> CHECKED OUT
                      </span>
                    )}
                  </div>

                  {/* Time Window */}
                  <div className="mb-6 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">Time Window</span>
                      <span className="text-sm text-gray-500">Indian Standard Time (IST)</span>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-indigo-600">{formatIndianTime(CHECKOUT_START)}</div>
                        <div className="text-xs text-gray-500">Start Time</div>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-indigo-600">{formatIndianTime(CHECKOUT_END)}</div>
                        <div className="text-xs text-gray-500">End Time</div>
                      </div>
                    </div>
                  </div>

                  {/* Current Time & Action Button */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          <Clock size={14} /> Current Time
                        </div>
                        <div className="text-2xl font-bold text-gray-800">
                          {currentTimeString} <span className="text-sm font-normal text-gray-600">IST</span>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                        CHECKOUT_ALLOWED ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                      }`}>
                        {CHECKOUT_ALLOWED ? "⚡ AVAILABLE" : "⏸️ CLOSED"}
                      </div>
                    </div>

                    <motion.button
                      disabled={!CHECKOUT_ALLOWED || !canCheckout || marking || !courseId}
                      onClick={() => markAttendance("LOGOUT")}
                      whileHover={(!CHECKOUT_ALLOWED || !canCheckout) ? {} : { scale: 1.03 }}
                      whileTap={(!CHECKOUT_ALLOWED || !canCheckout) ? {} : { scale: 0.98 }}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                        alreadyCheckedOut
                          ? "bg-green-100 text-green-800 cursor-default"
                          : (CHECKOUT_ALLOWED && canCheckout)
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {marking ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : alreadyCheckedOut ? (
                        <>
                          <CheckCircle size={20} /> Already Checked Out
                        </>
                      ) : (CHECKOUT_ALLOWED && canCheckout) ? (
                        <>
                          <Fingerprint size={20} /> Click to Check-Out
                        </>
                      ) : !alreadyCheckedIn ? (
                        <>
                          <ShieldAlert size={20} /> Check-In Required First
                        </>
                      ) : (
                        <>
                          <Clock size={20} /> Check-Out Closed
                        </>
                      )}
                    </motion.button>

                    {CHECKOUT_ALLOWED && canCheckout && (
                      <p className="text-center text-xs text-indigo-600 mt-3 animate-pulse">
                        🎯 Click the button above to complete your attendance
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SUMMARY & HISTORY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-blue-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-800">Attendance Analytics</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                      <span className="text-gray-700 font-medium">Total Present Days</span>
                      <span className="text-2xl font-bold text-blue-600">{presentDays}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <span className="text-gray-700 font-medium">Today's Progress</span>
                      <span className={`text-lg font-bold ${alreadyCheckedIn ? "text-blue-600" : "text-gray-600"}`}>
                        {alreadyCheckedOut ? "✅ Completed" : alreadyCheckedIn ? "🟡 Active" : "⚪ Pending"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <span className="text-gray-700 font-medium">Current Status</span>
                      <span className={`text-lg font-bold ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <History className="text-blue-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-800">Recent Attendance History</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-400 text-xs uppercase border-b border-gray-200">
                          <th className="pb-4 font-semibold">Date</th>
                          <th className="pb-4 font-semibold">Session</th>
                          <th className="pb-4 font-semibold">Time (IST)</th>
                          <th className="pb-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 divide-y divide-gray-100">
                        {attendance.length > 0 ? (
                          attendance.slice(0, 10).map((record, idx) => {
                            const recordDate = new Date(record.date);
                            const isToday = recordDate.toISOString().split("T")[0] === today;
                            const isActive = isToday && record.session === 'LOGIN' && !alreadyCheckedOut;

                            return (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 font-medium">
                                  <div className="flex flex-col">
                                    <span className="text-sm">
                                      {recordDate.toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short"
                                      })}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {recordDate.toLocaleDateString("en-IN", {
                                        weekday: 'short'
                                      })}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4">
                                  <span className={`px-3 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 ${
                                    record.session === 'LOGIN' 
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                                  }`}>
                                    {record.session === 'LOGIN' ? (
                                      <>
                                        <ArrowRightToLine size={12} /> CHECK-IN
                                      </>
                                    ) : (
                                      <>
                                        <ArrowLeftToLine size={12} /> CHECK-OUT
                                      </>
                                    )}
                                  </span>
                                </td>
                                <td className="py-4 font-semibold">
                                  <div className="flex flex-col">
                                    <span>
                                      {record.time || new Date(record.createdAt).toLocaleTimeString("en-IN", { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                    <span className="text-xs text-gray-400">IST</span>
                                  </div>
                                </td>
                                <td className="py-4">
                                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                                    isActive 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {isActive ? (
                                      <>
                                        <Clock size={12} /> Active
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle size={12} /> Completed
                                      </>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-10 text-center text-gray-400">
                              <div className="flex flex-col items-center gap-3">
                                <History className="text-gray-300" size={40} />
                                <p className="text-gray-500">No attendance records found</p>
                                <p className="text-sm text-gray-400">Your attendance history will appear here</p>
                              </div>
                            </td>
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