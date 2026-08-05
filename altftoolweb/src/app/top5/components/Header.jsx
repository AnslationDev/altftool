"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const NAV_LINKS = [
  { label: "Trending", href: "/top5#trending" },
  { label: "Categories", href: "/top5/categories" },
  { label: "New & notable", href: "/top5#featured" },
];

export default function Header() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur"
    >
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-6">
        <Link href="/top5" className="flex items-center gap-0.5 shrink-0">
          <motion.span whileHover={{ y: -2 }} className="text-xl font-black tracking-tight text-[#0b1120]">
            TOP
          </motion.span>
          <motion.span
            whileHover={{ y: -2, rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.4 }}
            className="text-xl font-black tracking-tight text-[#10b981]"
          >
            5
          </motion.span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative text-sm text-[#4b5563] hover:text-[#0b1120] transition-colors"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#10b981] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="shrink-0">
          <Link
            href="/top5/categories"
            className="flex items-center gap-2 rounded-full bg-[#f3f4f6] px-4 py-2 text-sm text-[#4b5563] hover:bg-[#e5e7eb] transition-colors"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search</span>
            <span className="hidden sm:inline text-[#9ca3af]">/</span>
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
}
