"use client";

import { Check, GitCompare, Heart } from "lucide-react";
import ToolLogo from "./ToolLogo";
import { TILE_BACKGROUNDS } from "./DesignToolCard";
import { useAuth } from "../providers/AuthProvider";
import { useCompare } from "../providers/CompareProvider";
import { useTrendingToolIds } from "../providers/ToolStatsProvider";
import { toolId } from "../lib/toolId";

const PRICING_STYLES = {
  FREE: "bg-[rgba(187,255,133,0.3)]",
  PAID: "bg-[rgba(255,181,80,0.15)]",
  "FREE + PAID": "bg-[rgba(249,248,113,0.35)]",
};

const CARD_SHADOW =
  "shadow-[inset_1.5px_1.5px_1.5px_rgba(255,255,255,0.66),0_20px_40px_rgba(10,5,35,0.03)] hover:shadow-[inset_1.5px_1.5px_1.5px_rgba(255,255,255,0.66),0_20px_40px_rgba(10,5,35,0.1)]";

/**
 * Row-style card — square logo tile on the left, title/description/pricing
 * on the right — as an alternative to DesignToolCard's stacked layout. Same
 * bookmark + Compare actions, tucked into a hover-reveal cluster in the
 * corner so they don't compete with the reference's clean look. Grid-driven
 * (fixed track width, auto-fill), so adding more tools to a category just
 * wraps more rows — no layout changes needed as the catalog grows.
 */
export default function DesignToolCardHorizontal({ tool, index = 0, onClick, className = "" }) {
  const { isToolSaved, toggleSaveTool } = useAuth();
  const { isComparing, toggleCompare, isCompareFull } = useCompare();
  const trendingIds = useTrendingToolIds();
  const isTrending = trendingIds.has(toolId(tool));

  const bg = TILE_BACKGROUNDS[index % TILE_BACKGROUNDS.length];
  const pricingClass = PRICING_STYLES[tool.pricing] || "bg-[rgba(10,5,35,0.06)]";
  const saved = isToolSaved(tool);
  const comparing = isComparing(tool);

  return (
    <div
      className={`group relative flex w-full gap-4 sm:gap-5 rounded-2xl bg-gradient-to-b from-white/70 to-[#fbfaff]/70 p-4 sm:p-5 transition-shadow ${CARD_SHADOW} ${className}`}
    >
      <button onClick={onClick} className="flex flex-1 items-start gap-4 sm:gap-5 text-left">
        <div
          className={`${bg} relative h-[130px] w-[130px] sm:h-[150px] sm:w-[150px] shrink-0 rounded-2xl flex items-center justify-center overflow-hidden shadow-[0_2px_20px_rgba(10,5,35,0.03)]`}
        >
          {isTrending ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#0A0523]/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              Trending
            </span>
          ) : null}
          <span className="flex items-center justify-center rounded-xl bg-white/95 p-2.5 shadow-lg shadow-black/10">
            <ToolLogo name={tool.name} domain={tool.domain} size={32} />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col self-stretch py-1">
          <h4 className="text-lg sm:text-xl font-bold leading-tight text-[#0A0523]">{tool.name}</h4>
          <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-[#0A0523]/70 line-clamp-3 flex-1">
            {tool.tagline}
          </p>
          <div className="mt-3 flex justify-end">
            <span className={`inline-flex h-7 shrink-0 items-center rounded-full px-3.5 text-[11px] font-bold uppercase tracking-wide text-[#0A0523]/50 ${pricingClass}`}>
              {tool.pricing}
            </span>
          </div>
        </div>
      </button>

      <div className="absolute right-4 top-4 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleSaveTool(tool);
          }}
          aria-label={saved ? `Remove ${tool.name} from saved tools` : `Save ${tool.name}`}
          aria-pressed={saved}
          className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all ${
            saved
              ? "bg-rose-500 text-white opacity-100"
              : "bg-white/85 text-[#0A0523]/50 opacity-0 hover:bg-white hover:text-rose-500 group-hover:opacity-100"
          }`}
        >
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleCompare(tool);
          }}
          disabled={!comparing && isCompareFull}
          aria-pressed={comparing}
          aria-label={comparing ? `Remove ${tool.name} from comparison` : `Add ${tool.name} to comparison`}
          className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
            comparing
              ? "bg-violet-600 text-white opacity-100"
              : "bg-white/85 text-[#0A0523]/50 opacity-0 hover:bg-white hover:text-violet-700 group-hover:opacity-100"
          }`}
        >
          {comparing ? <Check className="h-4 w-4" aria-hidden="true" /> : <GitCompare className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
