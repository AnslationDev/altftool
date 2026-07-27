"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fence, RotateCcw } from "lucide-react";

import { BAG_SIZES, MAX_SPACING_PRESETS, POST_SIZES, planFence } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const ONE = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DEFAULTS = {
  runLength: "100",
  unit: "ft",
  fenceType: "wood",
  maxSpacing: "8",
  fenceHeight: "6",
  postSize: "wood4x4",
  holeDiameterIn: "",
  gravelIn: "6",
  bagSize: "lb80",
  closedLoop: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [runLength, setRunLength] = useState(DEFAULTS.runLength);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [fenceType, setFenceType] = useState(DEFAULTS.fenceType);
  const [maxSpacing, setMaxSpacing] = useState(DEFAULTS.maxSpacing);
  const [fenceHeight, setFenceHeight] = useState(DEFAULTS.fenceHeight);
  const [postSize, setPostSize] = useState(DEFAULTS.postSize);
  const [holeDiameterIn, setHoleDiameterIn] = useState(DEFAULTS.holeDiameterIn);
  const [gravelIn, setGravelIn] = useState(DEFAULTS.gravelIn);
  const [bagSize, setBagSize] = useState(DEFAULTS.bagSize);
  const [closedLoop, setClosedLoop] = useState(DEFAULTS.closedLoop);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planFence({
        runLength,
        unit,
        maxSpacing,
        fenceHeight,
        postSize,
        holeDiameterIn,
        gravelIn,
        bagSize,
        closedLoop,
      }),
    [
      runLength,
      unit,
      maxSpacing,
      fenceHeight,
      postSize,
      holeDiameterIn,
      gravelIn,
      bagSize,
      closedLoop,
    ],
  );

  const failed = Boolean(result.error);

  const applyFenceType = (key) => {
    setFenceType(key);
    const preset = MAX_SPACING_PRESETS[key];
    if (!preset) return;
    // Presets are quoted in feet; convert when the user is working in metres.
    setMaxSpacing(unit === "m" ? String(Math.round(preset.feet * 0.3048 * 100) / 100) : String(preset.feet));
  };

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Fence Post Spacing Calculator",
      `Run: ${NUM.format(result.runFt)} ft in ${result.sections} sections`,
      `Posts needed: ${result.posts}`,
      `On-centre spacing: ${NUM.format(result.spacingFt)} ft (${ONE.format(result.spacingIn)} in / ${NUM.format(result.spacingM)} m)`,
      `Post: ${result.postLabel}`,
      `Buy posts at least ${NUM.format(result.postLengthFt)} ft long (${ONE.format(result.postLengthIn)} in)`,
      `Burial depth: ${ONE.format(result.burialIn)} in (${ONE.format(result.burialCm)} cm)`,
      `Hole: ${NUM.format(result.holeDiameterIn)} in wide × ${ONE.format(result.holeDepthIn)} in deep`,
      `Concrete per hole: ${NUM.format(result.concretePerHoleFt3)} ft³ (${ONE.format(result.concretePerHoleL)} L) = ${NUM.format(result.bagsPerHole)} × ${result.bagLabel}`,
      `Total concrete: ${NUM.format(result.totalConcreteFt3)} ft³ (${NUM.format(result.totalConcreteM3)} m³) — ${result.totalBags} bags`,
      `Gravel for the drainage beds: ${NUM.format(result.totalGravelFt3)} ft³`,
    ].join("\n");
  }, [failed, result]);

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
    setRunLength(DEFAULTS.runLength);
    setUnit(DEFAULTS.unit);
    setFenceType(DEFAULTS.fenceType);
    setMaxSpacing(DEFAULTS.maxSpacing);
    setFenceHeight(DEFAULTS.fenceHeight);
    setPostSize(DEFAULTS.postSize);
    setHoleDiameterIn(DEFAULTS.holeDiameterIn);
    setGravelIn(DEFAULTS.gravelIn);
    setBagSize(DEFAULTS.bagSize);
    setClosedLoop(DEFAULTS.closedLoop);
    setCopied(false);
  };

  const rows = failed
    ? [
        ["Sections between posts", DASH],
        ["On-centre spacing", DASH],
        ["Post length to buy", DASH],
        ["Burial depth", DASH],
        ["Hole diameter × depth", DASH],
        ["Concrete per hole", DASH],
        ["Bags per hole", DASH],
        ["Total concrete", DASH],
        ["Total bags to buy", DASH],
        ["Gravel for drainage beds", DASH],
      ]
    : [
        ["Sections between posts", INT.format(result.sections)],
        [
          "On-centre spacing",
          `${NUM.format(result.spacingFt)} ft (${ONE.format(result.spacingIn)} in / ${NUM.format(result.spacingM)} m)`,
        ],
        [
          "Post length to buy",
          `${NUM.format(result.postLengthFt)} ft (${ONE.format(result.postLengthIn)} in)`,
        ],
        ["Burial depth", `${ONE.format(result.burialIn)} in (${ONE.format(result.burialCm)} cm)`],
        [
          "Hole diameter × depth",
          `${NUM.format(result.holeDiameterIn)} in × ${ONE.format(result.holeDepthIn)} in`,
        ],
        [
          "Concrete per hole",
          `${NUM.format(result.concretePerHoleFt3)} ft³ (${ONE.format(result.concretePerHoleL)} L)`,
        ],
        ["Bags per hole", `${NUM.format(result.bagsPerHole)} × ${result.bagLabel}`],
        [
          "Total concrete",
          `${NUM.format(result.totalConcreteFt3)} ft³ (${NUM.format(result.totalConcreteM3)} m³)`,
        ],
        ["Total bags to buy", `${INT.format(result.totalBags)} × ${result.bagLabel}`],
        ["Gravel for drainage beds", `${NUM.format(result.totalGravelFt3)} ft³`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fence className="h-4 w-4" aria-hidden="true" />
          Fencing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Fence Post Spacing Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Divides a run into even sections, then works out post length, hole depth and diameter and
          the bags of concrete per hole — using the standard rules of burying a third of the post and
          digging three times its width.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-unit">
              Unit
            </label>
            <select
              id="fp-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="ft">Feet</option>
              <option value="m">Metres</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-run">
              Total fence run ({unit})
            </label>
            <input
              id="fp-run"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={runLength}
              onChange={(event) => setRunLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-type">
              Fence type
            </label>
            <select
              id="fp-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fenceType}
              onChange={(event) => applyFenceType(event.target.value)}
            >
              {Object.values(MAX_SPACING_PRESETS).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label} — max {option.feet} ft
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-spacing">
              Maximum spacing ({unit})
            </label>
            <input
              id="fp-spacing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={maxSpacing}
              onChange={(event) => setMaxSpacing(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-height">
              Fence height above ground ({unit})
            </label>
            <input
              id="fp-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={fenceHeight}
              onChange={(event) => setFenceHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-post">
              Post size
            </label>
            <select
              id="fp-post"
              className={`mt-2 ${INPUT_CLASS}`}
              value={postSize}
              onChange={(event) => setPostSize(event.target.value)}
            >
              {Object.values(POST_SIZES).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-hole">
              Hole diameter (in) — blank for 3× post
            </label>
            <input
              id="fp-hole"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="48"
              step="0.5"
              placeholder={failed ? "auto" : String(result.autoHoleDiaIn)}
              value={holeDiameterIn}
              onChange={(event) => setHoleDiameterIn(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-gravel">
              Gravel bed under post (in)
            </label>
            <input
              id="fp-gravel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={gravelIn}
              onChange={(event) => setGravelIn(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fp-bag">
              Concrete bag size
            </label>
            <select
              id="fp-bag"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bagSize}
              onChange={(event) => setBagSize(event.target.value)}
            >
              {Object.values(BAG_SIZES).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
              htmlFor="fp-loop"
            >
              <input
                id="fp-loop"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={closedLoop}
                onChange={(event) => setClosedLoop(event.target.checked)}
              />
              The fence closes back on itself (an enclosure, not a straight run)
            </label>
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Posts needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : INT.format(result.posts)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see a layout."
                : `${result.sections} sections at ${NUM.format(result.spacingFt)} ft on centre`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy fence post spacing result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Holes must also reach below your local frost line, corner and gate posts
        carry more load and are usually set deeper or one size larger, and many areas require a
        permit or a boundary survey before you build. Call the utility locate service before digging.
      </p>
    </main>
  );
}
