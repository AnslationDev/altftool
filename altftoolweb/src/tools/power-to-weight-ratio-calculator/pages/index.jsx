"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";
import {
  BENCHMARKS,
  POWER_UNITS,
  VEHICLE_LABELS,
  computePowerToWeight,
  nearestBenchmark,
} from "../lib";

const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const one = (value) => (Number.isFinite(value) ? N1.format(value) : "—");
const two = (value) => (Number.isFinite(value) ? N2.format(value) : "—");

const DEFAULTS = {
  power: "43.5",
  powerUnit: "ps",
  kerbWeightKg: "167",
  addedLoadKg: "75",
  vehicleType: "motorcycle",
  targetKmph: "100",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [power, setPower] = useState(DEFAULTS.power);
  const [powerUnit, setPowerUnit] = useState(DEFAULTS.powerUnit);
  const [kerbWeightKg, setKerbWeightKg] = useState(DEFAULTS.kerbWeightKg);
  const [addedLoadKg, setAddedLoadKg] = useState(DEFAULTS.addedLoadKg);
  const [vehicleType, setVehicleType] = useState(DEFAULTS.vehicleType);
  const [targetKmph, setTargetKmph] = useState(DEFAULTS.targetKmph);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePowerToWeight({
        power: toNumber(power),
        powerUnit,
        kerbWeightKg: toNumber(kerbWeightKg),
        addedLoadKg: addedLoadKg.trim() === "" ? 0 : toNumber(addedLoadKg),
        vehicleType,
        targetKmph: toNumber(targetKmph),
      }),
    [power, powerUnit, kerbWeightKg, addedLoadKg, vehicleType, targetKmph],
  );

  const ok = !result.error;
  const benchmark = ok ? nearestBenchmark(result.psPerTonneKerb) : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Power to Weight Ratio",
      `${VEHICLE_LABELS[vehicleType]} · ${two(result.powerPs)} PS (${two(result.powerKw)} kW)`,
      `Kerb weight ${one(result.kerbWeightKg)} kg + load ${one(result.addedLoadKg)} kg = ${one(result.totalMassKg)} kg`,
      `Kerb power-to-weight: ${one(result.psPerTonneKerb)} PS/tonne`,
      `Laden power-to-weight: ${one(result.psPerTonneLaden)} PS/tonne (${one(result.kwPerTonneLaden)} kW/tonne)`,
      `Watts per kg: ${two(result.wattsPerKgLaden)}`,
      `Weight carried per PS: ${two(result.kgPerPsLaden)} kg/PS`,
      `Estimated 0-${one(result.targetKmph)} km/h: ${two(result.accel.seconds)} s (${result.accel.limitedBy}-limited)`,
    ].join("\n");
  }, [ok, result, vehicleType]);

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
    setPower(DEFAULTS.power);
    setPowerUnit(DEFAULTS.powerUnit);
    setKerbWeightKg(DEFAULTS.kerbWeightKg);
    setAddedLoadKg(DEFAULTS.addedLoadKg);
    setVehicleType(DEFAULTS.vehicleType);
    setTargetKmph(DEFAULTS.targetKmph);
    setCopied(false);
  };

  const maxBench = BENCHMARKS.reduce((max, entry) => Math.max(max, entry.psPerTonne), 1);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Performance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Power to Weight Ratio Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter power and kerb weight to get PS per tonne, kW per tonne, watts per kilogram and kg
          carried per PS — plus a work-energy estimate of how long the vehicle needs to reach your
          target speed from rest.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-power">
              Peak power
            </label>
            <input
              id="pw-power"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={power}
              onChange={(event) => setPower(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-unit">
              Power unit
            </label>
            <select
              id="pw-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={powerUnit}
              onChange={(event) => setPowerUnit(event.target.value)}
            >
              {Object.entries(POWER_UNITS).map(([key, entry]) => (
                <option key={key} value={key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-kerb">
              Kerb weight (kg)
            </label>
            <input
              id="pw-kerb"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={kerbWeightKg}
              onChange={(event) => setKerbWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-load">
              Rider, passengers and luggage (kg)
            </label>
            <input
              id="pw-load"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={addedLoadKg}
              onChange={(event) => setAddedLoadKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-type">
              Vehicle type
            </label>
            <select
              id="pw-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
            >
              {Object.entries(VEHICLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-target">
              Target speed for 0-to-X (km/h)
            </label>
            <input
              id="pw-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="500"
              step="5"
              value={targetKmph}
              onChange={(event) => setTargetKmph(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Power to weight (with load)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${one(result.psPerTonneLaden)} PS/t` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${one(result.psPerTonneKerb)} PS/tonne at kerb weight — about the same as a ${benchmark?.label.toLowerCase()}`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy power to weight result"
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
          {[
            ["Power", ok ? `${two(result.powerPs)} PS · ${two(result.powerKw)} kW · ${two(result.powerBhp)} bhp` : "—"],
            ["Total mass moved", ok ? `${one(result.totalMassKg)} kg` : "—"],
            ["kW per tonne", ok ? one(result.kwPerTonneLaden) : "—"],
            ["bhp per tonne", ok ? one(result.bhpPerTonneLaden) : "—"],
            ["Watts per kg", ok ? two(result.wattsPerKgLaden) : "—"],
            ["Weight carried per PS", ok ? `${two(result.kgPerPsLaden)} kg/PS` : "—"],
            [
              `Estimated 0-${ok ? one(result.targetKmph) : "X"} km/h`,
              ok ? `${two(result.accel.seconds)} s` : "—",
            ],
            [
              "Limiting factor",
              ok
                ? result.accel.limitedBy === "traction"
                  ? `Traction / wheelie limit at ${two(result.maxAccelG)} g`
                  : `Available power (${Math.round(result.powerFraction * 100)}% of peak used on average)`
                : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where that sits</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Typical kerb-weight PS per tonne for common vehicle classes.
        </p>
        <ul className="mt-4 space-y-3">
          {BENCHMARKS.map((entry) => (
            <li key={entry.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--muted-foreground)]">{entry.label}</span>
                <span className="font-semibold">{entry.psPerTonne} PS/t</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                <span
                  className="block h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(2, (entry.psPerTonne / maxBench) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The acceleration figure is a work-energy estimate: kinetic energy divided by the average
        power actually delivered, floored by the traction limit. It ignores aerodynamic drag, which
        is minor below about 120 km/h but dominant above it, and it assumes a competent launch on
        dry tarmac. Treat it as a comparison tool, not a test-track prediction.
      </p>
    </main>
  );
}
