"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getTipsByCategory, CATEGORY_META } from "../../lib/privacyTips";

const impactStyles = {
  "Very High": "text-red-400 bg-red-500/10 border-red-500/20",
  High: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  Low: "text-green-400 bg-green-500/10 border-green-500/20",
};

const colorMap = {
  blue: {
    border: "border-l-[var(--primary)]",
    icon: "bg-[var(--primary)]/10 border-[var(--primary)]/20",
    text: "text-[var(--primary)]",
  },
  purple: {
    border: "border-l-violet-500",
    icon: "bg-violet-500/10 border-violet-500/20",
    text: "text-violet-400",
  },
  orange: {
    border: "border-l-orange-400",
    icon: "bg-orange-400/10 border-orange-400/20",
    text: "text-orange-400",
  },
  cyan: {
    border: "border-l-cyan-500",
    icon: "bg-cyan-500/10 border-cyan-500/20",
    text: "text-cyan-400",
  },
  green: {
    border: "border-l-emerald-500",
    icon: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-400",
  },
};

function CategorySection({ categoryName, tips }) {
  const [isOpen, setIsOpen] = useState(false);
  const meta = CATEGORY_META[categoryName] || {
    icon: "📋",
    color: "blue",
    description: "",
  };
  const c = colorMap[meta.color] || colorMap.blue;

  return (
    <div
      className={`bg-[var(--card)] border border-[var(--border)] border-l-4
                     ${c.border} rounded-2xl shadow-sm transition-all duration-300 ease-out`}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between
                   px-3 py-3 sm:px-5 sm:py-4
                   cursor-pointer select-none
                   hover:bg-[var(--muted)]/40 rounded-2xl
                   transition-colors duration-200"
        onClick={() => setIsOpen((p) => !p)}
      >
        {/* Left: icon + title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border
                          flex items-center justify-center
                          text-base sm:text-lg shrink-0 ${c.icon}`}
          >
            {meta.icon}
          </div>
          <div className="min-w-0">
            <p
              className="text-xs sm:text-sm font-semibold font-primary
                          text-[var(--card-foreground)] truncate"
            >
              {categoryName}
            </p>
            <p
              className={`text-[10px] sm:text-xs font-medium font-secondary mt-0.5 ${c.text}`}
            >
              {tips.length} recommendation{tips.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Right: description badge + chevron */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
          {/* Hide description on very small screens */}
          <span
            className={`hidden sm:inline-block text-[10px] sm:text-[11px]
                           px-2 py-0.5 rounded-full border font-secondary
                           ${c.text} bg-[var(--muted)] border-[var(--border)]`}
          >
            {meta.description}
          </span>
          <ChevronDown
            className={`w-4 h-4 sm:w-5 sm:h-5 text-[var(--muted-foreground)]
                        transition-transform duration-300
                        ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </div>

      {/* ── Expandable Content ── */}
      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out
                      ${isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-3 pb-3 sm:px-5 sm:pb-5">
          <div className="h-px bg-[var(--border)] mb-3 sm:mb-4" />

          {/* Tips grid:
              320px      → 1 col
              sm 640px+  → 2 col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {tips.map((tip) => {
              const badge = impactStyles[tip.impact] || impactStyles.Low;
              return (
                <div
                  key={tip.id}
                  className="flex gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-xl
                             bg-[var(--muted)] border border-[var(--border)]
                             hover:border-[var(--primary)]/30
                             transition-colors duration-200"
                >
                  {/* Emoji */}
                  <span className="text-lg sm:text-xl shrink-0 mt-0.5">
                    {tip.icon}
                  </span>

                  {/* Content */}
                  <div className="min-w-0">
                    {/* Title + badge */}
                    <div
                      className="flex items-start sm:items-center gap-1.5 sm:gap-2
                                    flex-col sm:flex-row flex-wrap mb-1"
                    >
                      <p
                        className="text-xs sm:text-sm font-semibold
                                    text-[var(--card-foreground)] font-primary leading-snug"
                      >
                        {tip.title}
                      </p>
                      <span
                        className={`text-[9px] sm:text-[10px] px-1.5 py-0.5
                                       rounded-full border font-secondary shrink-0 ${badge}`}
                      >
                        {tip.impact}
                      </span>
                    </div>

                    {/* Description */}
                    <p
                      className="text-[11px] sm:text-[12px] text-[var(--muted-foreground)]
                                  font-secondary leading-relaxed"
                    >
                      {tip.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyRecommendations({ tips, loading }) {
  const grouped = tips ? getTipsByCategory(tips) : {};
  const categories = Object.keys(grouped);

  return (
    <div
      className="bg-[var(--card)] border border-[var(--border)]
                    rounded-2xl shadow-sm
                    p-3 sm:p-4 lg:p-5"
    >
      {/* Section header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl
                       bg-[var(--primary)]/10 border border-[var(--primary)]/20
                       flex items-center justify-center text-base sm:text-lg shrink-0"
        >
          🛡️
        </div>
        <div>
          <p
            className="text-sm sm:text-base font-semibold font-primary
                        text-[var(--card-foreground)]"
          >
            Privacy Recommendations
          </p>
          <p
            className="text-[10px] sm:text-xs text-[var(--muted-foreground)]
                        font-secondary mt-0.5"
          >
            Actionable steps grouped by category to reduce your tracking risk
          </p>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 sm:h-16 bg-[var(--muted)] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {categories.map((cat) => (
            <CategorySection key={cat} categoryName={cat} tips={grouped[cat]} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8">
          <span className="text-4xl sm:text-5xl block mb-3">🏆</span>
          <p className="text-sm font-semibold text-green-400 font-primary mb-1">
            Excellent Privacy Protection!
          </p>
          <p className="text-xs text-[var(--muted-foreground)] font-secondary">
            Your browser is well configured. Your fingerprint risk is very low.
          </p>
        </div>
      )}
    </div>
  );
}
