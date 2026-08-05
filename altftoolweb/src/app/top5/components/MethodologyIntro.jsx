"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal, PetalBurst } from "./motion";

// The reference video's "What We Do" beat: a parens-bracketed eyebrow, a
// two-tone statement headline, and a spinning flower mark beside the copy.
// Preview copy only — describes the structure the finished editorial workflow
// is intended to use. Nothing here claims that independent review has occurred.
export default function MethodologyIntro() {
  return (
    <section className="w-full overflow-hidden bg-white py-14 sm:py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <span className="inline-flex items-center rounded-full border border-black/10 px-4 py-1 sm:px-5 sm:py-1.5 text-xs font-semibold tracking-widest text-[#0b1120]">
            ( HOW WE RANK )
          </span>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mt-6 sm:mt-8 max-w-3xl text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="font-semibold text-[#0b1120]">
              A clear structure,{" "}
            </span>
            <span className="font-[family-name:var(--font-top5-display)] italic text-[#9ca3af]">
              visible every time.
            </span>
          </h2>
        </Reveal>

        <div className="mt-10 sm:mt-16 grid gap-8 sm:gap-10 md:grid-cols-[auto_1fr] md:items-start md:gap-16">
          <Reveal delay={0.15}>
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.4 }}>
              <PetalBurst className="h-16 w-16 text-[#0b1120] sm:h-20 sm:w-20 md:h-24 md:w-24" />
            </motion.div>
          </Reveal>

          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2">
            <Reveal delay={0.2}>
              <p className="text-[#4b5563] leading-relaxed">
                This preview demonstrates a repeatable structure for candidate
                sourcing, weighted scoring, and review notes. It does not
                represent completed independent verification.
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <p className="text-[#4b5563] leading-relaxed">
                Each demo entry keeps its authored score, strengths, tradeoffs,
                and reasoning visible so sourced editorial records can replace
                the preview data without changing the page structure.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.3} className="mt-8 sm:mt-12">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
            <Link
              href="/top5#methodology"
              className="inline-flex items-center gap-2 rounded-full bg-[#0b1120] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#10b981]"
            >
              See full methodology
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15"
              >
                <ArrowRight size={13} />
              </motion.span>
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
