"use client";

import { DIFFICULTIES } from "../constants";

export default function DifficultyFilter({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {["all", ...DIFFICULTIES].map((d) => {
        const active = selected === d;
        const label = d === "all" ? "All Levels" : d.charAt(0).toUpperCase() + d.slice(1);
        const color = d === "easy" ? "bg-emerald-500/10 text-emerald-600" : d === "medium" ? "bg-amber-500/10 text-amber-600" : d === "hard" ? "bg-rose-500/10 text-rose-600" : "";
        return (
          <button key={d} onClick={() => onChange(d)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              active
                ? d === "all" ? "bg-[var(--primary)] text-white" : color + " ring-2 ring-offset-1 ring-[var(--primary)]"
                : d === "all" ? "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10" : color
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
