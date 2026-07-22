"use client";

import React from "react";
import { ClipboardList } from "lucide-react";

const EXAMPLE_RECIPE = `2 cups all-purpose flour
1 1/2 tsp baking powder
1/2 tsp salt
1 cup sugar
3 large eggs
1/2 cup whole milk
1 tsp vanilla extract`;

export default function RecipeInput({ value, onChange }) {
  const lineCount = value.trim() ? value.split("\n").filter(l => l.trim()).length : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground) flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5" />
          Ingredients — one per line
        </label>
        {lineCount > 0 ? (
          <span className="px-3 py-1 rounded-full bg-(--primary)/10 text-(--primary) text-xs font-black">
            {lineCount} items
          </span>
        ) : (
          <button
            onClick={() => onChange(EXAMPLE_RECIPE.trim())}
            className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-bold"
          >
            Try Example
          </button>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`One ingredient per line, e.g.\n${EXAMPLE_RECIPE}`}
        className="w-full h-56 px-4 py-3 rounded-xl bg-(--background) border border-(--border) focus:border-(--primary) outline-none transition-all resize-none font-mono text-sm leading-relaxed"
      />

      <p className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground)">
        Supports · Fractions (1 1/2) · Decimals (0.5) · Units (cups, tsp, lbs, g…)
      </p>
    </div>
  );
}
