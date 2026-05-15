"use client";

import { useMemo, useState } from "react";
import { CheckSquare, Copy } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16));
}

function luminance(hex) {
  return hexToRgb(hex)
    .map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function ratio(foreground, background) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

function Result({ label, pass }) {
  return (
    <div className={`min-w-0 rounded-lg border p-4 ${pass ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200" : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs font-medium">{pass ? "Pass" : "Fail"}</p>
    </div>
  );
}

export default function ToolHome() {
  const [foreground, setForeground] = useState("#111827");
  const [background, setBackground] = useState("#ffffff");
  const [copied, setCopied] = useState(false);
  const contrast = useMemo(() => ratio(foreground, background), [background, foreground]);

  const copyCss = async () => {
    setCopied(await safeCopyText(`color: ${foreground};\nbackground-color: ${background};`));
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CheckSquare className="h-4 w-4" />
            Accessibility
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Color Contrast Checker</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Check text/background contrast against WCAG AA and AAA thresholds for UI readability.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            {[
              ["Text color", foreground, setForeground],
              ["Background", background, setBackground],
            ].map(([label, value, setter]) => (
              <label key={label} className="mb-5 block">
                <span className="text-sm font-semibold">{label}</span>
                <div className="mt-2 flex gap-3">
                  <input type="color" value={value} onChange={(event) => setter(event.target.value)} className="h-12 w-14 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-1 sm:w-16" />
                  <input value={value} onChange={(event) => setter(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono outline-none focus:border-[var(--primary)]" />
                </div>
              </label>
            ))}
            <button type="button" onClick={copyCss} className="btn-primary w-full">
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy CSS"}
            </button>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="rounded-lg p-5 sm:p-8" style={{ color: foreground, backgroundColor: background }}>
              <p className="text-sm font-semibold uppercase opacity-80">Preview</p>
              <h2 className="mt-3 break-words text-2xl font-semibold sm:text-4xl">Readable interface text</h2>
              <p className="mt-3 max-w-xl text-base leading-7">This preview shows how body copy and large headings feel with the selected colors.</p>
            </div>
            <div className="tool-card-grid mt-5">
              <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Ratio</p>
                <p className="tool-money-value mt-2">{contrast.toFixed(2)}:1</p>
              </div>
              <Result label="AA normal" pass={contrast >= 4.5} />
              <Result label="AA large" pass={contrast >= 3} />
              <Result label="AAA normal" pass={contrast >= 7} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
