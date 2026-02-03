import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import StudentLayout from "../../components/student/StudentLayout";
import { toast } from "react-toastify";
import { User, Mail, Target, TrendingUp, Edit2 } from "lucide-react";

const StudentInfo = () => {
  const { backendUrl, getToken, isTeamLeader } = useContext(AppContext);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editProgress, setEditProgress] = useState("");

  const fetchStudentInfo = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const res = await axios.get(`${backendUrl}/api/teams/student-info`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setStudents(res.data.students || []);
      } else {
        toast.error(res.data.message || "Failed to load student info");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load student info");
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (studentId, newProgress) => {
    try {
      const token = await getToken();

      const res = await axios.put(
        `${backendUrl}/api/teams/update-progress`,
        {
          studentId,
          progress: newProgress,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("Progress updated");
        fetchStudentInfo();
        setEditingStudent(null);
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleQuickUpdate = (studentId, change) => {
    const student = students.find(s => s.userId === studentId);
    if (student) {
      const newProgress = Math.max(0, Math.min(100, student.progress + change));
      updateProgress(studentId, newProgress);
    }
  };

  const handleEditSave = (studentId) => {
    const progress = parseInt(editProgress);
    if (!isNaN(progress) && progress >= 0 && progress <= 100) {
      updateProgress(studentId, progress);
    } else {
      toast.error("Please enter a valid number between 0 and 100");
    }
  };

  useEffect(() => {
    if (isTeamLeader) fetchStudentInfo();
  }, [isTeamLeader]);

  if (!isTeamLeader) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-red-500 text-2xl">!</div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Restricted</h2>
            <p className="text-gray-600">
              Only Team Leaders can access this page.
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const getProgressColor = (progress) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <StudentLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Progress</h1>
          <p className="text-gray-600">
            Monitor and update student progress after team meetings
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading students...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Students Found</h3>
            <p className="text-gray-600">There are no students in your team yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((s) => (
              <div
                key={s.userId}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    {s.email && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail size={12} />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Projects */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={14} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Projects</span>
                  </div>
                  {s.projects?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {s.projects.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-100"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No project assigned</p>
                  )}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                    </div>
                    <span className={`text-sm font-semibold ${getProgressColor(s.progress).replace('bg-', 'text-')}`}>
                      {s.progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(s.progress)} transition-all duration-300`}
                      style={{ width: `${s.progress}%` }}
                    ></div>
                  </div>

                  {/* Progress Controls */}
                  {editingStudent === s.userId ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editProgress}
                          onChange={(e) => setEditProgress(e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="Enter progress %"
                        />
                        <button
                          onClick={() => handleEditSave(s.userId)}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingStudent(null)}
                          className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          onClick={() => handleQuickUpdate(s.userId, -10)}
                          className="px-2 py-1.5 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100"
                        >
                          -10%
                        </button>
                        <button
                          onClick={() => handleQuickUpdate(s.userId, -5)}
                          className="px-2 py-1.5 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100"
                        >
                          -5%
                        </button>
                        <button
                          onClick={() => handleQuickUpdate(s.userId, 5)}
                          className="px-2 py-1.5 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100"
                        >
                          +5%
                        </button>
                        <button
                          onClick={() => handleQuickUpdate(s.userId, 10)}
                          className="px-2 py-1.5 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100"
                        >
                          +10%
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingStudent(s.userId);
                            setEditProgress(s.progress.toString());
                          }}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                        >
                          <Edit2 size={14} />
                          Edit Progress
                        </button>
                        <button
                          onClick={() => updateProgress(s.userId, 100)}
                          className="px-3 py-2 bg-blue-100 text-blue-600 text-sm rounded hover:bg-blue-200"
                        >
                          100%
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentInfo;