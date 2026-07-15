"use client";

import { motion } from "framer-motion";
import { Sparkles, Crop, Shuffle, Download, Shield, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Face Detection",
    description: "Automatically detects and aligns your face",
  },
  {
    icon: Crop,
    title: "Smart Background",
    description: "Remove and replace backgrounds instantly",
  },
  {
    icon: Shuffle,
    title: "Multiple Templates",
    description: "14+ passport & visa templates",
  },
  {
    icon: Download,
    title: "Print Ready",
    description: "Generate print sheets with multiple photos",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "All processing happens in your browser",
  },
  {
    icon: Zap,
    title: "Easy Export",
    description: "Download as PNG, JPG, or PDF",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function FeatureCards() {
  return (
    <section className="py-10">
      <motion.h2
        className="mb-8 text-center text-xl font-bold text-(--foreground) sm:text-2xl"
        initial={{ opacity: 0, y: -12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4 }}
      >
        Why Use AI Passport Photo Maker?
      </motion.h2>

      <motion.div
        className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <motion.div
            key={title}
            variants={cardVariants}
            className="group rounded-xl border border-(--border) bg-(--card) p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-(--border-strong) hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary-soft) text-(--primary)">
              <Icon size={20} />
            </div>
            <h3 className="text-sm font-semibold text-(--foreground)">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-(--muted-foreground)">
              {description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
