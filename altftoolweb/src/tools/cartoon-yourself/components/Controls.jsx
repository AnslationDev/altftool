"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { adjustmentDefaults } from "../constants/styles";

const controls = [
  { key: "brightness", label: "Brightness", min: 50, max: 200, default: 100 },
  { key: "contrast", label: "Contrast", min: 50, max: 200, default: 100 },
  { key: "saturation", label: "Saturation", min: 0, max: 200, default: 100 },
  { key: "sharpness", label: "Sharpness", min: 0, max: 100, default: 0 },
  { key: "smoothness", label: "Smoothness", min: 0, max: 100, default: 0 },
];

export default function Controls({ adjustments, onUpdate, onReset }) {
  return (
    <div className="bg-(--card) border border-(--border) rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-(--primary)" />
          <h3 className="text-lg font-semibold text-(--foreground)">Adjustments</h3>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-(--muted-foreground) hover:text-(--primary) transition"
          aria-label="Reset all adjustments"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="space-y-4">
        {controls.map(({ key, label, min, max, default: defaultValue }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-(--foreground)" htmlFor={`adjust-${key}`}>
                {label}
              </label>
              <span className="text-xs font-semibold text-(--primary) tabular-nums">
                {adjustments[key]}
              </span>
            </div>
            <input
              id={`adjust-${key}`}
              type="range"
              min={min}
              max={max}
              value={adjustments[key]}
              onChange={(e) => onUpdate(key, Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-(--muted) accent-(--primary)"
              aria-label={`${label} adjustment`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
