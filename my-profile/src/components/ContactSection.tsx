import SectionLayout from "./SectionLayout";
import { Mail, ArrowUpRight } from "lucide-react";
import { Github, Linkedin } from "./Icons";
import { motion } from "framer-motion";

interface ContactSectionProps {
  contact?: {
    email: string;
    github?: string;
    linkedin?: string;
    title?: string;
    description?: string;
  };
}

export default function ContactSection({ contact }: ContactSectionProps) {
  const email = contact?.email || "hello@example.com";
  const github = contact?.github || "#";
  const linkedin = contact?.linkedin || "#";
  const title = contact?.title || "Let's build something amazing together.";
  const description =
    contact?.description ||
    "Whether you have a freelance project, a research opportunity, or just want to say hi, my inbox is always open. I'll try my best to get back to you!";

  return (
    <SectionLayout id="contact" title="Get In Touch">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-[#050505]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 md:p-12 hover:bg-[#050505]/70 hover:border-white/20 transition-all duration-300 max-w-4xl"
      >
        <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-3 sm:mb-4 break-words">
          {title}
        </h3>
        <p className="text-gray-400 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base md:text-lg max-w-2xl">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2">
          <a
            href={`mailto:${email}`}
            className="inline-flex max-w-full items-center space-x-3 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-white font-medium transition-all group w-fit"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-105 transition-all flex-shrink-0">
              <Mail size={18} />
            </div>
            <span className="truncate text-sm sm:text-base">{email}</span>
            <ArrowUpRight
              size={18}
              className="text-gray-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0"
            />
          </a>

          <div className="flex items-center space-x-3">
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </motion.div>
    </SectionLayout>
  );
}
