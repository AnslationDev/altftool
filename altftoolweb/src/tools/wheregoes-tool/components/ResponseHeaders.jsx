"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CARD, FOCUS_RING } from "./ui.jsx";

const PREVIEW_COUNT = 5;

export default function ResponseHeaders({ step }) {
  const [showAll, setShowAll] = useState(false);
  if (!step) return null;

  const entries = Object.entries(step.headers || {});
  if (!entries.length) return null;

  const visible = showAll ? entries : entries.slice(0, PREVIEW_COUNT);

  return (
    <section
      aria-label={`Response headers for step ${step.index + 1}`}
      className={`${CARD} p-4 sm:p-5`}
    >
      <h2 className="mb-3 text-sm font-bold tracking-tight text-(--foreground)">
        Response Headers <span className="font-semibold text-(--muted-foreground)">(Step {step.index + 1})</span>
      </h2>

      <dl className="overflow-hidden rounded-[10px] border border-(--border) bg-(--background) font-mono text-xs">
        {visible.map(([key, value], index) => (
          <div
            key={key}
            className={`grid gap-1 px-4 py-2.5 sm:grid-cols-[200px_1fr] ${
              index !== visible.length - 1 ? "border-b border-(--border)" : ""
            }`}
          >
            <dt className="font-bold text-(--muted-foreground)">{key}</dt>
            <dd className="break-all leading-5 text-(--foreground)">{String(value)}</dd>
          </div>
        ))}
      </dl>

      {entries.length > PREVIEW_COUNT && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll(!showAll)}
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[8px] border border-(--border) bg-(--card) px-3.5 text-xs font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary-hover) dark:hover:text-(--primary) ${FOCUS_RING}`}
          >
            {showAll ? "Show Fewer Headers" : "View All Headers"}
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={`transition-transform ${showAll ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      )}
    </section>
  );
}
