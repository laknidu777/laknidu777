import SectionLayout from "./SectionLayout";
import { Code2, Database, Layout, Server, Settings, Terminal, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export interface SkillCategoryDisplay {
  title: string;
  skills: string[];
}

interface SkillsSectionProps {
  skillCategories?: SkillCategoryDisplay[];
}

function getCategoryIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("front")) return <Layout className="text-blue-400" size={24} />;
  if (lower.includes("back") || lower.includes("api")) return <Server className="text-green-400" size={24} />;
  if (lower.includes("data") || lower.includes("storage")) return <Database className="text-yellow-400" size={24} />;
  if (lower.includes("devops") || lower.includes("cloud")) return <Settings className="text-purple-400" size={24} />;
  if (lower.includes("lang")) return <Code2 className="text-pink-400" size={24} />;
  if (lower.includes("tool")) return <Terminal className="text-indigo-400" size={24} />;
  return <Sparkles className="text-cyan-400" size={24} />;
}

export default function SkillsSection({ skillCategories: dynamicCategories }: SkillsSectionProps) {
  const fallbackCategories = [
    {
      title: "Frontend Development",
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "HTML/CSS"],
    },
    {
      title: "Backend Development",
      skills: ["Node.js", "Express", "Python", "RESTful APIs", "GraphQL"],
    },
    {
      title: "Databases & Storage",
      skills: ["PostgreSQL", "MongoDB", "Redis", "Firebase"],
    },
    {
      title: "DevOps & Cloud",
      skills: ["Docker", "AWS", "Vercel", "GitHub Actions", "CI/CD"],
    },
    {
      title: "Languages",
      skills: ["JavaScript", "TypeScript", "Python", "C++", "Java"],
    },
    {
      title: "Tools & Others",
      skills: ["Git", "Linux", "Figma", "Jest", "Webpack"],
    },
  ];

  const categories =
    dynamicCategories && dynamicCategories.length > 0
      ? dynamicCategories
      : fallbackCategories;

  return (
    <SectionLayout id="skills" title="Technical Skills">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((category, idx) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="p-5 sm:p-6 rounded-2xl bg-[#050505]/50 backdrop-blur-md border border-white/5 hover:bg-[#050505]/70 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="p-2.5 sm:p-3 bg-white/5 rounded-lg flex-shrink-0">
                  {getCategoryIcon(category.title)}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white break-words">
                  {category.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-300 bg-black/40 rounded-md border border-white/10 hover:border-white/30 hover:text-white transition-all cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionLayout>
  );
}
