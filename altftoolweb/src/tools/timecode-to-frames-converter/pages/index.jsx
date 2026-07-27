"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw } from "lucide-react";

import { FRAME_RATES, convertTimecode } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [mode, setMode] = useState("timecode");
  const [value, setValue] = useState("01:02:03:12");
  const [fpsId, setFpsId] = useState("29.97");
  const [dropFrame, setDropFrame] = useState(false);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => convertTimecode({ mode, value, fpsId, dropFrame }), [mode, value, fpsId, dropFrame]);
  const copyResult = async () => {
    if (result.error) return;
    const text = [`Timecode To Frames Converter`, `Frames: ${result.frameNumber}`, `Active TC: ${result.activeTimecode}`, `Non-drop: ${result.nonDropTimecode}`, `Drop: ${result.dropTimecode || "n/a"}`, `Real time: ${result.realClock}`].join("\n");
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  };
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]"><Clock className="h-4 w-4" aria-hidden="true" />SMPTE math</div><h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Timecode To Frames Converter</h1><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Convert between timecode, frames and real seconds at common frame rates, including 29.97 drop-frame.</p></header>
      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><div className="grid gap-4 sm:grid-cols-4"><div><label className="block text-sm font-semibold" htmlFor="tc-mode">From</label><select id="tc-mode" className={`mt-2 ${INPUT_CLASS}`} value={mode} onChange={(event) => setMode(event.target.value)}><option value="timecode">Timecode</option><option value="frames">Frames</option><option value="seconds">Seconds</option></select></div><div className="sm:col-span-2"><label className="block text-sm font-semibold" htmlFor="tc-value">Value</label><input id="tc-value" className={`mt-2 ${INPUT_CLASS}`} value={value} onChange={(event) => setValue(event.target.value)} /></div><div><label className="block text-sm font-semibold" htmlFor="tc-fps">Frame rate</label><select id="tc-fps" className={`mt-2 ${INPUT_CLASS}`} value={fpsId} onChange={(event) => setFpsId(event.target.value)}>{FRAME_RATES.map((rate) => <option key={rate.id} value={rate.id}>{rate.label}</option>)}</select></div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={dropFrame} onChange={(event) => setDropFrame(event.target.checked)} />Drop frame</label></div></section>
      {result.error ? <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">{result.error}</p> : <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><div className="grid gap-3 sm:grid-cols-4"><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Frames</p><p className="mt-1 font-semibold">{result.frameNumber}</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Active TC</p><p className="mt-1 font-semibold">{result.activeTimecode}</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Real clock</p><p className="mt-1 font-semibold">{result.realClock}</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Drift</p><p className="mt-1 font-semibold">{result.nonDropDriftSeconds.toFixed(3)}s</p></div></div><div className="mt-5 flex flex-wrap gap-2"><button className={GHOST_BTN} type="button" aria-label="Reset all inputs" onClick={() => { setMode("timecode"); setValue("01:02:03:12"); setFpsId("29.97"); setDropFrame(false); }}><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset</button><button className={PRIMARY_BTN} type="button" aria-label="Copy the timecode conversion" onClick={copyResult}>{copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{copied ? "Copied!" : "Copy"}</button></div></section>}
    </main>
  );
}
