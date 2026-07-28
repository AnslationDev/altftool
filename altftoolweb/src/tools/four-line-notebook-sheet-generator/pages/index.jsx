"use client";

import { useMemo, useState } from "react";
import { Check, Copy, NotebookPen, Printer, RotateCcw } from "lucide-react";

import {
  PAGE_SIZES,
  RULING_TYPES,
  SPACING_PRESETS,
  US_COLLEGE_RULE_MM,
  US_NARROW_RULE_MM,
  US_WIDE_RULE_MM,
  buildSheet,
  mmToInches,
  rowsPerPageTable,
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
  ruling: "four-line",
  x: "10",
  ascender: "6",
  descender: "6",
  gap: "8",
  page: "a4",
  margin: "15",
  landscape: false,
};
const DASH = "—";
const MM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const LINE_STYLE = {
  light: { stroke: "var(--border)", width: 0.2 },
  medium: { stroke: "var(--muted-foreground)", width: 0.25 },
  strong: { stroke: "var(--foreground)", width: 0.35 },
};

const RULE_PRESETS = [
  { label: `Wide rule (${US_WIDE_RULE_MM} mm)`, value: String(US_WIDE_RULE_MM) },
  { label: `College rule (${US_COLLEGE_RULE_MM} mm)`, value: String(US_COLLEGE_RULE_MM) },
  { label: `Narrow rule (${US_NARROW_RULE_MM} mm)`, value: String(US_NARROW_RULE_MM) },
];

export default function ToolHome() {
  const [ruling, setRuling] = useState(DEFAULTS.ruling);
  const [x, setX] = useState(DEFAULTS.x);
  const [ascender, setAscender] = useState(DEFAULTS.ascender);
  const [descender, setDescender] = useState(DEFAULTS.descender);
  const [gap, setGap] = useState(DEFAULTS.gap);
  const [page, setPage] = useState(DEFAULTS.page);
  const [margin, setMargin] = useState(DEFAULTS.margin);
  const [landscape, setLandscape] = useState(DEFAULTS.landscape);
  const [copied, setCopied] = useState(false);

  const sheet = useMemo(
    () =>
      buildSheet({
        rulingKey: ruling,
        xHeightMm: Number(x),
        ascenderMm: Number(ascender),
        descenderMm: Number(descender),
        rowGapMm: Number(gap),
        pageKey: page,
        marginMm: Number(margin),
        landscape,
      }),
    [ruling, x, ascender, descender, gap, page, margin, landscape],
  );

  const ok = !sheet.error;

  const pageTable = useMemo(
    () =>
      ok
        ? rowsPerPageTable({ pitchMm: sheet.pitchMm, marginMm: sheet.marginMm, landscape })
        : { error: sheet.error },
    [ok, sheet, landscape],
  );

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `${sheet.ruling.label} ruled sheet`,
      `Page: ${sheet.page.label}${sheet.landscape ? " landscape" : ""}, ${MM.format(sheet.marginMm)} mm margin`,
      `x-height band: ${MM.format(sheet.xHeightMm)} mm`,
      `Band height drawn: ${MM.format(sheet.bandHeightMm)} mm`,
      `Row pitch: ${MM.format(sheet.pitchMm)} mm (${mmToInches(sheet.pitchMm)} in)`,
      `Rows on the page: ${sheet.rowCount} (${sheet.totalLines} ruled lines)`,
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

  const applyPreset = (preset) => {
    setX(String(preset.x));
    setAscender(String(preset.ascender));
    setDescender(String(preset.descender));
    setGap(String(preset.gap));
  };

  const reset = () => {
    setRuling(DEFAULTS.ruling);
    setX(DEFAULTS.x);
    setAscender(DEFAULTS.ascender);
    setDescender(DEFAULTS.descender);
    setGap(DEFAULTS.gap);
    setPage(DEFAULTS.page);
    setMargin(DEFAULTS.margin);
    setLandscape(DEFAULTS.landscape);
    setCopied(false);
  };

  const activeRuling = RULING_TYPES.find((type) => type.key === ruling) ?? RULING_TYPES[0];
  const usesAscender = activeRuling.bands.includes("ascender");
  const usesDescender = activeRuling.bands.includes("descender");
  const usesX = activeRuling.bands.includes("x");

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6 print:hidden">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          Handwriting sheets
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Four Line Notebook Sheet Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rules a printable handwriting sheet to whatever band heights you need — four line, three
          line, two line or plain single line — and tells you the row pitch and exactly how many rows
          land on the page before you print.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rule-type">
              Ruling
            </label>
            <select
              id="rule-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ruling}
              onChange={(event) => setRuling(event.target.value)}
            >
              {RULING_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rule-page">
              Page size
            </label>
            <select
              id="rule-page"
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
          {usesX ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="rule-x">
                Middle band / x-height (mm)
              </label>
              <input
                id="rule-x"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                max="60"
                step="0.5"
                value={x}
                onChange={(event) => setX(event.target.value)}
              />
            </div>
          ) : null}
          {usesAscender ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="rule-asc">
                Top band / ascenders (mm)
              </label>
              <input
                id="rule-asc"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                max="60"
                step="0.5"
                value={ascender}
                onChange={(event) => setAscender(event.target.value)}
              />
            </div>
          ) : null}
          {usesDescender ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="rule-desc">
                Bottom band / descenders (mm)
              </label>
              <input
                id="rule-desc"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                max="60"
                step="0.5"
                value={descender}
                onChange={(event) => setDescender(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="rule-gap">
              Gap between rows (mm)
            </label>
            <input
              id="rule-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="0.5"
              value={gap}
              onChange={(event) => setGap(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rule-margin">
              Margin (mm)
            </label>
            <input
              id="rule-margin"
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

        <div className="mt-4 flex flex-wrap gap-2">
          {SPACING_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {ruling === "single-line" ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {RULE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setGap(preset.value)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset.label}
              </button>
            ))}
          </div>
        ) : null}

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="rule-landscape">
          <input
            id="rule-landscape"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={landscape}
            onChange={(event) => setLandscape(event.target.checked)}
          />
          Landscape orientation
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
              Rows on the page
            </p>
            <p className="mt-1 text-5xl font-semibold leading-none text-[var(--primary)]">
              {ok ? sheet.rowCount : DASH}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${sheet.totalLines} ruled lines at a ${MM.format(sheet.pitchMm)} mm pitch`
                : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the sheet measurements"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={printSheet} aria-label="Print the ruled sheet" className={GHOST_BTN}>
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
            ["Lines per row", ok ? String(sheet.linesPerRow) : DASH],
            ["Band height drawn", ok ? `${MM.format(sheet.bandHeightMm)} mm` : DASH],
            [
              "Row pitch",
              ok ? `${MM.format(sheet.pitchMm)} mm (${mmToInches(sheet.pitchMm)} in)` : DASH,
            ],
            ["Usable page height", ok ? `${MM.format(sheet.usableHeightMm)} mm` : DASH],
            ["Ruled area height", ok ? `${MM.format(sheet.inkedHeightMm)} mm` : DASH],
            [
              "Sheet",
              ok ? `${sheet.page.label}${sheet.landscape ? ", landscape" : ", portrait"}` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">{sheet.ruling.note}</p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold print:hidden">Preview and print</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)] print:hidden">
            Print at 100% scale — turn off “fit to page” or the band heights will shrink.
          </p>
          <div className="mt-3 overflow-x-auto">
            <svg
              viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
              width="100%"
              role="img"
              aria-label={`${sheet.ruling.label} ruled sheet with ${sheet.rowCount} rows`}
              className="mx-auto block h-auto w-full max-w-full bg-[var(--background)]"
            >
              <rect
                x="0"
                y="0"
                width={sheet.page.width}
                height={sheet.page.height}
                fill="var(--background)"
              />
              {sheet.rows.map((row) =>
                row.lines.map((line) => {
                  const style = LINE_STYLE[line.weight] ?? LINE_STYLE.light;
                  return (
                    <line
                      key={`${row.index}-${line.role}`}
                      x1={sheet.contentLeftMm}
                      y1={line.y}
                      x2={sheet.contentRightMm}
                      y2={line.y}
                      stroke={style.stroke}
                      strokeWidth={style.width}
                      strokeDasharray={line.dashed ? "2 2" : undefined}
                    />
                  );
                }),
              )}
            </svg>
          </div>
        </section>
      ) : null}

      {ok && !pageTable.error ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
          <h2 className="text-base font-semibold">Rows at this pitch on other paper</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Paper</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Usable height</th>
                  <th scope="col" className="py-2 text-right font-semibold">Rows</th>
                </tr>
              </thead>
              <tbody>
                {pageTable.rows.map((entry) => (
                  <tr key={entry.page.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{entry.page.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {MM.format(entry.usableMm)} mm
                    </td>
                    <td className="py-2 text-right font-semibold">{entry.rows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)] print:hidden">
        The stage presets are practical suggestions, not an official standard — schools and
        publishers rule their copies differently, so match your child&apos;s existing notebook if one
        is prescribed. The single-line presets are the real commercial rulings: wide 11/32 in,
        college 9/32 in and narrow 1/4 in.
      </p>
    </main>
  );
}
