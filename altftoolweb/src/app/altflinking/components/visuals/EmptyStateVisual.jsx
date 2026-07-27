/**
 * Empty State Visual — Pure Light Theme
 */
"use client";
import React from "react";
import { SearchX } from "lucide-react";

export default function EmptyStateVisual({ title = "No Results Found", desc = "Try adjusting your filters." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 border border-indigo-200 shadow-lg">
        <SearchX className="h-10 w-10 text-indigo-400" />
      </div>
      <h3 className="text-base font-black text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 text-center max-w-xs">{desc}</p>
    </div>
  );
}
