import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { useAuth } from "@clerk/clerk-react";

const AssignCourse = () => {
  const { backendUrl } = useContext(AppContext);
  const { getToken } = useAuth(); // ✅ Clerk Auth
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teams, setTeams] = useState([]); // ✅ NEW: Teams state
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(""); // ✅ NEW: Selected Team
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all students and educator's courses (Clerk-secured)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken(); // 🔐 Get Clerk token

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
        setTeams(teamsRes.data.teams || []); // ✅ Set Teams
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [backendUrl, getToken]);

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
      const token = await getToken(); // 🔐 Clerk token again

      const requests = [];

      // 1. Assign Course (Project)
      if (selectedCourse) {
        requests.push(
          axios.post(
            `${backendUrl}/api/educator/assign-course`,
            { studentId: selectedStudent, courseId: selectedCourse },
            { headers: { Authorization: `Bearer ${token}` } }
          ).then(res => ({ type: 'course', ...res.data }))
        );
      }

      // 2. Assign Team
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
        {/* Student Dropdown */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Select Student
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">-- Choose Student --</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        {/* Course Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Course Dropdown */}
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

            {/* Team Dropdown */}
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

        {/* Assign Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold py-3 rounded-lg shadow-md hover:from-cyan-500 hover:to-blue-600 transition-all disabled:opacity-50"
        >
          {loading ? "Assigning..." : "Assign Selected"}
        </button>
      </motion.form>
    </motion.div>
  );
};

export default AssignCourse;
