"use client";

import { RotateCcw, Undo2 } from "lucide-react";
import { fontFamilies, presets } from "../utils/typographyUtils";

const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

function Field({ label, children, hint }) {
  return (
    <label className="block min-w-0">
      <span className="block text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-2">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-[var(--muted-foreground)]">{hint}</span>}
    </label>
  );
}

function NumberInput({ value, onChange, min, max, step = 1 }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-cyan-400"
    />
  );
}

export default function Controls({ settings, update, applyPreset, reset, undo, canUndo }) {
  return (
    <section className="font-css-card p-4 sm:p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-[var(--foreground)]">Controls</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Every field feeds the live preview and CSS output (color fields pause while Gradient Text is on; Unit pauses while Responsive clamp() is on).</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={undo} disabled={!canUndo} title="Undo" className="font-css-icon-btn disabled:opacity-40">
            <Undo2 size={17} />
          </button>
          <button type="button" onClick={reset} title="Reset" className="font-css-icon-btn">
            <RotateCcw size={17} />
          </button>
        </div>
      </div>

      <Field label="Preview Text">
        <textarea
          value={settings.text}
          onChange={(event) => update("text", event.target.value)}
          rows={5}
          className="w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-relaxed text-[var(--foreground)] outline-none focus:border-cyan-400"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Font Family">
          <select value={settings.fontFamily} onChange={(event) => update("fontFamily", event.target.value)} className="font-css-input">
            {fontFamilies.map((font) => <option key={font.name}>{font.name}</option>)}
          </select>
        </Field>
        <Field label="Weight">
          <select value={settings.fontWeight} onChange={(event) => update("fontWeight", Number(event.target.value))} className="font-css-input">
            {weights.map((weight) => <option key={weight}>{weight}</option>)}
          </select>
        </Field>
        <Field label="Font Style">
          <select value={settings.fontStyle} onChange={(event) => update("fontStyle", event.target.value)} className="font-css-input">
            {["normal", "italic", "oblique"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Transform">
          <select value={settings.textTransform} onChange={(event) => update("textTransform", event.target.value)} className="font-css-input">
            {["none", "uppercase", "lowercase", "capitalize"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Font Size">
          <NumberInput value={settings.fontSize} min={1} max={240} onChange={(value) => update("fontSize", value)} />
        </Field>
        <Field label="Unit" hint={settings.responsive ? "Ignored while Responsive clamp() is on" : undefined}>
          <select
            value={settings.fontSizeUnit}
            onChange={(event) => update("fontSizeUnit", event.target.value)}
            disabled={settings.responsive}
            className="font-css-input disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {["px", "rem", "em", "%"].map((unit) => <option key={unit}>{unit}</option>)}
          </select>
        </Field>
        <Field label="Letter Spacing">
          <NumberInput value={settings.letterSpacing} min={-12} max={24} step={0.1} onChange={(value) => update("letterSpacing", value)} />
        </Field>
        <Field label="Line Height">
          <NumberInput value={settings.lineHeight} min={0.7} max={3} step={0.05} onChange={(value) => update("lineHeight", value)} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Alignment">
          <select value={settings.textAlign} onChange={(event) => update("textAlign", event.target.value)} className="font-css-input">
            {["left", "center", "right", "justify"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Color Format" hint={settings.gradientEnabled ? "Inactive while Gradient Text is on" : undefined}>
          <select
            value={settings.colorMode}
            onChange={(event) => update("colorMode", event.target.value)}
            disabled={settings.gradientEnabled}
            className="font-css-input disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {["hex", "rgb", "hsl"].map((item) => <option key={item}>{item.toUpperCase()}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Text Color" hint={settings.gradientEnabled ? "Inactive while Gradient Text is on" : undefined}>
          <input
            type="color"
            value={settings.color}
            onChange={(event) => update("color", event.target.value)}
            disabled={settings.gradientEnabled}
            className="font-css-color disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </Field>
        <Field label="Responsive clamp()">
          <button type="button" onClick={() => update("responsive", !settings.responsive)} className={`font-css-toggle ${settings.responsive ? "is-on" : ""}`}>
            {settings.responsive ? "Enabled" : "Disabled"}
          </button>
        </Field>
      </div>

      {settings.responsive && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Mobile Min PX">
            <NumberInput value={settings.minFontSize} min={8} max={160} onChange={(value) => update("minFontSize", value)} />
          </Field>
          <Field label="Desktop Max PX">
            <NumberInput value={settings.maxFontSize} min={10} max={260} onChange={(value) => update("maxFontSize", value)} />
          </Field>
        </div>
      )}

      <div>
        <span className="block text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Presets</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presets.map((preset) => (
            <button key={preset.name} type="button" onClick={() => applyPreset(preset)} className="font-css-preset">
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
