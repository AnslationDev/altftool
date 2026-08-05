"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal, EASE } from "./motion";

// The reference video's "Our Approach" beat: a parens eyebrow, a serif
// statement heading, then a click-to-expand row list — reusing the same
// expand/collapse language RankedItemsList already uses elsewhere on this
// microsite, just at the section level instead of per-item.
const STEPS = [
  {
    title: "Research",
    summary: "The production workflow starts by documenting each candidate.",
    detail:
      "The current entries are illustrative. A publishable version should attach primary sources, first-party specifications, and a documented inclusion case before scoring.",
    tags: ["SOURCE PLAN", "CANDIDATE RECORD"],
  },
  {
    title: "Scoring",
    summary: "A visible weighted rubric is attached to every demo ranking.",
    detail:
      "Each category publishes its authored criteria and weights. The numbers demonstrate the scoring model; they are not presented as independently validated measurements.",
    tags: ["WEIGHTED CRITERIA", "VISIBLE RUBRIC"],
  },
  {
    title: "Review readiness",
    summary: "Every entry exposes the notes a future reviewer would need.",
    detail:
      "This preview has not completed a second- or third-reviewer workflow. Production records should add source checks, reviewer identity, and a resolution trail for disagreements.",
    tags: ["REVIEW READY", "SOURCE GAPS"],
  },
  {
    title: "Publishing",
    summary: "Preview rankings keep their reasoning attached, not just a list.",
    detail:
      "Each page shows strengths, tradeoffs, and the score behind a placement. The preview is not maintained on a live or fixed review schedule.",
    tags: ["TRANSPARENT", "DEMO DATA"],
  },
];

export default function MethodologySteps() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="w-full bg-[#f7f8fa] py-14 sm:py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-1 sm:px-5 sm:py-1.5 text-xs font-semibold tracking-widest text-[#0b1120]">
              ( OUR METHODOLOGY )
            </span>
            <h2 className="mt-4 sm:mt-6 max-w-xl text-3xl font-semibold leading-[1.1] tracking-tight text-[#0b1120] sm:text-4xl md:text-5xl">
              Four steps.{" "}
              <span className="font-[family-name:var(--font-top5-display)] italic text-[#10b981]">
                One standard.
              </span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-10 sm:mt-14 border-t border-black/10">
          {STEPS.map((step, index) => {
            const isOpen = index === openIndex;
            return (
              <Reveal key={step.title} delay={index * 0.05} className="border-b border-black/10">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="group flex w-full items-center justify-between gap-3 sm:gap-6 py-5 sm:py-7 text-left"
                >
                  <div className="flex items-baseline gap-3 sm:gap-5 md:gap-8 min-w-0">
                    <span className="text-xs sm:text-sm text-[#9ca3af] shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`truncate text-lg font-semibold transition-colors sm:text-2xl md:text-3xl ${
                        isOpen ? "text-[#0b1120]" : "text-[#4b5563] group-hover:text-[#0b1120]"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[#0b1120] group-hover:border-[#10b981] group-hover:text-[#10b981] transition-colors"
                  >
                    <Plus size={16} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-4 pb-6 sm:pb-8 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-10 sm:pl-[3.75rem]">
                        <div>
                          <p className="font-medium text-[#0b1120]">{step.summary}</p>
                          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6b7280]">
                            {step.detail}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          {step.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#4b5563]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
