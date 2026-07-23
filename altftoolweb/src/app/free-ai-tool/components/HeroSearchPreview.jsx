"use client";

import { motion } from "framer-motion";
import { ArrowRight, SearchX } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import ToolLogo from "./ToolLogo";

/** Live results dropdown anchored under the hero search bar. */
export default function HeroSearchPreview({ results, totalCount, query, onSelectResult, onViewAll }) {
  const { requireAuth } = useAuth();
  const empty = results.length === 0;

  const handleResultClick = (event, tool) => {
    event.preventDefault();
    onSelectResult();
    requireAuth(() => window.open(tool.url, "_blank", "noopener,noreferrer"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fat-card absolute inset-x-0 top-[calc(100%+0.75rem)] z-30 overflow-hidden rounded-2xl p-2 text-left shadow-2xl shadow-slate-300/60"
      role="listbox"
      aria-label="Live search results"
    >
      {empty ? (
        <div className="flex flex-col items-center px-4 py-8 text-center">
          <SearchX className="h-6 w-6 text-slate-300" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-slate-500">
            Nothing matches “{query}” yet — try a broader term.
          </p>
        </div>
      ) : (
        <>
          <ul>
            {results.map((tool) => (
              <li key={`${tool.name}-${tool.domain}`}>
                <a
                  href={tool.url}
                  onClick={(event) => handleResultClick(event, tool)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-violet-50"
                >
                  <ToolLogo name={tool.name} domain={tool.domain} hue={tool.hue} size={32} className="shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{tool.name}</span>
                    <span className="block truncate text-xs text-slate-500">{tool.tagline}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {tool.categoryLabel}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {totalCount > results.length ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onViewAll}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-50 px-3 py-2.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100"
            >
              View all {totalCount} results
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </>
      )}
    </motion.div>
  );
}
