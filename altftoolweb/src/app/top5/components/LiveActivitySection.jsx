"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { Reveal, staggerContainer, staggerItem } from "./motion";
import { getRanking } from "../data/rankings";

const RECENT_UPDATES = [
  { slug: "global-universities", time: "12 MIN AGO", note: "Methodology and 2026 research output updated" },
  { slug: "ai-tools", time: "2 HRS AGO", note: "New capability testing and pricing review" },
  { slug: "electric-cars", time: "TODAY", note: "Range, availability, and owner scores refreshed" },
  { slug: "football-players", time: "YESTERDAY", note: "Latest match data and form index added" },
];

const COMMUNITY_FAVORITES = [
  { title: "Design studios defining a new visual culture", saves: "32.8K saves" },
  { title: "Independent hotels worth planning a trip around", saves: "27.1K saves" },
  { title: "Books every product leader should revisit", saves: "22.6K saves" },
  { title: "The most liveable small cities in Europe", saves: "19.4K saves" },
];

export default function LiveActivitySection() {
  return (
    <section className="w-full py-14 sm:py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16">
        <div>
          <Reveal>
            <p className="text-xs font-semibold tracking-widest text-[#10b981]">
              05 / RECENTLY UPDATED
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#0b1120]">
              Fresh context, clearly marked.
            </h2>
          </Reveal>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-8 sm:mt-10 space-y-6 sm:space-y-8"
          >
            {RECENT_UPDATES.map((update) => {
              const ranking = getRanking(update.slug);
              if (!ranking) return null;
              return (
                <motion.li key={update.slug} variants={staggerItem} className="relative pl-6">
                  <motion.span
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[#10b981]"
                  />
                  <p className="text-xs font-semibold tracking-widest text-[#10b981]">
                    {update.time}
                  </p>
                  <Link
                    href={`/top5/item/${update.slug}`}
                    className="mt-1 block font-bold text-[#0b1120] hover:text-[#5ea8ff] transition-colors"
                  >
                    {ranking.shortLabel}
                  </Link>
                  <p className="text-sm text-[#6b7280]">{update.note}</p>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        <div>
          <Reveal delay={0.1}>
            <p className="text-xs font-semibold tracking-widest text-[#10b981]">
              06 / COMMUNITY FAVORITES
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#0b1120]">
              Saved by people with taste.
            </h2>
          </Reveal>

          <motion.ul
            id="community"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-8 sm:mt-10 divide-y divide-black/10 scroll-mt-20"
          >
            {COMMUNITY_FAVORITES.map((fav, index) => (
              <motion.li
                key={fav.title}
                variants={staggerItem}
                whileHover={{ x: 6 }}
                className="flex items-center justify-between gap-4 py-5"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <span className="text-sm text-[#9ca3af] pt-0.5">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-[#0b1120] truncate">{fav.title}</p>
                    <p className="text-sm text-[#9ca3af]">{fav.saves}</p>
                  </div>
                </div>
                <motion.span whileHover={{ scale: 1.2, color: "#10b981" }}>
                  <Bookmark size={18} className="shrink-0 text-[#d1d5db]" />
                </motion.span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
