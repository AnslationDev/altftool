"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import {
  COMMON_COLLAR_LB,
  COMPETITION_COLLAR_KG,
  KG_BARS,
  LB_BARS,
  computePlateLoading,
  defaultInventory,
} from "../lib";

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
  const [copied, setCopied] = useState(false);

  const bars = unit === "lb" ? LB_BARS : KG_BARS;
  const bar = bars.find((option) => option.id === barId) ?? bars[0];

  const switchUnit = (nextUnit) => {
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
    setCopied(false);
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
    });
  }, [target, collar, inventory, bar]);

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

  const reset = () => switchUnit("kg");

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
          Weight per side is (target − bar − both collars) ÷ 2, then the plates are picked heaviest
          first from what your rack actually has. Bar weights and disc sizes follow IWF and IPF
          competition specifications.
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
              onChange={(event) => switchUnit(event.target.value)}
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
          <div>
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
              aria-label="Copy the plate loading"
              className={GHOST_BTN}
              disabled={hasError}
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
              aria-label="Reset to the default kilogram setup"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && !result.exact && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            The rack cannot make {NUM.format(result.targetWeight)} {unit} exactly — this is the
            closest loading at or below it, {NUM.format(result.shortfall)} {unit} short.
          </p>
        )}

        {!hasError && (
          <div className="mt-5">
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
                max="20"
                step="1"
                value={plate.pairs}
                onChange={(event) => {
                  const next = event.target.value;
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
        Loading is picked heaviest first, which matches how a bar is actually loaded and keeps the
        largest discs against the sleeve. Check your own bar on a scale — training bars are often a
        kilogram or two off their marked weight.
      </p>
    </main>
  );
}
