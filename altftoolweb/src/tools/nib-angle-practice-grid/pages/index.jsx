"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PenTool, Printer, RotateCcw } from "lucide-react";

import {
  ANGLE_MARK_SPACING_NIB_WIDTHS,
  DEFAULT_GAP_NIB_WIDTHS,
  HANDS,
  PAGE_SIZES,
  buildGrid,
  nibLadder,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DEFAULTS = {
  hand: "foundational",
  nib: "3.8",
  page: "a4",
  margin: "15",
  gap: String(DEFAULT_GAP_NIB_WIDTHS),
  angle: "",
};
const DASH = "—";
const MM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const NIB_PRESETS = [
  { label: "Pilot Parallel 1.5", value: "1.5" },
  { label: "Pilot Parallel 2.4", value: "2.4" },
  { label: "Brause 3.0", value: "3.0" },
  { label: "Pilot Parallel 3.8", value: "3.8" },
  { label: "Brause 5.0", value: "5.0" },
];

export default function ToolHome() {
  const [hand, setHand] = useState(DEFAULTS.hand);
  const [nib, setNib] = useState(DEFAULTS.nib);
  const [page, setPage] = useState(DEFAULTS.page);
  const [margin, setMargin] = useState(DEFAULTS.margin);
  const [gap, setGap] = useState(DEFAULTS.gap);
  const [angle, setAngle] = useState(DEFAULTS.angle);
  const [showSlant, setShowSlant] = useState(true);
  const [copied, setCopied] = useState(false);

  const grid = useMemo(
    () =>
      buildGrid({
        handKey: hand,
        nibWidthMm: Number(nib),
        pageKey: page,
        marginMm: Number(margin),
        gapNibWidths: Number(gap),
        penAngleOverride: angle.trim() === "" ? null : Number(angle),
      }),
    [hand, nib, page, margin, gap, angle],
  );

  const ok = !grid.error;

  const ladder = useMemo(
    () => (ok ? nibLadder(grid.nibWidthMm, Math.max(1, grid.hand.xHeight)) : { error: grid.error }),
    [ok, grid],
  );

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `${grid.hand.name} guide sheet`,
      `Nib width: ${MM.format(grid.nibWidthMm)} mm`,
      `Pen angle: ${grid.penAngleDeg}°`,
      `x-height: ${grid.hand.xHeight} nib widths = ${MM.format(grid.xHeightMm)} mm`,
      `Ascender: ${grid.hand.ascender} nib widths = ${MM.format(grid.ascenderMm)} mm`,
      `Descender: ${grid.hand.descender} nib widths = ${MM.format(grid.descenderMm)} mm`,
      `Line set height: ${MM.format(grid.lineSetHeightMm)} mm, pitch ${MM.format(grid.rowPitchMm)} mm`,
      `Rows on ${grid.page.label}: ${grid.rowCount}`,
      `Predicted stem width: ${MM.format(grid.strokes.stem)} mm; horizontal bar ${MM.format(grid.strokes.bar)} mm`,
    ].join("\n");
  }, [ok, grid]);

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

  const printSheet = () => {
    if (typeof window !== "undefined") window.print();
  };

  const reset = () => {
    setHand(DEFAULTS.hand);
    setNib(DEFAULTS.nib);
    setPage(DEFAULTS.page);
    setMargin(DEFAULTS.margin);
    setGap(DEFAULTS.gap);
    setAngle(DEFAULTS.angle);
    setShowSlant(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6 print:hidden">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PenTool className="h-4 w-4" aria-hidden="true" />
          Broad-edge calligraphy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Nib Angle Practice Grid</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rules a guide sheet in nib widths, the way calligraphic hands are actually measured, and
          prints pen-angle hatch marks across every line so you can check the angle of the nib
          without guessing. It also predicts the stem width your downstroke should measure.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nib-hand">
              Calligraphic hand
            </label>
            <select
              id="nib-hand"
              className={`mt-2 ${INPUT_CLASS}`}
              value={hand}
              onChange={(event) => setHand(event.target.value)}
            >
              {HANDS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.name} — {item.penAngle}°, x-height {item.xHeight} n.w.
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nib-width">
              Nib width (mm)
            </label>
            <input
              id="nib-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.3"
              max="15"
              step="0.1"
              value={nib}
              onChange={(event) => setNib(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nib-page">
              Page size
            </label>
            <select
              id="nib-page"
              className={`mt-2 ${INPUT_CLASS}`}
              value={page}
              onChange={(event) => setPage(event.target.value)}
            >
              {Object.values(PAGE_SIZES).map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nib-margin">
              Margin (mm)
            </label>
            <input
              id="nib-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              step="1"
              value={margin}
              onChange={(event) => setMargin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nib-gap">
              Gap between line sets (nib widths)
            </label>
            <input
              id="nib-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="12"
              step="0.5"
              value={gap}
              onChange={(event) => setGap(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nib-angle">
              Pen angle override (°, optional)
            </label>
            <input
              id="nib-angle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="90"
              step="1"
              placeholder={`default ${HANDS.find((h) => h.key === hand)?.penAngle ?? 30}°`}
              value={angle}
              onChange={(event) => setAngle(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {NIB_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setNib(preset.value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="nib-slant">
          <input
            id="nib-slant"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={showSlant}
            onChange={(event) => setShowSlant(event.target.checked)}
          />
          Show slant guides where the hand has a forward slope
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        {grid.error ? (
          <p role="alert" className={ERROR_CLASS}>
            {grid.error}
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              x-height on the sheet
            </p>
            <p className="mt-1 text-5xl font-semibold leading-none text-[var(--primary)]">
              {ok ? `${MM.format(grid.xHeightMm)}` : DASH}
              {ok ? <span className="text-2xl text-[var(--muted-foreground)]"> mm</span> : null}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${grid.hand.xHeight} nib widths at ${MM.format(grid.nibWidthMm)} mm · ${grid.rowCount} line sets per page`
                : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the guide sheet measurements"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={printSheet} aria-label="Print the guide sheet" className={GHOST_BTN}>
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Pen angle", ok ? `${grid.penAngleDeg}°${grid.usingCustomAngle ? " (override)" : ""}` : DASH],
            ["Ascender zone", ok ? `${grid.hand.ascender} n.w. = ${MM.format(grid.ascenderMm)} mm` : DASH],
            ["Descender zone", ok ? `${grid.hand.descender} n.w. = ${MM.format(grid.descenderMm)} mm` : DASH],
            ["Line set height", ok ? `${MM.format(grid.lineSetHeightMm)} mm` : DASH],
            ["Row pitch", ok ? `${MM.format(grid.rowPitchMm)} mm` : DASH],
            [
              "Predicted stem width (vertical pull)",
              ok ? `${MM.format(grid.strokes.stem)} mm` : DASH,
            ],
            [
              "Predicted bar width (horizontal pull)",
              ok ? `${MM.format(grid.strokes.bar)} mm` : DASH,
            ],
            [
              "Thick-to-thin ratio",
              ok
                ? grid.strokes.contrast === null
                  ? "undefined at this angle — one stroke has no width"
                  : `${MM.format(grid.strokes.contrast)} : 1`
                : DASH,
            ],
            ["Letter slant", ok ? (grid.slantDeg > 0 ? `${grid.slantDeg}° forward` : "upright") : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">{grid.hand.note}</p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold print:hidden">
            Guide sheet — {grid.page.label}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)] print:hidden">
            Print at 100% scale (no “fit to page”) or the nib widths will be wrong.
          </p>
          <div className="mt-3 overflow-x-auto">
            <svg
              viewBox={`0 0 ${grid.page.width} ${grid.page.height}`}
              width="100%"
              role="img"
              aria-label={`${grid.hand.name} guide sheet with ${grid.rowCount} line sets and pen angle marks at ${grid.penAngleDeg} degrees`}
              className="mx-auto block h-auto w-full max-w-full bg-[var(--background)]"
            >
              <rect
                x="0"
                y="0"
                width={grid.page.width}
                height={grid.page.height}
                fill="var(--background)"
              />
              {grid.rows.map((row) => (
                <g key={row.index}>
                  <line
                    x1={grid.contentLeftMm}
                    y1={row.ascenderY}
                    x2={grid.contentRightMm}
                    y2={row.ascenderY}
                    stroke="var(--border)"
                    strokeWidth="0.2"
                  />
                  <line
                    x1={grid.contentLeftMm}
                    y1={row.waistY}
                    x2={grid.contentRightMm}
                    y2={row.waistY}
                    stroke="var(--muted-foreground)"
                    strokeWidth="0.25"
                  />
                  <line
                    x1={grid.contentLeftMm}
                    y1={row.baselineY}
                    x2={grid.contentRightMm}
                    y2={row.baselineY}
                    stroke="var(--foreground)"
                    strokeWidth="0.35"
                  />
                  <line
                    x1={grid.contentLeftMm}
                    y1={row.descenderY}
                    x2={grid.contentRightMm}
                    y2={row.descenderY}
                    stroke="var(--border)"
                    strokeWidth="0.2"
                  />
                  {showSlant
                    ? row.slants.map((slant) => (
                        <line
                          key={`slant-${row.index}-${slant.x}`}
                          x1={slant.x1}
                          y1={slant.y1}
                          x2={slant.x2}
                          y2={slant.y2}
                          stroke="var(--border)"
                          strokeWidth="0.18"
                          strokeDasharray="1.5 1.5"
                        />
                      ))
                    : null}
                  {row.marks.map((mark) => (
                    <line
                      key={`angle-${row.index}-${mark.x}`}
                      x1={mark.x1}
                      y1={mark.y1}
                      x2={mark.x2}
                      y2={mark.y2}
                      stroke="var(--primary)"
                      strokeWidth="0.3"
                    />
                  ))}
                </g>
              ))}
            </svg>
          </div>
        </section>
      ) : null}

      {ok && !ladder.error ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
          <h2 className="text-base font-semibold">Nib-width ladder for this x-height</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Step the nib corner to corner this many times and the stack should reach the waist line.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-4 font-semibold">Step</th>
                  <th scope="col" className="py-2 text-right font-semibold">Height from baseline</th>
                </tr>
              </thead>
              <tbody>
                {ladder.steps.map((step) => (
                  <tr key={step.step} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-4 font-semibold">{step.step}</td>
                    <td className="py-2 text-right">{MM.format(step.heightMm)} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)] print:hidden">
        Pen-angle marks are spaced every {ANGLE_MARK_SPACING_NIB_WIDTHS} nib widths. The proportions
        given for each hand are the common teaching values; historical manuscripts vary, and your
        exemplar or teacher&apos;s sheet takes precedence. Pointed-pen hands such as Copperplate have
        no fixed nib angle and are not covered here.
      </p>
    </main>
  );
}
