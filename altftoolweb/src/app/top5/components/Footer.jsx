"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "./motion";

const COLUMNS = [
  {
    heading: "EXPLORE",
    links: [
      { label: "Trending", href: "/top5#trending" },
      { label: "Categories", href: "/top5/categories" },
    ],
  },
  {
    heading: "COMPANY",
    links: [
      { label: "About", href: "/top5" },
      { label: "Methodology", href: "/top5#methodology" },
      { label: "Editorial", href: "/top5#trending" },
    ],
  },
  {
    heading: "COMMUNITY",
    links: [
      { label: "Editorial picks", href: "/top5#editorial-picks" },
      { label: "Suggest a list", href: "/top5" },
      { label: "Newsletter", href: "/top5#newsletter" },
    ],
  },
  {
    heading: "LEGAL",
    links: [
      { label: "Privacy", href: "/top5" },
      { label: "Terms", href: "/top5" },
      { label: "Accessibility", href: "/top5" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#070b16] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 relative z-10">
        <Reveal className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <Link href="/top5" className="flex items-center gap-0.5">
              <span className="text-lg font-black tracking-tight text-white">TOP</span>
              <span className="text-lg font-black tracking-tight text-[#10b981]">5</span>
            </Link>
            <p className="mt-4 text-sm text-white/50 max-w-xs">
              The global discovery and ranking platform for everything worth
              knowing.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-xs font-semibold tracking-wider text-white/40">
                {column.heading}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <motion.span whileHover={{ x: 4 }} className="inline-block">
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </motion.span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-white/40">Top5 Global Index / 2026</p>
          <p className="text-xs text-white/40">Made for better discovery.</p>
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none select-none absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10rem] sm:text-[13rem] font-black tracking-tighter text-white/[0.04] whitespace-nowrap"
      >
        TOP5
      </motion.div>
    </footer>
  );
}
