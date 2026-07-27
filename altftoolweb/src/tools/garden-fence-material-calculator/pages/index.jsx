"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fence, RotateCcw } from "lucide-react";

import { FENCE_STYLES, LENGTH_UNITS, computeFenceMaterials, presetInUnit } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const DEFAULTS = {
  fenceLength: "40",
  unit: "m",
  closedLoop: true,
  gateWidth: "1",
  style: "picket",
  postSpacing: "2.4",
  fenceHeight: "1.2",
  postWidthMm: "100",
  strands: "0",
  panelWidth: "2.4",
  corners: "4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [fenceLength, setFenceLength] = useState(DEFAULTS.fenceLength);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [closedLoop, setClosedLoop] = useState(DEFAULTS.closedLoop);
  const [gateWidth, setGateWidth] = useState(DEFAULTS.gateWidth);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [postSpacing, setPostSpacing] = useState(DEFAULTS.postSpacing);
  const [fenceHeight, setFenceHeight] = useState(DEFAULTS.fenceHeight);
  const [postWidthMm, setPostWidthMm] = useState(DEFAULTS.postWidthMm);
  const [strands, setStrands] = useState(DEFAULTS.strands);
  const [panelWidth, setPanelWidth] = useState(DEFAULTS.panelWidth);
  const [corners, setCorners] = useState(DEFAULTS.corners);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeFenceMaterials({
        fenceLength,
        unit,
        closedLoop,
        gateWidth,
        postSpacing,
        fenceHeight,
        postWidthMm,
        strands,
        panelWidth,
        corners,
      }),
    [
      fenceLength,
      unit,
      closedLoop,
      gateWidth,
      postSpacing,
      fenceHeight,
      postWidthMm,
      strands,
      panelWidth,
      corners,
    ],
  );

  const hasError = Boolean(result.error);

  const applyStyle = (value) => {
    setStyle(value);
    const preset = FENCE_STYLES.find((option) => option.value === value);
    if (!preset) return;
    setPostSpacing(String(presetInUnit(preset.spacing, unit)));
    setStrands(String(preset.strands));
    setPanelWidth(String(presetInUnit(preset.panelWidth, unit)));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Garden Fence Material Calculator",
      `Fence run: ${NUM2.format(result.totalM)} m, less ${NUM2.format(result.gateM)} m of gates = ${NUM2.format(result.netM)} m`,
      `Posts: ${result.posts} (${result.bracedPosts} corner/end, ${result.linePosts} line)`,
      `Bays: ${result.bays} at ${NUM2.format(result.actualSpacingM)} m centres`,
      result.panels > 0 ? `Panels: ${result.panels} at ${NUM2.format(result.panelWidthM)} m` : "Panels: not applicable",
      result.strands > 0 ? `Wire: ${NUM1.format(result.wireM)} m for ${result.strands} strands` : "Wire: not applicable",
      `Post length: ${NUM2.format(result.postLengthM)} m each (${NUM2.format(result.burialM)} m buried)`,
      `Concrete: ${NUM3.format(result.concreteTotalM3)} m³ total, about ${result.cementBags} cement bags`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFenceLength(DEFAULTS.fenceLength);
    setUnit(DEFAULTS.unit);
    setClosedLoop(DEFAULTS.closedLoop);
    setGateWidth(DEFAULTS.gateWidth);
    setStyle(DEFAULTS.style);
    setPostSpacing(DEFAULTS.postSpacing);
    setFenceHeight(DEFAULTS.fenceHeight);
    setPostWidthMm(DEFAULTS.postWidthMm);
    setStrands(DEFAULTS.strands);
    setPanelWidth(DEFAULTS.panelWidth);
    setCorners(DEFAULTS.corners);
    setCopied(false);
  };

  const rows = [
    ["Fence to build (gates deducted)", hasError ? DASH : `${NUM2.format(result.netM)} m`],
    ["Bays between posts", hasError ? DASH : `${result.bays}`],
    ["Actual post centres", hasError ? DASH : `${NUM2.format(result.actualSpacingM)} m (asked for ${NUM2.format(result.requestedSpacingM)} m)`],
    ["Corner and end posts (brace these)", hasError ? DASH : `${result.bracedPosts}`],
    ["Line posts", hasError ? DASH : `${result.linePosts}`],
    ["Post length to buy", hasError ? DASH : `${NUM2.format(result.postLengthM)} m each · ${NUM1.format(result.totalPostTimberM)} m total`],
    ["Buried depth per post", hasError ? DASH : `${NUM2.format(result.burialM)} m`],
    ["Panels or mesh runs", hasError ? DASH : result.panels > 0 ? `${result.panels} at ${NUM2.format(result.panelWidthM)} m` : "Not used"],
    ["Wire", hasError ? DASH : result.strands > 0 ? `${NUM1.format(result.wireM)} m (${result.strands} strands, 10% slack)` : "Not used"],
    ["Post hole diameter", hasError ? DASH : `${INT.format(result.holeDiaMm)} mm`],
    ["Concrete per hole", hasError ? DASH : `${NUM1.format(result.concretePerPostLitres)} L`],
    ["Concrete total", hasError ? DASH : `${NUM3.format(result.concreteTotalM3)} m³`],
    ["Cement at 1:2:4", hasError ? DASH : `${INT.format(result.cementKg)} kg · ${result.cementBags} bags of 50 kg`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Fence className="h-4 w-4" aria-hidden="true" />
          Lawn &amp; landscape
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Garden Fence Material Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turns a fence length into a shopping list: posts, bays, panels, wire and the concrete for
          every post hole, with spacing evened out so you do not finish on a stub bay.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fence-length">
              Total fence length or perimeter
            </label>
            <input
              id="fence-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={fenceLength}
              onChange={(event) => setFenceLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fence-unit">
              Measurement unit
            </label>
            <select
              id="fence-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {LENGTH_UNITS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fence-style">
              Fence style
            </label>
            <select
              id="fence-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => applyStyle(event.target.value)}
            >
              {FENCE_STYLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Picking a style fills in typical spacing, panel width and strand count — edit any of them.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fence-gate">
              Total gate width
            </label>
            <input
              id="fence-gate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={gateWidth}
              onChange={(event) => setGateWidth(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fence-spacing">
              Maximum post spacing
            </label>
            <input
              id="fence-spacing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.1"
              value={postSpacing}
              onChange={(event) => setPostSpacing(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fence-height">
              Fence height above ground
            </label>
            <input
              id="fence-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={fenceHeight}
              onChange={(event) => setFenceHeight(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fence-post-width">
              Post section width (mm)
            </label>
            <input
              id="fence-post-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="25"
              max="500"
              step="5"
              value={postWidthMm}
              onChange={(event) => setPostWidthMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fence-corners">
              Corners in the run
            </label>
            <input
              id="fence-corners"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="1"
              value={corners}
              onChange={(event) => setCorners(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fence-panel">
              Panel or mesh roll width (0 if none)
            </label>
            <input
              id="fence-panel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={panelWidth}
              onChange={(event) => setPanelWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fence-strands">
              Horizontal wire strands (0 if none)
            </label>
            <input
              id="fence-strands"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={strands}
              onChange={(event) => setStrands(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--foreground)]" htmlFor="fence-loop">
              <input
                id="fence-loop"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={closedLoop}
                onChange={(event) => setClosedLoop(event.target.checked)}
              />
              The fence returns to where it started (a closed perimeter)
            </label>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Posts required
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : INT.format(result.posts)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a take-off."
                : `${result.bays} bays at ${NUM2.format(result.actualSpacingM)} m over ${NUM2.format(result.netM)} m of fence`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy fence material take-off"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.notes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {result.notes.map((note) => (
            <li
              key={note}
              className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Quantities are an estimate for ordering. Check your local boundary rules and any society or
        municipal height limit before building, and confirm the boundary line with your neighbour —
        a fence on the wrong side of it is expensive to move.
      </p>
    </main>
  );
}
