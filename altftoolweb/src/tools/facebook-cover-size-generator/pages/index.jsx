"use client";

import { useMemo, useState } from "react";
import { LayoutTemplate, RotateCcw } from "lucide-react";
import { FACEBOOK_COVER_PRESETS, buildCoverReport, ratioLabel } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const px = (value) => `${Math.round(value)} px`;

export default function ToolHome() {
  const [presetId, setPresetId] = useState(FACEBOOK_COVER_PRESETS[0].id);
  const [srcW, setSrcW] = useState("2400");
  const [srcH, setSrcH] = useState("1200");
  const report = useMemo(() => buildCoverReport({ presetId, srcW: Number(srcW), srcH: Number(srcH) }), [presetId, srcW, srcH]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LayoutTemplate className="h-4 w-4" aria-hidden="true" /> Social image
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Facebook Cover Size Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Choose a Facebook cover target and see upload size, safe zone and source quality.</p>
      </header>
      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className="text-sm font-semibold">Cover type
          <select className={`mt-2 ${INPUT_CLASS}`} value={presetId} onChange={(e) => setPresetId(e.target.value)}>
            {FACEBOOK_COVER_PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
          </select>
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Source width<input className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" value={srcW} onChange={(e) => setSrcW(e.target.value)} /></label>
          <label className="text-sm font-semibold">Source height<input className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" value={srcH} onChange={(e) => setSrcH(e.target.value)} /></label>
        </div>
      </section>
      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {report.error ? <p role="alert" className="text-sm font-semibold text-[var(--danger)]">{report.error}</p> : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div><p className="text-xs uppercase text-[var(--muted-foreground)]">Upload</p><p className="text-xl font-semibold">{report.preset.uploadW} × {report.preset.uploadH}</p><p className="text-xs text-[var(--muted-foreground)]">{ratioLabel(report.preset.uploadW, report.preset.uploadH)}</p></div>
            <div><p className="text-xs uppercase text-[var(--muted-foreground)]">Safe zone</p><p className="text-xl font-semibold">{px(report.zone.w)} × {px(report.zone.h)}</p><p className="text-xs text-[var(--muted-foreground)]">{report.safePctArea.toFixed(1)}% of upload</p></div>
            <div><p className="text-xs uppercase text-[var(--muted-foreground)]">Quality</p><p className="text-xl font-semibold capitalize">{report.quality.verdict}</p><p className="text-xs text-[var(--muted-foreground)]">{report.quality.note}</p></div>
            <p className="sm:col-span-3 text-sm text-[var(--muted-foreground)]">{report.preset.note}</p>
          </div>
        )}
        <button type="button" className={`mt-4 ${GHOST_BTN}`} onClick={() => { setPresetId(FACEBOOK_COVER_PRESETS[0].id); setSrcW("2400"); setSrcH("1200"); }}>
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </section>
    </main>
  );
}
