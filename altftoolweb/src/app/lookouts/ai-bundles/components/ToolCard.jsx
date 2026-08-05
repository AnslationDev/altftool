"use client";

import { motion } from "framer-motion";
import { Check, Heart, Scale } from "lucide-react";
import { useEngagement } from "../providers/EngagementProvider";
import { useToolLaunch } from "../providers/ToolLaunchProvider";
import RatingStars from "./RatingStars";
import ToolLogo from "./ToolLogo";

const BADGE_STYLES = {
  FREE: "bg-emerald-100 text-emerald-700",
  "FREE + PAID": "bg-amber-100 text-amber-800",
  PAID: "bg-slate-200 text-slate-700",
};

/**
 * Directory card: logo tile, name, tagline, rating, pricing pill. Favorite
 * and compare controls stay understated at rest and step forward on
 * hover/focus so the resting grid reads clean, not button-heavy.
 */
export default function ToolCard({ tool, showCategory = false }) {
  const { isFavorite, toggleFavorite, addRecentlyViewed, isComparing, toggleCompare, compareList, compareLimit } = useEngagement();
  const { launchTool } = useToolLaunch();
  const hue = tool.hue || ["#8b5cf6", "#22d3ee"];
  const favorited = isFavorite(tool);
  const comparing = isComparing(tool);
  const compareDisabled = !comparing && compareList.length >= compareLimit;

  const handleOpen = (event) => {
    event.preventDefault();
    addRecentlyViewed(tool);
    launchTool(tool);
  };

  return (
    <motion.div
      className="aib-card group relative flex h-full flex-col rounded-3xl p-3"
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <motion.button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          toggleFavorite(tool);
        }}
        aria-pressed={favorited}
        aria-label={favorited ? `Remove ${tool.name} from favorites` : `Save ${tool.name} to favorites`}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ${
          favorited
            ? "bg-rose-500 text-white shadow-sm"
            : "bg-white/0 text-slate-400 opacity-0 group-hover:bg-white/95 group-hover:opacity-100 group-hover:shadow-sm group-focus-within:opacity-100 hover:text-rose-500"
        }`}
      >
        <motion.span
          initial={false}
          animate={favorited ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Heart className="h-4 w-4" fill={favorited ? "currentColor" : "none"} aria-hidden="true" />
        </motion.span>
      </motion.button>

      <a
        href={tool.url}
        onClick={handleOpen}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${tool.name} — ${tool.tagline}`}
        className="flex flex-1 flex-col rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60"
      >
        <div
          className="aib-tile relative flex h-40 items-center justify-center overflow-hidden rounded-2xl sm:h-44"
          style={{ "--aib-tile-a": `${hue[0]}1a`, "--aib-tile-b": `${hue[1]}0f` }}
        >
          {tool.popular ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
              Popular
            </span>
          ) : null}
          <span className="flex items-center justify-center rounded-2xl bg-white p-3 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 transition-transform duration-500 group-hover:scale-110">
            <ToolLogo name={tool.name} domain={tool.domain} hue={hue} size={56} />
          </span>
        </div>

        <div className="flex flex-1 flex-col px-2.5 pb-1 pt-4">
          <h3 className="text-lg font-extrabold tracking-tight text-slate-900">{tool.name}</h3>
          {showCategory && tool.categoryLabel ? (
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-teal-500">{tool.categoryLabel}</span>
          ) : null}
          <p className="mt-1.5 line-clamp-2 flex-1 text-[15px] leading-relaxed text-slate-500">{tool.tagline}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <RatingStars rating={tool.rating} />
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${BADGE_STYLES[tool.pricing] || BADGE_STYLES.FREE}`}>
              {tool.pricing}
            </span>
          </div>
        </div>
      </a>

      <motion.button
        type="button"
        onClick={() => toggleCompare(tool)}
        disabled={compareDisabled}
        aria-pressed={comparing}
        whileHover={compareDisabled ? undefined : { scale: 1.04 }}
        whileTap={compareDisabled ? undefined : { scale: 0.94 }}
        className={`mx-2.5 mb-2 mt-2.5 flex items-center justify-center gap-1.5 self-start rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
          comparing
            ? "border-teal-300 bg-teal-50 text-teal-600"
            : "border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600 disabled:pointer-events-none disabled:opacity-30"
        }`}
      >
        {comparing ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Scale className="h-3.5 w-3.5" aria-hidden="true" />}
        {comparing ? "Added to compare" : "Compare"}
      </motion.button>
    </motion.div>
  );
}
