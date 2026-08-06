"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Thermometer } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  FEVER_EXTRA_PCT_PER_DEG_C,
  INFANT_URGENT_AGE_MONTHS,
  computeFeverFluid,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  age: "35",
  weight: "70",
  temperature: "39.5",
  unit: "C",
  hours: "24",
};

const RED_FLAGS = [
  "Cannot keep any fluid down, or vomits everything back",
  "No urine for 8 hours in an adult, or no wet nappy for 6 hours in a baby",
  "Drowsiness, confusion, or being difficult to wake",
  "A stiff neck, a rash that does not fade under pressure, or a fit",
  "Fever lasting more than 5 days, or any fever in a baby under 3 months",
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [temperature, setTemperature] = useState(DEFAULTS.temperature);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const { copy: copyToClipboard, isCopied, announcement } = useCopyToClipboard();

  const num = (value) => (value === "" ? NaN : Number(value));

  const result = useMemo(
    () =>
      computeFeverFluid({
        ageYears: num(age),
        weightKg: num(weight),
        temperature: num(temperature),
        unit,
        hoursFebrile: num(hours),
      }),
    [age, weight, temperature, unit, hours],
  );

  const hasError = Boolean(result.error);

  const switchUnit = (nextUnit) => {
    if (nextUnit === unit) return;
    // Use the same num() helper the calculation uses, so a blank field stays
    // blank instead of being read as 0 and silently filled in with a converted
    // value the user never typed.
    const value = num(temperature);
    if (Number.isFinite(value)) {
      const converted =
        nextUnit === "F" ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
      setTemperature(String(Math.round(converted * 10) / 10));
    }
    setUnit(nextUnit);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Fever Fluid Replacement Calculator",
      `Temperature: ${result.tempC} °C (${result.tempF} °F) for ${result.hoursFebrile} hours`,
      `Maintenance: ${NUM.format(result.baseMaintenanceMl)} ml/day — ${result.maintenanceRule}`,
      `Fever surcharge: +${result.surchargePct}% (${result.degreesAbove} °C above 37 °C)`,
      `Extra fluid for the fever: ${NUM.format(result.feverExtraMl)} ml`,
      `Total fluid for the day: ${NUM.format(result.totalMl)} ml`,
      `Spread over 16 waking hours: about ${NUM.format(result.hourlyMl)} ml per hour`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = () => {
    copyToClipboard("result", summary, { label: "the fever fluid replacement result" });
  };

  const reset = () => {
    setAge(DEFAULTS.age);
    setWeight(DEFAULTS.weight);
    setTemperature(DEFAULTS.temperature);
    setUnit(DEFAULTS.unit);
    setHours(DEFAULTS.hours);
  };

  const rows = [
    [
      "Temperature",
      hasError ? DASH : `${result.tempC} °C / ${result.tempF} °F${result.isFever ? " — fever" : " — no fever"}`,
    ],
    ["Maintenance rule used", hasError ? DASH : result.maintenanceRule],
    ["Baseline maintenance fluid", hasError ? DASH : `${NUM.format(result.baseMaintenanceMl)} ml/day`],
    ["Degrees above 37 °C", hasError ? DASH : `${result.degreesAbove} °C`],
    ["Fever surcharge", hasError ? DASH : `+${result.surchargePct}%`],
    [
      "Surcharge if febrile all day",
      hasError ? DASH : `${NUM.format(result.fullDayExtraMl)} ml`,
    ],
    [
      `Surcharge for ${hasError ? "—" : result.hoursFebrile} hours`,
      hasError ? DASH : `${NUM.format(result.feverExtraMl)} ml`,
    ],
    [
      "Spread over 16 waking hours",
      hasError ? DASH : `about ${NUM.format(result.hourlyMl)} ml per hour`,
    ],
    ["Roughly this many glasses", hasError ? DASH : `${result.glasses200} × 200 ml`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Thermometer className="h-4 w-4" aria-hidden="true" />
          Fever hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Fever Fluid Replacement Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A fever raises the metabolic rate and with it the water you lose through skin and breath.
          This adds {FEVER_EXTRA_PCT_PER_DEG_C}% to maintenance fluid for each degree Celsius above
          37 °C, prorated by how long the temperature was actually up.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ffr-age">
              Age (years)
            </label>
            <input
              id="ffr-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ffr-weight">
              Weight (kg)
            </label>
            <input
              id="ffr-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="300"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ffr-temp">
              Body temperature (°{unit})
            </label>
            <input
              id="ffr-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.1"
              value={temperature}
              onChange={(event) => setTemperature(event.target.value)}
            />
          </div>
          <div>
            <span className={LABEL_CLASS}>Temperature unit</span>
            <div className="mt-2 flex gap-2">
              {["C", "F"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => switchUnit(value)}
                  aria-pressed={unit === value}
                  className={
                    unit === value
                      ? "min-h-11 flex-1 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      : "min-h-11 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  }
                >
                  °{value}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ffr-hours">
              Hours with a raised temperature today
            </label>
            <input
              id="ffr-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="24"
              step="1"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
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

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total fluid for the day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.totalMl)} ml`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : `${NUM.format(result.baseMaintenanceMl)} ml maintenance + ${NUM.format(result.feverExtraMl)} ml for the fever`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={
                isCopied("result")
                  ? "Copied the fever fluid replacement result to clipboard"
                  : "Copy fever fluid replacement result"
              }
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
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
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

        {!hasError && result.infantUrgent && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Any fever of 38 °C or more in a baby under {INFANT_URGENT_AGE_MONTHS} months needs
            same-day medical assessment. Do not manage this at home with fluids alone.
          </p>
        )}

        {!hasError && !result.isFever && result.degreesAbove <= 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            This reading is at or below the 37 °C baseline, so the figure shown is ordinary
            maintenance fluid with no fever surcharge.
          </p>
        )}

        {!hasError && !result.isFever && result.degreesAbove > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            This reading is below the 38 °C fever threshold, but it is still {result.degreesAbove} °C
            above the 37 °C baseline, so the figure already includes a +{result.surchargePct}%
            surcharge on top of ordinary maintenance fluid.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          Water, oral rehydration solution, milk, diluted juice, soup and rice water all count
          towards the total. Small amounts often beat large ones — a few sips every ten minutes stays
          down better than a full glass when someone feels nauseated.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Stop calculating and seek care if</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          {RED_FLAGS.map((flag) => (
            <li key={flag} className="flex gap-2">
              <span aria-hidden="true" className="text-[var(--danger)]">
                •
              </span>
              <span>{flag}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only — this is not medical advice and does not replace assessment by a
        clinician. The 10-12% per degree rule is a planning heuristic, not a prescription. Anyone on a
        fluid restriction for heart, kidney or liver disease must follow the limit their doctor set,
        even during a fever.
      </p>
    </main>
  );
}
