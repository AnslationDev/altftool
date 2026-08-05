"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn, scoreColor } from "../../lib/utils";
import { ScoreRing } from "../shared/score-ring";

const GROUPS = [
  {
    title: "Prompt signals",
    keys: [
      ["quality", "Prompt Quality"],
      ["creativity", "Creativity"],
      ["realism", "Realism"],
      ["composition", "Composition"],
      ["lighting", "Lighting"],
    ],
  },
  {
    title: "Structure signals",
    keys: [
      ["keywordDensity", "Keyword Density"],
      ["optimization", "Optimization"],
    ],
  },
];

function Bar({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold tabular-nums", scoreColor(value))}>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-brand-gradient"
        />
      </div>
    </div>
  );
}

export function IntelligencePanel({ scores }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Local Prompt Checklist</h3>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-4">
        <ScoreRing score={scores.overall} size={92} label="Heuristic" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">
            {scores.overall >= 90 ? "Detailed structure" : scores.overall >= 80 ? "Good starting point" : "Needs review"}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            A local pattern check, not a quality, performance or licensing prediction.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {g.title}
            </div>
            <div className="space-y-2.5">
              {g.keys.map(([key, label]) => (
                <Bar key={key} label={label} value={scores[key]} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
