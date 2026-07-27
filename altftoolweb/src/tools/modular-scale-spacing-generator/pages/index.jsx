"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ruler } from "lucide-react";

import {
  buildExport,
  DEFAULT_ROOT_PX,
  EXPORT_FORMATS,
  generateScale,
  NAMING_SCHEMES,
  RATIOS,
  SNAP_OPTIONS,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const DEFAULTS = {
  basePx: "16",
  ratioId: "minor-third",
  customRatio: "1.5",
  stepsUp: "5",
  stepsDown: "2",
  rootPx: String(DEFAULT_ROOT_PX),
  snap: "4",
  naming: "tshirt",
  prefix: "space",
  format: "css",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [basePx, setBasePx] = useState(DEFAULTS.basePx);
  const [ratioId, setRatioId] = useState(DEFAULTS.ratioId);
  const [customRatio, setCustomRatio] = useState(DEFAULTS.customRatio);
  const [stepsUp, setStepsUp] = useState(DEFAULTS.stepsUp);
  const [stepsDown, setStepsDown] = useState(DEFAULTS.stepsDown);
  const [rootPx, setRootPx] = useState(DEFAULTS.rootPx);
  const [snap, setSnap] = useState(DEFAULTS.snap);
  const [naming, setNaming] = useState(DEFAULTS.naming);
  const [prefix, setPrefix] = useState(DEFAULTS.prefix);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateScale({
        basePx: Number(basePx),
        ratioId,
        customRatio: Number(customRatio),
        stepsUp: Number(stepsUp),
        stepsDown: Number(stepsDown),
        rootPx: Number(rootPx),
        snap: Number(snap),
        naming,
      }),
    [basePx, ratioId, customRatio, stepsUp, stepsDown, rootPx, snap, naming],
  );

  const error = result.error || null;
  const safePrefix = prefix.trim().replace(/[^a-zA-Z0-9-]/g, "") || "space";
  const output = error ? "" : buildExport(result, format, safePrefix);

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBasePx(DEFAULTS.basePx);
    setRatioId(DEFAULTS.ratioId);
    setCustomRatio(DEFAULTS.customRatio);
    setStepsUp(DEFAULTS.stepsUp);
    setStepsDown(DEFAULTS.stepsDown);
    setRootPx(DEFAULTS.rootPx);
    setSnap(DEFAULTS.snap);
    setNaming(DEFAULTS.naming);
    setPrefix(DEFAULTS.prefix);
    setFormat(DEFAULTS.format);
    setCopied(false);
  };

  const largest = error ? 1 : Math.max(...result.steps.map((step) => step.px), 1);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Design tokens
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Modular Spacing Scale Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Multiply a base value by a fixed ratio to build a spacing scale, snap it to a 4 or 8 point
          grid, and export it as CSS custom properties, a Tailwind theme block, an SCSS map or JSON
          design tokens.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mssg-base">
              Base spacing (px)
            </label>
            <input
              id="mssg-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={basePx}
              onChange={(event) => setBasePx(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mssg-ratio">
              Scale ratio
            </label>
            <select
              id="mssg-ratio"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ratioId}
              onChange={(event) => setRatioId(event.target.value)}
            >
              {RATIOS.map((ratio) => (
                <option key={ratio.id} value={ratio.id}>
                  {ratio.label} — {ratio.note}
                </option>
              ))}
              <option value="custom">Custom ratio</option>
            </select>
          </div>
          {ratioId === "custom" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="mssg-custom">
                Custom ratio
              </label>
              <input
                id="mssg-custom"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1.01"
                max="4"
                step="0.001"
                value={customRatio}
                onChange={(event) => setCustomRatio(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="mssg-up">
              Steps above the base
            </label>
            <input
              id="mssg-up"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="12"
              step="1"
              value={stepsUp}
              onChange={(event) => setStepsUp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mssg-down">
              Steps below the base
            </label>
            <input
              id="mssg-down"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="12"
              step="1"
              value={stepsDown}
              onChange={(event) => setStepsDown(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mssg-snap">
              Snap to grid
            </label>
            <select
              id="mssg-snap"
              className={`mt-2 ${INPUT_CLASS}`}
              value={snap}
              onChange={(event) => setSnap(event.target.value)}
            >
              {SNAP_OPTIONS.map((option) => (
                <option key={option.id} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mssg-root">
              Root font size (px)
            </label>
            <input
              id="mssg-root"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={rootPx}
              onChange={(event) => setRootPx(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mssg-naming">
              Token naming
            </label>
            <select
              id="mssg-naming"
              className={`mt-2 ${INPUT_CLASS}`}
              value={naming}
              onChange={(event) => setNaming(event.target.value)}
            >
              {NAMING_SCHEMES.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mssg-prefix">
              Token prefix
            </label>
            <input
              id="mssg-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[4, 8, 12, 16].map((value) => (
            <button key={value} type="button" onClick={() => setBasePx(String(value))} className={CHIP_BTN}>
              Base {value}px
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Scale ratio
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : `${NUM3.format(result.ratio)}×`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the input above to build the scale."
                : `${result.ratioLabel} · ${NUM.format(result.stepCount)} steps`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyOutput}
              aria-label="Copy the generated tokens"
              className={GHOST_BTN}
              disabled={!output}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy tokens"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Smallest step", error ? "—" : `${NUM2.format(result.smallestPx)} px`],
            ["Base step", error ? "—" : `${NUM2.format(result.base)} px`],
            ["Largest step", error ? "—" : `${NUM2.format(result.largestPx)} px`],
            ["Span, smallest to largest", error ? "—" : `${NUM2.format(result.spanMultiple)}×`],
            ["Grid snapping", error ? "—" : result.snap > 0 ? `${NUM.format(result.snap)} pt` : "off"],
            ["Root font size", error ? "—" : `${NUM.format(result.rootPx)} px = 1rem`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {error ? null : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">The scale</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[440px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Token</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">px</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">rem</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Step up</th>
                    <th scope="col" className="py-2 font-semibold">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {result.steps.map((step) => (
                    <tr key={step.index} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {safePrefix}-{step.name}
                        {step.isBase ? (
                          <span className="ml-2 text-xs font-medium text-[var(--primary)]">base</span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {NUM2.format(step.px)}
                        {step.snapped ? (
                          <span className="ml-1 text-xs text-[var(--muted-foreground)]">snapped</span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {NUM3.format(step.rem)}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {step.growthPct === null ? "—" : `+${NUM2.format(step.growthPct)}%`}
                      </td>
                      <td className="py-2">
                        <span
                          className="block h-3 rounded-sm bg-[var(--primary)]"
                          style={{ width: `${Math.max(2, (step.px / largest) * 100)}%` }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Export</h2>
              <div>
                <label className="sr-only" htmlFor="mssg-format">
                  Export format
                </label>
                <select
                  id="mssg-format"
                  className={INPUT_CLASS}
                  value={format}
                  onChange={(event) => setFormat(event.target.value)}
                >
                  {EXPORT_FORMATS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] px-3 py-3 text-xs leading-5 text-[var(--foreground)]">
              {output}
            </pre>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Values are exported in rem so they scale with the reader's browser font size. Snapping to a
        4 or 8 point grid keeps neighbouring components aligned, at the cost of the exact
        proportional relationship between steps.
      </p>
    </main>
  );
}
