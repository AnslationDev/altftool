"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import { KATHAK_SEGMENTS, computeKathakBurn } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const show = (value, formatter = NUM0) =>
  Number.isFinite(value) ? formatter.format(value) : DASH;

const DEFAULT_MINUTES = {
  abhinaya: "15",
  vilambit: "10",
  madhya: "20",
  drut: "15",
  chakkar: "5",
};

const DEFAULTS = {
  weight: "55",
  weightUnit: "kg",
  ghungroo: "0.7",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [ghungroo, setGhungroo] = useState(DEFAULTS.ghungroo);
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const minutesBySegment = {};
    for (const segment of KATHAK_SEGMENTS) {
      minutesBySegment[segment.id] = toNumber(minutes[segment.id]);
    }
    return computeKathakBurn({
      weight: toNumber(weight),
      weightUnit,
      ghungrooPerAnkleKg: toNumber(ghungroo),
      minutesBySegment,
    });
  }, [weight, weightUnit, ghungroo, minutes]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Kathak Riyaz Calorie Estimate",
      `Body weight: ${NUM1.format(result.weightKg)} kg, ghungroo ${NUM2.format(result.ghungrooTotalKg)} kg total`,
      `Riyaz length: ${result.totalMinutes} min (${result.footworkMinutes} min on the feet)`,
      "",
    ];
    for (const row of result.rows) {
      if (row.minutes > 0) {
        lines.push(
          `${row.label}: ${row.minutes} min at ${row.met} MET = ${NUM0.format(row.kcal)} kcal`,
        );
      }
    }
    lines.push(
      "",
      `Total: ${NUM0.format(result.grossKcal)} kcal`,
      `Net of resting metabolism: ${NUM0.format(result.netKcal)} kcal`,
      `Attributable to the ghungroo: ${NUM0.format(result.ghungrooExtraKcal)} kcal`,
    );
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
    setWeight(DEFAULTS.weight);
    setWeightUnit(DEFAULTS.weightUnit);
    setGhungroo(DEFAULTS.ghungroo);
    setMinutes(DEFAULT_MINUTES);
    setCopied(false);
  };

  const setSegmentMinutes = (id, value) => {
    setMinutes((current) => ({ ...current, [id]: value }));
  };

  const rows = [
    ["Net of resting metabolism", hasError ? DASH : `${show(result.netKcal)} kcal`],
    ["Extra cost of the ghungroo", hasError ? DASH : `${show(result.ghungrooExtraKcal)} kcal`],
    ["Total riyaz time", hasError ? DASH : `${show(result.totalMinutes, NUM1)} min`],
    ["Time on the feet", hasError ? DASH : `${show(result.footworkMinutes, NUM1)} min`],
    ["Average intensity", hasError ? DASH : `${show(result.averageMet, NUM2)} MET`],
    ["Rate across the session", hasError ? DASH : `${show(result.kcalPerHour)} kcal/hour`],
    [
      "Effective load during footwork",
      hasError ? DASH : `${show(result.footworkWeightKg, NUM1)} kg equivalent`,
    ],
    ["Body-fat equivalent", hasError ? DASH : `${show(result.fatGramsEquivalent, NUM1)} g`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Dance calories
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kathak Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Riyaz swings from near-seated abhinaya to non-stop chakkars, so a single average is
          useless. Put the minutes against each segment and the ghungroo you wear, and get the
          energy cost of the practice you actually did.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kathak-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="kathak-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                aria-label="Weight unit"
                className={`${INPUT_CLASS} w-24`}
                value={weightUnit}
                onChange={(event) => setWeightUnit(event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="kathak-ghungroo">
              Ghungroo per ankle (kg)
            </label>
            <input
              id="kathak-ghungroo"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="3"
              step="0.1"
              value={ghungroo}
              onChange={(event) => setGhungroo(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              A 100-bell set is roughly 0.5-0.8 kg per ankle; heavier 200-bell sets reach 1.5 kg.
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Minutes in each segment
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {KATHAK_SEGMENTS.map((segment) => (
            <div key={segment.id}>
              <label className={LABEL_CLASS} htmlFor={`kathak-${segment.id}`}>
                {segment.label}
              </label>
              <input
                id={`kathak-${segment.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="300"
                step="5"
                value={minutes[segment.id]}
                onChange={(event) => setSegmentMinutes(segment.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {segment.met} MET · {segment.footwork ? "counts ghungroo load" : "no ghungroo load"}
              </p>
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
              Calories for this riyaz
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${show(result.grossKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an estimate."
                : `${show(result.totalMinutes, NUM1)} minutes of practice`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy Kathak calorie result"
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Segment breakdown</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Segment
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Minutes
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  kcal/min
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  kcal
                </th>
              </tr>
            </thead>
            <tbody>
              {KATHAK_SEGMENTS.map((segment) => {
                const row = hasError
                  ? null
                  : result.rows.find((item) => item.id === segment.id) || null;
                return (
                  <tr key={segment.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{segment.label}</td>
                    <td className="py-2 pr-3 text-right">{row ? show(row.minutes, NUM1) : DASH}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row ? show(row.kcalPerMinute, NUM2) : DASH}
                    </td>
                    <td className="py-2 text-right font-semibold">{row ? show(row.kcal) : DASH}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Ghungroo load is converted using the finding that weight carried on the feet costs several
          times more energy than the same weight on the torso — a walking-study result applied here
          as an approximation, not a measured Kathak value.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Kathak has no entry in published MET tables, so every segment is mapped to the closest
        catalogued dance code. Treat the total as an informed estimate rather than a measurement.
        General information only — not medical or dietary advice.
      </p>
    </main>
  );
}
