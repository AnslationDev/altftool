"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import {
  COMMON_COLLAR_LB,
  COMPETITION_COLLAR_KG,
  KG_BARS,
  LB_BARS,
  MAX_PAIRS_PER_PLATE,
  computePlateLoading,
  defaultInventory,
} from "../lib";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const inventoryToState = (unit) =>
  defaultInventory(unit).map((plate) => ({ weight: plate.weight, pairs: String(plate.pairs) }));

export default function ToolHome() {
  const [unit, setUnit] = useState("kg");
  const [barId, setBarId] = useState("men-20");
  const [collar, setCollar] = useState(String(COMPETITION_COLLAR_KG));
  const [target, setTarget] = useState("142.5");
  const [inventory, setInventory] = useState(() => inventoryToState("kg"));
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const bars = unit === "lb" ? LB_BARS : KG_BARS;
  const bar = bars.find((option) => option.id === barId) ?? bars[0];

  const applyUnitDefaults = (nextUnit) => {
    setUnit(nextUnit);
    setInventory(inventoryToState(nextUnit));
    if (nextUnit === "lb") {
      setBarId("men-45");
      setCollar(String(COMMON_COLLAR_LB));
      setTarget("225");
    } else {
      setBarId("men-20");
      setCollar(String(COMPETITION_COLLAR_KG));
      setTarget("142.5");
    }
    resetCopyState();
  };

  // Switching units resets the rack, since kg and lb plates come in different
  // denominations — confirm first if that would discard a custom rack.
  const handleUnitChange = (nextUnit) => {
    if (nextUnit === unit) return;
    const isCustomRack = JSON.stringify(inventory) !== JSON.stringify(inventoryToState(unit));
    if (
      isCustomRack &&
      !window.confirm(
        "Switching units resets your plate rack to the default stock for that unit (kg and lb plates come in different sizes). Continue?",
      )
    ) {
      return;
    }
    applyUnitDefaults(nextUnit);
  };

  const result = useMemo(() => {
    const targetWeight = toNumber(target);
    const collarWeight = toNumber(collar);
    if (Number.isNaN(targetWeight)) return { error: "Enter a target weight." };
    if (Number.isNaN(collarWeight)) return { error: "Enter the collar weight, or 0 for none." };
    const stock = inventory
      .map((plate) => ({ weight: plate.weight, pairs: toNumber(plate.pairs) }))
      .filter((plate) => Number.isFinite(plate.pairs) && plate.pairs > 0);
    return computePlateLoading({
      targetWeight,
      barWeight: bar.weight,
      collarWeight,
      inventory: stock.length ? stock : [{ weight: 0, pairs: 0 }],
      unit,
    });
  }, [target, collar, inventory, bar, unit]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const perSide = result.loading.length
      ? result.loading.map((row) => `${NUM.format(row.weight)} × ${row.count}`).join(" + ")
      : "bar only";
    return [
      "Barbell Plate Loading",
      `Bar: ${bar.label}`,
      `Collars: ${NUM.format(result.collarWeight)} ${unit} each side`,
      `Target: ${NUM.format(result.targetWeight)} ${unit}`,
      `Loaded: ${NUM.format(result.achievedWeight)} ${unit}`,
      `Per side: ${perSide}`,
    ].join("\n");
  }, [hasError, result, bar, unit]);

  const copyResult = () => copy("result", summary, { label: "Plate loading result" });

  const reset = () => {
    if (
      !window.confirm(
        "Reset the target, collars, bar and plate rack back to the defaults? This cannot be undone.",
      )
    ) {
      return;
    }
    applyUnitDefaults(unit);
  };

  const rows = hasError
    ? [
        ["Weight needed per side", DASH],
        ["Weight actually loaded per side", DASH],
        ["Plates per side", DASH],
        ["Plates in total", DASH],
        ["Bar plus collars", DASH],
        ["Shortfall", DASH],
        ["Smallest jump this rack allows", DASH],
      ]
    : [
        ["Weight needed per side", `${NUM.format(result.perSide)} ${unit}`],
        ["Weight actually loaded per side", `${NUM.format(result.loadedPerSide)} ${unit}`],
        ["Plates per side", NUM.format(result.plateCountPerSide)],
        ["Plates in total", NUM.format(result.totalPlates)],
        ["Bar plus collars", `${NUM.format(result.barAndCollars)} ${unit}`],
        [
          "Shortfall",
          result.exact ? "None — exact match" : `${NUM.format(result.shortfall)} ${unit} short`,
        ],
        ["Smallest jump this rack allows", `${NUM.format(result.smallestIncrement)} ${unit}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Gym maths
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Barbell Plate Loading Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weight per side is (target − bar − both collars) ÷ 2, then the closest achievable weight
          is found from what your rack actually has, preferring the heaviest plates first. Bar
          weights and disc sizes follow IWF and IPF competition specifications.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="plate-unit">
              Units
            </label>
            <select
              id="plate-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => handleUnitChange(event.target.value)}
            >
              <option value="kg">Kilograms</option>
              <option value="lb">Pounds</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="plate-bar">
              Bar
            </label>
            <select
              id="plate-bar"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bar.id}
              onChange={(event) => setBarId(event.target.value)}
            >
              {bars.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="plate-target">
              Target weight ({unit})
            </label>
            <input
              id="plate-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step={unit === "lb" ? "5" : "2.5"}
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="plate-collar">
              Collar weight, each side ({unit})
            </label>
            <input
              id="plate-collar"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={collar}
              onChange={(event) => setCollar(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Competition collars are 2.5 kg each. Use 0 for spring clips.
            </p>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Loaded bar weight
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.achievedWeight)} ${unit}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a loading."
                : `${NUM.format(result.perSide)} ${unit} per side on a ${bar.label.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy result to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset target, collars, bar and rack to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        <span aria-live="polite" role="status" className="sr-only">
          {announcement}
        </span>

        {!hasError && !result.exact && (
          <p
            aria-live="polite"
            role="status"
            className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
          >
            The rack cannot make {NUM.format(result.targetWeight)} {unit} exactly — this is the
            closest loading at or below it, {NUM.format(result.shortfall)} {unit} short.
          </p>
        )}

        {!hasError && (
          <div className="mt-5" aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Per side, sleeve outwards
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {result.loading.length === 0 && (
                <li className="text-sm text-[var(--muted-foreground)]">
                  No plates — the bar and collars alone make this weight.
                </li>
              )}
              {result.loading.flatMap((row) =>
                Array.from({ length: row.count }, (unused, index) => (
                  <li
                    key={`${row.weight}-${index}`}
                    className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
                  >
                    {NUM.format(row.weight)}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What is in your rack</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Pairs of each plate — one for the left sleeve, one for the right. Set a denomination to 0
          if you do not own it.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {inventory.map((plate, index) => (
            <div key={plate.weight}>
              <label className={LABEL_CLASS} htmlFor={`plate-stock-${plate.weight}`}>
                {NUM.format(plate.weight)} {unit} — pairs
              </label>
              <input
                id={`plate-stock-${plate.weight}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max={MAX_PAIRS_PER_PLATE}
                step="1"
                value={plate.pairs}
                onChange={(event) => {
                  const raw = event.target.value;
                  // min/max on a number input only affect the spinner arrows,
                  // not typed/pasted text, so clamp explicitly — otherwise an
                  // out-of-range value (e.g. pasted "9999") flows straight
                  // into state and can render thousands of per-side pills.
                  let next = raw;
                  if (raw !== "") {
                    const parsed = Number(raw);
                    if (Number.isFinite(parsed)) {
                      next = String(Math.max(0, Math.min(MAX_PAIRS_PER_PLATE, parsed)));
                    }
                  }
                  setInventory((list) =>
                    list.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, pairs: next } : row
                    )
                  );
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Loading finds the closest weight your rack can actually make, preferring the largest discs
        against the sleeve when more than one combination works. Check your own bar on a scale —
        training bars are often a kilogram or two off their marked weight.
      </p>
    </main>
  );
}
