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
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // -----------------------------
  // Fetch Data
  // -----------------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const [studentsRes, coursesRes] = await Promise.all([
        axios.get(`${backendUrl}/api/educator/all-students`, {
            headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backendUrl}/api/educator/courses`, {
            headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (studentsRes.data.success) {
        setStudents(studentsRes.data.students);
      } else {
        toast.error(studentsRes.data.message);
      }
      
      if (coursesRes.data.success) {
          setCourses(coursesRes.data.courses);
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
        // Optimistic update
        const updatedStudents = students.map(s => 
            s._id === selectedStudentId ? { ...s, isTeamLeader: true } : s
        );
        setStudents(updatedStudents);

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
            toast.success(data.message);
            // Reset selection
            setSelectedStudentId("");
            setSelectedCourseId("");
        } else {
            toast.error(data.message);
            // Revert on failure (reload data)
            fetchData();
        }
    } catch (error) {
        toast.error(error.message);
        fetchData();
    } finally {
        setAssignLoading(false);
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
        className="w-full max-w-lg"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            ⚡ Assign Team Leader
        </h1>

        <form 
            onSubmit={handleAssign}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 space-y-6"
        >
            
            {/* Searchable Student Dropdown */}
            <SearchableDropdown 
                label="Select Student"
                options={students}
                selectedId={selectedStudentId}
                onSelect={setSelectedStudentId}
                placeholder="-- Choose Student --"
            />

            {/* Project Dropdown (Standard) */}
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
                {assignLoading ? "Processing..." : "Make Team Leader"}
            </button>

        </form>
      </motion.div>
    </motion.div>
  );
};

// ----------------------------------------------------
// Custom Searchable Dropdown Component
// ----------------------------------------------------
const SearchableDropdown = ({ label, options, selectedId, onSelect, placeholder }) => {
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
    
    // Filter options
    const filteredOptions = options.filter(o => 
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                            onClick={(e) => e.stopPropagation()} // Prevent closing
                        />
                    </div>
                    
                    {/* List Items */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt._id}
                                    className={`px-4 py-3 cursor-pointer text-sm transition-colors flex items-center justify-between
                                        ${opt._id === selectedId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                                    `}
                                    onClick={() => {
                                        onSelect(opt._id);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                >
                                    <span>{opt.name}</span>
                                    {opt.isTeamLeader && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Current TL</span>}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-gray-500 text-sm text-center italic">No students found</div>
                        )}
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
      </div>
    )
  }

export default AssignTeamLeader;
