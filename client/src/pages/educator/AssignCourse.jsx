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
  const [projects, setProjects] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all students and educator's projects (Clerk-secured)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken(); // 🔐 Get Clerk token

        const [studentsRes, projectsRes] = await Promise.all([
          axios.get(`${backendUrl}/api/educator/all-students`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendUrl}/api/educator/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStudents(studentsRes.data.students || []);
        setProjects(projectsRes.data.projects || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [backendUrl, getToken]);

  // ✅ Assign project to student
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedProject) {
      toast.warning("Please select both student and project");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken(); // 🔐 Clerk token again

      const { data } = await axios.post(
        `${backendUrl}/api/educator/assign-project`,
        { studentId: selectedStudent, projectId: selectedProject },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Project assigned successfully");
        setSelectedStudent("");
        setSelectedProject("");
      } else {
        toast.error(data.message || "Failed to assign project");
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

        {/* Project Dropdown */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Select Projects
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">-- Choose Project --</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.projectTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Assign Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold py-3 rounded-lg shadow-md hover:from-cyan-500 hover:to-blue-600 transition-all disabled:opacity-50"
        >
          {loading ? "Assigning..." : "Assign Project"}
        </button>
      </motion.form>
    </motion.div>
  );
};

export default AssignCourse;
