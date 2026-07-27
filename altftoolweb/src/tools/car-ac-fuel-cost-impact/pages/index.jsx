"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Snowflake } from "lucide-react";

import { CAR_SIZES, FUEL_TYPES, SUN_LEVELS, computeAcFuelImpact } from "../lib";

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
  carSize: "sedan",
  fuelType: "petrol",
  fuelPrice: "105",
  mileage: "16",
  avgSpeed: "30",
  ambientC: "38",
  setpointC: "24",
  sun: "normal",
  occupants: "2",
  hoursPerDay: "2",
  daysPerMonth: "26",
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

  const result = useMemo(() => computeAcFuelImpact(form), [form]);
  const hasError = Boolean(result.error);

  const activeFuel = FUEL_TYPES.find((option) => option.value === form.fuelType) || FUEL_TYPES[0];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Car AC Fuel Cost Impact",
      `${result.carLabel} on ${result.fuelLabel.toLowerCase()}, ${NUM1.format(result.ambientC)}°C outside, set to ${NUM1.format(result.setpointC)}°C`,
      `Compressor load: ${NUM2.format(result.compressorKw)} kW average`,
      `Extra fuel: ${NUM3.format(result.acUnitsPerHour)} ${result.fuelUnitShort} per hour`,
      `Mileage: ${NUM2.format(result.mileageWithoutAc)} → ${NUM2.format(result.mileageWithAc)} km per ${result.fuelUnit} (${NUM1.format(result.penaltyPct)}% worse)`,
      `Cost: ${INR2.format(result.costPerHour)} an hour, ${INR.format(result.costPerMonth)} a month, ${INR.format(result.costPerYear)} a year`,
      `CO2 from AC alone: ${INT.format(result.co2PerYearKg)} kg a year`,
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
    ["Temperature to pull down", hasError ? DASH : `${NUM1.format(result.deltaC)} °C (load factor ${NUM2.format(result.tempFactor)})`],
    ["Sun exposure factor", hasError ? DASH : `× ${result.sunFactor}`],
    ["Extra load from occupants", hasError ? DASH : `${NUM3.format(result.occupantKw)} kW for ${result.occupants} people`],
    ["Average compressor shaft power", hasError ? DASH : `${NUM2.format(result.compressorKw)} kW`],
    ["Engine fuel per kWh of shaft work", hasError ? DASH : `${INT.format(result.bsfc)} g/kWh`],
    ["Extra fuel per hour", hasError ? DASH : `${NUM3.format(result.acUnitsPerHour)} ${result.fuelUnitShort}`],
    ["Extra fuel per km", hasError ? DASH : `${NUM3.format(result.acUnitsPerKm)} ${result.fuelUnitShort}`],
    ["Mileage without AC", hasError ? DASH : `${NUM2.format(result.mileageWithoutAc)} km/${result.fuelUnitShort}`],
    ["Mileage with AC", hasError ? DASH : `${NUM2.format(result.mileageWithAc)} km/${result.fuelUnitShort}`],
    ["Cost per hour of AC", hasError ? DASH : INR2.format(result.costPerHour)],
    ["AC hours per month", hasError ? DASH : `${NUM1.format(result.hoursPerMonth)} h`],
    ["Extra fuel per month", hasError ? DASH : `${NUM2.format(result.unitsPerMonth)} ${result.fuelUnitShort}`],
    ["Extra cost per month", hasError ? DASH : INR.format(result.costPerMonth)],
    ["Extra fuel per year", hasError ? DASH : `${NUM1.format(result.unitsPerYear)} ${result.fuelUnitShort}`],
    ["Extra cost per year", hasError ? DASH : INR.format(result.costPerYear)],
    ["Extra CO2 per year", hasError ? DASH : `${INT.format(result.co2PerYearKg)} kg`],
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

  const select = (id, label, key, options) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <select id={id} className={`mt-2 ${INPUT_CLASS}`} value={form[key]} onChange={set(key)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Snowflake className="h-4 w-4" aria-hidden="true" />
          Fuel &amp; mileage
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Car AC Fuel Cost Impact</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The compressor is a mechanical load on the engine, so its cost is shaft power multiplied by
          how much fuel your engine burns per kilowatt-hour of work. Nothing here is a flat guess.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The car</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {select("ac-size", "Car size", "carSize", CAR_SIZES)}
          {select("ac-fuel", "Fuel", "fuelType", FUEL_TYPES)}
          {field("ac-mileage", `Mileage without AC (km/${activeFuel.unitShort})`, "mileage", "0.5", "0")}
          {field("ac-price", `Fuel price (INR per ${activeFuel.unit})`, "fuelPrice", "0.5", "0")}
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Conditions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("ac-ambient", "Outside temperature (°C)", "ambientC", "1", "-20", "60")}
          {field("ac-setpoint", "Cabin setpoint (°C)", "setpointC", "1", "16", "32")}
          {select("ac-sun", "Sun exposure", "sun", SUN_LEVELS)}
          {field("ac-occupants", "People in the car", "occupants", "1", "1", "12")}
          {field("ac-speed", "Average moving speed (km/h)", "avgSpeed", "5", "1", "200", "City crawling makes the percentage hit much larger.")}
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How much you use it</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("ac-hours", "AC hours per driving day", "hoursPerDay", "0.5", "0", "24")}
          {field("ac-days", "Driving days per month", "daysPerMonth", "1", "0", "31")}
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
              Extra fuel cost per month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : INR.format(result.costPerMonth)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : `Mileage falls from ${NUM2.format(result.mileageWithoutAc)} to ${NUM2.format(result.mileageWithAc)} km/${result.fuelUnitShort} — a ${NUM1.format(result.penaltyPct)}% penalty`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy car AC fuel cost result"
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
        An engineering estimate, not a dynamometer measurement. Compressor sizing, refrigerant
        charge, cabin insulation and glass tint all shift the real number, and a car with a failing
        AC can draw far more than the figures here.
      </p>
    </main>
  );
}
