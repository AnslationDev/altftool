"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PencilLine, Printer, RotateCcw } from "lucide-react";

import {
  CASE_STYLES,
  MAX_NAME_LENGTH,
  PAGE_SIZES,
  TRACE_STYLES,
  buildWorksheet,
  maxXHeightForName,
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
  name: "Aarav",
  x: "12",
  caseKey: "title",
  traceKey: "guided",
  page: "a4",
  margin: "15",
  ruling: true,
};
const DASH = "—";
const MM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [x, setX] = useState(DEFAULTS.x);
  const [caseKey, setCaseKey] = useState(DEFAULTS.caseKey);
  const [traceKey, setTraceKey] = useState(DEFAULTS.traceKey);
  const [page, setPage] = useState(DEFAULTS.page);
  const [margin, setMargin] = useState(DEFAULTS.margin);
  const [ruling, setRuling] = useState(DEFAULTS.ruling);
  const [copied, setCopied] = useState(false);

  const sheet = useMemo(
    () =>
      buildWorksheet({
        name,
        xHeightMm: Number(x),
        caseKey,
        traceKey,
        pageKey: page,
        marginMm: Number(margin),
        showRuling: ruling,
      }),
    [name, x, caseKey, traceKey, page, margin, ruling],
  );

  const ok = !sheet.error;

  const biggest = useMemo(
    () => maxXHeightForName({ name, pageKey: page, marginMm: Number(margin), caseKey }),
    [name, page, margin, caseKey],
  );

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Name tracing sheet — ${sheet.text}`,
      `x-height: ${MM.format(sheet.xHeightMm)} mm (font size ${MM.format(sheet.fontSizeMm)} mm)`,
      `Four-line band: ${MM.format(sheet.bandHeightMm)} mm, row pitch ${MM.format(sheet.rowPitchMm)} mm`,
      `${sheet.rowCount} rows × ${sheet.perRow} per row = ${sheet.totalTracings} tracings`,
      `Style: ${sheet.style.label} on ${sheet.page.label}`,
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
    setName(DEFAULTS.name);
    setX(DEFAULTS.x);
    setCaseKey(DEFAULTS.caseKey);
    setTraceKey(DEFAULTS.traceKey);
    setPage(DEFAULTS.page);
    setMargin(DEFAULTS.margin);
    setRuling(DEFAULTS.ruling);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6 print:hidden">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PencilLine className="h-4 w-4" aria-hidden="true" />
          Early writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Name Tracing Worksheet Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type a child&apos;s name and get a printable tracing sheet sized to a real x-height in
          millimetres, with four-line guides, a solid model letter and dotted copies to trace over.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="trace-name">
              Child&apos;s name
            </label>
            <input
              id="trace-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Letters, spaces, hyphens and apostrophes only, up to {MAX_NAME_LENGTH} characters.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trace-x">
              Letter x-height (mm)
            </label>
            <input
              id="trace-x"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="4"
              max="40"
              step="0.5"
              value={x}
              onChange={(event) => setX(event.target.value)}
            />
            {!biggest.error ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Fits across the page up to about {MM.format(biggest.xHeightMm)} mm.
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trace-case">
              Letter case
            </label>
            <select
              id="trace-case"
              className={`mt-2 ${INPUT_CLASS}`}
              value={caseKey}
              onChange={(event) => setCaseKey(event.target.value)}
            >
              {CASE_STYLES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trace-style">
              Tracing style
            </label>
            <select
              id="trace-style"
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
            <label className={LABEL_CLASS} htmlFor="trace-page">
              Page size
            </label>
            <select
              id="trace-page"
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
            <label className={LABEL_CLASS} htmlFor="trace-margin">
              Margin (mm)
            </label>
            <input
              id="trace-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              step="1"
              value={margin}
              onChange={(event) => setMargin(event.target.value)}
            />
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="trace-ruling">
          <input
            id="trace-ruling"
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

        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Tracings on the sheet
            </p>
            <p className="mt-1 text-5xl font-semibold leading-none text-[var(--primary)]">
              {ok ? sheet.totalTracings : DASH}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {ok ? `${sheet.rowCount} rows × ${sheet.perRow} per row` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the worksheet measurements"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Name as printed", ok ? sheet.text : DASH],
            ["Letters to trace", ok ? String(sheet.letters.length) : DASH],
            ["x-height", ok ? `${MM.format(sheet.xHeightMm)} mm` : DASH],
            ["Font size used", ok ? `${MM.format(sheet.fontSizeMm)} mm` : DASH],
            ["Four-line band height", ok ? `${MM.format(sheet.bandHeightMm)} mm` : DASH],
            ["Row pitch", ok ? `${MM.format(sheet.rowPitchMm)} mm` : DASH],
            ["Width of one tracing", ok ? `${MM.format(sheet.nameWidthMm)} mm` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">{sheet.style.note}</p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold print:hidden">Worksheet preview</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)] print:hidden">
            Print at 100% scale so the letters come out at the x-height shown above.
          </p>
          <div className="mt-3 overflow-x-auto">
            <svg
              viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
              width="100%"
              role="img"
              aria-label={`Tracing worksheet for the name ${sheet.text} with ${sheet.totalTracings} tracings`}
              className="mx-auto block h-auto w-full max-w-full bg-[var(--background)]"
            >
              <rect
                x="0"
                y="0"
                width={sheet.page.width}
                height={sheet.page.height}
                fill="var(--background)"
              />
              {sheet.rows.map((row) => (
                <g key={row.index}>
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
                      key={`${row.index}-${item.index}`}
                      x={item.x}
                      y={row.baselineY}
                      textLength={sheet.nameWidthMm}
                      lengthAdjust="spacingAndGlyphs"
                      fontFamily={FONT_STACK}
                      fontSize={sheet.fontSizeMm}
                      fill={item.solid ? "var(--muted-foreground)" : "none"}
                      fillOpacity={item.solid ? 0.4 : 0}
                      stroke={item.solid ? "none" : "var(--muted-foreground)"}
                      strokeWidth={item.solid ? 0 : 0.3}
                      strokeDasharray={item.dotted ? "1.4 1.4" : undefined}
                    >
                      {sheet.text}
                    </text>
                  ))}
                </g>
              ))}
            </svg>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)] print:hidden">
        Letters are drawn in whichever child-friendly font your device has installed, so the exact
        letterforms differ between computers — check the preview before printing a class set. The
        x-height is derived from the font size using the usual 0.52 em ratio; measure a printed
        letter with a ruler if the size has to match an existing notebook exactly.
      </p>
    </main>
  );
}
