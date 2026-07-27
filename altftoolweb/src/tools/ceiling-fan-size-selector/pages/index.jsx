"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fan, RotateCcw } from "lucide-react";

import {
  MIN_WALL_CLEARANCE_M,
  SWEEP_OPTIONS,
  TARGET_BLADE_HEIGHT_M,
  selectCeilingFan,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const m = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} m` : DASH);
const m2 = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} m²` : DASH);
const m3 = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} m³` : DASH);

const DEFAULTS = { length: "4", width: "3.5", height: "3" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      selectCeilingFan({
        roomLengthM: toNum(length),
        roomWidthM: toNum(width),
        ceilingHeightM: toNum(height),
      }),
    [length, width, height],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Ceiling Fan Size Selector",
      `Room: ${m(toNum(length))} × ${m(toNum(width))} × ${m(toNum(height))} high (${m2(result.areaM2)})`,
      `Recommended sweep: ${result.sweepMm} mm (${result.sweepInches} inch)`,
      `Number of fans: ${result.fanCount}`,
      `Rated air delivery: ${result.airDeliveryPerFanCmm} m³/min each, ${result.totalAirDeliveryCmm} total`,
      `Air changes: ${NUM1.format(result.airChangesPerMinute)} per minute`,
      `Downrod: ${result.downrodMm} mm (ideal ${NUM0.format(result.idealDownrodMm)} mm)`,
      `Blade height above floor: ${m(result.bladeHeightM)}`,
      ...result.warnings.map((w) => `Note: ${w}`),
    ].join("\n");
  }, [hasError, result, length, width, height]);

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
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setCopied(false);
  };

  const labels = [
    "Floor area",
    "Room volume",
    "Fans needed",
    "Rated air delivery per fan",
    "Total air delivery",
    "Air changes per minute",
    "Air changes per hour",
    "Downrod to order",
    "Ideal downrod length",
    "Blade height above floor",
    "Shortest room side",
    "Side length this sweep needs",
  ];

  const values = hasError
    ? labels.map(() => DASH)
    : [
        m2(result.areaM2),
        m3(result.volumeM3),
        String(result.fanCount),
        `${result.airDeliveryPerFanCmm} m³/min`,
        `${result.totalAirDeliveryCmm} m³/min`,
        NUM1.format(result.airChangesPerMinute),
        NUM0.format(result.airChangesPerHour),
        `${result.downrodMm} mm`,
        `${NUM0.format(result.idealDownrodMm)} mm`,
        m(result.bladeHeightM),
        m(result.shortestSideM),
        m(result.minWallClearanceNeededM),
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fan className="h-4 w-4" aria-hidden="true" />
          Cooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ceiling Fan Size Selector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sweep comes from floor area, downrod comes from ceiling height. Enter both and get the fan
          size, how many you need, the rod length to order and the air changes you will get.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fan-length">
              Room length (m)
            </label>
            <input
              id="fan-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fan-width">
              Room width (m)
            </label>
            <input
              id="fan-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fan-height">
              Floor to ceiling height (m)
            </label>
            <input
              id="fan-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="2"
              max="6"
              step="0.05"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended sweep
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.sweepMm} mm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the recommendation."
                : `${result.sweepInches} inch · ${result.fanCount} fan${result.fanCount === 1 ? "" : "s"} · ${result.downrodMm} mm downrod`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy ceiling fan recommendation"
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
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError &&
          result.warnings.map((warning) => (
            <p
              key={warning}
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {warning}
            </p>
          ))}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {labels.map((label, index) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{values[index]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Sweep against floor area</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Sweep
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Up to
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Air delivery
                </th>
              </tr>
            </thead>
            <tbody>
              {SWEEP_OPTIONS.map((option) => {
                const active = !hasError && option.sweepMm === result.sweepMm;
                return (
                  <tr
                    key={option.sweepMm}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      active ? "bg-[var(--muted)] font-semibold" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">
                      {option.sweepMm} mm ({option.inches}″)
                    </td>
                    <td className="py-2 pr-3 text-right">{option.maxAreaM2} m²</td>
                    <td className="py-2 text-right">{option.airDeliveryCmm} m³/min</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Downrod is sized so the blades land about {TARGET_BLADE_HEIGHT_M} m above the floor, with
          at least {Math.round(MIN_WALL_CLEARANCE_M * 100)} cm from the blade tip to the nearest
          wall.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A sizing guide, not an installation instruction. Air delivery figures are typical ratings
        for each sweep — check the actual m³/min and wattage on the fan's BEE label. Ceiling fans
        must be fixed to a structural hook or box rated for the load; have an electrician confirm
        the fixing and the wiring.
      </p>
    </main>
  );
}
