"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { Reveal, staggerContainer, staggerItem, EASE } from "./motion";
import { getAllRankings } from "../data/rankings";

// How many rows are visible before "Show more" expands the rest.
const VISIBLE_COUNT = 7;

function PopularRow({ item, index }) {
  return (
    <Link
      href={`/top5/item/${item.slug}`}
      className="group relative flex items-center gap-3 sm:gap-5 md:gap-8 py-4 sm:py-5 border-b border-black/10 overflow-hidden"
    >
      <motion.span
        aria-hidden="true"
        initial={{ x: "-100%" }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 bg-[#f7f8fa]"
      />
      <span className="relative z-10 w-5 sm:w-6 shrink-0 text-xs sm:text-sm text-[#9ca3af]">
        {String(index + 1).padStart(2, "0")}
      </span>

      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 h-12 w-12 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg"
      >
        <ManagedImage
          src={item.cardImage}
          alt={item.title}
          className="h-full w-full object-cover"
        />
      </motion.div>

      <div className="relative z-10 min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-widest text-[#10b981]">
          {item.category.toUpperCase()}
        </p>
        <h3 className="mt-1 truncate text-sm sm:text-base md:text-xl font-bold text-[#0b1120] group-hover:text-[#5ea8ff] transition-colors">
          {item.title}
        </h3>
      </div>

      <div className="relative z-10 hidden sm:block text-right shrink-0">
        <p className="text-sm font-semibold text-[#0b1120]">{item.views}</p>
        <p className="text-xs text-[#9ca3af]">views</p>
      </div>

      <motion.span
        whileHover={{ rotate: 45 }}
        className="relative z-10 flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#0b1120] group-hover:bg-[#0b1120] group-hover:text-white transition-colors"
      >
        <ArrowUpRight size={16} />
      </motion.span>
    </Link>
  );
}

export default function PopularSection() {
  const rankings = getAllRankings();
  const [expanded, setExpanded] = useState(false);

  const visibleItems = rankings.slice(0, VISIBLE_COUNT);
  const hiddenItems = rankings.slice(VISIBLE_COUNT);

  return (
    <section className="w-full py-14 sm:py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            index="04"
            eyebrow="POPULAR THIS WEEK"
            heading="The conversation, ranked."
          />
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-8 sm:mt-12 border-t border-black/10"
        >
          {visibleItems.map((item, index) => (
            <motion.div key={item.slug} variants={staggerItem}>
              <PopularRow item={item} index={index} />
            </motion.div>
          ))}
        </motion.div>

        {/* The remaining rows unfold smoothly instead of rendering a huge
            list up front; each revealed row cascades in. */}
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="more-rows"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.6, ease: EASE },
                opacity: { duration: 0.4, ease: EASE },
              }}
              className="overflow-hidden"
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                {hiddenItems.map((item, index) => (
                  <motion.div key={item.slug} variants={staggerItem}>
                    <PopularRow item={item} index={VISIBLE_COUNT + index} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {hiddenItems.length > 0 ? (
          <Reveal delay={0.1} className="mt-8 flex justify-center">
            <motion.button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: EASE }}
              aria-expanded={expanded}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#0b1120] hover:bg-[#f7f8fa] transition-colors"
            >
              {expanded ? "Show less" : `Show ${hiddenItems.length} more`}
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="inline-flex"
              >
                <ChevronDown size={16} />
              </motion.span>
            </motion.button>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
