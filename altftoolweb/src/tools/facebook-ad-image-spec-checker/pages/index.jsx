"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Megaphone, RotateCcw } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PLACEMENTS = [
  { id: "feed-square", label: "Feed square", width: 1080, height: 1080, ratio: 1, maxMb: 30 },
  { id: "feed-landscape", label: "Feed landscape", width: 1200, height: 628, ratio: 1.91, maxMb: 30 },
  { id: "story", label: "Stories / Reels", width: 1080, height: 1920, ratio: 0.5625, maxMb: 30 },
  { id: "right-column", label: "Right column", width: 254, height: 133, ratio: 1.91, maxMb: 30 },
];

function checkCreative({ placement, width, height, fileMb, textShare }) {
  const p = PLACEMENTS.find((item) => item.id === placement) || PLACEMENTS[0];
  const w = Number(width);
  const h = Number(height);
  const mb = Number(fileMb);
  const text = Number(textShare);
  if (![w, h, mb, text].every(Number.isFinite) || w <= 0 || h <= 0 || mb < 0 || text < 0) {
    return { error: "Enter positive numeric values for size, file weight and text share." };
  }
  const ratio = w / h;
  const ratioDiff = Math.abs(ratio - p.ratio) / p.ratio;
  const issues = [];
  if (w < p.width || h < p.height) issues.push(`Export at least ${p.width} x ${p.height}px for ${p.label}.`);
  if (ratioDiff > 0.03) issues.push(`Aspect ratio is ${ratio.toFixed(2)}:1; target is ${p.ratio.toFixed(2)}:1.`);
  if (mb > p.maxMb) issues.push(`File is ${mb}MB; keep it under ${p.maxMb}MB.`);
  if (text > 20) issues.push("Text covers more than 20% of the image. Meta may still run it, but delivery can suffer.");
  return { placement: p, ratio, ratioDiff, issues, status: issues.length === 0 ? "pass" : issues.length <= 2 ? "review" : "fail" };
}

export default function ToolHome() {
  const [placement, setPlacement] = useState("feed-square");
  const [width, setWidth] = useState("1080");
  const [height, setHeight] = useState("1080");
  const [fileMb, setFileMb] = useState("1.8");
  const [textShare, setTextShare] = useState("12");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => checkCreative({ placement, width, height, fileMb, textShare }), [placement, width, height, fileMb, textShare]);

  const applyPreset = (id) => {
    const preset = PLACEMENTS.find((item) => item.id === id) || PLACEMENTS[0];
    setPlacement(id); setWidth(String(preset.width)); setHeight(String(preset.height));
  };
  const copyResult = async () => {
    if (result.error) return;
    const text = [`Facebook Ad Image Spec Checker`, `${result.placement.label}: ${width} x ${height}px, ${fileMb}MB`, result.issues.length ? result.issues.map((item) => `- ${item}`).join("\n") : "- Creative matches the quick spec checks."].join("\n");
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]"><Megaphone className="h-4 w-4" aria-hidden="true" />Ad creative QA</div><h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Facebook Ad Image Spec Checker</h1><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Check ad creative dimensions, aspect ratio, file size and text density against common Meta placements.</p></header>
      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3"><label className="block text-sm font-semibold" htmlFor="fb-place">Placement</label><select id="fb-place" className={`mt-2 ${INPUT_CLASS}`} value={placement} onChange={(event) => applyPreset(event.target.value)}>{PLACEMENTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
        <div><label className="block text-sm font-semibold" htmlFor="fb-w">Width px</label><input id="fb-w" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" value={width} onChange={(event) => setWidth(event.target.value)} /></div>
        <div><label className="block text-sm font-semibold" htmlFor="fb-h">Height px</label><input id="fb-h" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" value={height} onChange={(event) => setHeight(event.target.value)} /></div>
        <div><label className="block text-sm font-semibold" htmlFor="fb-mb">File MB</label><input id="fb-mb" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" step="0.1" value={fileMb} onChange={(event) => setFileMb(event.target.value)} /></div>
        <div><label className="block text-sm font-semibold" htmlFor="fb-text">Text area %</label><input id="fb-text" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" max="100" value={textShare} onChange={(event) => setTextShare(event.target.value)} /></div>
      </div></section>
      {result.error ? <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">{result.error}</p> : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Verdict</p><h2 className={result.status === "pass" ? "mt-1 text-2xl font-semibold text-[var(--success)]" : result.status === "review" ? "mt-1 text-2xl font-semibold text-[var(--warning)]" : "mt-1 text-2xl font-semibold text-[var(--danger)]"}>{result.status === "pass" ? "Ready to upload" : result.status === "review" ? "Needs review" : "Fix before upload"}</h2></div><button className={PRIMARY_BTN} type="button" onClick={copyResult}>{copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{copied ? "Copied" : "Copy"}</button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Target</p><p className="mt-1 font-semibold">{result.placement.width} x {result.placement.height}</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Your ratio</p><p className="mt-1 font-semibold">{result.ratio.toFixed(2)}:1</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Ratio drift</p><p className="mt-1 font-semibold">{(result.ratioDiff * 100).toFixed(1)}%</p></div></div>{result.issues.length > 0 && <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">{result.issues.map((issue) => <li key={issue}>• {issue}</li>)}</ul>}<button className={`mt-5 ${GHOST_BTN}`} type="button" onClick={() => applyPreset("feed-square")}><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset</button></section>
      )}
    </main>
  );
}
