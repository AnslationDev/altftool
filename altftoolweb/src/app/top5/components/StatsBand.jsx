"use client";

import { motion } from "framer-motion";
import { AnimatedCounter, staggerContainer, staggerItem } from "./motion";

const STATS = [
  { label: "Countries indexed", value: "195" },
  { label: "Categories", value: "15+" },
  { label: "Published rankings", value: "184K" },
  { label: "Monthly readers", value: "28M" },
  { label: "Community signals", value: "94M" },
];

export default function StatsBand() {
  return (
    <section className="relative w-full overflow-hidden bg-[#10b981] py-10 sm:py-12">
      <motion.div
        aria-hidden="true"
        animate={{ x: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-1/2 left-1/4 h-[300px] w-[300px] rounded-full bg-white/10 blur-[100px]"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 md:gap-8"
      >
        {STATS.map((stat) => (
          <motion.div key={stat.label} variants={staggerItem} className="border-t border-white/30 pt-3 sm:pt-4">
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              <AnimatedCounter value={stat.value} />
            </p>
            <p className="mt-1 text-xs sm:text-sm text-white/80">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
