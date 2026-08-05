"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal, PetalBurst } from "./motion";

// The reference video's closing "Let's talk about it" beat: a small seal CTA
// sitting beside a huge two-line gradient serif statement. Ours points at
// the categories directory instead of a contact form.
export default function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-[#0b0f1a] py-16 sm:py-24 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 text-[4rem] font-black tracking-tighter text-white/[0.03] sm:text-[8rem] md:text-[12rem] whitespace-nowrap"
      >
        FIND YOUR FIVE
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-start gap-6 sm:gap-8 sm:flex-row sm:items-center">
          <Reveal>
            <Link
              href="/top5/categories"
              className="group flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-center text-xs font-bold leading-tight text-[#0b1120] transition-colors hover:bg-[#10b981] hover:text-white sm:h-24 sm:w-24 md:h-28 md:w-28"
            >
              Start
              <br />
              exploring
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Find your
              <br />
              <span className="font-[family-name:var(--font-top5-display)] italic bg-[linear-gradient(90deg,#67e8b8,#5ea8ff,#a78bfa)] bg-clip-text text-transparent">
                top 5.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.2} className="ml-0 sm:ml-auto">
            <motion.div whileHover={{ rotate: 20 }} transition={{ duration: 0.4 }}>
              <PetalBurst className="h-14 w-14 text-white/20 sm:h-16 sm:w-16 md:h-20 md:w-20" />
            </motion.div>
          </Reveal>
        </div>

        <Reveal delay={0.3} className="mt-8 sm:mt-12">
          <p className="max-w-lg text-sm sm:text-base text-white/60 leading-relaxed">
            Every preview list on Top5 is free to browse and keeps its authored
            criteria, scores, and tradeoffs visible. Start with a category, or
            jump straight into whatever you&apos;re curious about.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="mt-5 sm:mt-6 inline-block">
            <Link
              href="/top5/categories"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 sm:px-6 sm:py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#0b1120]"
            >
              Browse every list
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
