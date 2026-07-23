"use client";

import { motion } from "framer-motion";
import { TOOL_CATEGORIES } from "../data/tools";

/**
 * Sticky desktop category rail. The active highlight is a shared framer-motion
 * layout element, so it glides between rows instead of jumping.
 */
export default function CategorySidebar({ activeId, onSelect, muted = false }) {
  return (
    <nav aria-label="AI tool categories" className="fat-glass flex h-full flex-col rounded-3xl p-3 shadow-sm">
      <p className="shrink-0 px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        Categories
      </p>
      <ul className="fat-scrollbar min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
        {TOOL_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = !muted && category.id === activeId;
          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => onSelect(category.id)}
                aria-current={isActive ? "true" : undefined}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ${
                  isActive ? "text-slate-900" : "text-slate-500 hover:bg-slate-900/[0.04] hover:text-slate-800"
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="fat-active-category"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    className="absolute inset-0 rounded-xl border border-slate-900/10"
                    style={{
                      backgroundImage: `linear-gradient(120deg, ${category.hue[0]}26, ${category.hue[1]}14)`,
                    }}
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${category.hue[0]}22, ${category.hue[1]}14)`,
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: category.hue[0] }} aria-hidden="true" />
                </span>
                <span className="relative flex-1 truncate text-sm font-medium">{category.label}</span>
                <span
                  className={`relative rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    isActive ? "bg-slate-900/10 text-slate-900" : "bg-slate-900/5 text-slate-500"
                  }`}
                >
                  {category.tools.length}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
