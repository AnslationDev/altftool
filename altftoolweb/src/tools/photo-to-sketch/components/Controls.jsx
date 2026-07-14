"use client";

import React from "react";
import { SlidersHorizontal, Contrast, Brush, Palette } from "lucide-react";

function Slider({ label, icon: Icon, value, min, max, step, onChange, suffix }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-(--foreground)">
          <Icon size={15} className="text-(--primary)" />
          {label}
        </span>
        <span className="tabular-nums text-(--muted-foreground)">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-(--muted) accent-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
        aria-label={label}
      />
    </div>
  );
}

// Adjustment controls: blur radius, contrast, intensity, and color toggle.
export default function Controls({ settings, update, onReset }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between border-b border-(--border) pb-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-(--foreground)">
          <SlidersHorizontal size={18} className="text-(--primary)" />
          Sketch Controls
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-medium text-(--muted-foreground) transition hover:text-(--primary) hover:border-(--primary)/40"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <Slider
          label="Blur Radius"
          icon={Brush}
          value={settings.blurRadius}
          min={1}
          max={20}
          step={1}
          suffix=" px"
          onChange={(v) => update("blurRadius", v)}
        />
        <Slider
          label="Contrast"
          icon={Contrast}
          value={settings.contrast}
          min={-60}
          max={80}
          step={1}
          onChange={(v) => update("contrast", v)}
        />
        <Slider
          label="Sketch Intensity"
          icon={SlidersHorizontal}
          value={Math.round(settings.intensity * 100)}
          min={0}
          max={100}
          step={1}
          suffix="%"
          onChange={(v) => update("intensity", v / 100)}
        />

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-(--border) bg-(--background) px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-(--foreground)">
            <Palette size={15} className="text-(--primary)" />
            Colored Pencil
          </span>
          <input
            type="checkbox"
            checked={settings.colored}
            onChange={(e) => update("colored", e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
            aria-label="Toggle colored pencil mode"
          />
        </label>
      </div>
    </div>
  );
}
