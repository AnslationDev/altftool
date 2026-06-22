"use client";

import React from "react";
import { presetMixes } from "../data/ambientSounds";

export default function PresetChips({ activePresetId, onLoadPreset }) {
  return (
    <div className="flex flex-col items-center mb-8">
      <span className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold mb-3">
        Quick Presets
      </span>
      <div className="preset-container flex flex-wrap justify-center gap-2 max-w-2xl px-4">
        {presetMixes.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onLoadPreset(preset)}
              className={`preset-chip px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300 ${
                isActive
                  ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/25"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-750 hover:border-sky-500 hover:text-sky-500"
              }`}
              aria-label={`Load ${preset.name} preset`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
