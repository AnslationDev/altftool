"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Eye, Star } from "lucide-react";
import { getHighestRatedTools, getMostSavedTools, getMostVisitedTools } from "../data/tools";
import { useToolLaunch } from "../providers/ToolLaunchProvider";
import RatingStars from "./RatingStars";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import ToolLogo from "./ToolLogo";

function formatCount(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

const TABS = [
  { id: "rated", label: "Highest rated", icon: Star },
  { id: "saved", label: "Most saved", icon: Bookmark },
  { id: "visited", label: "Most visited", icon: Eye },
];

/** Section 6 — Highest Rated / Most Saved / Most Visited leaderboard tabs. */
export default function CommunityFavoritesSection() {
  const [activeTab, setActiveTab] = useState("rated");
  const { launchTool } = useToolLaunch();

  const rows =
    activeTab === "saved" ? getMostSavedTools() : activeTab === "visited" ? getMostVisitedTools() : getHighestRatedTools(10);

  return (
    <section id="community" aria-label="Community favorites" className="scroll-mt-24 bg-white/70 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <SectionHeading eyebrow="Loved by the community" title="Community favorites" subtitle="What real users rate, save, and visit the most." />
        </Reveal>

        <div className="mx-auto mt-8 flex max-w-2xl justify-center gap-2">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-600"
              }`}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <ol className="aib-card mt-8 divide-y divide-slate-100 overflow-hidden rounded-3xl">
          {rows.map((tool, index) => (
            <motion.li
              key={`${activeTab}-${tool.name}-${tool.domain}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.24), ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ backgroundColor: "rgba(15, 23, 42, 0.03)" }}
            >
              <a
                href={tool.url}
                onClick={(event) => {
                  event.preventDefault();
                  launchTool(tool);
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <span className="w-6 shrink-0 text-center text-sm font-bold text-slate-300">{index + 1}</span>
                <ToolLogo name={tool.name} domain={tool.domain} hue={tool.hue} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-900">{tool.name}</span>
                  <span className="block truncate text-xs text-slate-500">{tool.categoryLabel}</span>
                </span>
                {activeTab === "saved" ? (
                  <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-rose-500">
                    <Bookmark className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
                    {formatCount(tool.saves)}
                  </span>
                ) : activeTab === "visited" ? (
                  <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-600">
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatCount(tool.visits)}
                  </span>
                ) : (
                  <RatingStars rating={tool.rating} />
                )}
              </a>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
