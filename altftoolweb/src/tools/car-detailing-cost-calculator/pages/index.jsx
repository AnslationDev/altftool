"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";

import { CAR_SIZES, TREATMENTS, WASH_TYPES, compareDetailingCost } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  carSize: "hatchback",
  years: "3",
  washType: "foam",
  washesPerMonth: "2",
  washCost: "500",
  treatmentIds: ["wax", "sealant", "ceramic", "ppfPartial"],
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [carSize, setCarSize] = useState(DEFAULTS.carSize);
  const [years, setYears] = useState(DEFAULTS.years);
  const [washType, setWashType] = useState(DEFAULTS.washType);
  const [washesPerMonth, setWashesPerMonth] = useState(DEFAULTS.washesPerMonth);
  const [washCost, setWashCost] = useState(DEFAULTS.washCost);
  const [treatmentIds, setTreatmentIds] = useState(DEFAULTS.treatmentIds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareDetailingCost({
        carSize,
        years: toNumber(years),
        washesPerMonth: toNumber(washesPerMonth),
        washCost: toNumber(washCost),
        treatmentIds,
      }),
    [carSize, years, washesPerMonth, washCost, treatmentIds],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Car Detailing Cost Calculator",
      `Car: ${result.sizeLabel} · comparison period ${result.years} years`,
      `Routine washing alone: ${INR.format(result.baseline.total)} (${INR.format(result.baseline.perYear)}/year)`,
      "",
      ...result.rows.map(
        (row) =>
          `${row.label}: ${row.applications} application${row.applications === 1 ? "" : "s"}, ${INR.format(row.total)} total, ${INR.format(row.perYear)}/year`,
      ),
      "",
      `Cheapest overall: ${result.cheapest.label}`,
    ].join("\n");
  }, [result]);

  const toggleTreatment = (id) => {
    setTreatmentIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const applyWashType = (id) => {
    setWashType(id);
    const found = WASH_TYPES.find((type) => type.id === id);
    if (found) setWashCost(String(found.cost));
    setCopied(false);
  };

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
    setCarSize(DEFAULTS.carSize);
    setYears(DEFAULTS.years);
    setWashType(DEFAULTS.washType);
    setWashesPerMonth(DEFAULTS.washesPerMonth);
    setWashCost(DEFAULTS.washCost);
    setTreatmentIds(DEFAULTS.treatmentIds);
    setCopied(false);
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Car maintenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Car Detailing Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A wax is a twentieth the price of a ceramic coating and lasts a twentieth as long. Compare
          on cost per year over the period you will actually keep the car, including the routine
          washing every option still needs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="det-size">
              Car size
            </label>
            <select
              id="det-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={carSize}
              onChange={(event) => {
                setCarSize(event.target.value);
                setCopied(false);
              }}
            >
              {CAR_SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label} (&times;{size.multiplier} on price)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="det-years">
              How long you will keep the car (years)
            </label>
            <input
              id="det-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="15"
              step="0.5"
              value={years}
              onChange={(event) => {
                setYears(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="det-washtype">
              Routine wash type
            </label>
            <select
              id="det-washtype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={washType}
              onChange={(event) => applyWashType(event.target.value)}
            >
              {WASH_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} · {INR.format(type.cost)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="det-washcost">
              Cost per wash (₹)
            </label>
            <input
              id="det-washcost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={washCost}
              onChange={(event) => {
                setWashCost(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="det-washes">
              Washes per month
            </label>
            <input
              id="det-washes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={washesPerMonth}
              onChange={(event) => {
                setWashesPerMonth(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Treatments to compare</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TREATMENTS.map((treatment) => {
              const active = treatmentIds.includes(treatment.id);
              return (
                <label
                  key={treatment.id}
                  htmlFor={`tr-${treatment.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`tr-${treatment.id}`}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleTreatment(treatment.id)}
                  />
                  <span>
                    <span className="block font-medium">{treatment.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      from {INR.format(treatment.baseCost)} · lasts about{" "}
                      {treatment.durabilityMonths} months
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Lowest total cost over the period
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? INR.format(result.cheapest.total) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.cheapest.label} — ${INR.format(result.cheapest.perYear)} per year`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy detailing cost comparison"
              className={GHOST_BTN}
              disabled={!ok}
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
          {[
            ["Comparison period", ok ? `${NUM.format(result.years)} years` : DASH],
            ["Washes per year", ok ? NUM.format(result.washesPerYear) : DASH],
            [
              "Routine washing over the period",
              ok ? `${INR.format(result.washTotal)} (in every row below)` : DASH,
            ],
            [
              "Washing alone, no protection",
              ok ? `${INR.format(result.baseline.total)} · ${INR.format(result.baseline.perYear)}/yr` : DASH,
            ],
            ["Dearest option compared", ok ? result.dearest.label : DASH],
            ["Gap between cheapest and dearest", ok ? INR.format(result.spread) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Full comparison</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Treatment
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Per application
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Times needed
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Total
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Per year
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{INR.format(row.unitCost)}</td>
                    <td className="py-2 pr-3 text-right">{row.applications}</td>
                    <td className="py-2 pr-3 text-right">{INR.format(row.total)}</td>
                    <td className="py-2 text-right font-semibold">{INR.format(row.perYear)}</td>
                  </tr>
                ))}
                <tr className="border-t border-[var(--border)]">
                  <td className="py-2 pr-3 font-semibold text-[var(--muted-foreground)]">
                    {result.baseline.label}
                  </td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{DASH}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{DASH}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {INR.format(result.baseline.total)}
                  </td>
                  <td className="py-2 text-right font-semibold text-[var(--muted-foreground)]">
                    {INR.format(result.baseline.perYear)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Every row includes the same routine washing cost, so the difference between rows is
            purely the protection.
          </p>
        </section>
      ) : null}

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What each one actually does</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {result.rows.map((row) => (
              <li key={row.id}>
                <span className="font-medium">
                  {row.label} · protection {INR.format(row.protectionCostPerYear)}/yr
                </span>
                <span className="block text-[var(--muted-foreground)]">{row.note}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Indicative estimate. Detailing rates vary widely by city and studio, and quoted coating
        lifespans assume correct paint preparation and regular maintenance washing — replace the
        defaults with your own quotes.
      </p>
    </main>
  );
}
