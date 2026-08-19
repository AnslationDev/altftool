"use client";

import { useMemo, useState } from "react";
import { CaseUpper, Check, Copy, Printer, RotateCcw } from "lucide-react";

import {
  CASE_MODES,
  LETTER_FAMILIES,
  MAX_ROWS_PER_LETTER,
  PAGE_SIZES,
  SELECTIONS,
  TRACE_STYLES,
  buildAlphabetSheet,
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

const FONT_STACK =
  "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', 'Segoe Print', 'Bradley Hand', system-ui, sans-serif";

const DEFAULTS = {
  selection: "all",
  custom: "",
  caseMode: "pair",
  traceKey: "guided",
  x: "12",
  rowsPerLetter: "1",
  page: "a4",
  margin: "15",
  ruling: true,
};
const DASH = "—";
const MM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [selection, setSelection] = useState(DEFAULTS.selection);
  const [custom, setCustom] = useState(DEFAULTS.custom);
  const [caseMode, setCaseMode] = useState(DEFAULTS.caseMode);
  const [traceKey, setTraceKey] = useState(DEFAULTS.traceKey);
  const [x, setX] = useState(DEFAULTS.x);
  const [rowsPerLetter, setRowsPerLetter] = useState(DEFAULTS.rowsPerLetter);
  const [page, setPage] = useState(DEFAULTS.page);
  const [margin, setMargin] = useState(DEFAULTS.margin);
  const [ruling, setRuling] = useState(DEFAULTS.ruling);
  const [visiblePage, setVisiblePage] = useState(1);
  const [copied, setCopied] = useState(false);

  const sheet = useMemo(
    () =>
      buildAlphabetSheet({
        selectionKey: selection,
        customLetters: custom,
        caseMode,
        traceKey,
        xHeightMm: Number(x),
        rowsPerLetter: Number(rowsPerLetter),
        pageKey: page,
        marginMm: Number(margin),
        showRuling: ruling,
      }),
    [selection, custom, caseMode, traceKey, x, rowsPerLetter, page, margin, ruling],
  );

  const ok = !sheet.error;
  const activePage = ok
    ? sheet.pages[Math.min(visiblePage, sheet.pageCount) - 1] ?? sheet.pages[0]
    : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Alphabet tracing worksheet",
      `Letters: ${sheet.letters.join(" ")}`,
      `Case: ${CASE_MODES.find((mode) => mode.key === sheet.caseMode)?.label ?? sheet.caseMode}`,
      `x-height ${MM.format(sheet.xHeightMm)} mm, row pitch ${MM.format(sheet.rowPitchMm)} mm`,
      `${sheet.rowCount} rows over ${sheet.pageCount} page(s), ${sheet.totalTracings} tracings in total`,
    ].join("\n");
  }, [ok, sheet]);

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
    setSelection(DEFAULTS.selection);
    setCustom(DEFAULTS.custom);
    setCaseMode(DEFAULTS.caseMode);
    setTraceKey(DEFAULTS.traceKey);
    setX(DEFAULTS.x);
    setRowsPerLetter(DEFAULTS.rowsPerLetter);
    setPage(DEFAULTS.page);
    setMargin(DEFAULTS.margin);
    setRuling(DEFAULTS.ruling);
    setVisiblePage(1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6 print:hidden">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CaseUpper className="h-4 w-4" aria-hidden="true" />
          A to Z practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">English Alphabet Tracing Worksheet</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Prints tracing rows for the whole alphabet or any subset — capitals, lower case or Aa pairs
          — on four-line guides, sized to a real x-height in millimetres. Letters can be ordered by
          formation family so children practise one movement at a time.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="alpha-selection">
              Letter set
            </label>
            <select
              id="alpha-selection"
              className={`mt-2 ${INPUT_CLASS}`}
              value={selection}
              onChange={(event) => {
                setSelection(event.target.value);
                setVisiblePage(1);
              }}
            >
              {SELECTIONS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alpha-custom">
              Or type specific letters
            </label>
            <input
              id="alpha-custom"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="e.g. c o a d"
              value={custom}
              onChange={(event) => {
                setCustom(event.target.value);
                setVisiblePage(1);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Anything typed here overrides the letter set above.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alpha-case">
              Case
            </label>
            <select
              id="alpha-case"
              className={`mt-2 ${INPUT_CLASS}`}
              value={caseMode}
              onChange={(event) => {
                setCaseMode(event.target.value);
                setVisiblePage(1);
              }}
            >
              {CASE_MODES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alpha-style">
              Tracing style
            </label>
            <select
              id="alpha-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={traceKey}
              onChange={(event) => setTraceKey(event.target.value)}
            >
              {TRACE_STYLES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alpha-x">
              Letter x-height (mm)
            </label>
            <input
              id="alpha-x"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="4"
              max="40"
              step="0.5"
              value={x}
              onChange={(event) => {
                setX(event.target.value);
                setVisiblePage(1);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alpha-rows">
              Rows per letter (1–{MAX_ROWS_PER_LETTER})
            </label>
            <input
              id="alpha-rows"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_ROWS_PER_LETTER}
              step="1"
              value={rowsPerLetter}
              onChange={(event) => {
                setRowsPerLetter(event.target.value);
                setVisiblePage(1);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alpha-page">
              Page size
            </label>
            <select
              id="alpha-page"
              className={`mt-2 ${INPUT_CLASS}`}
              value={page}
              onChange={(event) => {
                setPage(event.target.value);
                setVisiblePage(1);
              }}
            >
              {Object.values(PAGE_SIZES).map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alpha-margin">
              Margin (mm)
            </label>
            <input
              id="alpha-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              step="1"
              value={margin}
              onChange={(event) => {
                setMargin(event.target.value);
                setVisiblePage(1);
              }}
            />
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="alpha-ruling">
          <input
            id="alpha-ruling"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={ruling}
            onChange={(event) => setRuling(event.target.checked)}
          />
          Print the four-line guides behind the letters
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        {sheet.error ? (
          <p role="alert" className={ERROR_CLASS}>
            {sheet.error}
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-start justify-between gap-3" aria-live="polite" aria-atomic="true">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Tracings in the set
            </p>
            <p className="mt-1 text-5xl font-semibold leading-none text-[var(--primary)]">
              {ok ? sheet.totalTracings : DASH}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${sheet.rowCount} rows over ${sheet.pageCount} page${sheet.pageCount === 1 ? "" : "s"}`
                : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the worksheet settings"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={printSheet} aria-label="Print the worksheet" className={GHOST_BTN}>
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {[
            ["Letters selected", ok ? `${sheet.letters.length} (${sheet.letters.join(" ")})` : DASH],
            ["Rows per page", ok ? String(sheet.rowsPerPage) : DASH],
            ["Rows per letter", ok ? String(sheet.rowsPerLetter) : DASH],
            ["x-height", ok ? `${MM.format(sheet.xHeightMm)} mm` : DASH],
            ["Font size used", ok ? `${MM.format(sheet.fontSizeMm)} mm` : DASH],
            ["Four-line band height", ok ? `${MM.format(sheet.bandHeightMm)} mm` : DASH],
            ["Row pitch", ok ? `${MM.format(sheet.rowPitchMm)} mm` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && activePage ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <h2 className="text-base font-semibold">
              Page {activePage.index} of {sheet.pageCount}
            </h2>
            {sheet.pageCount > 1 ? (
              <div className="flex flex-wrap gap-2">
                {sheet.pages.map((item) => (
                  <button
                    key={item.index}
                    type="button"
                    onClick={() => setVisiblePage(item.index)}
                    aria-pressed={activePage.index === item.index}
                    className={`min-h-11 min-w-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      activePage.index === item.index
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.index}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mt-3 overflow-x-auto">
            <svg
              viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
              width="100%"
              role="img"
              aria-label={`Alphabet tracing page ${activePage.index} covering ${activePage.rows.map((row) => row.glyph).join(", ")}`}
              className="mx-auto block h-auto w-full max-w-full bg-[var(--background)]"
            >
              <rect
                x="0"
                y="0"
                width={sheet.page.width}
                height={sheet.page.height}
                fill="var(--background)"
              />
              {activePage.rows.map((row) => (
                <g key={`${row.index}-${row.glyph}`}>
                  {sheet.showRuling ? (
                    <>
                      <line
                        x1={sheet.contentLeftMm}
                        y1={row.topY}
                        x2={sheet.contentRightMm}
                        y2={row.topY}
                        stroke="var(--border)"
                        strokeWidth="0.2"
                      />
                      <line
                        x1={sheet.contentLeftMm}
                        y1={row.waistY}
                        x2={sheet.contentRightMm}
                        y2={row.waistY}
                        stroke="var(--muted-foreground)"
                        strokeWidth="0.22"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1={sheet.contentLeftMm}
                        y1={row.baselineY}
                        x2={sheet.contentRightMm}
                        y2={row.baselineY}
                        stroke="var(--foreground)"
                        strokeWidth="0.35"
                      />
                      <line
                        x1={sheet.contentLeftMm}
                        y1={row.bottomY}
                        x2={sheet.contentRightMm}
                        y2={row.bottomY}
                        stroke="var(--border)"
                        strokeWidth="0.2"
                      />
                    </>
                  ) : null}
                  {row.items.map((item) => (
                    <text
                      key={`${row.index}-${row.glyph}-${item.index}`}
                      x={item.x}
                      y={row.baselineY}
                      textLength={row.glyphWidthMm}
                      lengthAdjust="spacingAndGlyphs"
                      fontFamily={FONT_STACK}
                      fontSize={sheet.fontSizeMm}
                      fill={item.solid ? "var(--muted-foreground)" : "none"}
                      fillOpacity={item.solid ? 0.4 : 0}
                      stroke={item.solid ? "none" : "var(--muted-foreground)"}
                      strokeWidth={item.solid ? 0 : 0.3}
                      strokeDasharray={item.dotted ? "1.4 1.4" : undefined}
                    >
                      {row.glyph}
                    </text>
                  ))}
                </g>
              ))}
            </svg>
          </div>
        </section>
      ) : null}

      {ok ? (
        <div className="hidden print:block">
          {sheet.pages.map((pg) => (
            <svg
              key={pg.index}
              viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
              width="100%"
              role="img"
              aria-label={`Alphabet tracing page ${pg.index} covering ${pg.rows.map((row) => row.glyph).join(", ")}`}
              className="mx-auto block h-auto w-full max-w-full bg-[var(--background)]"
              style={pg.index < sheet.pageCount ? { pageBreakAfter: "always" } : undefined}
            >
              <rect
                x="0"
                y="0"
                width={sheet.page.width}
                height={sheet.page.height}
                fill="var(--background)"
              />
              {pg.rows.map((row) => (
                <g key={`${row.index}-${row.glyph}`}>
                  {sheet.showRuling ? (
                    <>
                      <line
                        x1={sheet.contentLeftMm}
                        y1={row.topY}
                        x2={sheet.contentRightMm}
                        y2={row.topY}
                        stroke="var(--border)"
                        strokeWidth="0.2"
                      />
                      <line
                        x1={sheet.contentLeftMm}
                        y1={row.waistY}
                        x2={sheet.contentRightMm}
                        y2={row.waistY}
                        stroke="var(--muted-foreground)"
                        strokeWidth="0.22"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1={sheet.contentLeftMm}
                        y1={row.baselineY}
                        x2={sheet.contentRightMm}
                        y2={row.baselineY}
                        stroke="var(--foreground)"
                        strokeWidth="0.35"
                      />
                      <line
                        x1={sheet.contentLeftMm}
                        y1={row.bottomY}
                        x2={sheet.contentRightMm}
                        y2={row.bottomY}
                        stroke="var(--border)"
                        strokeWidth="0.2"
                      />
                    </>
                  ) : null}
                  {row.items.map((item) => (
                    <text
                      key={`${row.index}-${row.glyph}-${item.index}`}
                      x={item.x}
                      y={row.baselineY}
                      textLength={row.glyphWidthMm}
                      lengthAdjust="spacingAndGlyphs"
                      fontFamily={FONT_STACK}
                      fontSize={sheet.fontSizeMm}
                      fill={item.solid ? "var(--muted-foreground)" : "none"}
                      fillOpacity={item.solid ? 0.4 : 0}
                      stroke={item.solid ? "none" : "var(--muted-foreground)"}
                      strokeWidth={item.solid ? 0 : 0.3}
                      strokeDasharray={item.dotted ? "1.4 1.4" : undefined}
                    >
                      {row.glyph}
                    </text>
                  ))}
                </g>
              ))}
            </svg>
          ))}
        </div>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        <h2 className="text-base font-semibold">Letter formation families</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Handwriting schemes usually teach letters by shared movement rather than alphabetically.
        </p>
        <ul className="mt-3 space-y-2">
          {LETTER_FAMILIES.map((family) => (
            <li
              key={family.key}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <button
                type="button"
                onClick={() => {
                  setSelection(family.key);
                  setCustom("");
                  setVisiblePage(1);
                }}
                className="min-h-11 text-left font-semibold text-[var(--primary)] transition hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {family.label} — {family.letters.join(" ")}
              </button>
              <span className="block text-xs text-[var(--muted-foreground)]">{family.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)] print:hidden">
        Letterforms depend on the child-friendly font installed on your device, so a and g may appear
        single-storey or double-storey — check the preview against your school&apos;s scheme before
        printing a class set. Print at 100% scale, with “fit to page” switched off, or the x-height
        will not match the figure shown.
      </p>
    </main>
  );
}
