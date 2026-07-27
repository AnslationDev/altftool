"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Recycle, RotateCcw } from "lucide-react";

import { RECYCLABLE_MATERIALS, computeRecyclingImpact } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const kg = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} kg` : DASH);
const kwh = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} kWh` : DASH);
const litres = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} litres` : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const num0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : DASH);

/** Starting weekly quantities, in kg — a rough mid-sized household. */
const DEFAULT_QUANTITIES = {
  aluminium: "0.2",
  pet: "0.3",
  hdpe: "0.2",
  steel: "0.2",
  paper: "1",
  cardboard: "0.8",
  glass: "1",
};

const buildInitialRows = () =>
  RECYCLABLE_MATERIALS.map((material) => ({
    id: material.id,
    label: material.label,
    energySavingPct: material.energySavingPct,
    kgPerWeek: DEFAULT_QUANTITIES[material.id] ?? "0",
    kwhPerKg: String(material.kwhPerKg),
    co2PerKg: String(material.co2PerKg),
    waterPerKg: String(material.waterPerKg),
  }));

const DEFAULT_CAPTURE = "85";
const DEFAULT_UNITS = "300";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const NARROW_INPUT =
  "h-11 w-24 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-right text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rows, setRows] = useState(buildInitialRows);
  const [capture, setCapture] = useState(DEFAULT_CAPTURE);
  const [monthlyUnits, setMonthlyUnits] = useState(DEFAULT_UNITS);
  const [showFactors, setShowFactors] = useState(false);
  const [copied, setCopied] = useState(false);

  const updateRow = (id, patch) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const result = useMemo(
    () =>
      computeRecyclingImpact({
        materials: rows.map((row) => ({
          id: row.id,
          label: row.label,
          kgPerWeek: toNumber(row.kgPerWeek),
          kwhPerKg: toNumber(row.kwhPerKg),
          co2PerKg: toNumber(row.co2PerKg),
          waterPerKg: toNumber(row.waterPerKg),
        })),
        captureRatePct: toNumber(capture),
        monthlyUnits: toNumber(monthlyUnits),
      }),
    [rows, capture, monthlyUnits],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Home Recycling Impact Calculator",
      `Recycled: ${kg(result.totalKgPerYear)} a year at a ${num0(result.captureRatePct)}% capture rate`,
      `Energy saved: ${kwh(result.energySavedKwh)}`,
      `CO2 avoided: ${kg(result.co2AvoidedKg)} — about ${num0(result.carKmEquivalent)} km of car driving`,
      `Water saved: ${litres(result.waterSavedLitres)} — about ${num0(result.bucketsOfWater)} buckets`,
      "",
      "By material:",
    ];
    result.ranked.forEach((row) => {
      lines.push(
        `- ${row.label}: ${kg(row.kgPerYear)} a year, ${kg(row.co2AvoidedKg)} CO2, ${kwh(row.energySavedKwh)}`,
      );
    });
    return lines.join("\n");
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
    setRows(buildInitialRows());
    setCapture(DEFAULT_CAPTURE);
    setMonthlyUnits(DEFAULT_UNITS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Recycle className="h-4 w-4" aria-hidden="true" />
          Household waste
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Home Recycling Impact Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Recycling saves energy because making something from a used material skips the mining,
          refining and transport that virgin material needs. Enter roughly what your household puts
          out each week to see how much that adds up to in a year.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What you recycle each week</h2>
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <label className="flex-1 text-sm font-medium" htmlFor={`rec-kg-${row.id}`}>
                {row.label}
                <span className="block text-xs text-[var(--muted-foreground)]">
                  saves about {row.energySavingPct}% of the energy of making it new
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`rec-kg-${row.id}`}
                  className={NARROW_INPUT}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={row.kgPerWeek}
                  onChange={(event) => updateRow(row.id, { kgPerWeek: event.target.value })}
                />
                <span className="text-sm text-[var(--muted-foreground)]">kg</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rec-capture">
              Capture rate (%)
            </label>
            <input
              id="rec-capture"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={capture}
              onChange={(event) => setCapture(event.target.value)}
            />
            <p className={HINT_CLASS}>
              How much genuinely reaches a recycler. Contaminated or wet loads get rejected, so 100%
              is optimistic.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rec-units">
              Household electricity (units a month)
            </label>
            <input
              id="rec-units"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={monthlyUnits}
              onChange={(event) => setMonthlyUnits(event.target.value)}
            />
            <p className={HINT_CLASS}>Optional — used to put the energy saving in context.</p>
          </div>
        </div>
      </section>

      {failed && (
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
              CO2 avoided a year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : kg(result.co2AvoidedKg)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see your totals."
                : `about the same as driving ${num0(result.carKmEquivalent)} km`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy recycling impact summary"
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Energy saved
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {failed ? DASH : kwh(result.energySavedKwh)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {failed || result.householdElectricityMonths === null
                ? "Add your monthly units for a comparison."
                : `about ${num1(result.householdElectricityMonths)} months of your household's electricity`}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Water saved
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {failed ? DASH : litres(result.waterSavedLitres)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {failed ? DASH : `about ${num0(result.bucketsOfWater)} twenty-litre buckets`}
            </p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Recycled a week", failed ? DASH : kg(result.totalKgPerWeek)],
            ["Actually recycled a year", failed ? DASH : kg(result.totalKgPerYear)],
            ["Biggest single contributor", failed ? DASH : result.biggestContributor.label],
            ["Average CO2 avoided per kg", failed ? DASH : kg(result.co2PerKgAverage)],
            ["Average energy saved per kg", failed ? DASH : kwh(result.energyPerKg)],
            [
              "Energy saving as a share of your electricity use",
              failed || result.shareOfHouseholdElectricityPct === null
                ? DASH
                : `${num1(result.shareOfHouseholdElectricityPct)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the impact comes from</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Material
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    kg/year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    CO2
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Energy
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Water
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.label}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {num1(row.kgPerYear)}
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap font-semibold">
                      {kg(row.co2AvoidedKg)}
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {kwh(row.energySavedKwh)}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {litres(row.waterSavedLitres)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Saving factors used</h2>
          <button
            type="button"
            onClick={() => setShowFactors((value) => !value)}
            aria-expanded={showFactors}
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {showFactors ? "Hide" : "Edit"}
          </button>
        </div>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Indicative lifecycle averages for recycled versus virgin production. They shift with the
          local grid, process route and transport distance — replace any of them with a figure from
          your own recycler or regional dataset.
        </p>
        {showFactors && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Material
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    kWh/kg
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    kg CO2/kg
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Litres/kg
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.label}</td>
                    <td className="py-2 pr-3 text-right">
                      <label className="sr-only" htmlFor={`rec-kwh-${row.id}`}>
                        {row.label} energy saved per kg
                      </label>
                      <input
                        id={`rec-kwh-${row.id}`}
                        className={NARROW_INPUT}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.1"
                        value={row.kwhPerKg}
                        onChange={(event) => updateRow(row.id, { kwhPerKg: event.target.value })}
                      />
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <label className="sr-only" htmlFor={`rec-co2-${row.id}`}>
                        {row.label} CO2 avoided per kg
                      </label>
                      <input
                        id={`rec-co2-${row.id}`}
                        className={NARROW_INPUT}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.1"
                        value={row.co2PerKg}
                        onChange={(event) => updateRow(row.id, { co2PerKg: event.target.value })}
                      />
                    </td>
                    <td className="py-2 text-right">
                      <label className="sr-only" htmlFor={`rec-water-${row.id}`}>
                        {row.label} water saved per kg
                      </label>
                      <input
                        id={`rec-water-${row.id}`}
                        className={NARROW_INPUT}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="1"
                        value={row.waterPerKg}
                        onChange={(event) => updateRow(row.id, { waterPerKg: event.target.value })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Savings are only real if the material is actually reprocessed. Rinse containers, keep paper
        dry, and leave out anything your local facility does not accept — one greasy or wet item can
        downgrade a whole batch. Reducing and reusing beat recycling every time, because they avoid
        the material being made at all.
      </p>
    </main>
  );
}
