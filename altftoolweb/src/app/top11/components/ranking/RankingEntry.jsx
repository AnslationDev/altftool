"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import RankMetric from "../ui/RankMetric";

export default function RankingEntry({ entry, index }) {
  const [expanded, setExpanded] = useState(index < 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
      className="border-t border-slate-300 py-10 md:py-14"
    >
      <div className="grid gap-7 lg:grid-cols-[100px_1fr_230px] lg:gap-10">
        {/* Rank number */}
        <div className="flex items-start justify-between lg:block">
          <span
            className={`text-6xl font-semibold tracking-[-0.08em] ${index === 0 ? "text-blue-600" : "text-slate-300"}`}
          >
            #{index + 1}
          </span>
          {index === 0 && (
            <span className="mt-4 hidden w-fit rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 lg:block">
              Top choice
            </span>
          )}
          <span className="text-xs font-bold text-slate-400 lg:hidden">
            Score {entry.score}
          </span>
        </div>

        {/* Main content */}
        <div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-3xl font-semibold tracking-[-0.045em] text-slate-950 md:text-5xl">
              {entry.name}
            </h2>
            <span className="text-sm text-slate-400">by {entry.company}</span>
          </div>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
            {entry.fact}
          </p>
          <button
            onClick={() => setExpanded((value) => !value)}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
          >
            {expanded ? "Hide analysis" : "View full analysis"}
            <ChevronDown
              className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-8 grid gap-7 border-l-2 border-blue-100 pl-6 md:grid-cols-2">
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-900">
                      Why it ranks here
                    </p>
                    <p className="text-sm leading-6 text-slate-500">
                      It combines capability, thoughtful product design, and
                      reliable day-to-day utility better than most of its peers.
                      Our panel also rated its pace of improvement highly.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                        Strengths
                      </p>
                      <ul className="space-y-2 text-sm text-slate-500">
                        <li>Versatile workflow</li>
                        <li>Refined experience</li>
                      </ul>
                    </div>
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-rose-700">
                        Tradeoffs
                      </p>
                      <ul className="space-y-2 text-sm text-slate-500">
                        <li>Premium limits</li>
                        <li>Needs review</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Score card */}
        <div className="rounded-2xl bg-slate-50 p-5 lg:self-start">
          <div className="flex items-end justify-between border-b border-slate-200 pb-5">
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Top11 score
              </span>
              <span className="mt-1 block text-3xl font-semibold tracking-[-0.05em]">
                {entry.score}
              </span>
            </span>
            <span className="text-sm text-slate-400">/10</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-5">
            <RankMetric label="Best for" value={entry.best.replace("Best ", "")} />
            <RankMetric label="Global reach" value={`${94 - index * 2}%`} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
