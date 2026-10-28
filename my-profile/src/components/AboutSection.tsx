import SectionLayout from "./SectionLayout";
import { motion } from "framer-motion";

interface AboutSectionProps {
  profile?: {
    aboutP1?: string;
    aboutP2?: string;
    aboutP3?: string;
  };
}

export default function AboutSection({ profile }: AboutSectionProps) {
  const p1 =
    profile?.aboutP1 ||
    "I am a Software Engineer and Researcher with a passion for building scalable web applications and exploring the intersection of design, interaction, and deep technical engineering.";
  const p2 =
    profile?.aboutP2 ||
    "My approach to solving problems involves a healthy mix of rigorous academic research, rapid prototyping, and a relentless focus on the end-user experience. I believe that the best products are not just functional, but delightfully interactive and meticulously crafted.";
  const p3 =
    profile?.aboutP3 ||
    "When I'm not writing code for web platforms or optimizing backend services, you can find me tinkering with game engines, contributing to open-source developer tools, or reading up on the latest advancements in artificial intelligence and human-computer interaction.";

  return (
    <SectionLayout id="about" title="About Me">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-[#050505]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10 hover:bg-[#050505]/70 hover:border-white/20 transition-all duration-300 space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-300 leading-relaxed"
      >
        <p>{p1}</p>
        <p>{p2}</p>
        <p>{p3}</p>
      </motion.div>
    </SectionLayout>
  );
}
