"use client";

import { useMemo, useState } from "react";
import { BatteryCharging, Check, Copy, RotateCcw } from "lucide-react";

import { TERRAIN_LEVELS, TRAFFIC_LEVELS, VEHICLE_TYPES, computeScooterRange } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DASH = "—";

const DEFAULTS = {
  batteryWh: "3000",
  vehicle: "moped",
  kerbKg: "110",
  riderKg: "75",
  cargoKg: "0",
  speedKmph: "45",
  gradePct: "0",
  stopsPerKm: "3",
  regenPct: "15",
  healthPct: "100",
  usablePct: "90",
  tariff: "8",
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

  const chooseVehicle = (event) => {
    const value = event.target.value;
    const preset = VEHICLE_TYPES.find((option) => option.value === value);
    setForm((prev) => ({
      ...prev,
      vehicle: value,
      kerbKg: preset ? String(preset.kerbKg) : prev.kerbKg,
    }));
  };

  const result = useMemo(() => computeScooterRange(form), [form]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Electric Scooter Range Calculator",
      `Battery: ${INT.format(result.nameplateWh)} Wh nameplate, ${INT.format(result.usableWh)} Wh usable`,
      `Total moving mass: ${NUM1.format(result.massKg)} kg`,
      `At ${NUM1.format(result.speedKmph)} km/h on a ${NUM2.format(result.gradePct)}% gradient`,
      `Consumption: ${NUM1.format(result.whPerKm)} Wh/km (${NUM1.format(result.cruiseWhPerKm)} cruising + ${NUM1.format(result.accelWhPerKm)} stop-start)`,
      `Estimated range: ${NUM1.format(result.rangeKm)} km`,
      `Cost: ${INR2.format(result.costPerKm)} per km, ${INR2.format(result.fullChargeCost)} a full charge`,
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
    ["Total moving mass", hasError ? DASH : `${NUM1.format(result.massKg)} kg`],
    ["Rolling resistance", hasError ? DASH : `${NUM1.format(result.rollingN)} N (Crr ${result.crr})`],
    ["Aerodynamic drag", hasError ? DASH : `${NUM1.format(result.aeroN)} N (CdA ${result.cdA} m²)`],
    ["Gradient force", hasError ? DASH : `${NUM1.format(result.gradeN)} N`],
    ["Net road load", hasError ? DASH : `${NUM1.format(result.netRoadN)} N`],
    ["Energy to cruise", hasError ? DASH : `${NUM1.format(result.cruiseWhPerKm)} Wh/km`],
    ["Energy lost to stop-start", hasError ? DASH : `${NUM1.format(result.accelWhPerKm)} Wh/km`],
    ["Total consumption", hasError ? DASH : `${NUM1.format(result.whPerKm)} Wh/km · ${NUM2.format(result.kwhPer100Km)} kWh/100 km`],
    ["Usable battery energy", hasError ? DASH : `${INT.format(result.usableWh)} Wh of ${INT.format(result.nameplateWh)} Wh`],
    ["Drivetrain efficiency assumed", hasError ? DASH : `${INT.format(result.driveEfficiencyPct)}%`],
    ["Cost of a full charge", hasError ? DASH : INR2.format(result.fullChargeCost)],
    ["Cost per km", hasError ? DASH : INR2.format(result.costPerKm)],
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
          <BatteryCharging className="h-4 w-4" aria-hidden="true" />
          EV &amp; charging
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Electric Scooter Range Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out consumption from the road-load equation — rolling resistance, aerodynamic drag,
          gradient and the kinetic energy thrown away at every signal — then divides usable battery
          energy by it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Scooter and load</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="scooter-type">
              Vehicle type
            </label>
            <select
              id="scooter-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.vehicle}
              onChange={chooseVehicle}
            >
              {VEHICLE_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {field("scooter-battery", "Battery energy (Wh)", "batteryWh", "50", "0", undefined, "A 3 kWh pack is 3000 Wh.")}
          {field("scooter-kerb", "Kerb weight (kg)", "kerbKg", "1", "0")}
          {field("scooter-rider", "Rider weight (kg)", "riderKg", "1", "0")}
          {field("scooter-cargo", "Pillion + luggage (kg)", "cargoKg", "1", "0")}
          {field("scooter-health", "Battery state of health (%)", "healthPct", "1", "1", "100")}
          {field("scooter-usable", "Share of pack you actually use (%)", "usablePct", "1", "1", "100")}
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How and where you ride</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("scooter-speed", "Average cruising speed (km/h)", "speedKmph", "1", "1", "150")}
          <div>
            <label className={LABEL_CLASS} htmlFor="scooter-terrain">
              Terrain preset
            </label>
            <select
              id="scooter-terrain"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.gradePct}
              onChange={set("gradePct")}
            >
              {TERRAIN_LEVELS.map((option) => (
                <option key={option.value} value={String(option.gradePct)}>
                  {option.label} · {option.gradePct}%
                </option>
              ))}
            </select>
          </div>
          {field("scooter-grade", "Average gradient (%)", "gradePct", "0.5", "-20", "20", "0% for any there-and-back trip.")}
          <div>
            <label className={LABEL_CLASS} htmlFor="scooter-traffic">
              Traffic
            </label>
            <select
              id="scooter-traffic"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.stopsPerKm}
              onChange={set("stopsPerKm")}
            >
              {TRAFFIC_LEVELS.map((option) => (
                <option key={option.value} value={String(option.stopsPerKm)}>
                  {option.label} · {option.stopsPerKm} stops/km
                </option>
              ))}
            </select>
          </div>
          {field("scooter-regen", "Braking energy recovered (%)", "regenPct", "1", "0", "90")}
          {field("scooter-tariff", "Electricity tariff (INR per kWh)", "tariff", "0.5", "0")}
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
              Estimated range
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM1.format(result.rangeKm)} km`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a range."
                : `${NUM1.format(result.whPerKm)} Wh/km at ${NUM1.format(result.speedKmph)} km/h with ${NUM1.format(result.massKg)} kg moving`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy e-scooter range result"
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
        A physics estimate at sea-level air density and 15°C. Headwinds, cold weather, low tyre
        pressure and hard acceleration all reduce range further, and manufacturer claimed figures
        are measured on a gentle test cycle that no real commute resembles.
      </p>
    </main>
  );
}
