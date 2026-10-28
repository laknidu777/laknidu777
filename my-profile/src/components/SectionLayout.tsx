import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionLayoutProps {
  id: string;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function SectionLayout({ id, title, children, className = "" }: SectionLayoutProps) {
  return (
    <section id={id} className={`py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto ${className}`}>
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-5xl font-bold mb-8 md:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 break-words"
        >
          {title}
        </motion.h2>
      )}
      {children}
    </section>
  );
}
