import React, { useContext, useEffect } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import { AppContext } from "../../context/AppContext";

const Progress = () => {
  const { teamProgress, teamProjectName, fetchMyTeamProgress } =
    useContext(AppContext);

  // ✅ Fetch latest progress when page opens
  useEffect(() => {
    fetchMyTeamProgress();
  }, []);

  const progressValue = Math.min(100, Math.max(0, Number(teamProgress || 0)));

  return (
    <StudentLayout>
      <h1 className="text-2xl font-bold mb-6">Progress</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <p className="font-semibold text-gray-800">Overall Project Progress</p>

        {/* ✅ Project Name */}
        {teamProjectName && (
          <p className="text-sm text-gray-500 mt-1">
            Project: <span className="font-medium">{teamProjectName}</span>
          </p>
        )}

        {/* ✅ Progress Bar */}
        <div className="w-full bg-gray-200 h-3 rounded mt-3 overflow-hidden">
          <div
            className="bg-cyan-600 h-3 rounded transition-all duration-500"
            style={{ width: `${progressValue}%` }}
          />
        </div>

        {/* ✅ Progress Text */}
        <p className="text-sm text-gray-500 mt-2">
          {progressValue}% Completed
        </p>
      </div>
    </StudentLayout>
  );
};

export default Progress;
