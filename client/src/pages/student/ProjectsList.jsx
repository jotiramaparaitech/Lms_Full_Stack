import React, { useContext, useEffect, useState } from "react";
import Footer from "../../components/student/Footer";
import { assets } from "../../assets/assets";
import ProjectCard from "../../components/student/ProjectCard";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import SearchBar from "../../components/student/SearchBar";
import { motion } from "framer-motion";

const ProjectsList = () => {
  const { input } = useParams();
  const { allProjects, navigate } = useContext(AppContext);

  const [filteredProject, setFilteredProject] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("All");

  // ✅ Extract unique domains
  const uniqueDomains = Array.from(
    new Set(allProjects?.map((project) => project.customDomain))
  );

  // ✅ Filter projects
  useEffect(() => {
    if (allProjects?.length > 0) {
      let tempProjects = [...allProjects];

      if (input) {
        tempProjects = tempProjects.filter((item) =>
          item.projectTitle.toLowerCase().includes(input.toLowerCase())
        );
      }

      if (selectedDomain !== "All") {
        tempProjects = tempProjects.filter(
          (item) => item.customDomain === selectedDomain
        );
      }

      setFilteredProject(tempProjects);
    }
  }, [allProjects, input, selectedDomain]);

  // ✅ Group by domain
  const groupedByDomain = filteredProject.reduce((acc, project) => {
    if (!acc[project.customDomain]) acc[project.customDomain] = [];
    acc[project.customDomain].push(project);
    return acc;
  }, {});

  // Refined card animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.98,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        mass: 1,
        duration: 0.6
      }
    }
  };

  // Hover animation variant
  const hoverVariants = {
    rest: {
      scale: 1,
      y: 0,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
    },
    hover: {
      scale: 1.03,
      y: -6,
      boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  // Container animation for staggered cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  // Domain header animation
  const domainHeaderVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      x: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.5
      }
    }
  };

  return (
    <>
      {/* 🌈 Background Wrapper */}
      <div className="relative min-h-screen pt-20 overflow-hidden bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50">
        {/* Background orbs */}
        <div className="absolute top-[-150px] left-[-80px] w-[300px] h-[300px] bg-blue-400/20 blur-3xl rounded-full animate-pulse -z-10"></div>
        <div className="absolute bottom-[-150px] right-[-80px] w-[350px] h-[350px] bg-cyan-400/30 blur-3xl rounded-full animate-pulse -z-10"></div>

        {/* ✅ Centered Content Container */}
        <div className="max-w-7xl mx-auto md:px-10 px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex md:flex-row flex-col gap-6 items-start justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Project List
              </h1>
              <p className="text-gray-600 mt-2">
                <span
                  onClick={() => navigate("/")}
                  className="text-blue-600 font-medium cursor-pointer hover:underline"
                >
                  Home
                </span>{" "}
                / Project List
              </p>
            </div>
            <SearchBar data={input} />
          </motion.div>

          {/* 🆕 Modern Domain Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 mt-10 p-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                <svg 
                  className="w-5 h-5 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
                  />
                </svg>
              </div>
              <label className="text-gray-700 font-medium text-sm sm:text-base">
                Filter Projects by Domain
              </label>
            </div>
            
            <div className="relative flex-1 max-w-md">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 bg-white/90 shadow-sm 
                         focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none 
                         text-gray-700 font-medium text-sm sm:text-base
                         appearance-none cursor-pointer
                         transition-all duration-200 hover:border-blue-300"
              >
                <option value="All" className="py-2">🌐 All Domains</option>
                {uniqueDomains.map((domain, index) => (
                  <option key={index} value={domain} className="py-2">
                    {domain}
                  </option>
                ))}
              </select>
              
              {/* Custom dropdown arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg 
                  className="w-5 h-5 text-blue-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </div>
              
              {/* Filter icon inside select */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg 
                  className="w-5 h-5 text-blue-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
                  />
                </svg>
              </div>
            </div>
            
            {/* Active filter indicator */}
            {selectedDomain !== "All" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-full"
              >
                <span className="w-2 h-2 bg-white rounded-full"></span>
                Active: {selectedDomain}
              </motion.div>
            )}
          </motion.div>

          {/* Active Search Tag */}
          {input && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-4 px-4 py-2 border mt-6 text-gray-600 bg-white/70 rounded-lg shadow backdrop-blur-md"
            >
              <p>{input}</p>
              <img
                src={assets.cross_icon}
                alt="clear"
                onClick={() => navigate("/project-list")}
                className="w-4 h-4 cursor-pointer hover:rotate-90 transition-transform"
              />
            </motion.div>
          )}

          {/* Projects */}
          {Object.keys(groupedByDomain).length > 0 ? (
            Object.entries(groupedByDomain).map(([domain, projects]) => (
              <div key={domain} className="my-16">
                {/* Domain Heading with animation */}
                <motion.h2
                  variants={domainHeaderVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-2xl font-semibold text-gray-800 mb-8 border-l-4 border-blue-500 pl-4 relative"
                >
                  {domain}
                  <motion.span 
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  />
                </motion.h2>

                {/* Cards Grid with refined animations */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 md:gap-8 place-items-start"
                >
                  {projects.map((project, index) => (
                    <motion.div
                       key={index}
                       variants={cardVariants}
                       initial="hidden"
                       animate="visible"
                       whileHover="hover"
                       onClick={() => navigate(`/project/${project._id}`)}
                       className="w-full flex justify-center relative cursor-pointer"
                     >
                      {/* Elegant hover overlay */}
                      <motion.div
                        className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0"
                        variants={{
                          hover: {
                            opacity: 1,
                            transition: { duration: 0.3 }
                          }
                        }}
                      />
                      
                      {/* Main card container with subtle effects */}
                      <motion.div
                        variants={hoverVariants}
                        initial="rest"
                        whileHover="hover"
                        className="relative w-full rounded-xl overflow-hidden bg-white shadow-lg"
                        style={{
                          transformStyle: "preserve-3d"
                        }}
                      >
                        {/* Card content wrapper */}
                        <div className="relative">
                          <ProjectCard project={project} />
                          
                          {/* Subtle shine effect on hover */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
                            variants={{
                              hover: {
                                opacity: 1,
                                x: ["0%", "200%"],
                                transition: {
                                  x: {
                                    duration: 0.8,
                                    ease: "easeInOut"
                                  },
                                  opacity: {
                                    duration: 0.3
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <div className="inline-block p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProjectsList;