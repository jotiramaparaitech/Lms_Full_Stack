import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { useAuth } from "@clerk/clerk-react";

const AssignCourse = () => {
  const { backendUrl } = useContext(AppContext);
  const { getToken } = useAuth();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Filter students whose names START WITH search term (case-insensitive)
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch all students and educator's courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();

        const [studentsRes, coursesRes, teamsRes] = await Promise.all([
          axios.get(`${backendUrl}/api/educator/all-students`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendUrl}/api/educator/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendUrl}/api/teams/list`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStudents(studentsRes.data.students || []);
        setCourses(coursesRes.data.courses || []);
        setTeams(teamsRes.data.teams || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [backendUrl, getToken]);

  // ✅ Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Only clear selected student if search term doesn't match
    if (!selectedStudent || !value.startsWith(searchTerm)) {
      setSelectedStudent("");
    }
    
    if (value.trim() === "") {
      setShowDropdown(false);
    } else {
      setShowDropdown(true);
    }
  };

  // ✅ Handle student selection
  const handleSelectStudent = (studentId, studentName) => {
    setSelectedStudent(studentId);
    setSearchTerm(studentName); // Show the selected name in search box
    setShowDropdown(false);
  };

  // ✅ Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedStudent("");
    setShowDropdown(false);
  };

  // ✅ Assign course/team to student
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.warning("Please select a student");
      return;
    }
    if (!selectedCourse && !selectedTeam) {
      toast.warning("Please select at least a Project or a Team");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      const requests = [];

      if (selectedCourse) {
        requests.push(
          axios.post(
            `${backendUrl}/api/educator/assign-course`,
            { studentId: selectedStudent, courseId: selectedCourse },
            { headers: { Authorization: `Bearer ${token}` } }
          ).then(res => ({ type: 'course', ...res.data }))
        );
      }

      if (selectedTeam) {
        requests.push(
          axios.post(
            `${backendUrl}/api/educator/assign-to-team`,
            { studentId: selectedStudent, teamId: selectedTeam },
            { headers: { Authorization: `Bearer ${token}` } }
          ).then(res => ({ type: 'team', ...res.data }))
        );
      }

      const results = await Promise.allSettled(requests);
      
      let successCount = 0;
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
            const data = result.value;
            if(data.success) {
                successCount++;
                toast.success(data.message);
            } else {
                toast.warning(data.message || `Failed to assign ${data.type}`);
            }
        } else {
             console.error("Assignment failed", result.reason);
             toast.error(result.reason?.response?.data?.message || "Assignment failed");
        }
      });

      if (successCount > 0) {
        setSelectedStudent("");
        setSelectedCourse("");
        setSelectedTeam("");
        setSearchTerm("");
      }

    } catch (error) {
      console.error(error);
      toast.error("Server error while assigning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="p-8 min-h-screen bg-gradient-to-br from-cyan-50 via-sky-100 to-blue-50"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        🎓 Assign Projects to Student
      </h1>

      <motion.form
        onSubmit={handleAssign}
        className="bg-white p-8 rounded-2xl shadow-lg max-w-lg mx-auto space-y-6 border border-gray-200"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Student Search with Dropdown */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-gray-700 font-semibold mb-2">
            Select Student
          </label>
          
          {/* 🔍 Search Input with Clear Button */}
          <div className="relative">
            <input
              type="text"
              placeholder="Type student name (starts with)..."
              className="w-full border border-gray-300 rounded-lg p-3 pl-10 pr-10 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchTerm.trim() && filteredStudents.length > 0) {
                  setShowDropdown(true);
                }
              }}
            />
            {/* Search Icon */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            
            {/* Clear Button (X) */}
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown Results */}
          {showDropdown && filteredStudents.length > 0 && (
            <motion.div 
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b">
                Showing students starting with "{searchTerm}"
              </div>
              {filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedStudent === student._id ? "bg-blue-100" : ""
                  }`}
                  onClick={() => handleSelectStudent(student._id, student.name)}
                >
                  <div className="font-medium text-gray-800">{student.name}</div>
                  {student.email && (
                    <div className="text-sm text-gray-500 truncate">{student.email}</div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* No Results Message */}
          {showDropdown && searchTerm.trim() && filteredStudents.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
              No students found starting with "{searchTerm}"
            </div>
          )}

          {/* Selected Student Info */}
          {selectedStudent && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-700">
                Selected: <span className="font-semibold">{searchTerm}</span>
              </div>
            </div>
          )}
        </div>

        {/* Project and Team Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Select Project (Optional)
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Choose Project --</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Select Team (Optional)
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="">-- Choose Team --</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedStudent}
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold py-3 rounded-lg shadow-md hover:from-cyan-500 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Assigning..." : "Assign Selected"}
        </button>
      </motion.form>
    </motion.div>
  );
};

export default AssignCourse;