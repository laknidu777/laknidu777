"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Header from "./Header";
import HeroOverlay from "./HeroOverlay";
import AboutSection from "./AboutSection";
import ResearchSection from "./ResearchSection";
import GamesSection from "./GamesSection";
import FreelanceSection from "./FreelanceSection";
import ProjectsSection from "./ProjectsSection";
import ExperienceSection from "./ExperienceSection";
import SkillsSection from "./SkillsSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import { PortfolioData } from "@/lib/portfolio-data";

type IntroState = "loading" | "showing_text" | "done";

interface PortfolioClientProps {
  initialData: PortfolioData;
}

export default function PortfolioClient({ initialData }: PortfolioClientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  // States for intro and loading
  const [loadProgress, setLoadProgress] = useState(0);
  const [introState, setIntroState] = useState<IntroState>("loading");

  // Total number of frames in the directory
  const frameCount = 300;

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, "0");
      img.src = `/ezgif-6916cc84d1500b24-jpg/ezgif-frame-${paddedIndex}.png`;

      const onImageLoaded = () => {
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / frameCount) * 100));

        if (loadedCount === frameCount) {
          setImages([...loadedImages]);
          setIntroState("showing_text");
        }
      };

      img.onload = onImageLoaded;
      img.onerror = onImageLoaded;

      loadedImages.push(img);
    }
  }, []);

  // Helper to draw a specific frame
  const drawFrame = useCallback((index: number) => {
    if (!canvasRef.current || images.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const currentImage = images[index];

    if (ctx && currentImage) {
      if (canvas.width !== currentImage.width) canvas.width = currentImage.width;
      if (canvas.height !== currentImage.height) canvas.height = currentImage.height;
      ctx.drawImage(currentImage, 0, 0);
    }
  }, [images]);

  // 2. Show "Hi I'm Laknidu" intro text and then transition to done
  useEffect(() => {
    if (introState === "showing_text") {
      drawFrame(0);

      // Transition to done after the text introduction
      const timer = setTimeout(() => {
        setIntroState("done");
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [introState, drawFrame]);

  // 3. Handle normal scroll animation after intro is done
  useEffect(() => {
    if (introState !== "done") return;

    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = maxScrollTop === 0 ? 0 : Math.max(0, Math.min(1, scrollTop / maxScrollTop));
      const frameIndex = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));

      requestAnimationFrame(() => drawFrame(frameIndex));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [introState, drawFrame]);

  // Prevent scrolling while intro is playing
  useEffect(() => {
    if (introState !== "done") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [introState]);

  const hasResearch = initialData.researchProjects.length > 0;
  const hasGames = initialData.gameProjects.length > 0;

  return (
    <main className="bg-transparent min-h-screen text-gray-100 font-sans selection:bg-indigo-500/30">
      {introState === "done" && (
        <Header
          resumeUrl={initialData.profile.resumeUrl}
          hasResearch={hasResearch}
          hasGames={hasGames}
        />
      )}

      {/* The fixed background canvas */}
      <div className="fixed top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center bg-black -z-10 pointer-events-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover transition-opacity duration-1000 opacity-80 blur-none"
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          {/* Loading Indicator */}
          <div
            className={`transition-opacity duration-700 absolute ${
              introState === "loading" ? "opacity-100" : "opacity-0"
            } flex flex-col items-center`}
          >
            <div className="text-white text-xl tracking-[0.3em] font-light mb-4">LOADING</div>
            <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>

          {/* Intro Text that appears and then disappears */}
          <div
            className={`transition-all duration-1000 absolute flex flex-col items-center justify-center px-6 ${
              introState === "showing_text"
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-8"
            }`}
          >
            <h1 className="text-white text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-2xl text-center">
              <span className="block text-2xl md:text-4xl text-gray-300 font-medium mb-4">
                Hi! I&apos;m
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500">
                {initialData.profile.name}.
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      {introState === "done" && (
        <div className="relative z-20 bg-transparent">
          {/* Spacer to make the first page empty with a scroll down indicator */}
          <div className="w-full h-screen pointer-events-none flex flex-col items-center justify-end pb-12">
            <div className="animate-bounce flex flex-col items-center gap-2 text-white/50">
              <span className="text-sm font-medium tracking-widest uppercase">Scroll Down</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <HeroOverlay profile={initialData.profile} contact={initialData.contact} />
          <AboutSection profile={initialData.profile} />

          {/* Skills */}
          <SkillsSection skillCategories={initialData.skills} />

          {/* Research Section (rendered when published research exists) */}
          {hasResearch && <ResearchSection projects={initialData.researchProjects} />}

          {/* Games Section (rendered when published games exist) */}
          {hasGames && <GamesSection projects={initialData.gameProjects} />}

          {/* Freelance Work */}
          <FreelanceSection projects={initialData.freelanceProjects} />

          {/* Personal Projects */}
          <ProjectsSection projects={initialData.personalProjects} />

          {/* Work Experience */}
          <ExperienceSection experiences={initialData.experiences} />

          {/* Contact */}
          <ContactSection contact={initialData.contact} />

          {/* Footer */}
          <Footer profile={initialData.profile} />
        </div>
      )}
    </main>
  );
}
