"use client";

import { useMemo, useState } from "react";
import { Blinds, Check, Copy, RotateCcw } from "lucide-react";

import { BLIND_TYPES, planBlindSize } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const WIDTH_LABELS = ["at the top", "across the middle", "at the sill"];
const HEIGHT_LABELS = ["at the left", "down the centre", "at the right"];

const DEFAULTS = {
  unit: "mm",
  widths: ["1205", "1202", "1208"],
  heights: ["1500", "1504", "1498"],
  depth: "60",
  blindId: "roller",
  blackout: false,
};

const SQUARENESS_TEXT = {
  square: "Square enough for a recess fit",
  marginal: "Slightly out of square — the light gap will vary down the sides",
  out: "Too far out of square for a recess fit; face fix it instead",
};

const DEPTH_TEXT = {
  flush: "Deep enough for the headrail to sit fully inside the recess",
  partial: "Only deep enough for a partial recess fit — the rail will sit proud",
  insufficient: "Not deep enough for a recess fit at all",
};

const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [widths, setWidths] = useState(DEFAULTS.widths);
  const [heights, setHeights] = useState(DEFAULTS.heights);
  const [depth, setDepth] = useState(DEFAULTS.depth);
  const [blindId, setBlindId] = useState(DEFAULTS.blindId);
  const [blackout, setBlackout] = useState(DEFAULTS.blackout);
  const [copied, setCopied] = useState(false);

  const setWidthAt = (index, value) =>
    setWidths((current) => current.map((item, i) => (i === index ? value : item)));
  const setHeightAt = (index, value) =>
    setHeights((current) => current.map((item, i) => (i === index ? value : item)));

  const result = useMemo(
    () =>
      planBlindSize({
        widths: widths.map(toNumber),
        heights: heights.map(toNumber),
        depth: toNumber(depth),
        unit,
        blindId,
        blackout,
      }),
    [widths, heights, depth, unit, blindId, blackout],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      `Blind order size — ${result.blindLabel}`,
      `Measured: widths ${num(result.minWidthMm)} to ${num(result.maxWidthMm)} mm, heights ${num(result.minHeightMm)} to ${num(result.maxHeightMm)} mm`,
      `Squareness: ${SQUARENESS_TEXT[result.squareness]}`,
      `INSIDE MOUNT — order ${num(result.insideOrderWidthMm)} mm wide x ${num(result.insideOrderHeightMm)} mm drop`,
      `  factory deducts ${num(result.insideDeductionMm)} mm, leaving ${num(result.insideFinishedWidthMm)} mm of blind and ${num(result.insideGapEachSideMm)} mm each side`,
      `  recess depth ${num(result.depthMm)} mm: ${DEPTH_TEXT[result.depthVerdict]}`,
      `OUTSIDE MOUNT — order ${num(result.outsideOrderWidthMm)} mm wide x ${num(result.outsideOrderHeightMm)} mm drop`,
      `  ${num(result.overlapPerSideMm)} mm overlap each side, ${num(result.aboveOpeningMm)} mm above, ${num(result.belowSillMm)} mm below the sill`,
      `Brackets: ${result.insideBrackets} inside / ${result.outsideBrackets} outside`,
      `Stack when open: ${num(result.stackHeightMm)} mm at the top${result.stackBackMm > 0 ? `, ${num(result.stackBackMm)} mm of side stack` : ""}`,
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
    setUnit(DEFAULTS.unit);
    setWidths(DEFAULTS.widths);
    setHeights(DEFAULTS.heights);
    setDepth(DEFAULTS.depth);
    setBlindId(DEFAULTS.blindId);
    setBlackout(DEFAULTS.blackout);
    setCopied(false);
  };

  const rows = [
    ["Narrowest width measured", failed ? DASH : `${num(result.minWidthMm)} mm`],
    ["Widest width measured", failed ? DASH : `${num(result.maxWidthMm)} mm`],
    ["Width variation", failed ? DASH : `${num(result.widthSpreadMm)} mm`],
    ["Height variation", failed ? DASH : `${num(result.heightSpreadMm)} mm`],
    ["Squareness", failed ? DASH : SQUARENESS_TEXT[result.squareness]],
    ["Inside mount — order width", failed ? DASH : `${num(result.insideOrderWidthMm)} mm`],
    ["Inside mount — order drop", failed ? DASH : `${num(result.insideOrderHeightMm)} mm`],
    ["Factory deduction", failed ? DASH : `${num(result.insideDeductionMm)} mm`],
    ["Finished blind width", failed ? DASH : `${num(result.insideFinishedWidthMm)} mm`],
    ["Clearance each side", failed ? DASH : `${num(result.insideGapEachSideMm)} mm`],
    ["Widest light gap at the tight point", failed ? DASH : `${num(result.worstLightGapMm)} mm`],
    ["Recess depth measured", failed ? DASH : `${num(result.depthMm)} mm`],
    ["Depth verdict", failed ? DASH : DEPTH_TEXT[result.depthVerdict]],
    [
      "Depth still needed",
      failed || result.depthShortfallMm === 0 ? DASH : `${num(result.depthShortfallMm)} mm`,
    ],
    ["Outside mount — order width", failed ? DASH : `${num(result.outsideOrderWidthMm)} mm`],
    ["Outside mount — order drop", failed ? DASH : `${num(result.outsideOrderHeightMm)} mm`],
    ["Overlap used each side", failed ? DASH : `${num(result.overlapPerSideMm)} mm`],
    ["Brackets, inside mount", failed ? DASH : `${result.insideBrackets}`],
    ["Brackets, outside mount", failed ? DASH : `${result.outsideBrackets}`],
    ["Slats", failed || result.slatCount === 0 ? DASH : `${result.slatCount}`],
    ["Louvres", failed || result.louvreCount === 0 ? DASH : `${result.louvreCount}`],
    ["Stack at the top when open", failed ? DASH : `${num(result.stackHeightMm)} mm`],
    ["Side stack when drawn back", failed || result.stackBackMm === 0 ? DASH : `${num(result.stackBackMm)} mm`],
    ["Glass hidden by the stack", failed ? DASH : `${num(result.viewLossPercent)}%`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Blinds className="h-4 w-4" aria-hidden="true" />
          Furnishing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Window Blind Size Helper</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Measure three widths and three heights, and this works out the exact figure to put on the order
          for a recess fit or a face fit — including the deduction the factory takes for you.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Measurements</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: "mm", label: "Millimetres" },
            { id: "cm", label: "Centimetres" },
            { id: "in", label: "Inches" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={unit === option.id}
              className={unit === option.id ? CHIP_ON : CHIP}
              onClick={() => setUnit(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">Widths ({unit})</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          {widths.map((value, index) => (
            <div key={WIDTH_LABELS[index]}>
              <label className={LABEL} htmlFor={`wb-w${index}`}>
                Width {WIDTH_LABELS[index]}
              </label>
              <input
                id={`wb-w${index}`}
                className={FIELD}
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={value}
                onChange={(event) => setWidthAt(index, event.target.value)}
              />
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm font-semibold text-[var(--foreground)]">Heights ({unit})</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          {heights.map((value, index) => (
            <div key={HEIGHT_LABELS[index]}>
              <label className={LABEL} htmlFor={`wb-h${index}`}>
                Height {HEIGHT_LABELS[index]}
              </label>
              <input
                id={`wb-h${index}`}
                className={FIELD}
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={value}
                onChange={(event) => setHeightAt(index, event.target.value)}
              />
            </div>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold">Blind and recess</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="wb-type">
              Blind type
            </label>
            <select
              id="wb-type"
              className={FIELD}
              value={blindId}
              onChange={(event) => setBlindId(event.target.value)}
            >
              {BLIND_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="wb-depth">
              Clear recess depth ({unit})
            </label>
            <input
              id="wb-depth"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={depth}
              onChange={(event) => setDepth(event.target.value)}
            />
          </div>
        </div>
        <label className="mt-3 flex min-h-11 items-center gap-3 text-sm font-semibold">
          <input
            id="wb-blackout"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={blackout}
            onChange={(event) => setBlackout(event.target.checked)}
          />
          Blackout blind — use the wider face-fix overlap
        </label>
      </section>

      {failed && (
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
              Inside mount order size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed
                ? DASH
                : `${num(result.insideOrderWidthMm)} × ${num(result.insideOrderHeightMm)} mm`}
            </p>
            <p
              className={`mt-1 text-sm ${
                failed
                  ? "text-[var(--muted-foreground)]"
                  : result.squareness === "out" || result.depthVerdict === "insufficient"
                    ? "text-[var(--danger)]"
                    : "text-[var(--muted-foreground)]"
              }`}
            >
              {failed
                ? "Fix the highlighted input to see an order size."
                : result.squareness === "out"
                  ? "Face fix this one — the recess is too far out of square"
                  : result.depthVerdict === "insufficient"
                    ? `Recess is ${num(result.depthShortfallMm)} mm too shallow — face fix instead`
                    : `Outside mount alternative: ${num(result.outsideOrderWidthMm)} × ${num(result.outsideOrderHeightMm)} mm`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the blind order sizes"
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Deductions and minimum depths vary between manufacturers, so confirm both against the maker's own
        measuring guide before you order. Made-to-measure blinds are usually non-returnable if the size is
        wrong, so measure twice with a steel tape, never a fabric one.
      </p>
    </main>
  );
}
