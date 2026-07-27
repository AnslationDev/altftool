"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sprout } from "lucide-react";

import { HERBS, planHerbGarden } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";

const DEFAULT_COUNTS = { basil: "4", coriander: "6", mint: "1" };
const DEFAULTS = { length: "120", width: "60", unit: "cm" };

const UNIT_LABEL = { cm: "cm", in: "inches", ft: "feet" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return 0;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [counts, setCounts] = useState(DEFAULT_COUNTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const selection = HERBS.map((herb) => ({
      id: herb.id,
      count: toNumber(counts[herb.id] ?? "0"),
    })).filter((item) => Number.isFinite(item.count) && item.count > 0);

    return planHerbGarden({
      bedLength: toNumber(length),
      bedWidth: toNumber(width),
      unit,
      selection,
    });
  }, [length, width, unit, counts]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Herb Garden Spacing Plan",
      `Bed: ${NUM.format(result.bedLengthCm)} x ${NUM.format(result.bedWidthCm)} cm (${NUM2.format(result.bedAreaM2)} m2)`,
      `Plants: ${result.totalPlants} across ${result.plants.length} herbs`,
      `Space used: ${NUM2.format(result.usedAreaM2)} m2 (${NUM.format(result.utilisationPct)}% of the bed)`,
      `Minimum soil depth: ${result.minPotDepthCm} cm`,
      "",
      ...result.plants.map(
        (plant) =>
          `${plant.name}: ${plant.count} plant(s), ${plant.spacingCm} cm apart, ${plant.depthCm} cm deep, ${plant.sunHours[0]}-${plant.sunHours[1]} h sun`,
      ),
    ];
    return lines.join("\n");
  }, [hasError, result]);

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
    setUnit(DEFAULTS.unit);
    setCounts(DEFAULT_COUNTS);
    setCopied(false);
  };

  const setCount = (id, value) => {
    setCounts((previous) => ({ ...previous, [id]: value }));
  };

  const rows = hasError
    ? [
        ["Bed area", DASH],
        ["Plants in the plan", DASH],
        ["Space the plants need", DASH],
        ["Bed used", DASH],
        ["Space left over", DASH],
        ["Deepest soil required", DASH],
        ["Sun the sunniest herb wants", DASH],
      ]
    : [
        [
          "Bed area",
          `${NUM2.format(result.bedAreaM2)} m² (${NUM.format(result.bedLengthCm)} × ${NUM.format(result.bedWidthCm)} cm)`,
        ],
        ["Plants in the plan", `${result.totalPlants} across ${result.plants.length} herbs`],
        ["Space the plants need", `${NUM2.format(result.usedAreaM2)} m²`],
        ["Bed used", `${NUM.format(result.utilisationPct)}%`],
        [
          "Space left over",
          result.spareAreaM2 >= 0 ? `${NUM2.format(result.spareAreaM2)} m²` : "Over capacity",
        ],
        ["Deepest soil required", `${result.minPotDepthCm} cm`],
        ["Sun the sunniest herb wants", `${result.minSunHours}+ hours a day`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sprout className="h-4 w-4" aria-hidden="true" />
          Herb bed
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Herb Garden Spacing Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set your bed size, pick the herbs you want, and see whether they fit — with the spacing,
          soil depth and sun each one needs, and which ones to keep in their own pot.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="herb-length">
              Bed length
            </label>
            <input
              id="herb-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={length}
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="herb-width">
              Bed width
            </label>
            <input
              id="herb-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="herb-unit">
              Measured in
            </label>
            <select
              id="herb-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {Object.entries(UNIT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">How many of each herb?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {HERBS.map((herb) => (
            <div
              key={herb.id}
              className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] px-3 py-2"
            >
              <label className="min-w-0 flex-1 text-sm" htmlFor={`herb-count-${herb.id}`}>
                <span className="block font-semibold">{herb.name}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">
                  {herb.spacingCm} cm apart · {herb.depthCm} cm deep · {herb.sunHours[0]}-
                  {herb.sunHours[1]} h sun
                </span>
              </label>
              <input
                id={`herb-count-${herb.id}`}
                className="h-11 w-20 shrink-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-center text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={counts[herb.id] ?? "0"}
                onChange={(event) => setCount(herb.id, event.target.value)}
              />
            </div>
          ))}
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
              Bed space used
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.utilisationPct)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : result.fits
                  ? `${result.totalPlants} plants fit with ${NUM2.format(result.spareAreaM2)} m² to spare`
                  : "This plan is over the bed's capacity"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy herb garden plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
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

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Plant by plant</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Herb
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Plants
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Spacing
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Depth
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Sun
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Fits alone
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.plants.map((plant) => (
                  <tr key={plant.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{plant.name}</span>
                      <span className="block text-xs italic text-[var(--muted-foreground)]">
                        {plant.botanical} · {plant.lifespan}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{plant.count}</td>
                    <td className="py-2 pr-3 text-right">{plant.spacingCm} cm</td>
                    <td className="py-2 pr-3 text-right">{plant.depthCm} cm</td>
                    <td className="py-2 pr-3 text-right">
                      {plant.sunHours[0]}-{plant.sunHours[1]} h
                    </td>
                    <td className="py-2 text-right">
                      {plant.capacityAlone} ({plant.rowsIfAlone}×{plant.perRowIfAlone})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.plants.map((plant) => (
              <li key={plant.id}>
                <span className="font-semibold text-[var(--foreground)]">{plant.name}:</span>{" "}
                {plant.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Spacing, depth and sun figures are mature-habit growing guidance and vary with cultivar and
        climate. In a hot Indian summer most of the 6-8 hour herbs do better with morning sun and
        afternoon shade than with a full day of direct light.
      </p>
    </main>
  );
}
