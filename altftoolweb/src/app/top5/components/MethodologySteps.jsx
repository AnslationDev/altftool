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
    summary: "Every candidate is sourced before a single score is written.",
    detail:
      "We start from primary sources — official data, first-party specs, direct usage — instead of secondary roundups. A candidate needs a documented case for inclusion before it's ever scored.",
    tags: ["PRIMARY SOURCES", "CANDIDATE SOURCING"],
  },
  {
    title: "Scoring",
    summary: "A weighted rubric, applied the same way to every entry.",
    detail:
      "Each category has a fixed rubric agreed before research begins, so criteria can't be adjusted after the fact to favor a particular result. Weightings are published alongside the list.",
    tags: ["WEIGHTED CRITERIA", "EXPERT PANEL"],
  },
  {
    title: "Verification",
    summary: "Independent reviewers check every score before publication.",
    detail:
      "A second, independent reviewer re-checks sourcing and scoring on every entry. Disagreements are resolved by a third reviewer rather than the original author.",
    tags: ["FACT-CHECKED", "CROSS-REFERENCED"],
  },
  {
    title: "Publishing",
    summary: "Rankings ship with their reasoning attached, not just a list.",
    detail:
      "Every published ranking links back to the strengths, tradeoffs, and score behind each placement, and is re-reviewed on a fixed schedule rather than left static.",
    tags: ["TRANSPARENT", "SCHEDULED REVIEW"],
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
