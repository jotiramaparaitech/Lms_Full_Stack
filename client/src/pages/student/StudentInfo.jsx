import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import StudentLayout from "../../components/student/StudentLayout";
import { toast } from "react-toastify";

const StudentInfo = () => {
  const { backendUrl, getToken, isTeamLeader } = useContext(AppContext);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

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
        toast.success("Progress updated ✅");
        fetchStudentInfo();
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const updateProjectName = async (studentId, projectName) => {
    try {
      const token = await getToken();

      const res = await axios.put(
        `${backendUrl}/api/teams/update-progress`,
        {
          studentId,
          projectName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("Project updated ✅");
        fetchStudentInfo();
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    if (isTeamLeader) fetchStudentInfo();
  }, [isTeamLeader]);

  if (!isTeamLeader) {
    return (
      <StudentLayout>
        <div className="p-6 text-center text-gray-600">
          ❌ Only Team Leader can access Student Info
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Info</h1>
          <p className="text-gray-600">
            Update student progress after team meeting review
          </p>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : students.length === 0 ? (
          <div className="text-gray-500">No students found in your team.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {students.map((s) => (
              <div
                key={s.userId}
                className="bg-white shadow rounded-xl p-5 border border-gray-200"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                    Student:{" "}
                    <span className="text-lg font-normal text-gray-700">
                      {s.name}
                    </span>
                  </h2>
                  
                  {s.email && (
                    <p className="text-xs text-gray-500 mt-1">{s.email}</p>
                  )}


                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-700">
                    Project Name
                  </label>
                  <input
                    type="text"
                    defaultValue={s.projectName || ""}
                    placeholder="Enter project name"
                    className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-400"
                    onBlur={(e) => updateProjectName(s.userId, e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    Progress: {s.progress}%
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-teal-400 h-3 rounded-full transition-all"
                      style={{ width: `${s.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() =>
                        updateProgress(s.userId, Math.max(0, s.progress - 5))
                      }
                      className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      -5%
                    </button>

                    <button
                      onClick={() =>
                        updateProgress(s.userId, Math.min(100, s.progress + 5))
                      }
                      className="px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      +5%
                    </button>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={s.progress}
                      className="ml-auto w-20 border rounded-lg px-2 py-1"
                      onBlur={(e) => {
                        const value = Number(e.target.value);
                        if (!isNaN(value)) updateProgress(s.userId, value);
                      }}
                    />
                  </div>
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
