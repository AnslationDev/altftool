"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Type } from "lucide-react";

import { TYPE_SCALE_RATIOS, buildHeadingHierarchy, toCss } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [baseSizePx, setBaseSizePx] = useState("18");
  const [ratioId, setRatioId] = useState("major-third");
  const [rootSizePx, setRootSizePx] = useState("16");
  const [headingWeight, setHeadingWeight] = useState("750");
  const [bodyLineHeight, setBodyLineHeight] = useState("1.6");
  const [unit, setUnit] = useState("rem");
  const [copied, setCopied] = useState(false);

  const ratio = TYPE_SCALE_RATIOS.find((item) => item.id === ratioId)?.ratio || 1.25;
  const hierarchy = useMemo(
    () =>
      buildHeadingHierarchy({
        baseSizePx: Number(baseSizePx),
        ratio,
        rootSizePx: Number(rootSizePx),
        headingWeight: Number(headingWeight),
        bodyLineHeight: Number(bodyLineHeight),
      }),
    [baseSizePx, ratio, rootSizePx, headingWeight, bodyLineHeight],
  );
  const css = useMemo(() => toCss(hierarchy, { unit }), [hierarchy, unit]);

  const copyCss = async () => {
    if (!css) return;
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBaseSizePx("18");
    setRatioId("major-third");
    setRootSizePx("16");
    setHeadingWeight("750");
    setBodyLineHeight("1.6");
    setUnit("rem");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Type className="h-4 w-4" aria-hidden="true" />
          Type scale
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Heading Hierarchy Preview</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build an H1-H6 hierarchy from a modular scale, preview the optical spacing and copy ready CSS.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-base">Body size px</label>
            <input id="hh-base" className={`mt-2 ${INPUT_CLASS}`} type="number" min="8" max="120" value={baseSizePx} onChange={(event) => setBaseSizePx(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-ratio">Scale ratio</label>
            <select id="hh-ratio" className={`mt-2 ${INPUT_CLASS}`} value={ratioId} onChange={(event) => setRatioId(event.target.value)}>
              {TYPE_SCALE_RATIOS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · {item.ratio}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-root">Root px</label>
            <input id="hh-root" className={`mt-2 ${INPUT_CLASS}`} type="number" min="8" max="32" value={rootSizePx} onChange={(event) => setRootSizePx(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-weight">Heading weight</label>
            <input id="hh-weight" className={`mt-2 ${INPUT_CLASS}`} type="number" min="400" max="900" step="50" value={headingWeight} onChange={(event) => setHeadingWeight(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-line">Body line height</label>
            <input id="hh-line" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="3" step="0.05" value={bodyLineHeight} onChange={(event) => setBodyLineHeight(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-unit">CSS unit</label>
            <select id="hh-unit" className={`mt-2 ${INPUT_CLASS}`} value={unit} onChange={(event) => setUnit(event.target.value)}>
              <option value="rem">rem</option>
              <option value="px">px</option>
            </select>
          </div>
        </div>
      </section>

      {hierarchy.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {hierarchy.error}
        </p>
      ) : (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Preview</p>
            <div className="mt-4 space-y-4">
              {hierarchy.levels.map((row) => (
                <div key={row.tag} className="rounded-lg bg-[var(--surface-soft)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{row.tag.toUpperCase()} · {row.sizePx}px · line {row.lineHeight}</p>
                  <p className="mt-2 leading-none" style={{ fontSize: `${Math.min(row.sizePx, 72)}px`, fontWeight: row.weight }}>
                    Design system heading
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">CSS</p>
              <div className="flex gap-2">
                <button className={GHOST_BTN} type="button" onClick={reset} aria-label="Reset all inputs">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
                <button className={PRIMARY_BTN} type="button" onClick={copyCss} aria-label="Copy the heading hierarchy CSS">
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-soft)] p-4 text-xs leading-5">{css}</pre>
          </div>
        </section>
      )}
    </main>
  );
}
