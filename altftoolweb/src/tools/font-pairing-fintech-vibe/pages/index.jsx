"use client";

import { useMemo, useState } from "react";
import { Banknote, Check, Copy, RotateCcw } from "lucide-react";

import { GROUPING, PAIRS, buildFintechReport } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [pairId, setPairId] = useState("inter-inter");
  const [integerDigits, setIntegerDigits] = useState("7");
  const [decimals, setDecimals] = useState("2");
  const [grouping, setGrouping] = useState("indian");
  const [fontSizePx, setFontSizePx] = useState("18");
  const [showSymbol, setShowSymbol] = useState(true);
  const [copied, setCopied] = useState(false);
  const report = useMemo(() => buildFintechReport({ pairId, integerDigits: Number(integerDigits), decimals: Number(decimals), grouping, fontSizePx: Number(fontSizePx), showSymbol }), [pairId, integerDigits, decimals, grouping, fontSizePx, showSymbol]);
  const copyCss = async () => {
    if (!report.css) return;
    try { await navigator.clipboard.writeText(`${report.fontUrl}\n\n${report.css}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  };
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]"><Banknote className="h-4 w-4" aria-hidden="true" />Finance typography</div><h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Fintech Font Pairing</h1><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Pick trustworthy UI type and calculate tabular money-column widths for Indian or international grouping.</p></header>
      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><div className="grid gap-4 sm:grid-cols-3"><div className="sm:col-span-2"><label className="block text-sm font-semibold" htmlFor="ff-pair">Font pair</label><select id="ff-pair" className={`mt-2 ${INPUT_CLASS}`} value={pairId} onChange={(event) => setPairId(event.target.value)}>{PAIRS.map((pair) => <option key={pair.id} value={pair.id}>{pair.name}</option>)}</select></div><div><label className="block text-sm font-semibold" htmlFor="ff-group">Grouping</label><select id="ff-group" className={`mt-2 ${INPUT_CLASS}`} value={grouping} onChange={(event) => setGrouping(event.target.value)}>{GROUPING.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>{[["Integer digits", integerDigits, setIntegerDigits], ["Decimals", decimals, setDecimals], ["Font px", fontSizePx, setFontSizePx]].map(([label, value, setter]) => <div key={label}><label className="block text-sm font-semibold" htmlFor={`ff-${label}`}>{label}</label><input id={`ff-${label}`} className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={value} onChange={(event) => setter(event.target.value)} /></div>)}<label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={showSymbol} onChange={(event) => setShowSymbol(event.target.checked)} />Show currency symbol</label></div></section>
      {report.error ? <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">{report.error}</p> : <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]"><div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Preview</p><h2 className="mt-4 text-4xl font-semibold" style={{ fontFamily: report.pair.heading.stack }}>{report.pair.name}</h2><p className="mt-3 text-sm text-[var(--muted-foreground)]">{report.pair.why}</p><p className="mt-6 rounded-lg bg-[var(--surface-soft)] p-4 text-right text-3xl font-semibold" style={{ fontFamily: report.pair.figures.family, fontVariantNumeric: "tabular-nums" }}>{report.sampleText}</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Column width</p><p className="mt-1 font-semibold">{report.column.widthPx}px</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Width ch</p><p className="mt-1 font-semibold">{report.column.widthCh}</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Prop jitter saved</p><p className="mt-1 font-semibold">{report.jitter.worstCasePx}px</p></div></div></div><aside className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><div className="flex flex-wrap gap-2"><button className={GHOST_BTN} type="button" onClick={() => setPairId("inter-inter")}><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset</button><button className={PRIMARY_BTN} type="button" onClick={copyCss}>{copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{copied ? "Copied" : "Copy CSS"}</button></div><pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-soft)] p-4 text-xs leading-5">{report.css}</pre></aside></section>}
    </main>
  );
}
