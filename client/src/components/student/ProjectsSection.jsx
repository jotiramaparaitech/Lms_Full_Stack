import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import ProjectCard from "./ProjectCard";
import { Link } from "react-router-dom";

const ProjectsSection = () => {
  const { allProjects } = useContext(AppContext);

  const projects = allProjects?.filter((p) => p?.projectTitle) || [];

  if (!projects.length) {
    return (
      <div className="py-20 text-center text-gray-400">
        No projects available
      </div>
    );
  }

  return (
    <section className="pb-20 px-4 md:px-8 bg-white">
      {/* ===== SECTION HEADER (SAME STYLE AS TESTIMONIALS) ===== */}
      <h2 className="text-4xl md:text-5xl font-extrabold pt-9 text-center text-purple-700 tracking-wide">
        Projects That Shape the Future
      </h2>
      <p className="md:text-lg text-base text-gray-600 text-center mt-3 max-w-2xl mx-auto">
        Explore live industry-ready projects and sharpen your skills.
      </p>

      {/* ===== CARDS GRID ===== */}
      <div
        className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 
                      gap-10 mt-16 px-3 sm:px-10 md:px-20"
      >
        {projects.slice(0, 3).map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>

      {/* ===== CTA BUTTON ===== */}
      <div className="flex justify-center mt-16">
        <Link
          to="/project-list"
          className="inline-block px-8 py-3 text-base font-semibold
                     bg-gradient-to-r from-blue-600 to-purple-600
                     text-white rounded-xl shadow-md
                     hover:scale-105 hover:shadow-lg transition-all duration-300"
        >
          Show All Projects
        </Link>
      </div>
    </section>
  );
};

export default ProjectsSection;
