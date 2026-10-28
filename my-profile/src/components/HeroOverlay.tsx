import { motion } from "framer-motion";
import { Download, ArrowRight, Mail } from "lucide-react";
import { Github, Linkedin, Twitter } from "./Icons";

interface HeroOverlayProps {
  profile?: {
    name: string;
    headline: string;
    bio: string;
    resumeUrl: string;
  };
  contact?: {
    email: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export default function HeroOverlay({ profile, contact }: HeroOverlayProps) {
  const name = profile?.name || "Laknidu Thilakawardhana";
  const headline =
    profile?.headline ||
    "Software Engineer, Researcher, and Builder of interactive web experiences.";
  const bio =
    profile?.bio ||
    "Bridging the gap between design and deep technical engineering. Passionate about AI, Open Source, and crafting digital products that feel alive.";
  const resumeUrl = profile?.resumeUrl || "/api/resume";

  const githubUrl = contact?.github || "#";
  const linkedinUrl = contact?.linkedin || "#";
  const twitterUrl = contact?.twitter || "#";

  return (
    <section className="relative w-full min-h-[90vh] sm:min-h-screen flex flex-col items-center justify-center py-16 sm:py-20 z-20 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center w-full">
        {/* Name Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-white text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-4 sm:mb-6 drop-shadow-2xl break-words"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500">
            {name}.
          </span>
        </motion.h1>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-lg sm:text-2xl md:text-3xl font-medium text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            {headline}
          </h2>

          <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            {bio}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 w-full max-w-md sm:max-w-none mx-auto">
            <a
              href="#projects"
              className="group relative flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black font-semibold text-sm sm:text-base rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto shadow-lg"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">Explore My Work</span>
              <ArrowRight
                size={18}
                className="relative z-10 group-hover:translate-x-1 transition-transform"
              />
            </a>

            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm sm:text-base rounded-full transition-all hover:scale-105 active:scale-95 backdrop-blur-sm w-full sm:w-auto"
            >
              <Download size={18} />
              <span>Resume</span>
            </a>

            <a
              href="#contact"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/30 text-indigo-100 font-semibold text-sm sm:text-base rounded-full transition-all hover:scale-105 active:scale-95 backdrop-blur-sm w-full sm:w-auto"
            >
              <Mail size={18} />
              <span>Let&apos;s Talk</span>
            </a>
          </div>

          {/* Socials */}
          <div className="flex items-center justify-center gap-6">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white hover:scale-110 transition-all p-2"
              aria-label="GitHub Profile"
            >
              <Github size={24} />
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 hover:scale-110 transition-all p-2"
              aria-label="LinkedIn Profile"
            >
              <Linkedin size={24} />
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-sky-400 hover:scale-110 transition-all p-2"
              aria-label="Twitter Profile"
            >
              <Twitter size={24} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
