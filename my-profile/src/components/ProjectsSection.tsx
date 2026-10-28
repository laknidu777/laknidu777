import SectionLayout from "./SectionLayout";
import { ExternalLink } from "lucide-react";
import { Github } from "./Icons";
import { motion } from "framer-motion";

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

export default function ProjectsSection({ projects: dynamicProjects }: ProjectsSectionProps) {
  const fallbackProjects: ProjectDisplayItem[] = [
    {
      title: "Neon Nexus",
      description:
        "A cyberpunk-themed productivity dashboard built with React and Three.js. Reimagines daily tasks as missions in a neon-lit metropolis.",
      technologies: ["React", "Three.js", "TailwindCSS"],
      statusText: "Completed",
      githubUrl: "#",
      projectUrl: "#",
      featured: true,
    },
    {
      title: "Quantum State Manager",
      description:
        "An experimental state management library for React focusing on predictable state mutations and time-travel debugging.",
      technologies: ["TypeScript", "React", "State Management"],
      statusText: "In Progress",
      githubUrl: "#",
      projectUrl: "#",
      featured: false,
    },
    {
      title: "Echoes of Eternity",
      description:
        "An open-source text adventure engine built in Rust, compiled to WebAssembly for browser playability.",
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
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`group relative rounded-2xl bg-[#050505]/50 backdrop-blur-md border border-white/10 overflow-hidden hover:border-indigo-500/50 hover:bg-[#050505]/70 transition-all duration-300 ${
              project.featured ? "md:col-span-2 lg:col-span-1" : ""
            }`}
          >
            <div className="p-8 h-full flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-gray-300">
                  {project.statusText || "Featured"}
                </div>
                <div className="flex space-x-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="GitHub Repository"
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
                    >
                      <ExternalLink size={20} />
                    </a>
                  )}
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-gray-400 mb-6 flex-grow leading-relaxed">
                {project.summary || project.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {project.technologies.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium text-indigo-300 bg-indigo-500/10 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </SectionLayout>
  );
}
