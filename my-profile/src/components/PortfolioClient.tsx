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

type IntroState = "loading" | "done";

interface PortfolioClientProps {
  initialData: PortfolioData;
}

export default function PortfolioClient({ initialData }: PortfolioClientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(300).fill(null));

  // States for intro and loading
  const [loadProgress, setLoadProgress] = useState(0);
  const [introState, setIntroState] = useState<IntroState>("loading");

  // Total number of frames in the directory
  const frameCount = 300;

  // Helper to draw a specific frame
  const drawFrame = useCallback((index: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retrieve requested frame, or find nearest available loaded frame
    let targetImg = imagesRef.current[index];
    if (!targetImg || !targetImg.complete) {
      for (let offset = 1; offset < frameCount; offset++) {
        const prev = index - offset;
        const next = index + offset;
        if (prev >= 0 && imagesRef.current[prev]?.complete) {
          targetImg = imagesRef.current[prev];
          break;
        }
        if (next < frameCount && imagesRef.current[next]?.complete) {
          targetImg = imagesRef.current[next];
          break;
        }
      }
    }

    if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
      if (canvas.width !== targetImg.naturalWidth) canvas.width = targetImg.naturalWidth;
      if (canvas.height !== targetImg.naturalHeight) canvas.height = targetImg.naturalHeight;
      ctx.drawImage(targetImg, 0, 0);
    }
  }, [frameCount]);

  // 1. Sleek, fast loading progress (600ms duration, with instant click-to-skip)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 600;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setLoadProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => {
          setIntroState("done");
        }, 80);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  // 2. Load Frame 1 immediately and stream remaining WebP frames in small controlled batches
  useEffect(() => {
    let isCancelled = false;

    // Load first frame immediately for instant visual canvas
    const firstImg = new Image();
    firstImg.src = "/frames/frame-001.webp";
    firstImg.onload = () => {
      if (isCancelled) return;
      imagesRef.current[0] = firstImg;
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          canvasRef.current.width = firstImg.naturalWidth;
          canvasRef.current.height = firstImg.naturalHeight;
          ctx.drawImage(firstImg, 0, 0);
        }
      }
    };

    // Progressively stream frames in small batches so we don't saturate the browser connection pool or dev server
    let currentIndex = 2;
    const batchSize = 6;

    const streamNextBatch = () => {
      if (isCancelled || currentIndex > frameCount) return;

      const end = Math.min(currentIndex + batchSize, frameCount + 1);
      for (let i = currentIndex; i < end; i++) {
        const img = new Image();
        const paddedIndex = i.toString().padStart(3, "0");
        img.src = `/frames/frame-${paddedIndex}.webp`;
        img.onload = () => {
          if (!isCancelled) {
            imagesRef.current[i - 1] = img;
          }
        };
      }
      currentIndex = end;

      if (currentIndex <= frameCount) {
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          window.requestIdleCallback(() => streamNextBatch(), { timeout: 150 });
        } else {
          setTimeout(streamNextBatch, 50);
        }
      }
    };

    streamNextBatch();

    return () => {
      isCancelled = true;
    };
  }, [frameCount]);

  // 3. Handle normal scroll animation after intro is done
  useEffect(() => {
    if (introState !== "done") return;

    drawFrame(0);

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
  }, [introState, drawFrame, frameCount]);

  // Prevent scrolling while loading
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
      {/* Aesthetic Loading Screen (with instant click-to-skip) */}
      <div
        onClick={() => setIntroState("done")}
        className={`fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#050505] transition-opacity duration-500 cursor-pointer ${
          introState === "loading" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Ambient Glow */}
        <div className="absolute w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* Monogram Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-2xl shadow-indigo-500/30 mb-8 animate-pulse">
            <div className="w-full h-full bg-[#08090f] rounded-[14.5px] flex items-center justify-center">
              <span className="text-xl font-black tracking-tight text-white">LT</span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-lg font-bold text-white mb-1 tracking-tight">
            {initialData.profile.name}
          </h2>
          <p className="text-xs text-gray-400 mb-6 max-w-xs truncate">
            {initialData.profile.headline}
          </p>

          {/* Label and Percentage */}
          <div className="flex items-center justify-between w-64 mb-2.5 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
            <span>Loading</span>
            <span className="text-indigo-400 font-mono text-sm">{loadProgress}%</span>
          </div>

          {/* Glowing Gradient Progress Bar */}
          <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5 p-[1px] shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(99,102,241,0.6)]"
              style={{ width: `${loadProgress}%` }}
            />
          </div>

          {/* Dynamic Status Text */}
          <p className="text-[11px] text-gray-500 mt-4 tracking-wider uppercase">
            {loadProgress < 35
              ? "Initializing environment..."
              : loadProgress < 80
              ? "Loading visual assets..."
              : "Welcome"}
          </p>
        </div>
      </div>

      {/* Header */}
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
