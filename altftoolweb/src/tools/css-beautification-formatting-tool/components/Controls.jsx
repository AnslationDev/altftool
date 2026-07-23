"use client";

import { AlignLeft, ArrowDownAZ, Braces, Minimize2 } from "lucide-react";

export default function Controls({ settings, setSettings, mode, setMode, clearAll }) {
  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <section className="rounded-3xl p-4 space-y-4 cf-glass">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setMode(mode === "beautify" ? "minify" : "beautify")}
          className="btn-primary px-4 py-2 flex items-center gap-2 cursor-pointer"
        >
          {mode === "beautify" ? <AlignLeft className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          {mode === "beautify" ? "Beautify Mode" : "Minify Mode"}
        </button>
        <button onClick={clearAll} className="btn-secondary px-4 py-2 cursor-pointer">
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field label="Indent">
          <select value={settings.indent} onChange={(e) => set("indent", e.target.value)} className="cf-input">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </Field>
        <Field label="Line spacing">
          <select value={settings.lineSpacing} onChange={(e) => set("lineSpacing", e.target.value)} className="cf-input">
            <option value="compact">Compact</option>
            <option value="spacious">Spacious</option>
          </select>
        </Field>
        <Field label="Brackets">
          <select value={settings.bracketStyle} onChange={(e) => set("bracketStyle", e.target.value)} className="cf-input">
            <option value="same-line">Same line</option>
            <option value="new-line">New line</option>
          </select>
        </Field>
        <label className="flex items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--muted)/25 px-3 py-2 text-sm">
          <span className="flex items-center gap-2 text-(--foreground)">
            <ArrowDownAZ className="w-4 h-4 text-blue-500" />
            Sort properties
          </span>
          <input
            type="checkbox"
            checked={settings.sortProperties}
            onChange={(e) => set("sortProperties", e.target.checked)}
            className="w-4 h-4"
          />
        </label>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm text-(--muted-foreground)">
      <span className="flex items-center gap-2 mb-2">
        <Braces className="w-4 h-4 text-blue-500" />
        {label}
      </span>
      {children}
    </label>
  );
}
