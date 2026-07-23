"use client";

import { Copy, Download, Trash2 } from "lucide-react";
import { COMPARE_OPTIONS } from "../constants/options";

export default function OptionsBar({ options, onToggle, onCopy, onDownload, onClear }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {COMPARE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onToggle(option.key)}
              className={`h-10 rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${options[option.key] ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onCopy} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"><Copy className="h-4 w-4" /> Copy result</button>
          <button type="button" onClick={onDownload} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"><Download className="h-4 w-4" /> Download</button>
          <button type="button" onClick={onClear} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"><Trash2 className="h-4 w-4" /> Clear all</button>
        </div>
      </div>
    </div>
  );
}
