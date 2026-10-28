import SectionLayout from "./SectionLayout";
import { Gamepad2, Play } from "lucide-react";
import { motion } from "framer-motion";

export interface GameDisplayItem {
  title: string;
  summary?: string;
  description?: string;
  technologies: string[];
  statusText?: string | null;
  imageUrl?: string | null;
  projectUrl?: string | null;
  githubUrl?: string | null;
}

interface GamesSectionProps {
  projects?: GameDisplayItem[];
}

export default function GamesSection({ projects: dynamicProjects }: GamesSectionProps) {
  const fallbackGames: GameDisplayItem[] = [
    {
      title: "Starborne: Genesis",
      description:
        "A fast-paced 2D space shooter with procedural enemy generation and a custom physics engine built from scratch.",
      technologies: ["C++", "SFML", "Box2D"],
      statusText: "Playable Prototype",
      githubUrl: "#",
      projectUrl: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Neon Tactics",
      description:
        "Turn-based tactical RPG set in a cyberpunk dystopia. Features complex AI behaviors and a dynamic lighting system.",
      technologies: ["Unity", "C#", "HLSL"],
      statusText: "In Development",
      githubUrl: "#",
      projectUrl: null,
      imageUrl:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  const displayList =
    dynamicProjects && dynamicProjects.length > 0 ? dynamicProjects : fallbackGames;

  return (
    <SectionLayout id="games" title="Games & Experiments">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {displayList.map((game, idx) => (
          <motion.div
            key={game.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group rounded-2xl overflow-hidden bg-[#050505]/50 backdrop-blur-md border border-white/10 hover:bg-[#050505]/70 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 sm:h-64 overflow-hidden">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                {/* Fallback gradient if image doesn't load */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    game.imageUrl ||
                    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  }
                  alt={game.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 relative z-0 opacity-60 mix-blend-overlay"
                />

                {game.projectUrl && (
                  <a
                    href={game.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Play ${game.title}`}
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white hover:bg-white/30 hover:scale-110 transition-all">
                      <Play size={22} className="ml-1" />
                    </div>
                  </a>
                )}
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 break-words">
                    <Gamepad2 size={20} className="text-indigo-400 flex-shrink-0" />
                    <span>{game.title}</span>
                  </h3>
                  <span className="text-xs font-medium px-2 py-1 bg-white/10 text-gray-300 rounded flex-shrink-0">
                    {game.statusText || "Playable"}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                  {game.summary || game.description}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0 flex flex-wrap items-center justify-between gap-3 sm:gap-4 mt-auto">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {game.technologies.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-medium text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {game.githubUrl && (
                <a
                  href={game.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Source Code
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionLayout>
  );
}
