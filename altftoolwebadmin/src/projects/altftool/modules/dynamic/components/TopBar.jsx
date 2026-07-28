"use client";

import { Plus } from "lucide-react";

export default function ExtensionsHeader({ onCreate, onAddData }) {
  return (
    <div className="space-y-5">

      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Dynamic Module</h1>
          <p className="text-sm text-muted mt-0.5">Manage all dynamic data in one place</p>
        </div>
        <div className="flex flex-row gap-4">
          <button
            onClick={onAddData}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-semibold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Data
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-semibold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Configure Module
          </button>
        </div>
      </div>
    </div>
  );
}