import SectionLayout from "./SectionLayout";
import { BookOpen, ExternalLink } from "lucide-react";
import { Github } from "./Icons";
import { motion } from "framer-motion";

export interface ResearchDisplayItem {
  title: string;
  role?: string | null; // authors
  impact?: string | null; // venue & year
  summary?: string;
  description?: string;
  technologies: string[]; // keywords
  projectUrl?: string | null; // doiUrl / paper
  githubUrl?: string | null;
}

interface ResearchSectionProps {
  projects?: ResearchDisplayItem[];
}

export default function ResearchSection({ projects: dynamicProjects }: ResearchSectionProps) {
  const fallbackPublications: ResearchDisplayItem[] = [
    {
      title: "Interactive Visualization of Quantum State Transitions in Web Environments",
      role: "Laknidu Thilakawardhana, Dr. Jane Smith",
      impact: "ACM Conference on Human Factors in Computing Systems (CHI) • 2023",
      summary:
        "This paper presents a novel framework for rendering complex quantum state transitions in standard web browsers using WebGL and WebAssembly, lowering the barrier to entry for educational tools.",
      technologies: ["Data Visualization", "WebGL", "Educational Tech"],
      projectUrl: "#",
      githubUrl: "#",
    },
    {
      title: "Analyzing the Impact of Micro-Animations on User Retention in SaaS Platforms",
      role: "Laknidu Thilakawardhana, Alex Johnson",
      impact: "International Symposium on User Interface Software and Technology (UIST) • 2021",
      summary:
        "An empirical study analyzing over 50,000 user sessions to determine the correlation between subtle interface animations and user engagement metrics in enterprise software.",
      technologies: ["HCI", "UX Research", "Micro-interactions"],
      projectUrl: "#",
      githubUrl: null,
    },
  ];

  const displayList =
    dynamicProjects && dynamicProjects.length > 0 ? dynamicProjects : fallbackPublications;

  return (
    <SectionLayout id="research" title="Research & Publications">
      <div className="space-y-6 sm:space-y-8">
        {displayList.map((pub, idx) => (
          <motion.div
            key={pub.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group flex flex-col sm:flex-row gap-4 sm:gap-6 bg-[#050505]/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 md:p-8 hover:bg-[#050505]/70 hover:border-white/20 transition-all"
          >
            <div className="flex-shrink-0 pt-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                <h3 className="text-lg sm:text-xl font-bold text-white break-words group-hover:text-indigo-300 transition-colors">
                  {pub.title}
                </h3>
              </div>

              <p className="text-indigo-400 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                {pub.role || "Laknidu Thilakawardhana"} &bull;{" "}
                <span className="text-gray-400 italic">
                  {pub.impact || "Academic Publication"}
                </span>
              </p>

              <p className="text-gray-300 text-sm sm:text-base mb-5 sm:mb-6 leading-relaxed">
                {pub.summary || pub.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {pub.technologies.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs font-medium text-gray-400 bg-black/50 px-2.5 py-1 rounded-md border border-white/5"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  {pub.projectUrl && (
                    <a
                      href={pub.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-xs sm:text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <ExternalLink size={15} className="mr-1.5" /> Publication Link
                    </a>
                  )}
                  {pub.githubUrl && (
                    <a
                      href={pub.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      <Github size={15} className="mr-1.5" /> Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionLayout>
  );
}
