"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../providers/AuthProvider";
import ToolLogo from "./ToolLogo";

const STEP_DELAY_MS = 800;

/**
 * Workflow steps for the active combo pack, shown as the same card style
 * used everywhere else on the page (ToolCard-style logo tile + name +
 * description) in a plain wrapping grid — nothing hidden behind a scroll
 * track, packs with more than 4 steps just flow onto the next row. Steps
 * still reveal one at a time on a timer rather than dumping in at once.
 */
export default function ComboWorkflowTimeline({ pack }) {
  const { requireAuth } = useAuth();
  const Icon = pack.icon;
  const [visibleCount, setVisibleCount] = useState(0);

  // Reset the reveal count the moment the active pack changes — done during
  // render (React's recommended prop-change-reset pattern) so the timers
  // effect below only ever has to schedule, never synchronously reset state.
  const [trackedPack, setTrackedPack] = useState(pack);
  if (pack !== trackedPack) {
    setTrackedPack(pack);
    setVisibleCount(0);
  }

  useEffect(() => {
    const timers = pack.steps.map((_, index) =>
      setTimeout(() => setVisibleCount((count) => Math.max(count, index + 1)), 250 + index * STEP_DELAY_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [pack]);

  const openTool = (step) => {
    requireAuth(() => window.open(step.tool.url, "_blank", "noopener,noreferrer"));
  };

  return (
    <div className="fat-card overflow-hidden rounded-3xl">
      <div
        className="relative flex items-start gap-4 p-6 sm:p-8"
        style={{ backgroundImage: `linear-gradient(120deg, ${pack.hue[0]}14, ${pack.hue[1]}0c)` }}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <Icon className="h-6 w-6" style={{ color: pack.hue[0] }} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{pack.title} Combo Pack</h3>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 shadow-sm">
              {pack.difficulty}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{pack.tagline}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 xl:grid-cols-4">
        {pack.steps.map((item, index) => {
          const revealed = index < visibleCount;
          return (
            <div key={`${pack.id}-${index}`}>
              {revealed ? (
                <motion.button
                  type="button"
                  onClick={() => openTool(item)}
                  initial={{ opacity: 0, y: 14, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="fat-card group flex h-full w-full flex-col rounded-3xl p-3 text-left"
                >
                  <div
                    className="fat-tile relative flex h-40 items-center justify-center overflow-hidden rounded-2xl sm:h-44"
                    style={{ "--fat-tile-a": `${pack.hue[0]}1a`, "--fat-tile-b": `${pack.hue[1]}0f` }}
                  >
                    <span className="flex items-center justify-center rounded-2xl bg-white p-3 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 transition-transform duration-500 group-hover:scale-110">
                      <ToolLogo name={item.tool.name} domain={item.tool.domain} hue={pack.hue} size={56} />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
                    <h4 className="text-lg font-extrabold tracking-tight text-slate-900">{item.tool.name}</h4>
                    <p className="mt-1.5 line-clamp-3 flex-1 text-[15px] leading-relaxed text-slate-500">
                      {item.why} {item.output}
                    </p>
                    <div className="mt-5 flex justify-end">
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundImage: `linear-gradient(135deg, ${pack.hue[0]}, ${pack.hue[1]})` }}
                      >
                        Step {index + 1}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ) : (
                <div className="fat-card rounded-3xl p-3" aria-hidden="true">
                  <div className="fat-shimmer h-40 rounded-2xl sm:h-44" />
                  <div className="px-2.5 pb-2 pt-4">
                    <div className="fat-shimmer h-5 w-2/5 rounded-full" />
                    <div className="fat-shimmer mt-3 h-3 w-full rounded-full" />
                    <div className="fat-shimmer mt-2 h-3 w-full rounded-full" />
                    <div className="fat-shimmer mt-2 h-3 w-2/3 rounded-full" />
                    <div className="mt-5 flex justify-end">
                      <div className="fat-shimmer h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
