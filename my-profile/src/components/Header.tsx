"use client";

import { useState, useEffect } from "react";
import { Menu, X, Download } from "lucide-react";

interface HeaderProps {
  resumeUrl?: string;
  hasResearch?: boolean;
  hasGames?: boolean;
}

export default function Header({
  resumeUrl = "/api/resume",
  hasResearch = false,
  hasGames = false,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    ...(hasResearch ? [{ name: "Research", href: "#research" }] : []),
    ...(hasGames ? [{ name: "Games", href: "#games" }] : []),
    { name: "Freelance", href: "#freelance" },
    { name: "Projects", href: "#projects" },
    { name: "Experience", href: "#experience" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#050505]/70 backdrop-blur-md py-4 border-b border-white/10"
          : "bg-transparent py-6"
      }`}
    >
      <div className="w-full px-6 md:px-12 lg:px-16 flex items-center justify-between">
        {/* Left Corner: Brand Logo */}
        <div className="flex-1 flex justify-start">
          <a
            href="#"
            className="text-xl font-bold tracking-tighter text-white hover:text-indigo-400 transition-colors"
          >
            LT.
          </a>
        </div>

        {/* Center: Navigation spread with generous, balanced spacing */}
        <nav className="hidden lg:flex items-center justify-center">
          <ul className="flex items-center gap-7 xl:gap-9">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors py-1 hover:text-indigo-300 tracking-wide"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Corner: Resume Button & Mobile Toggle */}
        <div className="flex-1 flex justify-end items-center">
          <div className="hidden lg:flex items-center">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full transition-all border border-white/10 hover:border-white/25 shadow-sm"
            >
              <Download size={16} />
              <span>Resume</span>
            </a>
          </div>

          {/* Mobile Toggle Button */}
          <button
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 flex flex-col space-y-4 shadow-2xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-gray-300 hover:text-white py-1.5 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-white/10">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full transition-all border border-white/10"
            >
              <Download size={16} />
              <span>Resume</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}


