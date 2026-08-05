"use client";

import { Fragment, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import ToolLogo from "./ToolLogo";
import RatingStars from "./RatingStars";
import { useCompare } from "../providers/CompareProvider";
import { useAuth } from "../providers/AuthProvider";
import { useToolStats } from "../providers/ToolStatsProvider";
import { recordToolOpen } from "../lib/toolStats";
import { toolId } from "../lib/toolId";

const PRICING_STYLES = {
  FREE: "bg-[rgba(187,255,133,0.3)]",
  PAID: "bg-[rgba(255,181,80,0.15)]",
  "FREE + PAID": "bg-[rgba(249,248,113,0.35)]",
};

/**
 * Five comparison rows. "Popularity" is opens recorded on AltFTool itself
 * (our own click-through data — see ToolStatsProvider), not third-party
 * traffic for the tool's own site, which no public API exposes.
 */
function buildRows(weeklyOpensFor) {
  return [
    {
      label: "Pricing",
      render: (tool) => (
        <span
          className={`inline-flex h-7 items-center rounded-full px-3 text-[11px] font-bold uppercase tracking-wide text-[#0A0523]/60 ${
            PRICING_STYLES[tool.pricing] || "bg-slate-100"
          }`}
        >
          {tool.pricing}
        </span>
      ),
    },
    {
      label: "Rating",
      render: (tool) => <RatingStars rating={tool.rating} size={13} />,
    },
    {
      label: "Popularity",
      render: (tool) => {
        const opens = weeklyOpensFor(tool);
        return (
          <span className="text-sm font-semibold text-[#0A0523]">
            {opens > 0 ? `${opens} ${opens === 1 ? "open" : "opens"} this week` : "No opens yet"}
          </span>
        );
      },
    },
    {
      label: "Category",
      render: (tool) => <span className="text-sm font-semibold text-[#0A0523]/70">{tool.category}</span>,
    },
    {
      label: "About",
      render: (tool) => <span className="text-sm leading-relaxed text-[#0A0523]/60">{tool.tagline}</span>,
    },
  ];
}

export default function CompareModal() {
  const { compareList, modalOpen, closeCompareModal, removeFromCompare } = useCompare();
  const { requireAuth } = useAuth();
  const { counts } = useToolStats();

  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeCompareModal();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modalOpen, closeCompareModal]);

  if (!modalOpen || typeof document === "undefined") return null;

  const weeklyOpensFor = (tool) => counts.get(toolId(tool)) || 0;
  const rows = buildRows(weeklyOpensFor);

  const handleOpenTool = (tool) => {
    requireAuth(() => {
      recordToolOpen(tool);
      window.open(tool.url, "_blank", "noopener,noreferrer");
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-[#0A0523]/50 backdrop-blur-sm" onClick={closeCompareModal} />

      <div className="relative z-10 max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_30px_80px_-20px_rgba(10,5,35,0.4)] sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0A0523]">Compare Tools</h2>
            <p className="mt-1 text-xs text-[#0A0523]/40">
              Rating is an editorial score, not a live user vote. Popularity reflects opens via AltFTool.
            </p>
          </div>
          <button
            type="button"
            onClick={closeCompareModal}
            aria-label="Close"
            className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <div
            className="grid min-w-[480px] gap-x-4 gap-y-5"
            style={{ gridTemplateColumns: `110px repeat(${Math.max(compareList.length, 1)}, minmax(0, 1fr))` }}
          >
            <div />
            {compareList.map((tool) => (
              <div key={`head-${tool.name}`} className="flex flex-col items-center gap-2 text-center">
                <button
                  type="button"
                  onClick={() => removeFromCompare(tool)}
                  className="self-end text-[11px] font-semibold text-slate-400 transition-colors hover:text-rose-500"
                >
                  Remove
                </button>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 shadow-sm ring-1 ring-slate-100">
                  <ToolLogo name={tool.name} domain={tool.domain} size={30} />
                </span>
                <h3 className="text-sm font-bold text-[#0A0523]">{tool.name}</h3>
              </div>
            ))}

            {rows.map((row) => (
              <Fragment key={row.label}>
                <div className="flex items-center text-xs font-bold uppercase tracking-wide text-[#0A0523]/40">
                  {row.label}
                </div>
                {compareList.map((tool) => (
                  <div key={`${row.label}-${tool.name}`} className="flex items-center justify-center border-t border-slate-100 py-3">
                    {row.render(tool)}
                  </div>
                ))}
              </Fragment>
            ))}

            <div />
            {compareList.map((tool) => (
              <button
                key={`open-${tool.name}`}
                type="button"
                onClick={() => handleOpenTool(tool)}
                className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
              >
                Open
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
