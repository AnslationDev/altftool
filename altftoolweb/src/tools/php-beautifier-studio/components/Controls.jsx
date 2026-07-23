"use client";

import { Braces, Settings2, Upload } from "lucide-react";

export default function Controls({ settings, setSettings, clearAll, onUpload }) {
  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <section className="rounded-3xl p-4 space-y-4 bg-(--card) border border-(--border) shadow-xl">
      <div className="flex flex-wrap items-center gap-3">
        <label className="btn-primary px-4 py-2 flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" />
          Upload .php
          <input type="file" accept=".php" onChange={onUpload} className="hidden" />
        </label>
        <button onClick={clearAll} className="btn-secondary px-4 py-2 cursor-pointer">
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field label="Indent">
          <select value={settings.tabWidth} onChange={(e) => set("tabWidth", parseInt(e.target.value))} className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 text-(--foreground)">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="8">8 spaces</option>
          </select>
        </Field>

        <Field label="Print Width">
          <select value={settings.printWidth} onChange={(e) => set("printWidth", parseInt(e.target.value))} className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 text-(--foreground)">
            <option value="80">80 chars</option>
            <option value="120">120 chars</option>
            <option value="160">160 chars</option>
          </select>
        </Field>

        <Field label="Quotes">
          <select value={settings.singleQuote ? "single" : "double"} onChange={(e) => set("singleQuote", e.target.value === "single")} className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 text-(--foreground)">
            <option value="double">Double Quotes</option>
            <option value="single">Single Quotes</option>
          </select>
        </Field>

        <Field label="Brace Style">
          <select value={settings.braceStyle} onChange={(e) => set("braceStyle", e.target.value)} className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 text-(--foreground)">
            <option value="1tbs">1TBS (Same line)</option>
            <option value="perlx">Perl (New line)</option>
            <option value="allman">Allman</option>
          </select>
        </Field>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm text-(--muted-foreground)">
      <span className="flex items-center gap-2 mb-2">
        <Settings2 className="w-4 h-4 text-indigo-500" />
        {label}
      </span>
      {children}
    </label>
  );
}
