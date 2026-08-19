"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";

// Matches a well-formed rgb or rrggbb hex color, with an optional leading
// "#" (case-insensitive) — mirrors hexToRgb()'s own tolerance for a missing "#".
const HEX_COLOR_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

// A single color control: preset swatches + expandable fine-picker.
function ColorRow({ label, value, presets, onChange }) {
  const [open, setOpen] = useState(false);
  // The hex text input keeps its own draft state so incomplete/invalid
  // keystrokes (e.g. "#f1c" mid-type) never reach the committed color
  // state — only a well-formed hex value is propagated via onChange.
  const [hexText, setHexText] = useState(value);
  // Re-sync the draft text when the committed color changes from elsewhere
  // (preset click, color-picker drag, parent reset) — adjusted during
  // render per React's guidance, rather than in an effect, to avoid an
  // extra commit/render pass.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setHexText(value);
  }

  const handleHexTextChange = (e) => {
    const next = e.target.value;
    setHexText(next);
    if (HEX_COLOR_RE.test(next)) {
      onChange(next.startsWith("#") ? next : `#${next}`);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-(--card-foreground)">{label}</label>
        <button
          type="button"
          aria-label={`Toggle ${label} picker`}
          onClick={() => setOpen((o) => !o)}
          className="h-6 w-6 rounded-md border border-(--border) shadow-sm"
          style={{ backgroundColor: value }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`${label} ${c}`}
            onClick={() => onChange(c)}
            className={`h-7 w-7 rounded-full border transition active:scale-90 ${
              value.toLowerCase() === c.toLowerCase()
                ? "border-(--primary) ring-2 ring-(--primary)/40"
                : "border-(--border) hover:scale-105"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      {open && (
        <div className="rounded-xl border border-(--border) bg-(--background) p-3">
          <HexColorPicker color={value} onChange={onChange} />
          <input
            type="text"
            value={hexText}
            onChange={handleHexTextChange}
            aria-label={`${label} hex value`}
            className="mt-3 w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-(--primary)"
          />
        </div>
      )}
    </div>
  );
}

// Color customization: skin, hair, background, accent.
export default function ColorControls({ colors, backgrounds, onColor, onBackground }) {
  const swatches = {
    skin: ["#f8d9c0", "#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbb4"],
    hair: ["#1b1b1b", "#3b2f2f", "#6b4423", "#a55728", "#d6b370", "#e8e8e8", "#b03060", "#3a5fcd"],
    background: ["#eef2ff", "#fef3c7", "#dcfce7", "#fae8ff", "#e0f2fe", "#f1f5f9", "#0f172a", "#1e293b"],
    accent: ["#14b8a6", "#22d3ee", "#f472b6", "#a78bfa", "#f59e0b", "#34d399", "#ef4444"],
  };

  return (
    <div className="space-y-5">
      <ColorRow label="Skin tone" value={colors.skin} presets={swatches.skin} onChange={(c) => onColor("skin", c)} />
      <ColorRow label="Hair color" value={colors.hair} presets={swatches.hair} onChange={(c) => onColor("hair", c)} />
      <ColorRow label="Accent / clothing" value={colors.accent} presets={swatches.accent} onChange={(c) => onColor("accent", c)} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-(--card-foreground)">Background</label>
        <div className="flex flex-wrap gap-2">
          {backgrounds.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={colors.background === b.id}
              onClick={() => onBackground(b.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                colors.background === b.id
                  ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
                  : "border-(--border) bg-(--background) text-(--muted-foreground) hover:bg-(--muted)"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
        <ColorRow label="Background color" value={colors.background} presets={swatches.background} onChange={(c) => onColor("background", c)} />
      </div>
    </div>
  );
}
