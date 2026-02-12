import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, ChevronDown, ChevronUp } from "lucide-react";

const TeamLeaders = () => {
  const { backendUrl, getToken, isEducator } = useContext(AppContext);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLeader, setExpandedLeader] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  // -----------------------------
  // Fetch Team Leaders
  // -----------------------------
  const fetchTeamLeaders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/educator/team-leaders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setTeamLeaders(data.teamLeaders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Remove Team Leader Completely
  // -----------------------------
  const removeTeamLeader = async (studentId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to remove this user from Team Leaders? This will remove ALL their assigned projects."
      );
      if (!confirm) return;

      setRemoveLoading(true);
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/educator/assign-team-leader`,
        { userId: studentId, isTeamLeader: false },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Team Leader removed successfully");
        setTeamLeaders((prev) => prev.filter((leader) => leader._id !== studentId));
        if (expandedLeader === studentId) {
          setExpandedLeader(null);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRemoveLoading(false);
    }
  };

  // -----------------------------
  // Remove Single Project from Team Leader
  // -----------------------------
  const removeProject = async (leaderId, projectId, projectTitle) => {
    try {
      const confirm = window.confirm(
        `Are you sure you want to remove "${projectTitle}" from this team leader?`
      );
      if (!confirm) return;

      setRemoveLoading(true);
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/educator/remove-team-leader-project`,
        { userId: leaderId, courseId: projectId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Project removed from team leader");
        
        // Update local state
        setTeamLeaders((prev) => 
          prev.map((leader) => {
            if (leader._id === leaderId) {
              const updatedProjects = leader.assignedProjects?.filter(
                (p) => p._id !== projectId
              ) || [];
              
              // If no projects left, remove from list
              if (updatedProjects.length === 0 && !data.isTeamLeader) {
                return null; // Will be filtered out
              }
              
              return {
                ...leader,
                assignedProjects: updatedProjects,
                isTeamLeader: data.isTeamLeader
              };
            }
            return leader;
          }).filter(Boolean) // Remove null entries
        );
        
        if (data.assignedProjects?.length === 0) {
          setExpandedLeader(null);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRemoveLoading(false);
    }
  };

  const toggleExpand = (leaderId) => {
    setExpandedLeader(expandedLeader === leaderId ? null : leaderId);
  };

  useEffect(() => {
    if (isEducator) fetchTeamLeaders();
  }, [isEducator]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col items-center md:p-12 p-6 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-50px] w-72 h-72 bg-blue-300/30 blur-3xl rounded-full animate-pulse -z-10"></div>
      <div className="absolute bottom-[-120px] right-[-50px] w-96 h-96 bg-cyan-400/30 blur-3xl rounded-full animate-pulse -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white/80 border border-gray-200 shadow-[0_10px_40px_rgba(56,189,248,0.25)]"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Team Leaders</h2>
          <p className="text-gray-500 text-sm mt-1">
            List of all active Team Leaders and their assigned projects.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Total: {teamLeaders.length} Team Leader{teamLeaders.length !== 1 ? 's' : ''} • 
            {teamLeaders.reduce((acc, l) => acc + (l.assignedProjects?.length || 0), 0)} Total Projects
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {teamLeaders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No Team Leaders found.
            </div>
          ) : (
            teamLeaders.map((leader, index) => (
              <motion.div
                key={leader._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-blue-50/30 transition-colors"
              >
                {/* Main Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-gray-500 font-medium w-8">{index + 1}</span>
                    <img
                      src={leader.imageUrl || "/default-avatar.png"}
                      alt={leader.name}
                      className="w-12 h-12 rounded-full shadow-sm object-cover border-2 border-white"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{leader.name}</h3>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Team Leader
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{leader.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Projects Count Badge */}
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        {leader.assignedProjects?.length || 0} Project{(leader.assignedProjects?.length || 0) !== 1 ? 's' : ''}
                      </div>
                      {(leader.assignedProjects?.length || 0) > 0 && (
                        <button
                          onClick={() => toggleExpand(leader._id)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          {expandedLeader === leader._id ? (
                            <>Hide <ChevronUp size={14} /></>
                          ) : (
                            <>View <ChevronDown size={14} /></>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Remove All Access Button */}
                    <button
                      onClick={() => removeTeamLeader(leader._id)}
                      disabled={removeLoading}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove All
                    </button>
                  </div>
                </div>

                {/* Expanded Projects List */}
                <AnimatePresence>
                  {expandedLeader === leader._id && leader.assignedProjects?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 ml-12 pl-8 border-l-2 border-blue-200 space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                          <BookOpen size={16} />
                          Assigned Projects
                        </h4>
                        
                        {leader.assignedProjects.map((project) => (
                          <motion.div
                            key={project._id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {project.courseTitle}
                              </p>
                              {project.customDomain && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Domain: {project.customDomain}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeProject(leader._id, project._id, project.courseTitle)}
                              disabled={removeLoading}
                              className="ml-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                              title="Remove this project"
                            >
                              <X size={16} />
                            </button>
                          </motion.div>
                        ))}
                        
                        <p className="text-xs text-gray-400 mt-3 italic">
                          Total: {leader.assignedProjects.length} project{leader.assignedProjects.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TeamLeaders;