"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ToolLogo from "./ToolLogo";

export default function HeroSearchPreview({ results, totalCount, query, onSelectResult, onViewAll }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="aib-glass-dark absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl shadow-xl shadow-black/40"
    >
      {results.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-slate-400">No tools match &ldquo;{query}&rdquo; yet.</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {results.map((tool) => (
            <li key={`${tool.name}-${tool.domain}`}>
              <motion.a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onSelectResult}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/5"
              >
                <ToolLogo name={tool.name} domain={tool.domain} hue={tool.hue} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{tool.name}</span>
                  <span className="block truncate text-xs text-slate-400">{tool.categoryLabel}</span>
                </span>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300">
                  {tool.pricing}
                </span>
              </motion.a>
            </li>
          ))}
        </ul>
      )}
      {totalCount > results.length ? (
        <motion.button
          type="button"
          onClick={onViewAll}
          whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-1.5 border-t border-white/10 px-5 py-3 text-sm font-semibold text-teal-300"
        >
          View all {totalCount} results
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </motion.button>
      ) : null}
    </motion.div>
  );
}
