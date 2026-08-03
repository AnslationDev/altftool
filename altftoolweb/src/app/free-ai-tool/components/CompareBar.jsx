"use client";

import { X } from "lucide-react";
import ToolLogo from "./ToolLogo";
import { useCompare } from "../providers/CompareProvider";

/** Floating bottom tray — fills up as tools are added via each card's
 *  compare toggle, and launches CompareModal once 2+ are selected. */
export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare, openCompareModal, maxCompare } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] flex justify-center px-4 pb-4 sm:pb-6">
      <div className="flex w-full max-w-2xl items-center gap-3 sm:gap-4 rounded-[24px] bg-white/95 backdrop-blur-md p-3 pl-4 sm:pl-5 shadow-[0_20px_60px_-15px_rgba(10,5,35,0.35)] ring-1 ring-black/5">
        <div className="flex items-center gap-2">
          {compareList.map((tool) => (
            <div key={tool.name} className="group relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                <ToolLogo name={tool.name} domain={tool.domain} size={22} />
              </span>
              <button
                type="button"
                onClick={() => removeFromCompare(tool)}
                aria-label={`Remove ${tool.name} from comparison`}
                className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0A0523] text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-2.5 w-2.5" aria-hidden="true" />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, maxCompare - compareList.length) }).map((_, i) => (
            <span
              key={i}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-xs text-slate-300"
            >
              +
            </span>
          ))}
        </div>

        <p className="hidden flex-1 text-sm font-medium text-[#0A0523]/60 sm:block">
          {compareList.length < 2 ? "Add one more tool to compare" : `Comparing ${compareList.length} tools`}
        </p>

        <button
          type="button"
          onClick={clearCompare}
          className="whitespace-nowrap text-sm font-semibold text-[#0A0523]/50 transition-colors hover:text-[#0A0523]"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={openCompareModal}
          disabled={compareList.length < 2}
          className="whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          Compare
        </button>
      </div>
    </div>
  );
}
