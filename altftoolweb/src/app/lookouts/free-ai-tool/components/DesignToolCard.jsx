"use client";

import { Check, GitCompare, Heart } from "lucide-react";
import ToolLogo from "./ToolLogo";
import { useAuth } from "../providers/AuthProvider";
import { useCompare } from "../providers/CompareProvider";
import { useToolWeeklyOpens, useTrendingToolIds } from "../providers/ToolStatsProvider";
import { toolId } from "../lib/toolId";

export const TILE_BACKGROUNDS = [
  "bg-gradient-to-br from-orange-500 to-orange-600",
  "bg-gradient-to-br from-neutral-800 to-neutral-950",
  "bg-gradient-to-br from-black to-neutral-900",
  "bg-gradient-to-br from-fuchsia-400 via-purple-400 to-cyan-300",
  "bg-gradient-to-br from-purple-950 to-neutral-900",
  "bg-gradient-to-br from-blue-600 to-blue-700",
  "bg-gradient-to-br from-stone-200 to-stone-300",
  "bg-gradient-to-br from-rose-500 to-rose-600",
  "bg-gradient-to-br from-emerald-700 to-neutral-900",
  "bg-gradient-to-br from-indigo-950 to-neutral-900",
];

// Colors lifted directly from toools.design's live "pricing-tag" elements.
const PRICING_STYLES = {
  FREE: "bg-[rgba(187,255,133,0.3)]",
  PAID: "bg-[rgba(255,181,80,0.15)]",
  "FREE + PAID": "bg-[rgba(249,248,113,0.35)]",
};

const CARD_SHADOW =
  "shadow-[inset_1.5px_1.5px_1.5px_rgba(255,255,255,0.66),0_20px_40px_rgba(10,5,35,0.03)] hover:shadow-[inset_1.5px_1.5px_1.5px_rgba(255,255,255,0.66),0_20px_40px_rgba(10,5,35,0.1)]";

const COMPARE_SECTION_HEIGHT = 64;
const CARD_HEIGHT = 360 + COMPARE_SECTION_HEIGHT;
const IMAGE_HEIGHT = Math.round(CARD_HEIGHT * 0.4);

/**
 * Card body matched to toools.design's "resources-card" style (300px wide
 * fixed track so 4 fit per row, 28px radius, translucent white-to-lavender
 * gradient), with a full-width
 * "Compare" bar pinned to the bottom as a primary, always-visible action.
 * Bookmark stays a small hover-reveal icon top-right so it doesn't compete
 * with Compare for attention. bg/radius/shadow live on the outer wrapper
 * (clipped via overflow-hidden) so the "open tool" button and the compare
 * bar can be true siblings — a <button> can't nest inside another <button>.
 */
export default function DesignToolCard({ tool, index = 0, onClick, className = "" }) {
  const { isToolSaved, toggleSaveTool } = useAuth();
  const { isComparing, toggleCompare, isCompareFull } = useCompare();
  const weeklyOpens = useToolWeeklyOpens(tool);
  const trendingIds = useTrendingToolIds();
  const isTrending = trendingIds.has(toolId(tool));

  const bg = TILE_BACKGROUNDS[index % TILE_BACKGROUNDS.length];
  const pricingClass = PRICING_STYLES[tool.pricing] || "bg-[rgba(10,5,35,0.06)]";
  const saved = isToolSaved(tool);
  const comparing = isComparing(tool);

  return (
    <div
      className={`group relative flex w-full flex-col overflow-hidden rounded-[28px] bg-gradient-to-b from-white/70 to-[#fbfaff]/70 dark:from-[#1b1733]/85 dark:to-[#15122a]/85 transition-shadow ${CARD_SHADOW} ${className}`}
      style={{ height: CARD_HEIGHT }}
    >
      <button onClick={onClick} className="flex w-full flex-1 flex-col text-left p-5 pb-4">
        <div
          className={`${bg} relative w-full shrink-0 rounded-xl flex items-center justify-center overflow-hidden shadow-[0_2px_20px_rgba(10,5,35,0.03)]`}
          style={{ height: IMAGE_HEIGHT }}
        >
          {isTrending ? (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#0A0523]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              Trending
            </span>
          ) : null}
          <span className="flex items-center justify-center rounded-xl bg-white/95 p-2.5 shadow-lg shadow-black/10">
            <ToolLogo name={tool.name} domain={tool.domain} size={36} />
          </span>
        </div>

        <h3 className="mt-5 text-[22px] font-bold leading-tight text-[#0A0523]">{tool.name}</h3>
        <p className="mt-2 text-base leading-[22.4px] text-[#0A0523]/70 line-clamp-2 flex-1">
          {tool.tagline}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          {weeklyOpens > 0 ? (
            <span className="text-xs font-medium text-[#0A0523]/40">
              {weeklyOpens} {weeklyOpens === 1 ? "open" : "opens"} this week
            </span>
          ) : (
            <span />
          )}
          <span className={`inline-flex h-8 shrink-0 items-center rounded-full px-4 text-[12px] uppercase tracking-wide text-[#0A0523]/50 ${pricingClass}`}>
            {tool.pricing}
          </span>
        </div>
      </button>

      <div className="shrink-0 px-5 pb-5" style={{ height: COMPARE_SECTION_HEIGHT }}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleCompare(tool);
          }}
          disabled={!comparing && isCompareFull}
          aria-pressed={comparing}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            comparing
              ? "border-violet-600 bg-violet-600 text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)]"
              : "border-violet-200 bg-white text-[#0A0523]/70 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700"
          }`}
        >
          {comparing ? <Check className="h-4 w-4" aria-hidden="true" /> : <GitCompare className="h-4 w-4" aria-hidden="true" />}
          {comparing ? "Comparing" : "Compare"}
        </button>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          toggleSaveTool(tool);
        }}
        aria-label={saved ? `Remove ${tool.name} from saved tools` : `Save ${tool.name}`}
        aria-pressed={saved}
        className={`absolute right-7 top-7 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all ${
          saved
            ? "bg-rose-500 text-white opacity-100"
            : "bg-white/85 text-[#0A0523]/50 opacity-0 hover:bg-white hover:text-rose-500 group-hover:opacity-100"
        }`}
      >
        <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
