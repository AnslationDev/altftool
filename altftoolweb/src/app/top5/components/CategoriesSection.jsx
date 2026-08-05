"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";
import {
  Cpu,
  Bot,
  Building2,
  CircleDollarSign,
  GraduationCap,
  Clapperboard,
  Music,
  BookOpen,
  Landmark,
  UtensilsCrossed,
  Sparkles,
  Car,
  TrendingUp,
  Rocket,
  Shirt,
} from "lucide-react";
import SectionHeading from "./SectionHeading";
import { Reveal, EASE, AnimatedCounter } from "./motion";
import { getAllCategories } from "../data/categories";

// Number of columns at the widest grid tier (md:grid-cols-6) — used to turn
// a flat index into a (row, col) pair so the entrance plays as a diagonal
// wave across the grid instead of a flat left-to-right cascade.
const COLS = 6;

// A bento mix instead of a flat wall of icon tiles: 4 categories get a
// larger photo-backed "spotlight" card (2x2 at md+), the rest stay compact
// icon tiles. Every photo here reuses an image already confirmed live
// elsewhere on the site (each ranking's heroImage) rather than an unverified
// new URL, cropped square for this tile.
const SPOTLIGHT_IMAGES = {
  "artificial-intelligence":
    "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=900&h=900&q=90",
  education:
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&h=900&q=90",
  automotive:
    "https://images.unsplash.com/photo-1617704548623-340376564e68?auto=format&fit=crop&w=900&h=900&q=90",
  lifestyle:
    "https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=900&h=900&q=90",
};

const ICONS = {
  Cpu,
  Bot,
  Building2,
  CircleDollarSign,
  GraduationCap,
  Clapperboard,
  Music,
  BookOpen,
  Landmark,
  UtensilsCrossed,
  Sparkles,
  Car,
  TrendingUp,
  Rocket,
  Shirt,
};

// A distinct pastel badge color per category, so the icon row reads as
// premium and colorful rather than a flat wall of gray glyphs.
const THEME = {
  technology: { bg: "bg-emerald-50", text: "text-emerald-600" },
  "artificial-intelligence": { bg: "bg-violet-50", text: "text-violet-600" },
  business: { bg: "bg-blue-50", text: "text-blue-600" },
  finance: { bg: "bg-emerald-50", text: "text-emerald-600" },
  education: { bg: "bg-amber-50", text: "text-amber-600" },
  movies: { bg: "bg-rose-50", text: "text-rose-600" },
  music: { bg: "bg-violet-50", text: "text-violet-600" },
  books: { bg: "bg-blue-50", text: "text-blue-600" },
  history: { bg: "bg-amber-50", text: "text-amber-600" },
  food: { bg: "bg-rose-50", text: "text-rose-600" },
  lifestyle: { bg: "bg-teal-50", text: "text-teal-600" },
  automotive: { bg: "bg-blue-50", text: "text-blue-600" },
  startups: { bg: "bg-emerald-50", text: "text-emerald-600" },
  space: { bg: "bg-violet-50", text: "text-violet-600" },
  fashion: { bg: "bg-rose-50", text: "text-rose-600" },
};
const DEFAULT_THEME = { bg: "bg-slate-100", text: "text-slate-500" };

export default function CategoriesSection() {
  const categories = getAllCategories();

  return (
    <section id="categories" className="w-full py-14 sm:py-20 md:py-24 bg-[#f7f8fa] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="CATEGORIES"
            heading="Every field. One standard."
            description="Move across disciplines without losing context. Each field uses its own authored preview criteria."
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-5 md:auto-rows-[150px] md:grid-cols-6 md:gap-6 md:[grid-auto-flow:dense]">
          {categories.map((category, index) => {
            const Icon = ICONS[category.icon] || Sparkles;
            const theme = THEME[category.slug] || DEFAULT_THEME;
            const spotlightSrc = SPOTLIGHT_IMAGES[category.slug];
            const row = Math.floor(index / COLS);
            const col = index % COLS;
            // Diagonal wave: cells further down-right settle in slightly later,
            // so the whole grid reads as one sweeping motion rather than a
            // flat row-by-row or column-by-column cascade.
            const waveDelay = (row + col) * 0.05;
            const idleDuration = 3 + ((index % COLS) * 0.3);
            const idleDelay = (index % COLS) * 0.22;

            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 34, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.65, delay: waveDelay, ease: EASE }}
                className={spotlightSrc ? "md:col-span-2 md:row-span-2" : ""}
              >
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: EASE }} className="h-full">
                  <Link
                    href={`/top5/category/${category.slug}`}
                    className={`group relative flex h-full overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-lg ${
                      spotlightSrc
                        ? "flex-col justify-end p-5 sm:p-6"
                        : "flex-col items-start justify-center gap-2 border border-black/5 bg-white px-4 py-6 sm:gap-3 sm:px-5 sm:py-7"
                    }`}
                  >
                    {spotlightSrc ? (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.6, ease: EASE }}
                          className="absolute inset-0"
                        >
                          <ManagedImage
                            src={spotlightSrc}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      </>
                    ) : (
                      <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10b981]/0 via-[#10b981]/0 to-[#10b981]/0 transition-colors duration-300 group-hover:from-[#10b981]/[0.06] group-hover:to-[#5ea8ff]/[0.06]"
                      />
                    )}

                    {/* Premium hover "shine" sweep, diagonal light passing over the card */}
                    <motion.span
                      aria-hidden="true"
                      initial={{ x: "-130%", opacity: 0 }}
                      whileHover={{ x: "230%", opacity: 1, transition: { duration: 0.85, ease: "easeInOut" } }}
                      className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    />

                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: idleDuration, delay: idleDelay, repeat: Infinity, ease: "easeInOut" }}
                      whileHover={{
                        rotate: [0, -10, 10, -6, 0],
                        scale: 1.08,
                        transition: { duration: 0.5, ease: "easeInOut" },
                      }}
                      className={`relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full transition-shadow duration-300 group-hover:shadow-md sm:h-11 sm:w-11 ${
                        spotlightSrc ? "mb-3 bg-white/15 backdrop-blur-sm" : theme.bg
                      }`}
                    >
                      <Icon size={18} className={spotlightSrc ? "text-white" : theme.text} />
                    </motion.span>

                    <div className="relative z-10">
                      <p
                        className={`text-sm font-semibold sm:text-base ${
                          spotlightSrc ? "text-white" : "text-[#0b1120]"
                        }`}
                      >
                        {category.name}
                      </p>
                      <p className={`text-xs sm:text-sm ${spotlightSrc ? "text-white/70" : "text-[#9ca3af]"}`}>
                        <AnimatedCounter value={category.count} /> rankings
                      </p>
                    </div>

                    <motion.span
                      aria-hidden="true"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      style={{ transformOrigin: "left" }}
                      className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[2px] ${
                        spotlightSrc ? "bg-white/70" : "bg-[#10b981]"
                      }`}
                    />
                  </Link>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
