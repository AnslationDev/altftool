"use client";

import { Wand2, RefreshCw, Maximize2, Minimize2, Briefcase, Shuffle } from "lucide-react";
import { cn } from "../../lib/utils";

const ACTIONS = [
  { mode: "improve", label: "Improve", icon: Wand2 },
  { mode: "rewrite", label: "Rewrite", icon: RefreshCw },
  { mode: "expand", label: "Expand", icon: Maximize2 },
  { mode: "shorten", label: "Shorten", icon: Minimize2 },
  { mode: "professional", label: "Professional", icon: Briefcase },
];

export function AssistantBar({ onAssist, onShuffle, disabled }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">AI Assistant:</span>
      {ACTIONS.map((a) => (
        <button
          key={a.mode}
          disabled={disabled}
          onClick={() => onAssist(a.mode)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border bg-foreground/[0.03] px-3 py-1.5 text-xs font-medium text-foreground/80 transition-all",
            "hover:border-primary/40 hover:bg-primary/10 hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
          )}
        >
          <a.icon className="h-3.5 w-3.5" /> {a.label}
        </button>
      ))}
      <button
        disabled={disabled}
        onClick={onShuffle}
        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-foreground/[0.03] px-3 py-1.5 text-xs font-medium text-foreground/80 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
      >
        <Shuffle className="h-3.5 w-3.5" /> Shuffle
      </button>
    </div>
  );
}
