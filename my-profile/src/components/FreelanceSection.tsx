"use client";

import { useState } from "react";
import SectionLayout from "./SectionLayout";
import { ArrowUpRight, ExternalLink, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { Github } from "./Icons";
import { motion, AnimatePresence } from "framer-motion";

export interface FreelanceDisplayItem {
  client?: string | null;
  title: string;
  role?: string | null;
  summary?: string;
  description?: string;
  impact?: string | null;
  technologies: string[];
  projectUrl?: string | null;
  githubUrl?: string | null;
  imageUrl?: string | null;
}

interface FreelanceSectionProps {
  projects?: FreelanceDisplayItem[];
}

function FreelanceCard({ project, idx }: { project: FreelanceDisplayItem; idx: number }) {
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
      className="group relative bg-[#050505]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-[#050505]/80 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
    >
      {/* Background decorative gradient */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

      <div className="relative z-10">
        {/* Header: Client Tag & Title + Quick Link Icons */}
        <div className="flex justify-between items-start gap-4 mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                <Briefcase size={12} />
                {project.client || "Client Engagement"}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
              {project.title}
            </h3>
            {project.role && (
              <p className="text-sm font-medium text-gray-400">
                {project.role}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/15 transition-all"
                title="View Source Code"
                aria-label="View Source Code"
              >
                <Github size={18} />
              </a>
            )}
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 hover:text-white hover:bg-indigo-600 hover:scale-105 transition-all"
                title="Visit Website"
                aria-label="Visit Website"
              >
                <ArrowUpRight size={20} />
              </a>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4 mb-6">
          {/* Summary / Overview */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Overview
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              {summary || description || "Enterprise freelance engagement."}
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
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 mt-2 transition-colors focus:outline-none"
              >
                <span>{isExpanded ? "Show Less" : "Show More (Full Description)"}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          )}

          {/* Impact Metric */}
          {project.impact && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                Delivered Impact
              </h4>
              <p className="text-emerald-300 text-sm font-medium">{project.impact}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: Technologies & Prominent Website Link Button */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-auto">
        {/* Technologies Pills */}
        <div className="flex flex-wrap gap-1.5 flex-1">
          {project.technologies.map((t) => (
            <span
              key={t}
              className="text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Action Button: Dedicated "Visit Website" Button */}
        {project.projectUrl && (
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 flex-shrink-0"
          >
            <span>Visit Website</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function FreelanceSection({ projects: dynamicProjects }: FreelanceSectionProps) {
  const fallbackProjects: FreelanceDisplayItem[] = [
    {
      client: "Global Finance Tech",
      title: "Dashboard Redesign",
      role: "Lead Frontend Developer",
      summary: "A complete overhaul of a legacy financial dashboard used by hundreds of advisors.",
      description:
        "A complete overhaul of a legacy financial dashboard used by hundreds of advisors. Redesigned end-to-end user journeys, implemented real-time WebSocket state streaming, and integrated customizable analytics widgets. Decreased API payload sizes by 40% and elevated overall usability scores across active advisor teams.",
      impact: "Improved perceived load time by 300% and increased user task completion rate by 45%.",
      technologies: ["React", "Redux Toolkit", "Tailwind CSS", "Recharts"],
      projectUrl: "https://example.com",
    },
    {
      client: "E-Commerce Startup",
      title: "Headless Storefront",
      role: "Full Stack Consultant",
      summary: "Built a high-performance headless e-commerce storefront integrated with Shopify Plus.",
      description:
        "Architected and delivered a modern headless storefront on Next.js paired with the Shopify Storefront GraphQL API. Implemented edge caching, automated internationalized currency conversions, and bespoke checkout pathways that significantly diminished cart abandonment.",
      impact: "Achieved a perfect 100 Lighthouse performance score and increased conversion rate by 18%.",
      technologies: ["Next.js", "Shopify Storefront API", "Framer Motion"],
      projectUrl: "https://example.com",
    },
  ];

  const displayList =
    dynamicProjects && dynamicProjects.length > 0 ? dynamicProjects : fallbackProjects;

  return (
    <SectionLayout id="freelance" title="Freelance & Client Work">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {displayList.map((project, idx) => (
          <FreelanceCard key={project.title + idx} project={project} idx={idx} />
        ))}
      </div>
    </SectionLayout>
  );
}

