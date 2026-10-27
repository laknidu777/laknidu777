"use client";

import { useState, useEffect } from "react";
import { Menu, X, Download, Sun } from "lucide-react";

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
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
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
          ? "bg-[#050505]/50 backdrop-blur-md py-4 border-b border-white/10"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <a
          href="#"
          className="text-xl font-bold tracking-tighter text-white hover:text-indigo-400 transition-colors"
        >
          LT.
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-8">
          <ul className="flex space-x-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center space-x-4 border-l border-white/20 pl-4">
            <button
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              <Sun size={18} />
            </button>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all border border-white/10"
            >
              <Download size={16} />
              <span>Resume</span>
            </a>
          </div>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/10 p-6 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-gray-300 hover:text-white py-2"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 flex items-center justify-between border-t border-white/10">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3 rounded-lg transition-all"
            >
              <Download size={16} />
              <span>Download Resume</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
