"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ruler, RotateCcw } from "lucide-react";

import { computeCarpet, DEFAULT_TRIM_PER_DROP_M, ROLL_WIDTHS } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const m2 = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} m²` : DASH);
const m = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} m` : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM1.format(v)}%` : DASH);

const DEFAULTS = {
  length: "6",
  width: "5",
  roll: "3.66",
  repeat: "0",
  trim: String(DEFAULT_TRIM_PER_DROP_M),
  price: "900",
  underlayPrice: "250",
  doorways: "0.9",
};

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
  const [roll, setRoll] = useState(DEFAULTS.roll);
  const [repeat, setRepeat] = useState(DEFAULTS.repeat);
  const [trim, setTrim] = useState(DEFAULTS.trim);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [underlayPrice, setUnderlayPrice] = useState(DEFAULTS.underlayPrice);
  const [doorways, setDoorways] = useState(DEFAULTS.doorways);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCarpet({
        roomLengthM: toNum(length),
        roomWidthM: toNum(width),
        rollWidthM: toNum(roll),
        patternRepeatM: toNum(repeat),
        trimPerDropM: toNum(trim),
        pricePerSqm: toNum(price),
        underlayPricePerSqm: toNum(underlayPrice),
        doorwayWidthsM: toNum(doorways),
      }),
    [length, width, roll, repeat, trim, price, underlayPrice, doorways],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Carpet Roll Quantity Calculator",
      `Room: ${NUM2.format(toNum(length))} m x ${NUM2.format(toNum(width))} m (${m2(result.roomArea)})`,
      `Roll width: ${NUM2.format(toNum(roll))} m`,
      `Best layout: ${result.orientationLabel}`,
      `Drops: ${result.drops} of ${m(result.dropLengthM)} (${result.seams} seam${result.seams === 1 ? "" : "s"})`,
      `Carpet to order: ${m(result.runningMetres)} running`,
      `Carpet area bought: ${m2(result.purchasedArea)}`,
      `Offcut wastage: ${m2(result.offcutArea)} (${pct(result.wastagePercent)})`,
      `Underlay: ${m2(result.underlayArea)}`,
      `Gripper rod: ${m(result.gripperRodLengthM)}`,
      `Carpet cost: ${money(result.carpetCost)}`,
      `Underlay cost: ${money(result.underlayCost)}`,
      `Total: ${money(result.totalCost)}`,
    ].join("\n");
  }, [hasError, result, length, width, roll]);

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
    setRoll(DEFAULTS.roll);
    setRepeat(DEFAULTS.repeat);
    setTrim(DEFAULTS.trim);
    setPrice(DEFAULTS.price);
    setUnderlayPrice(DEFAULTS.underlayPrice);
    setDoorways(DEFAULTS.doorways);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Best layout", DASH],
        ["Drops needed", DASH],
        ["Seams", DASH],
        ["Carpet area bought", DASH],
        ["Room floor area", DASH],
        ["Offcut wastage", DASH],
        ["Metres saved vs the other direction", DASH],
        ["Underlay to buy", DASH],
        ["Gripper rod length", DASH],
        ["Carpet cost", DASH],
        ["Underlay cost", DASH],
        ["Estimated total", DASH],
      ]
    : [
        ["Best layout", result.orientationLabel],
        ["Drops needed", `${result.drops} × ${m(result.dropLengthM)}`],
        ["Seams", String(result.seams)],
        ["Carpet area bought", m2(result.purchasedArea)],
        ["Room floor area", m2(result.roomArea)],
        ["Offcut wastage", `${m2(result.offcutArea)} (${pct(result.wastagePercent)})`],
        ["Metres saved vs the other direction", m(result.metresSavedByOrientation)],
        ["Underlay to buy", m2(result.underlayArea)],
        ["Gripper rod length", m(result.gripperRodLengthM)],
        ["Carpet cost", money(result.carpetCost)],
        ["Underlay cost", money(result.underlayCost)],
        ["Estimated total", money(result.totalCost)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Flooring
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Carpet Roll Quantity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the room and the roll width. This works out how many drops you need, which
          direction wastes less, the running metres to order and what the offcuts cost you.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="carpet-length">
              Room length (m)
            </label>
            <input
              id="carpet-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="carpet-width">
              Room width (m)
            </label>
            <input
              id="carpet-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="carpet-roll">
              Carpet roll width
            </label>
            <select
              id="carpet-roll"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
            >
              {ROLL_WIDTHS.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="carpet-repeat">
              Pattern repeat (m, 0 if plain)
            </label>
            <input
              id="carpet-repeat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="carpet-trim">
              Trim allowance per drop (m)
            </label>
            <input
              id="carpet-trim"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={trim}
              onChange={(e) => setTrim(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="carpet-doors">
              Total doorway width (m)
            </label>
            <input
              id="carpet-doors"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={doorways}
              onChange={(e) => setDoorways(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="carpet-price">
              Carpet price (₹ per m²)
            </label>
            <input
              id="carpet-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="carpet-underlay">
              Underlay price (₹ per m²)
            </label>
            <input
              id="carpet-underlay"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={underlayPrice}
              onChange={(e) => setUnderlayPrice(e.target.value)}
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
              Carpet to order
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : m(result.runningMetres)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the order quantity."
                : `${result.drops} drop${result.drops === 1 ? "" : "s"} off a ${NUM2.format(toNum(roll))} m roll`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy carpet quantity result"
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
        Estimates for a single rectangular room. Alcoves, bay windows and stairs need separate
        measurements, and cut-pile carpet should be laid with every drop running the same way so
        the pile shades evenly. Ask your fitter to confirm before the roll is cut — cut lengths are
        rarely returnable.
      </p>
    </main>
  );
}
