"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TimerOff } from "lucide-react";

import { FUEL_TYPES, computeIdlingWaste } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const DEFAULTS = {
  displacementL: "1.5",
  fuelType: "petrol",
  acOn: true,
  signalsPerDay: "15",
  avgWaitSeconds: "60",
  otherIdleMinutes: "10",
  daysPerMonth: "26",
  fuelPrice: "105",
  mileage: "16",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const toggle = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.checked }));

  const result = useMemo(() => computeIdlingWaste(form), [form]);
  const hasError = Boolean(result.error);

  const activeFuel = FUEL_TYPES.find((option) => option.value === form.fuelType) || FUEL_TYPES[0];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Idling Fuel Waste Calculator",
      `${NUM2.format(result.displacementL)} L ${result.fuelLabel.toLowerCase()} engine idling at ${NUM3.format(result.idleUnitsPerHour)} ${result.fuelUnitShort} per hour`,
      `Idling: ${NUM1.format(result.idleMinutesPerDay)} minutes a day, ${NUM1.format(result.idleHoursPerYear)} hours a year`,
      `Fuel wasted: ${NUM2.format(result.unitsPerMonth)} ${result.fuelUnitShort} a month, ${NUM1.format(result.unitsPerYear)} a year`,
      `Cost: ${INR.format(result.costPerMonth)} a month, ${INR.format(result.costPerYear)} a year`,
      `That fuel would have driven ${INT.format(result.kmEquivalentPerYear)} km`,
      `Switching off could recover ${INR.format(result.savableCostPerYear)} and ${INT.format(result.savableCo2PerYearKg)} kg of CO2 a year`,
    ].join("\n");
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = [
    ["Idle rate per litre of displacement", hasError ? DASH : `${result.idleRatePerLitre} ${result.fuelUnitShort}/h`],
    ["AC multiplier at idle", hasError ? DASH : `× ${result.acFactor}`],
    ["Fuel burnt while idling", hasError ? DASH : `${NUM3.format(result.idleUnitsPerHour)} ${result.fuelUnitShort} per hour`],
    ["Idling at signals", hasError ? DASH : `${INT.format(result.signalSeconds)} seconds a day`],
    ["Other engine-on waiting", hasError ? DASH : `${INT.format(result.otherSeconds)} seconds a day`],
    ["Total idling", hasError ? DASH : `${NUM1.format(result.idleMinutesPerDay)} minutes a day · ${NUM1.format(result.idleHoursPerYear)} hours a year`],
    ["Fuel wasted per day", hasError ? DASH : `${NUM3.format(result.unitsPerDay)} ${result.fuelUnitShort}`],
    ["Fuel wasted per month", hasError ? DASH : `${NUM2.format(result.unitsPerMonth)} ${result.fuelUnitShort}`],
    ["Fuel wasted per year", hasError ? DASH : `${NUM1.format(result.unitsPerYear)} ${result.fuelUnitShort}`],
    ["Cost per day", hasError ? DASH : INR2.format(result.costPerDay)],
    ["Cost per year", hasError ? DASH : INR.format(result.costPerYear)],
    ["Distance that fuel would have covered", hasError ? DASH : `${INT.format(result.kmEquivalentPerYear)} km a year`],
    ["CO2 from idling alone", hasError ? DASH : `${INT.format(result.co2PerYearKg)} kg a year`],
    ["Idle time worth switching off for", hasError ? DASH : `${NUM1.format(result.recoverableSharePct)}%`],
    ["Recoverable by switching off", hasError ? DASH : `${NUM1.format(result.savableUnitsPerYear)} ${result.fuelUnitShort} · ${INR.format(result.savableCostPerYear)} a year`],
    ["CO2 recoverable", hasError ? DASH : `${INT.format(result.savableCo2PerYearKg)} kg a year`],
  ];

  const field = (id, label, key, step, min, max, hint) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={form[key]}
        onChange={set(key)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <TimerOff className="h-4 w-4" aria-hidden="true" />
          Fuel &amp; mileage
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Idling Fuel Waste Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An idling engine covers zero kilometres per litre. This works out what those minutes at
          signals actually cost you in a year, and how much of it switching off would recover.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The vehicle</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("idle-disp", "Engine size (litres)", "displacementL", "0.1", "0.1", "8", "1500 cc is 1.5 litres.")}
          <div>
            <label className={LABEL_CLASS} htmlFor="idle-fuel">
              Fuel
            </label>
            <select
              id="idle-fuel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.fuelType}
              onChange={set("fuelType")}
            >
              {FUEL_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {field("idle-price", `Fuel price (INR per ${activeFuel.unit})`, "fuelPrice", "0.5", "0")}
          {field("idle-mileage", `Mileage (${activeFuel.mileageLabel})`, "mileage", "0.5", "0", "100", "Used to show the distance that wasted fuel would have covered.")}
          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--foreground)]" htmlFor="idle-ac">
              <input
                id="idle-ac"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.acOn}
                onChange={toggle("acOn")}
              />
              Air conditioning running while stopped
            </label>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How much you idle</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("idle-signals", "Signals and halts per day", "signalsPerDay", "1", "0", "200")}
          {field("idle-wait", "Average wait at each halt (seconds)", "avgWaitSeconds", "5", "0", "3600")}
          {field("idle-other", "Other engine-on waiting (minutes a day)", "otherIdleMinutes", "1", "0", "600", "Waiting for someone, drive-through queues, warm-up.")}
          {field("idle-days", "Driving days per month", "daysPerMonth", "1", "0", "31")}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Wasted idling per year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--danger)]">
              {hasError ? DASH : INR.format(result.costPerYear)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : `${NUM1.format(result.unitsPerYear)} ${result.fuelUnitShort} burnt going nowhere — enough for ${INT.format(result.kmEquivalentPerYear)} km of driving`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy idling fuel waste result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Switching off at every halt longer than 10 seconds would recover about{" "}
            <strong className="text-[var(--success)]">{INR.format(result.savableCostPerYear)}</strong> and{" "}
            {INT.format(result.savableCo2PerYearKg)} kg of CO2 a year.
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
      </section>

      {!hasError && result.notes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {result.notes.map((note) => (
            <li
              key={note}
              className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates from typical idle fuel flow, not a measurement of your car. Do not switch off in
        moving traffic, on a slope, or where restarting could leave you stranded in a junction —
        and note that older cars with worn starters and batteries handle repeated restarts less well.
      </p>
    </main>
  );
}
