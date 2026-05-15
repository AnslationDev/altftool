"use client";

import { Download, ImageDown, RefreshCcw, Shuffle } from "lucide-react";
import { PALETTES, PATTERNS } from "../utils/patterns";

export default function ControlPanel({
  settings,
  onChange,
  onRandomize,
  onReset,
  onDownloadSvg,
  onDownloadPng,
}) {
  return (
    <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)]/80 p-4 shadow-lg backdrop-blur-xl">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <Field label="Pattern">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {Object.entries(PATTERNS).map(([key, pattern]) => (
              <button
                key={key}
                type="button"
                onClick={() => onChange("pattern", key)}
                className={`rounded-2xl border px-3 py-3 text-left ${
                  settings.pattern === key
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                }`}
              >
                <span className="block text-sm font-bold">{pattern.label}</span>
                <span className="mt-1 block text-xs opacity-80">{pattern.helper}</span>
              </button>
            ))}
          </div>
        </Field>

        <div className="space-y-4">
          <Field label="Palette">
            <select
              value={settings.palette}
              onChange={(event) => onChange("palette", event.target.value)}
              className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            >
              {Object.entries(PALETTES).map(([key, palette]) => (
                <option key={key} value={key}>
                  {palette.label}
                </option>
              ))}
            </select>
          </Field>
          <Slider
            label="Complexity"
            value={settings.complexity}
            min={2}
            max={6}
            step={1}
            onChange={(value) => onChange("complexity", value)}
          />
          <Slider
            label="Stroke"
            value={settings.strokeWidth}
            min={1}
            max={8}
            step={0.5}
            suffix="px"
            onChange={(value) => onChange("strokeWidth", value)}
          />
        </div>

        <div className="space-y-4">
          <Slider
            label="Scale"
            value={settings.scale}
            min={70}
            max={125}
            step={1}
            suffix="%"
            onChange={(value) => onChange("scale", value)}
          />
          <Slider
            label="Rotation"
            value={settings.rotation}
            min={0}
            max={360}
            step={1}
            suffix="deg"
            onChange={(value) => onChange("rotation", value)}
          />
          <Slider
            label="Opacity"
            value={settings.opacity}
            min={35}
            max={100}
            step={1}
            suffix="%"
            onChange={(value) => onChange("opacity", value)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onRandomize} className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm">
          <Shuffle size={16} />
          Random
        </button>
        <button type="button" onClick={onReset} className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm">
          <RefreshCcw size={16} />
          Reset
        </button>
        <button type="button" onClick={onDownloadSvg} className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm">
          <Download size={16} />
          SVG
        </button>
        <button type="button" onClick={onDownloadPng} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
          <ImageDown size={16} />
          PNG
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--secondary-foreground)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Slider({ label, value, min, max, step, suffix = "", onChange }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[var(--secondary-foreground)]">
        <span>{label}</span>
        <span className="font-mono text-[var(--foreground)]">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--border)] accent-[var(--primary)]"
      />
    </label>
  );
}
