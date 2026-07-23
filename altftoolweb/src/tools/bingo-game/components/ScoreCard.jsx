"use client";

import { motion } from "framer-motion";

export default function ScoreCard({ label, value }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3.5 sm:p-4 text-center backdrop-blur-md shadow-md text-[var(--foreground)]"
    >
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-[var(--foreground)] sm:text-3xl">
        {value}
      </p>
    </motion.div>
  );
}
