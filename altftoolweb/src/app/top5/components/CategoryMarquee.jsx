"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
import { getAllCategories } from "../data/categories";

// The reference video's client-logo marquee, translated into a strip of the
// site's own categories — a quiet, ambient beat between the hero and the
// countdown showcase. Pure framer-motion x-loop, no global CSS keyframes
// added, so it can't affect anything outside this component.
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

export default function CategoryMarquee() {
  const reduceMotion = useReducedMotion();
  const categories = getAllCategories();
  const loop = [...categories, ...categories];

  return (
    <div className="relative w-full overflow-hidden border-y border-border bg-page py-7">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-page to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-page to-transparent sm:w-28" />

      <motion.div
        className="flex w-max items-center gap-10 sm:gap-14"
        animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={reduceMotion ? undefined : { duration: 32, repeat: Infinity, ease: "linear" }}
      >
        {loop.map((category, index) => {
          const Icon = ICONS[category.icon] || Sparkles;
          return (
            <Link
              key={`${category.slug}-${index}`}
              href={`/top5/category/${category.slug}`}
              className="group flex shrink-0 items-center gap-2.5 text-foreground-soft transition-colors hover:text-foreground"
            >
              <Icon size={16} className="shrink-0 text-foreground-soft transition-colors group-hover:text-primary-text" />
              <span className="whitespace-nowrap text-sm font-semibold tracking-wide">
                {category.name}
              </span>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
