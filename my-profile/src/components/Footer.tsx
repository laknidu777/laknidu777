"use client";

import { ArrowUp } from "lucide-react";

interface FooterProps {
  profile?: {
    name?: string;
    headline?: string;
    availability?: string;
  };
}

export default function Footer({ profile }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const name = profile?.name || "Laknidu Thilakawardhana";
  const headline = profile?.headline || "Software Engineer & Researcher.";
  const availability = profile?.availability || "Available for freelance opportunities";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/10 bg-[#050505]/50 backdrop-blur-md pt-12 sm:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 gap-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">{name}</h2>
            <p className="text-sm sm:text-base text-gray-400">{headline}</p>
            {availability && (
              <div className="mt-3 sm:mt-4 inline-flex items-center space-x-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                <span className="text-xs font-medium text-green-400">{availability}</span>
              </div>
            )}
          </div>

          <button
            onClick={scrollToTop}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
            aria-label="Back to top"
          >
            <ArrowUp size={20} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/10 pt-6 sm:pt-8 gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
            &copy; {currentYear} {name}. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-gray-400 order-1 sm:order-2">
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#projects" className="hover:text-white transition-colors">
              Projects
            </a>
            <a href="#experience" className="hover:text-white transition-colors">
              Experience
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
            <a href="/admin" className="hover:text-indigo-400 transition-colors">
              Admin CMS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
