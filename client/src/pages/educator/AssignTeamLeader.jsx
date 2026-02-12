import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import { motion, AnimatePresence } from "framer-motion";

const AssignTeamLeader = () => {
  const { backendUrl, getToken, isEducator } = useContext(AppContext);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  // -----------------------------
  // Fetch Data
  // -----------------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const [studentsRes, coursesRes, teamLeadersRes] = await Promise.all([
        axios.get(`${backendUrl}/api/educator/all-students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backendUrl}/api/educator/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backendUrl}/api/educator/team-leaders`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (studentsRes.data.success) {
        setStudents(studentsRes.data.students);
      }
      
      if (coursesRes.data.success) {
        setCourses(coursesRes.data.courses);
      }

      if (teamLeadersRes.data.success) {
        setTeamLeaders(teamLeadersRes.data.teamLeaders);
      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEducator) fetchData();
  }, [isEducator]);

  // -----------------------------
  // Assign Handler
  // -----------------------------
  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedStudentId) {
      toast.warning("Please select a student");
      return;
    }
    if (!selectedCourseId) {
      toast.warning("Please select a project domain");
      return;
    }

    try {
      setAssignLoading(true);
      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/educator/assign-team-leader`,
        { 
          userId: selectedStudentId, 
          isTeamLeader: true, 
          courseId: selectedCourseId 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(`Team Leader assigned to project successfully`);
        // Refresh all data
        fetchData();
        // Reset selection
        setSelectedStudentId("");
        setSelectedCourseId("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAssignLoading(false);
    }
  };

  // -----------------------------
  // Remove Project from Team Leader
  // -----------------------------
  const handleRemoveProject = async (userId, courseId, courseTitle) => {
    if (!window.confirm(`Remove this project from team leader?`)) {
      return;
    }

    try {
      setRemoveLoading(true);
      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/educator/remove-team-leader-project`,
        { userId, courseId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Project removed from team leader");
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRemoveLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center md:p-12 p-6 bg-gradient-to-br from-cyan-50 via-sky-100 to-blue-50 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          ⚡ Assign Team Leaders
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Assignment Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Assign New Team Leader
            </h2>
            
            <form onSubmit={handleAssign} className="space-y-6">
              {/* Searchable Student Dropdown */}
              <SearchableDropdown 
                label="Select Student"
                options={students}
                selectedId={selectedStudentId}
                onSelect={setSelectedStudentId}
                placeholder="-- Choose Student --"
                teamLeaders={teamLeaders}
              />

              {/* Project Dropdown */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Project Domain
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  <option value="">-- Choose Project --</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseTitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={assignLoading}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold py-3 rounded-lg shadow-md hover:from-cyan-500 hover:to-blue-600 transition-all disabled:opacity-50"
              >
                {assignLoading ? "Processing..." : "Add Project to Team Leader"}
              </button>
            </form>
          </div>

          {/* Right Column - Current Team Leaders List */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Current Team Leaders
            </h2>
            
            {teamLeaders.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {teamLeaders.map((leader) => (
                  <div key={leader._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{leader.name}</div>
                        <div className="text-sm text-gray-500">{leader.email}</div>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Team Leader
                      </span>
                    </div>
                    
                    {/* Assigned Projects List */}
                    {leader.assignedProjects && leader.assignedProjects.length > 0 ? (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Assigned Projects ({leader.assignedProjects.length})
                        </p>
                        <div className="space-y-2">
                          {leader.assignedProjects.map((project) => (
                            <div key={project._id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                              <span className="text-sm text-gray-700">{project.courseTitle}</span>
                              <button
                                onClick={() => handleRemoveProject(leader._id, project._id, project.courseTitle)}
                                disabled={removeLoading}
                                className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-2 italic">No projects assigned</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No team leaders assigned yet
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ----------------------------------------------------
// Custom Searchable Dropdown Component
// ----------------------------------------------------
const SearchableDropdown = ({ label, options, selectedId, onSelect, placeholder, teamLeaders }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o._id === selectedId);
  
  // Create a map of team leaders for quick lookup
  const teamLeaderMap = teamLeaders.reduce((acc, leader) => {
    acc[leader._id] = leader;
    return acc;
  }, {});

  // Filter options
  const filteredOptions = options.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.email && o.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-gray-700 font-semibold mb-2">
        {label}
      </label>
      
      {/* Trigger Button */}
      <div 
        className={`w-full border ${isOpen ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg p-3 text-gray-700 bg-white cursor-pointer flex justify-between items-center transition-all`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-2 shadow-xl flex flex-col overflow-hidden"
          >
            {/* Search Input Sticky Header */}
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* List Items */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => {
                  const isTeamLeader = teamLeaderMap[opt._id];
                  return (
                    <div 
                      key={opt._id}
                      className={`px-4 py-3 cursor-pointer text-sm transition-colors
                        ${opt._id === selectedId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                      `}
                      onClick={() => {
                        onSelect(opt._id);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                    >
                      <div className="font-medium text-gray-800">{opt.name}</div>
                      {opt.email && (
                        <div className="text-xs text-gray-500 truncate">{opt.email}</div>
                      )}
                      {isTeamLeader && (
                        <div className="mt-1">
                          <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Current Team Leader ({isTeamLeader.assignedProjects?.length || 0} projects)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-gray-500 text-sm text-center italic">No students found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignTeamLeader;