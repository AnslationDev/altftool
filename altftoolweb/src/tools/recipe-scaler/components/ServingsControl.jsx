"use client";

import React from "react";
import { Users, TrendingUp, Minus, Plus } from "lucide-react";

export default function ServingsControl({
  originalServings,
  setOriginalServings,
  targetServings,
  setTargetServings
}) {
  const adjust = (setter, val, delta) => {
    const next = Math.max(1, (parseInt(val) || 1) + delta);
    setter(next.toString());
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground)">
        Serving Size
      </label>

      <div className="grid grid-cols-2 gap-4">
        {/* Original Servings */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground) ml-1 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Original Servings
          </label>
          <div className="flex items-center rounded-xl bg-(--background) border border-(--border) focus-within:border-(--primary) transition-all">
            <button
              onClick={() => adjust(setOriginalServings, originalServings, -1)}
              className="w-10 h-11 flex items-center justify-center text-(--muted-foreground) hover:text-(--primary) transition-all active:scale-90"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="1"
              value={originalServings}
              onChange={(e) => setOriginalServings(e.target.value)}
              className="flex-1 min-w-0 text-center font-black text-lg text-(--foreground) bg-transparent outline-none py-2"
            />
            <button
              onClick={() => adjust(setOriginalServings, originalServings, 1)}
              className="w-10 h-11 flex items-center justify-center text-(--muted-foreground) hover:text-(--primary) transition-all active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Target Servings */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-(--primary) ml-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Target Servings
          </label>
          <div className="flex items-center rounded-xl bg-(--background) border border-(--primary)/30 focus-within:border-(--primary) transition-all">
            <button
              onClick={() => adjust(setTargetServings, targetServings, -1)}
              className="w-10 h-11 flex items-center justify-center text-(--muted-foreground) hover:text-(--primary) transition-all active:scale-90"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="1"
              value={targetServings}
              onChange={(e) => setTargetServings(e.target.value)}
              className="flex-1 min-w-0 text-center font-black text-lg text-(--primary) bg-transparent outline-none py-2"
            />
            <button
              onClick={() => adjust(setTargetServings, targetServings, 1)}
              className="w-10 h-11 flex items-center justify-center text-(--muted-foreground) hover:text-(--primary) transition-all active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
