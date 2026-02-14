import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import StudentLayout from "../../components/student/StudentLayout";
import { toast } from "react-toastify";
import { 
  User, Mail, Target, TrendingUp, Edit2, Lock, Unlock, Users,
  ClipboardList, ChevronDown, ChevronUp, Calendar 
} from "lucide-react";

const StudentInfo = () => {
  const { backendUrl, getToken, isTeamLeader } = useContext(AppContext);

  const [students, setStudents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("all");
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editProgress, setEditProgress] = useState("");

  // NEW STATES FOR TESTS
  const [studentTests, setStudentTests] = useState({});
  const [loadingTests, setLoadingTests] = useState({});
  const [expandedTests, setExpandedTests] = useState({});

  // FETCH STUDENT TESTS
  const fetchStudentTests = async (studentId) => {
    try {
      setLoadingTests(prev => ({ ...prev, [studentId]: true }));
      const token = await getToken();

      const res = await axios.get(
        `${backendUrl}/api/assessment/student/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Sort tests by date (oldest first) to show Test 1, Test 2 in order
        const sortedTests = (res.data.tests || []).sort((a, b) => {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        });
        
        setStudentTests(prev => ({
          ...prev,
          [studentId]: sortedTests
        }));
      } else {
        toast.error("Failed to load tests");
      }
    } catch (error) {
      toast.error("Unable to fetch student tests");
    } finally {
      setLoadingTests(prev => ({ ...prev, [studentId]: false }));
    }
  };

  // TOGGLE TEST EXPANSION
  const toggleTestExpansion = (studentId) => {
    setExpandedTests(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
    
    // Fetch tests if not already loaded and expanding
    if (!expandedTests[studentId] && !studentTests[studentId]) {
      fetchStudentTests(studentId);
    }
  };

  const fetchStudentInfo = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const token = await getToken();

      const res = await axios.get(`${backendUrl}/api/teams/student-info`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setStudents(res.data.students || []);
        setTeams(res.data.teams || []);
      } else {
        toast.error(res.data.message || "Failed to load student info");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setStudents([]);
        setTeams([]);
        toast.info("You are a Team Leader but no teams are assigned yet.");
      } else {
        toast.error(error.response?.data?.message || "Failed to load student info");
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const updateProgress = async (studentId, newProgress, teamId = null) => {
    // Optimistic Update
    const previousStudents = [...students];
    
    if (teamId) {
      // Update for specific team
      setStudents((prev) =>
        prev.map((s) => {
          if (s.userId === studentId) {
            const updatedTeams = s.teams.map(t => 
              t.teamId === teamId 
                ? { ...t, progress: typeof newProgress === 'number' ? newProgress : t.progress, lorUnlocked: typeof newProgress === 'object' ? newProgress.lorUnlocked ?? t.lorUnlocked : t.lorUnlocked }
                : t
            );
            // Update overall progress to max of all teams
            const maxProgress = Math.max(...updatedTeams.map(t => t.progress));
            return { 
              ...s, 
              teams: updatedTeams,
              progress: maxProgress,
              lorUnlocked: updatedTeams.some(t => t.lorUnlocked)
            };
          }
          return s;
        })
      );
    } else {
      // Legacy update (no team specified)
      setStudents((prev) =>
        prev.map((s) => {
          if (s.userId === studentId) {
            if (typeof newProgress === "number") return { ...s, progress: newProgress };
            if (typeof newProgress === "object") return { ...s, ...newProgress };
          }
          return s;
        })
      );
    }

    try {
      const token = await getToken();

      const payload = {
        studentId,
        ...(typeof newProgress === "number" && { progress: newProgress }),
        ...(typeof newProgress === "object" ? newProgress : {}),
      };
      
      if (teamId) {
        payload.teamId = teamId;
      }

      const res = await axios.put(
        `${backendUrl}/api/teams/update-progress`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Updated successfully");
        fetchStudentInfo(true);
        setEditingStudent(null);
      } else {
        setStudents(previousStudents);
        toast.error(res.data.message || "Update failed");
      }
    } catch (error) {
      setStudents(previousStudents);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleQuickUpdate = (studentId, change, teamId = null) => {
    const student = students.find(s => s.userId === studentId);
    if (student) {
      const newProgress = Math.max(0, Math.min(100, student.progress + change));
      updateProgress(studentId, newProgress, teamId);
    }
  };

  const handleEditSave = (studentId, teamId = null) => {
    const progress = parseInt(editProgress);
    if (!isNaN(progress) && progress >= 0 && progress <= 100) {
      updateProgress(studentId, progress, teamId);
    } else {
      toast.error("Please enter a valid number between 0 and 100");
    }
  };

  const handleLorToggle = (studentId, currentStatus, teamId) => {
    updateProgress(studentId, { lorUnlocked: !currentStatus }, teamId);
  };

  useEffect(() => {
    if (isTeamLeader) fetchStudentInfo();
  }, [isTeamLeader]);

  // Filter students based on selected team
  const filteredStudents = selectedTeamId === "all" 
    ? students 
    : students.filter(s => s.teams?.some(t => t.teamId === selectedTeamId));

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
            Monitor and update student progress across all your teams
          </p>
        </div>

        {/* Team Filter */}
        {teams.length > 1 && (
          <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Team:</span>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Teams ({students.length} students)</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading students...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              {selectedTeamId === "all" 
                ? "There are no students in your teams yet."
                : "No students in this team."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((s) => (
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

                {/* Team Badges */}
                {s.teams && s.teams.length > 1 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {s.teams.map((team, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          team.teamId === selectedTeamId || selectedTeamId === "all"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {team.teamName}
                      </span>
                    ))}
                  </div>
                )}

                {/* Projects */}
                <div className="mb-4">
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

                {/* ================= TEST SECTION WITH DROPDOWN ================= */}
                <div className="mb-4 border border-indigo-100 rounded-lg overflow-hidden">
                  {/* Test Header - Clickable */}
                  <div 
                    onClick={() => toggleTestExpansion(s.userId)}
                    className="flex items-center justify-between p-3 bg-indigo-50 cursor-pointer hover:bg-indigo-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-indigo-700 font-medium">
                      <ClipboardList size={16} />
                      <span className="text-sm">Tests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {studentTests[s.userId] && (
                        <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">
                          {studentTests[s.userId].length}
                        </span>
                      )}
                      {expandedTests[s.userId] ? (
                        <ChevronUp size={16} className="text-indigo-600" />
                      ) : (
                        <ChevronDown size={16} className="text-indigo-600" />
                      )}
                    </div>
                  </div>

                  {/* Test Content - Expandable */}
                  {expandedTests[s.userId] && (
                    <div className="p-3 bg-white border-t border-indigo-100">
                      {loadingTests[s.userId] ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
                          <span className="ml-2 text-xs text-gray-500">Loading tests...</span>
                        </div>
                      ) : studentTests[s.userId]?.length > 0 ? (
                        <div className="space-y-3">
                          <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                            <Calendar size={12} />
                            <span>Tests shown in order taken (Test 1 = first test)</span>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50 text-gray-600 sticky top-0">
                                <tr>
                                  <th className="px-2 py-1.5 text-left font-medium">#</th>
                                  <th className="px-2 py-1.5 text-left font-medium">Score</th>
                                  <th className="px-2 py-1.5 text-left font-medium">Percentage</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {studentTests[s.userId].map((test, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-2 py-1.5 font-medium text-gray-700">
                                      Test {idx + 1}
                                    </td>
                                    <td className="px-2 py-1.5">
                                      {test.score}/{test.totalQuestions}
                                    </td>
                                    <td className="px-2 py-1.5">
                                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                        test.percentage >= 70 ? 'bg-green-100 text-green-700' :
                                        test.percentage >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {test.percentage}%
                                      </span>
                                    </td>
                                  
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          {/* Test Summary */}
                          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-xs">
                            <span className="text-gray-600">
                              Average: {
                                (studentTests[s.userId].reduce((acc, test) => acc + test.percentage, 0) / 
                                studentTests[s.userId].length).toFixed(1)
                              }%
                            </span>
                            <span className="text-gray-600">
                              Best: {Math.max(...studentTests[s.userId].map(t => t.percentage))}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-3">
                          No tests available
                        </p>
                      )}
                      
                      {/* Refresh button */}
                      {studentTests[s.userId] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchStudentTests(s.userId);
                          }}
                          className="mt-2 w-full text-xs text-indigo-600 hover:text-indigo-800 py-1 border-t border-indigo-100"
                        >
                          Refresh tests
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress & LOR */}
                <div>
                  {/* LOR Toggle */}
                  <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      {s.lorUnlocked ? (
                        <Unlock size={16} className="text-green-600" />
                      ) : (
                        <Lock size={16} className="text-amber-500" />
                      )}
                      <span className="text-sm font-medium text-gray-700">LOR Access</span>
                    </div>
                    <button
                      onClick={() => {
                        // If viewing all teams, update the first team
                        const teamId = selectedTeamId === "all" && s.teams?.length > 0 
                          ? s.teams[0].teamId 
                          : selectedTeamId;
                        handleLorToggle(s.userId, s.lorUnlocked, teamId);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        s.lorUnlocked ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`${
                          s.lorUnlocked ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </button>
                  </div>

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
                          onClick={() => {
                            const teamId = selectedTeamId === "all" && s.teams?.length > 0 
                              ? s.teams[0].teamId 
                              : selectedTeamId;
                            handleEditSave(s.userId, teamId);
                          }}
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
                          onClick={() => {
                            const teamId = selectedTeamId === "all" && s.teams?.length > 0 
                              ? s.teams[0].teamId 
                              : selectedTeamId;
                            handleQuickUpdate(s.userId, -10, teamId);
                          }}
                          className="px-2 py-1.5 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100"
                        >
                          -10%
                        </button>
                        <button
                          onClick={() => {
                            const teamId = selectedTeamId === "all" && s.teams?.length > 0 
                              ? s.teams[0].teamId 
                              : selectedTeamId;
                            handleQuickUpdate(s.userId, -5, teamId);
                          }}
                          className="px-2 py-1.5 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100"
                        >
                          -5%
                        </button>
                        <button
                          onClick={() => {
                            const teamId = selectedTeamId === "all" && s.teams?.length > 0 
                              ? s.teams[0].teamId 
                              : selectedTeamId;
                            handleQuickUpdate(s.userId, 5, teamId);
                          }}
                          className="px-2 py-1.5 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100"
                        >
                          +5%
                        </button>
                        <button
                          onClick={() => {
                            const teamId = selectedTeamId === "all" && s.teams?.length > 0 
                              ? s.teams[0].teamId 
                              : selectedTeamId;
                            handleQuickUpdate(s.userId, 10, teamId);
                          }}
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
                          onClick={() => {
                            const teamId = selectedTeamId === "all" && s.teams?.length > 0 
                              ? s.teams[0].teamId 
                              : selectedTeamId;
                            updateProgress(s.userId, 100, teamId);
                          }}
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