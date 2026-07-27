"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, LayoutGrid, RotateCcw } from "lucide-react";

import {
  ASPECT_RATIOS,
  computeSheet,
  frameSizeInInches,
  NOTES_POSITIONS,
  ORIENTATIONS,
  PAPER_SIZES,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  paperId: "a4",
  orientation: "portrait",
  marginMm: "12",
  columns: "2",
  rows: "3",
  gutterMm: "8",
  aspectId: "16-9",
  customAspect: "1.85",
  notesPosition: "below",
  notesShare: "0.31",
  headerMm: "18",
  labelMm: "6",
  totalFrames: "24",
};

/** Custom properties baked into the SVG when it is downloaded. */
const TOKEN_BY_ROLE = {
  sheet: "--card",
  ink: "--foreground",
  line: "--border",
  accent: "--primary",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [paperId, setPaperId] = useState(DEFAULTS.paperId);
  const [orientation, setOrientation] = useState(DEFAULTS.orientation);
  const [marginMm, setMarginMm] = useState(DEFAULTS.marginMm);
  const [columns, setColumns] = useState(DEFAULTS.columns);
  const [rows, setRows] = useState(DEFAULTS.rows);
  const [gutterMm, setGutterMm] = useState(DEFAULTS.gutterMm);
  const [aspectId, setAspectId] = useState(DEFAULTS.aspectId);
  const [customAspect, setCustomAspect] = useState(DEFAULTS.customAspect);
  const [notesPosition, setNotesPosition] = useState(DEFAULTS.notesPosition);
  const [notesShare, setNotesShare] = useState(DEFAULTS.notesShare);
  const [headerMm, setHeaderMm] = useState(DEFAULTS.headerMm);
  const [labelMm, setLabelMm] = useState(DEFAULTS.labelMm);
  const [totalFrames, setTotalFrames] = useState(DEFAULTS.totalFrames);
  const [copied, setCopied] = useState(false);

  const svgRef = useRef(null);

  const result = useMemo(
    () =>
      computeSheet({
        paperId,
        orientation,
        marginMm,
        columns,
        rows,
        gutterMm,
        aspectId,
        customAspect,
        notesPosition,
        notesShare,
        headerMm,
        labelMm,
        totalFrames,
      }),
    [
      paperId, orientation, marginMm, columns, rows, gutterMm,
      aspectId, customAspect, notesPosition, notesShare, headerMm, labelMm, totalFrames,
    ],
  );

  const error = result.error || null;
  const inches = error ? null : frameSizeInInches(result);

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Storyboard Frame Sheet",
      `Paper: ${result.paper.label} ${result.orientation}`,
      `Grid: ${result.columns} across × ${result.rows} down = ${result.framesPerPage} per sheet`,
      `Shooting ratio: ${result.aspectLabel}`,
      `Frame size: ${NUM1.format(result.frameWidth)} × ${NUM1.format(result.frameHeight)} mm`,
      `Notes area: ${result.notesPosition === "none" ? "none" : `${NUM1.format(result.notesWidth)} × ${NUM1.format(result.notesHeight || result.frameHeight)} mm ${result.notesPosition}`}`,
      `Total: ${result.totalFrames} frames over ${result.pages} sheet${result.pages === 1 ? "" : "s"}`,
      `Height used: ${NUM1.format(result.requiredHeight)} mm of ${NUM1.format(result.usableHeight)} mm`,
    ].join("\n");
  }, [error, result]);

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

  const downloadSvg = () => {
    const node = svgRef.current;
    if (!node || error) return;
    const styles = getComputedStyle(node);
    const resolved = {};
    Object.entries(TOKEN_BY_ROLE).forEach(([role, token]) => {
      resolved[role] = styles.getPropertyValue(token).trim();
    });

    const clone = node.cloneNode(true);
    clone.querySelectorAll("[data-fill]").forEach((element) => {
      const role = element.getAttribute("data-fill");
      if (resolved[role]) element.setAttribute("fill", resolved[role]);
      element.removeAttribute("style");
    });
    clone.querySelectorAll("[data-stroke]").forEach((element) => {
      const role = element.getAttribute("data-stroke");
      if (resolved[role]) element.setAttribute("stroke", resolved[role]);
      element.removeAttribute("style");
    });

    const markup = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `storyboard-${paperId}-${orientation}-${columns}x${rows}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setPaperId(DEFAULTS.paperId);
    setOrientation(DEFAULTS.orientation);
    setMarginMm(DEFAULTS.marginMm);
    setColumns(DEFAULTS.columns);
    setRows(DEFAULTS.rows);
    setGutterMm(DEFAULTS.gutterMm);
    setAspectId(DEFAULTS.aspectId);
    setCustomAspect(DEFAULTS.customAspect);
    setNotesPosition(DEFAULTS.notesPosition);
    setNotesShare(DEFAULTS.notesShare);
    setHeaderMm(DEFAULTS.headerMm);
    setLabelMm(DEFAULTS.labelMm);
    setTotalFrames(DEFAULTS.totalFrames);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          Pre-production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Storyboard Frame Sheet Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set your paper, grid and shooting ratio, and get a sheet with correctly proportioned
          frames, a notes column and a check that it all fits inside the printable area.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-paper">
              Paper size
            </label>
            <select
              id="sfsg-paper"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paperId}
              onChange={(event) => setPaperId(event.target.value)}
            >
              {PAPER_SIZES.map((paper) => (
                <option key={paper.id} value={paper.id}>
                  {paper.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-orientation">
              Orientation
            </label>
            <select
              id="sfsg-orientation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={orientation}
              onChange={(event) => setOrientation(event.target.value)}
            >
              {ORIENTATIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-aspect">
              Shooting ratio
            </label>
            <select
              id="sfsg-aspect"
              className={`mt-2 ${INPUT_CLASS}`}
              value={aspectId}
              onChange={(event) => setAspectId(event.target.value)}
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.id} value={ratio.id}>
                  {ratio.label}
                </option>
              ))}
              <option value="custom">Custom ratio</option>
            </select>
          </div>
          {aspectId === "custom" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="sfsg-custom-aspect">
                Custom ratio (width ÷ height)
              </label>
              <input
                id="sfsg-custom-aspect"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.1"
                step="0.01"
                value={customAspect}
                onChange={(event) => setCustomAspect(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-cols">
              Frames across
            </label>
            <input
              id="sfsg-cols"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={columns}
              onChange={(event) => setColumns(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-rows">
              Frames down
            </label>
            <input
              id="sfsg-rows"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="8"
              step="1"
              value={rows}
              onChange={(event) => setRows(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-notes">
              Notes area
            </label>
            <select
              id="sfsg-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              value={notesPosition}
              onChange={(event) => setNotesPosition(event.target.value)}
            >
              {NOTES_POSITIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-share">
              Notes share of the cell
            </label>
            <input
              id="sfsg-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="0.8"
              step="0.01"
              value={notesShare}
              onChange={(event) => setNotesShare(event.target.value)}
              disabled={notesPosition === "none"}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-margin">
              Page margin (mm)
            </label>
            <input
              id="sfsg-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={marginMm}
              onChange={(event) => setMarginMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-gutter">
              Gutter between cells (mm)
            </label>
            <input
              id="sfsg-gutter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={gutterMm}
              onChange={(event) => setGutterMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-header">
              Header height (mm)
            </label>
            <input
              id="sfsg-header"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={headerMm}
              onChange={(event) => setHeaderMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-label">
              Shot label height (mm)
            </label>
            <input
              id="sfsg-label"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={labelMm}
              onChange={(event) => setLabelMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sfsg-total">
              Total frames in the board
            </label>
            <input
              id="sfsg-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={totalFrames}
              onChange={(event) => setTotalFrames(event.target.value)}
            />
          </div>
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
              Frame size on the page
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : `${NUM1.format(result.frameWidth)} × ${NUM1.format(result.frameHeight)} mm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the input above to lay out the sheet."
                : `${NUM.format(result.framesPerPage)} frames per sheet · ${NUM.format(result.pages)} sheet${result.pages === 1 ? "" : "s"} for ${NUM.format(result.totalFrames)} frames`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the sheet specification"
              className={GHOST_BTN}
              disabled={!summary}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy spec"}
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              aria-label="Download the storyboard sheet as an SVG file"
              className={GHOST_BTN}
              disabled={Boolean(error)}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              SVG
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Page", error ? "—" : `${NUM1.format(result.pageWidth)} × ${NUM1.format(result.pageHeight)} mm`],
            ["Printable area", error ? "—" : `${NUM1.format(result.usableWidth)} × ${NUM1.format(result.usableHeight)} mm`],
            ["Frame size in inches", inches ? `${NUM2.format(inches.width)} × ${NUM2.format(inches.height)} in` : "—"],
            ["Drawing area per frame", error ? "—" : `${NUM1.format(result.frameAreaCm2)} cm²`],
            [
              "Notes area",
              error
                ? "—"
                : result.notesPosition === "none"
                  ? "none"
                  : `${NUM1.format(result.notesWidth)} × ${NUM1.format(result.notesPosition === "below" ? result.notesHeight : result.frameHeight)} mm`,
            ],
            ["Height needed", error ? "—" : `${NUM1.format(result.requiredHeight)} mm of ${NUM1.format(result.usableHeight)} mm`],
            ["Fits the page", error ? "—" : result.fits ? "Yes" : `No — ${NUM.format(result.maxRowsThatFit)} rows would fit`],
            ["Blank cells on the last sheet", error ? "—" : NUM.format(result.blanksOnLastPage)],
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
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Sheet preview</h2>
          <div className="mt-3 overflow-x-auto">
            <svg
              ref={svgRef}
              xmlns="http://www.w3.org/2000/svg"
              viewBox={`0 0 ${result.pageWidth} ${result.pageHeight}`}
              width="100%"
              className="mx-auto block h-auto w-full max-w-[380px] ring-1 ring-[var(--border)]"
              role="img"
              aria-label={`Storyboard sheet with ${result.columns} frames across and ${result.rows} down at ${result.aspectLabel}`}
            >
              <rect
                x="0"
                y="0"
                width={result.pageWidth}
                height={result.pageHeight}
                data-fill="sheet"
                style={{ fill: `var(${TOKEN_BY_ROLE.sheet})` }}
              />
              <text
                x={result.margin}
                y={result.margin + Math.max(6, result.header * 0.5)}
                fontFamily="system-ui, sans-serif"
                fontSize={Math.max(4, result.header * 0.32)}
                fontWeight="700"
                data-fill="ink"
                style={{ fill: `var(${TOKEN_BY_ROLE.ink})` }}
              >
                Storyboard · scene ___ · page ___
              </text>

              {result.cells.map((cell) => (
                <g key={cell.index}>
                  <rect
                    x={cell.frame.x}
                    y={cell.frame.y}
                    width={cell.frame.width}
                    height={cell.frame.height}
                    fillOpacity="0"
                    strokeWidth="0.6"
                    data-stroke="ink"
                    style={{ stroke: `var(${TOKEN_BY_ROLE.ink})` }}
                  />
                  {cell.notes ? (
                    <rect
                      x={cell.notes.x}
                      y={cell.notes.y}
                      width={cell.notes.width}
                      height={cell.notes.height}
                      fillOpacity="0"
                      strokeWidth="0.3"
                      strokeDasharray="1.5 1.5"
                      data-stroke="line"
                      style={{ stroke: `var(${TOKEN_BY_ROLE.line})` }}
                    />
                  ) : null}
                  {result.label > 0 ? (
                    <text
                      x={cell.label.x + 1}
                      y={cell.label.y + result.label * 0.75}
                      fontFamily="system-ui, sans-serif"
                      fontSize={Math.max(3, result.label * 0.6)}
                      data-fill="accent"
                      style={{ fill: `var(${TOKEN_BY_ROLE.accent})` }}
                    >
                      {cell.index + 1}
                    </text>
                  ) : null}
                </g>
              ))}
            </svg>
          </div>
          <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
            Solid boxes are the frames · dashed boxes are the notes area · print at 100%, not
            &quot;fit to page&quot;, or the ratio will shift
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Frames are drawn at the exact shooting ratio so anything you sketch inside the box is what
        the camera sees. Print without scaling — a printer driver set to shrink-to-fit will change
        both the margin and the frame proportions.
      </p>
    </main>
  );
}
