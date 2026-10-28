"use client";

import { useState } from "react";
import SectionLayout from "./SectionLayout";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Github } from "./Icons";
import { motion, AnimatePresence } from "framer-motion";

export interface ProjectDisplayItem {
  title: string;
  description: string;
  summary?: string;
  technologies: string[];
  statusText?: string | null;
  githubUrl?: string | null;
  projectUrl?: string | null;
  featured?: boolean;
}

interface ProjectsSectionProps {
  projects?: ProjectDisplayItem[];
}

function ProjectCard({ project, idx }: { project: ProjectDisplayItem; idx: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const summary = (project.summary || "").trim();
  const description = (project.description || "").trim();

  // Determine if there is additional or longer content to reveal
  const hasDetailedDescription = Boolean(
    description && (description !== summary || description.length > 140)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: idx * 0.1 }}
      className={`group relative rounded-2xl bg-[#050505]/50 backdrop-blur-md border border-white/10 overflow-hidden hover:border-indigo-500/50 hover:bg-[#050505]/70 transition-all duration-300 flex flex-col justify-between ${
        project.featured ? "md:col-span-2 lg:col-span-1" : ""
      }`}
    >
      <div className="p-8 h-full flex flex-col justify-between relative z-10">
        <div>
          {/* Header Status & Links */}
          <div className="flex justify-between items-start mb-6">
            <div className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-gray-300">
              {project.statusText || (project.featured ? "Featured" : "Project")}
            </div>
            <div className="flex space-x-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="GitHub Repository"
                  title="View Source Code"
                >
                  <Github size={20} />
                </a>
              )}
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Live Demo"
                  title="Live Demo"
                >
                  <ExternalLink size={20} />
                </a>
              )}
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-400 transition-colors">
            {project.title}
          </h3>

          {/* Details Section */}
          <div className="space-y-4 mb-6">
            {/* Summary / Overview */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Overview
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {summary || description}
              </p>
            </div>

            {/* Expandable Full Description */}
            {hasDetailedDescription && (
              <div>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="full-desc"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 pb-1 border-t border-white/5 space-y-2">
                        <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                          Full Description & Details
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                          {description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Show More / Show Less Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 mt-2 transition-colors focus:outline-none cursor-pointer"
                >
                  <span>{isExpanded ? "Show Less" : "Show More (Full Description)"}</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Technologies List */}
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
          {project.technologies.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
}

export default function ProjectsSection({ projects: dynamicProjects }: ProjectsSectionProps) {
  const fallbackProjects: ProjectDisplayItem[] = [
    {
      title: "Neon Nexus",
      summary:
        "A cyberpunk-themed productivity dashboard built with React and Three.js.",
      description:
        "A cyberpunk-themed productivity dashboard built with React and Three.js. Reimagines daily tasks as missions in a neon-lit metropolis, complete with custom GLSL shaders, gamified streak tracking, and interactive audio feedback loops for deep work sessions.",
      technologies: ["React", "Three.js", "TailwindCSS"],
      statusText: "Completed",
      githubUrl: "#",
      projectUrl: "#",
      featured: true,
    },
    {
      title: "Quantum State Manager",
      summary:
        "An experimental state management library for React focusing on predictable mutations.",
      description:
        "An experimental state management library for React focusing on predictable state mutations, atomic updates, and time-travel debugging with zero boilerplate and full TypeScript inference.",
      technologies: ["TypeScript", "React", "State Management"],
      statusText: "In Progress",
      githubUrl: "#",
      projectUrl: "#",
      featured: false,
    },
    {
      title: "Echoes of Eternity",
      summary:
        "An open-source text adventure engine built in Rust, compiled to WebAssembly.",
      description:
        "An open-source text adventure engine built in Rust, compiled to WebAssembly for browser playability. Features a modular branching story interpreter, dynamic ambient sound synthesis, and instant offline execution.",
      technologies: ["Rust", "WASM", "Web Audio API"],
      statusText: "Experimental",
      githubUrl: "#",
      projectUrl: "#",
      featured: true,
    },
  ];

  const displayList =
    dynamicProjects && dynamicProjects.length > 0
      ? dynamicProjects
      : fallbackProjects;

  return (
    <SectionLayout id="projects" title="Personal Projects & Open Source">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayList.map((project, idx) => (
          <ProjectCard key={project.title} project={project} idx={idx} />
        ))}
      </div>
    </SectionLayout>
  );
}
