"use client";

import { useMemo, useState } from "react";
import { Copy, RotateCcw, Twitter } from "lucide-react";

const PRESETS = [
  { id: "post-landscape", label: "Post image landscape", width: 1600, height: 900 },
  { id: "post-square", label: "Post image square", width: 1200, height: 1200 },
  { id: "post-portrait", label: "Post image portrait", width: 1080, height: 1350 },
  { id: "header", label: "Profile header", width: 1500, height: 500 },
  { id: "card", label: "Website card image", width: 1200, height: 630 },
];

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

export default function ToolHome() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [scale, setScale] = useState("1");
  const [safeInset, setSafeInset] = useState("80");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const preset = PRESETS.find((item) => item.id === presetId) || PRESETS[0];
    const factor = Number(scale);
    const inset = Number(safeInset);
    if (!Number.isFinite(factor) || factor <= 0 || factor > 4) {
      return { error: "Scale must be greater than 0 and no more than 4x." };
    }
    if (!Number.isFinite(inset) || inset < 0 || inset > 400) {
      return { error: "Safe inset should be between 0 and 400 pixels." };
    }
    const width = Math.round(preset.width * factor);
    const height = Math.round(preset.height * factor);
    return {
      preset,
      width,
      height,
      ratio: `${preset.width}:${preset.height}`,
      safeWidth: Math.max(0, width - inset * 2),
      safeHeight: Math.max(0, height - inset * 2),
    };
  }, [presetId, safeInset, scale]);

  const css = result.error
    ? ""
    : `.x-artboard {\n  width: ${result.width}px;\n  height: ${result.height}px;\n  aspect-ratio: ${result.preset.width} / ${result.preset.height};\n}\n\n.x-safe-area {\n  inset: ${safeInset}px;\n}`;

  const copy = async () => {
    if (!css) return;
    await navigator.clipboard?.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <Twitter className="h-4 w-4" /> Social image sizing
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">X Twitter Image Size Generator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Pick a common X image format and get exact dimensions, scaled exports, safe-area math and copyable CSS.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Image type</span>
                <select className={FIELD} value={presetId} onChange={(event) => setPresetId(event.target.value)}>
                  {PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label} — {preset.width}×{preset.height}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Export scale</span>
                <input className={FIELD} inputMode="decimal" value={scale} onChange={(event) => setScale(event.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Safe inset (px)</span>
                <input className={FIELD} inputMode="numeric" value={safeInset} onChange={(event) => setSafeInset(event.target.value)} />
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]" onClick={copy} type="button">
                <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy CSS"}
              </button>
              <button className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-4 text-sm font-semibold" onClick={() => { setPresetId(PRESETS[0].id); setScale("1"); setSafeInset("80"); }} type="button">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">Export result</h2>
            {result.error ? (
              <p className="mt-4 rounded-lg bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">{result.error}</p>
            ) : (
              <>
                <div className="mt-4 grid gap-3 text-sm">
                  {[
                    ["Canvas", `${result.width} × ${result.height}px`],
                    ["Aspect ratio", result.ratio],
                    ["Safe area", `${result.safeWidth} × ${result.safeHeight}px`],
                    ["Preset", result.preset.label],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between rounded-lg bg-[var(--muted)]/30 px-3 py-2">
                      <span className="text-[var(--muted-foreground)]">{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
                <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-[var(--background)] p-4 text-xs leading-5 ring-1 ring-[var(--border)]">
                  {css}
                </pre>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
