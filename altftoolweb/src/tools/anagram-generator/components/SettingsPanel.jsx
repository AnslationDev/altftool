"use client";

import React from "react";
import { Settings, Sliders, ShieldCheck, ArrowUpDown, Filter, Sparkles } from "lucide-react";

export default function SettingsPanel({
  count,
  setCount,
  realWordsOnly,
  setRealWordsOnly,
  sortMode,
  setSortMode,
  allowDuplicates,
  setAllowDuplicates,
}) {
  const PRESETS = [10, 20, 30, 50];

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Sliders size={16} />
          </div>
          <span>Generation Options & Settings</span>
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          PRO CONTROLS
        </span>
      </div>

      {/* Quantity Slider Card */}
      <div className="p-4 rounded-2xl bg-surface-soft/60 border border-border/60 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <span>Number of Anagrams</span>
          </label>
          <span className="text-sm font-mono font-bold px-2.5 py-0.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            {count} Results
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-teal-500 h-2 bg-border/60 rounded-lg appearance-none cursor-pointer"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>Presets:</span>
          <div className="flex gap-1.5">
            {PRESETS.map((val) => (
              <button
                key={val}
                onClick={() => setCount(val)}
                className={`px-2 py-0.5 rounded-md text-xs font-mono font-medium transition ${count === val
                    ? "bg-teal-500 text-white font-bold"
                    : "bg-card hover:bg-border text-foreground border border-border/60"
                  }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Segmented Sort Control */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <ArrowUpDown size={14} className="text-indigo-500" />
          <span>Sorting Order</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-soft/80 rounded-2xl border border-border/60">
          {[
            { id: "random", label: "🎲 Random" },
            { id: "az", label: "🔤 A - Z" },
            { id: "length", label: "📏 Length" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSortMode(mode.id)}
              className={`py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 ${sortMode === mode.id
                  ? "bg-card text-foreground font-bold shadow-md border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Controls */}
      <div className="space-y-3 pt-2 border-t border-border/40">
        {/* Real Words Only Switch */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/60 hover:border-indigo-500/40 transition">
          <div className="flex items-center gap-2.5">
            <Filter className="w-4 h-4 text-teal-500" />
            <div>
              <p className="text-xs font-bold text-foreground">Real Words Preferred</p>
              <p className="text-[10px] text-muted-foreground">Prioritize dictionary matching words</p>
            </div>
          </div>
          <button
            onClick={() => setRealWordsOnly(!realWordsOnly)}
            className={`w-11 h-6 rounded-full transition-colors duration-300 relative p-1 ${realWordsOnly ? "bg-teal-500" : "bg-border"
              }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${realWordsOnly ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>
        </div>

        {/* Allow Duplicates Switch */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/60 hover:border-indigo-500/40 transition">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <div>
              <p className="text-xs font-bold text-foreground">Allow Duplicate Letters</p>
              <p className="text-[10px] text-muted-foreground">Maintain exact character frequencies</p>
            </div>
          </div>
          <button
            onClick={() => setAllowDuplicates(!allowDuplicates)}
            className={`w-11 h-6 rounded-full transition-colors duration-300 relative p-1 ${allowDuplicates ? "bg-indigo-600" : "bg-border"
              }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${allowDuplicates ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
