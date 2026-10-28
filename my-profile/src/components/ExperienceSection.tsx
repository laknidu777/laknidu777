import SectionLayout from "./SectionLayout";
import { Briefcase, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export interface ExperienceDisplayItem {
  position: string;
  company: string;
  employmentType?: string | null;
  location?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  current: boolean;
  description: string;
  technologies: string[];
}

interface ExperienceSectionProps {
  experiences?: ExperienceDisplayItem[];
}

function formatDate(dateVal: Date | string) {
  const d = new Date(dateVal);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function ExperienceSection({ experiences: dynamicExperiences }: ExperienceSectionProps) {
  const fallbackExperiences = [
    {
      position: "Senior Software Engineer",
      company: "TechNova Solutions",
      employmentType: "Full-time",
      location: "San Francisco, CA (Remote)",
      startDate: new Date("2024-01-01"),
      current: true,
      description:
        "Leading the frontend architecture team for a suite of enterprise SaaS products. Implementing micro-frontends and optimizing rendering performance, resulting in a 40% decrease in load times.",
      technologies: ["React", "TypeScript", "Next.js", "GraphQL"],
    },
    {
      position: "Full Stack Developer",
      company: "Creative Digital Agency",
      employmentType: "Full-time",
      location: "New York, NY",
      startDate: new Date("2021-06-01"),
      endDate: new Date("2023-12-31"),
      current: false,
      description:
        "Developed and maintained interactive web applications for high-profile clients. Built custom CMS solutions, integrated complex third-party APIs, and mentored junior developers.",
      technologies: ["Vue.js", "Node.js", "PostgreSQL", "AWS"],
    },
    {
      position: "Research Assistant",
      company: "University Human-Computer Interaction Lab",
      employmentType: "Part-time",
      location: "Boston, MA",
      startDate: new Date("2019-09-01"),
      endDate: new Date("2021-05-31"),
      current: false,
      description:
        "Conducted research on novel interaction techniques for web-based collaborative tools. Co-authored two papers accepted at top-tier HCI conferences.",
      technologies: ["JavaScript", "Python", "WebSockets", "D3.js"],
    },
  ];

  const displayList =
    dynamicExperiences && dynamicExperiences.length > 0
      ? dynamicExperiences
      : fallbackExperiences;

  return (
    <SectionLayout id="experience" title="Professional Experience">
      <div className="space-y-8 sm:space-y-12 max-w-4xl mx-auto">
        {displayList.map((exp, idx) => (
          <motion.div
            key={exp.position + exp.company}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="relative pl-7 sm:pl-8 md:pl-0"
          >
            {/* Timeline Line (Visible on all screens) */}
            <div className="absolute left-2.5 md:left-1/2 top-0 bottom-[-2rem] sm:bottom-[-3rem] w-px bg-gradient-to-b from-indigo-500/50 to-transparent -translate-x-1/2 last:bottom-0" />

            <div
              className={`md:flex items-center justify-between w-full ${
                idx % 2 === 0 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-2.5 md:left-1/2 w-4 h-4 rounded-full bg-indigo-500 border-4 border-[#050505] -translate-x-1/2 mt-1.5 md:mt-0 z-10" />

              {/* Empty space for alternating layout */}
              <div className="hidden md:block md:w-5/12" />

              {/* Content Card */}
              <div className="md:w-5/12 bg-[#050505]/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 hover:border-indigo-500/30 hover:bg-[#050505]/70 transition-all duration-300">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1 break-words">
                  {exp.position}
                </h3>

                <div className="flex flex-wrap items-center text-xs sm:text-sm font-medium text-indigo-400 mb-3 sm:mb-4 gap-x-3 gap-y-1.5">
                  <span className="flex items-center">
                    <Briefcase size={14} className="mr-1.5 flex-shrink-0" /> {exp.company}
                  </span>
                  {exp.employmentType && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>{exp.employmentType}</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-400 mb-4 gap-x-3 gap-y-1.5">
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1.5 flex-shrink-0" />
                    {formatDate(exp.startDate)} &mdash;{" "}
                    {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : "Present"}
                  </span>
                  {exp.location && (
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-1.5 flex-shrink-0" /> {exp.location}
                    </span>
                  )}
                </div>

                <p className="text-gray-300 text-sm sm:text-base mb-5 sm:mb-6 leading-relaxed whitespace-pre-line">
                  {exp.description}
                </p>

                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {exp.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 text-xs font-medium text-gray-300 bg-black/40 rounded-md border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionLayout>
  );
}
