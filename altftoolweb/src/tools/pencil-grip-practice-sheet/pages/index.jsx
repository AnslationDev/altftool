"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Pencil, Printer, RotateCcw, Wand2 } from "lucide-react";

import {
  BAND_LABEL_HEIGHT_MM,
  MAX_AGE_MONTHS,
  MAX_CELL_MM,
  MAX_REPEATS,
  MIN_AGE_MONTHS,
  MIN_CELL_MM,
  MIN_REPEATS,
  PAGE_SIZES,
  PREWRITING_STROKES,
  SHAPE_VIEWBOX,
  buildPracticeSheet,
  classifyStrokes,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const MM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const mm = (value) => `${MM.format(value)} mm`;

const DEFAULTS = {
  pageSize: "a4",
  cellMm: "30",
  repeats: "6",
  marginMm: "15",
  ageMonths: "48",
  strokeIds: ["vertical", "horizontal", "circle"],
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #grip-print-area, #grip-print-area * { visibility: visible !important; }
  #grip-print-area { position: absolute; inset: 0 auto auto 0; width: 100%; }
  .grip-page { break-after: page; }
  .grip-page:last-child { break-after: auto; }
}
`;

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const toInt = (raw) => {
  const value = toNumber(raw);
  return Number.isFinite(value) ? Math.round(value) : NaN;
};

function StrokeGlyph({ paths, solid }) {
  return (
    <svg
      viewBox={`0 0 ${SHAPE_VIEWBOX} ${SHAPE_VIEWBOX}`}
      className={solid ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] opacity-40"}
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={solid ? 4 : 3}
          strokeDasharray={solid ? undefined : "6 5"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export default function ToolHome() {
  const [pageSize, setPageSize] = useState(DEFAULTS.pageSize);
  const [cellMm, setCellMm] = useState(DEFAULTS.cellMm);
  const [repeats, setRepeats] = useState(DEFAULTS.repeats);
  const [marginMm, setMarginMm] = useState(DEFAULTS.marginMm);
  const [ageMonths, setAgeMonths] = useState(DEFAULTS.ageMonths);
  const [strokeIds, setStrokeIds] = useState(DEFAULTS.strokeIds);
  const [copied, setCopied] = useState(false);

  const sheet = useMemo(
    () =>
      buildPracticeSheet({
        strokeIds,
        pageSize,
        cellMm: toNumber(cellMm),
        repeats: toInt(repeats),
        marginMm: toNumber(marginMm),
        ageMonths: toInt(ageMonths),
      }),
    [strokeIds, pageSize, cellMm, repeats, marginMm, ageMonths],
  );

  const suggested = useMemo(() => classifyStrokes(toInt(ageMonths)), [ageMonths]);

  const hasError = Boolean(sheet.error);
  const dash = "—";

  const toggleStroke = (id) => {
    setStrokeIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const useSuggested = () => {
    const picks = suggested.emerging.length > 0 ? suggested.emerging : suggested.mastered;
    if (picks.length > 0) setStrokeIds(picks.map((stroke) => stroke.id));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Pencil Grip Practice Sheet",
      `Child's age: ${sheet.ageMonths} months`,
      `Typical grasp stage: ${sheet.graspStage.name}`,
      `Strokes: ${sheet.pages.flat().map((band) => band.name).join(", ")}`,
      `Box size: ${mm(sheet.cellMm)}, ${sheet.cellsPerRow} boxes per row`,
      `Repeats per stroke: ${sheet.repeats}`,
      `Total practice boxes: ${NUM.format(sheet.totalBoxes)}`,
      `Pages to print: ${sheet.pageCount} on ${sheet.page.label}`,
    ].join("\n");
  }, [sheet, hasError]);

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
    setPageSize(DEFAULTS.pageSize);
    setCellMm(DEFAULTS.cellMm);
    setRepeats(DEFAULTS.repeats);
    setMarginMm(DEFAULTS.marginMm);
    setAgeMonths(DEFAULTS.ageMonths);
    setStrokeIds(DEFAULTS.strokeIds);
    setCopied(false);
  };

  const print = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <style>{PRINT_CSS}</style>

      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Handwriting worksheets
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Pencil Grip Practice Sheet</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Print the nine pre-writing strokes children learn before letters — vertical, horizontal,
          circle, cross, diagonals, square, oblique cross and triangle — at a box size you choose,
          with the strokes typical for the child&rsquo;s age highlighted.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="grip-age">
              Child&rsquo;s age (months)
            </label>
            <input
              id="grip-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_AGE_MONTHS}
              max={MAX_AGE_MONTHS}
              step="1"
              value={ageMonths}
              onChange={(event) => setAgeMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="grip-cell">
              Practice box size (mm)
            </label>
            <input
              id="grip-cell"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_CELL_MM}
              max={MAX_CELL_MM}
              step="1"
              value={cellMm}
              onChange={(event) => setCellMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="grip-repeats">
              Repeats per stroke
            </label>
            <input
              id="grip-repeats"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_REPEATS}
              max={MAX_REPEATS}
              step="1"
              value={repeats}
              onChange={(event) => setRepeats(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="grip-margin">
              Page margin (mm)
            </label>
            <input
              id="grip-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              max="40"
              step="1"
              value={marginMm}
              onChange={(event) => setMarginMm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="grip-paper">
              Paper size
            </label>
            <select
              id="grip-paper"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pageSize}
              onChange={(event) => setPageSize(event.target.value)}
            >
              {Object.values(PAGE_SIZES).map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Stroke patterns</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PREWRITING_STROKES.map((stroke) => {
              const checked = strokeIds.includes(stroke.id);
              const isEmerging = suggested.emerging.some((item) => item.id === stroke.id);
              return (
                <label
                  key={stroke.id}
                  htmlFor={`grip-stroke-${stroke.id}`}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm ${
                    checked ? "border-[var(--primary)]" : "border-[var(--border)]"
                  }`}
                >
                  <input
                    id={`grip-stroke-${stroke.id}`}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggleStroke(stroke.id)}
                  />
                  <span className="h-6 w-6 shrink-0">
                    <StrokeGlyph paths={stroke.paths} solid />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{stroke.name}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      typical from {stroke.typicalAgeMonths} months
                    </span>
                  </span>
                  {isEmerging ? (
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                      now
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>
          <button type="button" onClick={useSuggested} className={`mt-3 ${GHOST_BTN}`}>
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            Use the strokes typical for this age
          </button>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {sheet.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Practice boxes on the sheet
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : NUM.format(sheet.totalBoxes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the settings above to see the sheet"
                : `${NUM.format(sheet.pageCount)} page(s) · typical grasp: ${sheet.graspStage.name}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy practice sheet specification"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={print}
              disabled={hasError}
              aria-label="Print the practice sheet"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>
            <button type="button" onClick={reset} aria-label="Reset all settings" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Strokes selected", hasError ? dash : NUM.format(sheet.strokeCount)],
            ["Boxes per row", hasError ? dash : NUM.format(sheet.cellsPerRow)],
            ["Box size", hasError ? dash : `${mm(sheet.cellMm)} square`],
            ["Gap between boxes", hasError ? dash : mm(sheet.gapMm)],
            ["Pen strokes to complete", hasError ? dash : NUM.format(sheet.totalPenStrokes)],
            ["Stroke bands per page", hasError ? dash : NUM.format(sheet.bandsPerPage)],
            ["Printable area", hasError ? dash : `${mm(sheet.usableWidthMm)} x ${mm(sheet.usableHeightMm)}`],
            ["Pages to print", hasError ? dash : NUM.format(sheet.pageCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">{sheet.graspStage.name}:</span>{" "}
            {sheet.graspStage.detail}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6">
          <h2 className="text-base font-semibold">Sheet preview</h2>
          <p className="mt-1 mb-3 text-sm text-[var(--muted-foreground)]">
            The first box in each band is the solid model; the rest are dotted for tracing. Print at
            100% scale so the boxes come out {mm(sheet.cellMm)} square.
          </p>
          <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
            <div id="grip-print-area">
              {sheet.pages.map((bands, pageIndex) => (
                <div
                  key={`page-${sheet.pages.length}-${pageIndex}`}
                  className="grip-page bg-[var(--card)]"
                  style={{
                    width: `${sheet.page.widthMm}mm`,
                    minHeight: `${sheet.page.heightMm}mm`,
                    padding: `${sheet.marginMm}mm`,
                  }}
                >
                  {bands.map((band) => (
                    <div key={band.id} style={{ marginBottom: `${sheet.gapMm}mm` }}>
                      <div
                        className="flex items-baseline gap-2 text-[var(--muted-foreground)]"
                        style={{ height: `${BAND_LABEL_HEIGHT_MM}mm`, fontSize: "3.4mm" }}
                      >
                        <span className="font-semibold text-[var(--foreground)]">{band.name}</span>
                        <span>{band.cue}</span>
                      </div>
                      {band.rows.map((row) => (
                        <div
                          key={row.rowIndex}
                          className="flex"
                          style={{
                            gap: `${sheet.gapMm}mm`,
                            marginBottom:
                              row.rowIndex === band.rowCount - 1 ? "0" : `${sheet.gapMm}mm`,
                          }}
                        >
                          {row.cells.map((cell) => (
                            <span
                              key={cell.cellIndex}
                              className="block rounded-sm border border-[var(--border)]"
                              style={{ width: `${sheet.cellMm}mm`, height: `${sheet.cellMm}mm` }}
                            >
                              <StrokeGlyph paths={band.paths} solid={cell.solid} />
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                  <p className="text-[var(--muted-foreground)]" style={{ fontSize: "3mm" }}>
                    Page {pageIndex + 1} of {sheet.pageCount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Ages are typical ranges, not milestones every child must hit. If a child of school age still
        cannot copy a cross or a square, or holds the pencil in a fist that tires quickly, ask a
        paediatric occupational therapist rather than drilling harder.
      </p>
    </main>
  );
}
