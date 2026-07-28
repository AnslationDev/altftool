"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hash, Printer, RotateCcw } from "lucide-react";

import {
  MAX_GLYPH_HEIGHT_MM,
  MAX_NUMBER,
  MAX_ROWS_PER_NUMBER,
  MIN_GLYPH_HEIGHT_MM,
  MIN_NUMBER,
  PAGE_SIZES,
  buildTracingSheet,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const MM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const mm = (value) => `${MM.format(value)} mm`;

const DEFAULTS = {
  script: "latin",
  pageSize: "a4",
  from: "1",
  to: "10",
  rowsPerNumber: "2",
  glyphHeightMm: "20",
  marginMm: "15",
  showWord: true,
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
  #tracing-print-area, #tracing-print-area * { visibility: visible !important; }
  #tracing-print-area {
    position: absolute; inset: 0 auto auto 0; width: 100%;
  }
  .tracing-page { break-after: page; box-shadow: none !important; }
  .tracing-page:last-child { break-after: auto; }
}
`;

const toInt = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? Math.round(value) : NaN;
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [script, setScript] = useState(DEFAULTS.script);
  const [pageSize, setPageSize] = useState(DEFAULTS.pageSize);
  const [from, setFrom] = useState(DEFAULTS.from);
  const [to, setTo] = useState(DEFAULTS.to);
  const [rowsPerNumber, setRowsPerNumber] = useState(DEFAULTS.rowsPerNumber);
  const [glyphHeightMm, setGlyphHeightMm] = useState(DEFAULTS.glyphHeightMm);
  const [marginMm, setMarginMm] = useState(DEFAULTS.marginMm);
  const [showWord, setShowWord] = useState(DEFAULTS.showWord);
  const [copied, setCopied] = useState(false);

  const sheet = useMemo(
    () =>
      buildTracingSheet({
        script,
        pageSize,
        from: toInt(from),
        to: toInt(to),
        rowsPerNumber: toInt(rowsPerNumber),
        glyphHeightMm: toNumber(glyphHeightMm),
        marginMm: toNumber(marginMm),
      }),
    [script, pageSize, from, to, rowsPerNumber, glyphHeightMm, marginMm],
  );

  const hasError = Boolean(sheet.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Number Tracing Worksheet",
      `Script: ${sheet.script === "devanagari" ? "Devanagari (०-९)" : "Latin (0-9)"}`,
      `Numbers: ${sheet.from} to ${sheet.to}`,
      `Paper: ${sheet.page.label}, ${mm(sheet.marginMm)} margin`,
      `Digit height: ${mm(sheet.glyphHeightMm)} (${mm(sheet.glyphWidthMm)} wide)`,
      `Digits per row: ${sheet.glyphsPerRow}`,
      `Rows per number: ${sheet.rowsPerNumber}`,
      `Total tracing digits: ${NUM.format(sheet.totalGlyphs)}`,
      `Pages to print: ${sheet.pageCount}`,
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
    setScript(DEFAULTS.script);
    setPageSize(DEFAULTS.pageSize);
    setFrom(DEFAULTS.from);
    setTo(DEFAULTS.to);
    setRowsPerNumber(DEFAULTS.rowsPerNumber);
    setGlyphHeightMm(DEFAULTS.glyphHeightMm);
    setMarginMm(DEFAULTS.marginMm);
    setShowWord(DEFAULTS.showWord);
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
          <Hash className="h-4 w-4" aria-hidden="true" />
          Handwriting worksheets
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Number Tracing Worksheet Maker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set the digit height in millimetres and the tool works out how many digits fit a line, how
          many numbers fit a page, and exactly how many sheets you need to print — in Latin or
          Devanagari numerals.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ntw-script">
              Digit script
            </label>
            <select
              id="ntw-script"
              className={`mt-2 ${INPUT_CLASS}`}
              value={script}
              onChange={(event) => setScript(event.target.value)}
            >
              <option value="latin">Latin — 0 1 2 3</option>
              <option value="devanagari">Devanagari — ० १ २ ३</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntw-paper">
              Paper size
            </label>
            <select
              id="ntw-paper"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="ntw-from">
              First number
            </label>
            <input
              id="ntw-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_NUMBER}
              max={MAX_NUMBER}
              step="1"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntw-to">
              Last number
            </label>
            <input
              id="ntw-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_NUMBER}
              max={MAX_NUMBER}
              step="1"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntw-rows">
              Rows per number
            </label>
            <input
              id="ntw-rows"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_ROWS_PER_NUMBER}
              step="1"
              value={rowsPerNumber}
              onChange={(event) => setRowsPerNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntw-height">
              Digit height (mm)
            </label>
            <input
              id="ntw-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_GLYPH_HEIGHT_MM}
              max={MAX_GLYPH_HEIGHT_MM}
              step="1"
              value={glyphHeightMm}
              onChange={(event) => setGlyphHeightMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntw-margin">
              Page margin (mm)
            </label>
            <input
              id="ntw-margin"
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
          <div className="flex items-end">
            <label
              className="inline-flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-semibold"
              htmlFor="ntw-word"
            >
              <input
                id="ntw-word"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={showWord}
                onChange={(event) => setShowWord(event.target.checked)}
              />
              Print the number word
            </label>
          </div>
        </div>
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
              Sheets to print
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : NUM.format(sheet.pageCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the settings above to see the layout"
                : `${NUM.format(sheet.totalGlyphs)} tracing digits across ${NUM.format(sheet.numberCount)} numbers`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy worksheet specification"
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
              aria-label="Print the worksheet"
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
            ["Digits per row", hasError ? dash : NUM.format(sheet.glyphsPerRow)],
            ["Rows per number", hasError ? dash : NUM.format(sheet.rowsPerNumber)],
            ["Numbers per page", hasError ? dash : NUM.format(sheet.groupsPerPage)],
            ["Digit size (h x w)", hasError ? dash : `${mm(sheet.glyphHeightMm)} x ${mm(sheet.glyphWidthMm)}`],
            ["Gap between digits", hasError ? dash : mm(sheet.glyphGapMm)],
            ["Printable area", hasError ? dash : `${mm(sheet.usableWidthMm)} x ${mm(sheet.usableHeightMm)}`],
            ["Height of one number block", hasError ? dash : mm(sheet.groupHeightMm)],
            ["Total tracing digits", hasError ? dash : NUM.format(sheet.totalGlyphs)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6">
          <h2 className="text-base font-semibold">Worksheet preview</h2>
          <p className="mt-1 mb-3 text-sm text-[var(--muted-foreground)]">
            Printed at true size. Set your printer to 100% scale (not &ldquo;fit to page&rdquo;) so
            the {mm(sheet.glyphHeightMm)} digits come out the height you asked for.
          </p>
          <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
            <div id="tracing-print-area">
              {sheet.pages.map((groups, pageIndex) => (
                <div
                  key={`page-${sheet.pages.length}-${pageIndex}`}
                  className="tracing-page bg-[var(--card)] text-[var(--foreground)]"
                  style={{
                    width: `${sheet.page.widthMm}mm`,
                    minHeight: `${sheet.page.heightMm}mm`,
                    padding: `${sheet.marginMm}mm`,
                  }}
                >
                  {groups.map((group) => (
                    <div key={group.value} style={{ marginBottom: `${sheet.rowGapMm}mm` }}>
                      <div
                        className="flex items-baseline gap-2 text-[var(--muted-foreground)]"
                        style={{ height: `${sheet.labelHeightMm}mm`, fontSize: "3.5mm" }}
                      >
                        <span className="font-semibold text-[var(--foreground)]">{group.glyph}</span>
                        {showWord && (group.englishWord || group.hindiWord) ? (
                          <span>
                            {script === "devanagari" && group.hindiWord
                              ? group.hindiWord
                              : group.englishWord}
                          </span>
                        ) : null}
                      </div>
                      {group.rows.map((row) => (
                        <div
                          key={row.rowIndex}
                          className="flex items-end border-b border-[var(--border)]"
                          style={{
                            height: `${sheet.glyphHeightMm}mm`,
                            gap: `${sheet.glyphGapMm}mm`,
                            marginBottom:
                              row.rowIndex === sheet.rowsPerNumber - 1 ? "0" : `${sheet.rowGapMm}mm`,
                          }}
                        >
                          {row.cells.map((cell) => (
                            <span
                              key={cell.cellIndex}
                              className={
                                cell.solid
                                  ? "text-[var(--foreground)]"
                                  : "text-[var(--muted-foreground)] opacity-40"
                              }
                              style={{
                                width: `${sheet.glyphWidthMm}mm`,
                                fontSize: `${sheet.fontSizeMm}mm`,
                                lineHeight: 1,
                                textAlign: "center",
                              }}
                            >
                              {cell.glyph}
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
        Digit widths are estimated from typical figure proportions, so a very condensed or very wide
        printer font can shift the fit by a glyph. Print one test page before running a class set.
      </p>
    </main>
  );
}
