"use client";

import { Plus } from "lucide-react";

export default function TopBar({ onAddData, onCreateCategory }) {
  return (
    <div className="space-y-5">
      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Search Directory</h1>
          <p className="mt-0.5 text-sm text-muted">Manage results surfaced by the AltFTool search experience.</p>
        </div>
        <div className="flex flex-row gap-4">
          <button
            type="button"
            onClick={onAddData}
            className="flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus className="w-4 h-4" />
            Add result
          </button>
          <button
            type="button"
            onClick={onCreateCategory}
            className="flex h-10 items-center gap-1.5 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus className="w-4 h-4" />
            Add category
          </button>
        </div>
      </div>
    </div>
  );
}
