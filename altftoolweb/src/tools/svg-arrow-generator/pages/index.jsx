"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Spline } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  CURVE_MAX,
  CURVE_MIN,
  HEAD_STYLES,
  arrowToSvg,
  buildArrow,
  parseNumber,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DEFAULTS = {
  width: "320",
  height: "200",
  x1: "24",
  y1: "160",
  x2: "296",
  y2: "56",
  curvePercent: "18",
  strokeWidth: "4",
  headSize: "20",
  headStyle: "triangle",
  dashed: false,
  doubleHeaded: false,
};

const PRESETS = [
  { label: "Straight callout", values: { x1: "24", y1: "100", x2: "296", y2: "100", curvePercent: "0" } },
  { label: "Gentle arc", values: { x1: "24", y1: "160", x2: "296", y2: "56", curvePercent: "18" } },
  { label: "Deep hook", values: { x1: "40", y1: "40", x2: "280", y2: "160", curvePercent: "45" } },
  { label: "Back-curve", values: { x1: "40", y1: "160", x2: "280", y2: "160", curvePercent: "-35" } },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const arrow = useMemo(
    () =>
      buildArrow({
        width: parseNumber(form.width),
        height: parseNumber(form.height),
        x1: parseNumber(form.x1),
        y1: parseNumber(form.y1),
        x2: parseNumber(form.x2),
        y2: parseNumber(form.y2),
        curvePercent: parseNumber(form.curvePercent),
        strokeWidth: parseNumber(form.strokeWidth),
        headSize: parseNumber(form.headSize),
        headStyle: form.headStyle,
        dashed: form.dashed,
        doubleHeaded: form.doubleHeaded,
      }),
    [form],
  );

  const markup = useMemo(() => arrowToSvg(arrow), [arrow]);
  const failed = Boolean(arrow.error);

  const reset = () => {
    setForm(DEFAULTS);
  };

  const numberField = (id, label, key, step, min, max) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        value={form[key]}
        onChange={(event) => setField(key, event.target.value)}
      />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Spline className="h-4 w-4" aria-hidden="true" />
          Vector annotation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SVG Arrow Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set two points, bend the shaft, pick a head, and copy hand-editable SVG. The arrow is
          drawn with a single quadratic Bezier and inherits colour from <code>currentColor</code>,
          so it adapts to light and dark backgrounds wherever you paste it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberField("arrow-width", "Canvas width", "width", "10", "40", "2000")}
          {numberField("arrow-height", "Canvas height", "height", "10", "40", "2000")}
          {numberField("arrow-x1", "Start X", "x1", "1")}
          {numberField("arrow-y1", "Start Y", "y1", "1")}
          {numberField("arrow-x2", "End X", "x2", "1")}
          {numberField("arrow-y2", "End Y", "y2", "1")}
          {numberField("arrow-stroke", "Stroke width", "strokeWidth", "0.5", "0.25", "40")}
          {numberField("arrow-head", "Arrowhead size", "headSize", "1", "0", "200")}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="arrow-curve">
            Bow height ({form.curvePercent}% of the straight-line distance)
          </label>
          <input
            id="arrow-curve"
            className="mt-3 h-11 w-full accent-[var(--primary)]"
            type="range"
            min={CURVE_MIN}
            max={CURVE_MAX}
            step="1"
            value={form.curvePercent}
            onChange={(event) => setField("curvePercent", event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="arrow-headstyle">
              Head style
            </label>
            <select
              id="arrow-headstyle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.headStyle}
              onChange={(event) => setField("headStyle", event.target.value)}
            >
              {HEAD_STYLES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label
              className="flex min-h-11 items-center gap-3 text-sm font-semibold"
              htmlFor="arrow-dashed"
            >
              <input
                id="arrow-dashed"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={form.dashed}
                onChange={(event) => setField("dashed", event.target.checked)}
              />
              Dashed shaft
            </label>
            <label
              className="flex min-h-11 items-center gap-3 text-sm font-semibold"
              htmlFor="arrow-double"
            >
              <input
                id="arrow-double"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={form.doubleHeaded}
                onChange={(event) => setField("doubleHeaded", event.target.checked)}
              />
              Head at both ends
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP_BTN}
              onClick={() => setForm((prev) => ({ ...prev, ...preset.values }))}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {arrow.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div role="status" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Shaft length along the curve
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM.format(arrow.shaftLength)} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to draw the arrow."
                : `Straight-line distance ${NUM.format(arrow.chordLength)} px`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label={isCopied("svg") ? "Copied the generated SVG markup" : "Copy the generated SVG markup"}
              onClick={() => copy("svg", markup, { label: "SVG markup" })}
              disabled={failed}
            >
              {isCopied("svg") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("svg") ? "Copied!" : "Copy SVG"}
            </button>
            <button type="button" className={PRIMARY_BTN} aria-label="Reset all inputs" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-3">
          {failed ? (
            <p className="py-10 text-center text-sm text-[var(--muted-foreground)]">{DASH}</p>
          ) : (
            <svg
              viewBox={`0 0 ${arrow.width} ${arrow.height}`}
              className="mx-auto block h-auto w-full max-w-full text-[var(--primary)]"
              fill="none"
              stroke="currentColor"
              role="img"
              aria-label={`Preview of the generated arrow, ${NUM.format(arrow.shaftLength)} pixels long`}
            >
              <path
                d={arrow.shaftD}
                strokeWidth={arrow.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={arrow.dashArray || undefined}
              />
              {[arrow.endHead, arrow.startHead].map((head, index) =>
                !head ? null : head.kind === "polygon" ? (
                  <polygon key={index} points={head.points} fill="currentColor" stroke="none" />
                ) : (
                  <path
                    key={index}
                    d={head.d}
                    strokeWidth={arrow.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ),
              )}
            </svg>
          )}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" role="status" aria-live="polite">
          {[
            ["Bezier control point", failed ? DASH : `${arrow.control.x}, ${arrow.control.y}`],
            ["Bow height at the midpoint", failed ? DASH : `${NUM.format(arrow.bowHeight)} px`],
            ["Head angle at the tip", failed ? DASH : `${NUM.format(arrow.endAngleDeg)}°`],
            [
              "Tail angle",
              failed || !arrow.doubleHeaded ? DASH : `${NUM.format(arrow.startAngleDeg)}°`,
            ],
            ["Head style", failed ? DASH : arrow.headStyle],
            ["Canvas", failed ? DASH : `${arrow.width} × ${arrow.height}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">SVG markup</h2>
          <button
            type="button"
            className={GHOST_BTN}
            aria-label={isCopied("path") ? "Copied the path data of the arrow shaft" : "Copy only the path data of the arrow shaft"}
            onClick={() => copy("path", arrow.fullPathD || "", { label: "Path data" })}
            disabled={failed}
          >
            {isCopied("path") ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {isCopied("path") ? "Copied!" : "Copy path only"}
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-full whitespace-pre rounded-md bg-[var(--background)] p-3 text-xs leading-5 text-[var(--foreground)]">
            {failed ? DASH : markup}
          </pre>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Stroke and fill are set to <code>currentColor</code>. Set a <code>color</code> on the
          parent element (or add your own <code>stroke</code> attribute) to recolour the arrow.
        </p>
      </section>
    </main>
  );
}
