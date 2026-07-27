"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { DRIVETRAINS, UNITS, convertPower } from "../lib";

const SMART = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const TWO = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DEFAULTS = {
  value: "200",
  unit: "hp",
  drivetrain: "rwdManual",
  weight: "1500",
  weightUnit: "kg",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

/** Large numbers get no decimals, small ones get more — purely presentational. */
const smart = (value) => {
  if (!Number.isFinite(value)) return DASH;
  const abs = Math.abs(value);
  if (abs === 0) return "0";
  if (abs >= 100000) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  if (abs >= 1000) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
  if (abs < 0.01) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(value);
  return SMART.format(value);
};

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [drivetrain, setDrivetrain] = useState(DEFAULTS.drivetrain);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertPower({ value, unit, drivetrain, weight, weightUnit }),
    [value, unit, drivetrain, weight, weightUnit],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "HP to kW Converter",
      `Input: ${value} ${result.sourceShort}`,
      ...result.conversions.map((row) => `${row.short}: ${smart(row.value)}`),
      "",
      `Drivetrain: ${result.drivetrainLabel} (${result.lossPct}% loss)`,
      `At the crank: ${smart(result.crankHp)} hp / ${smart(result.crankKw)} kW`,
      `At the wheels: ${smart(result.wheelHp)} hp / ${smart(result.wheelKw)} kW / ${smart(result.wheelPs)} PS`,
      `Lost in the drivetrain: ${smart(result.lostHp)} hp`,
    ];
    if (result.powerToWeight) {
      lines.push(
        "",
        `Power-to-weight at ${smart(result.powerToWeight.kg)} kg:`,
        `${smart(result.powerToWeight.hpPerTonne)} hp/tonne`,
        `${smart(result.powerToWeight.kwPerTonne)} kW/tonne`,
        `${smart(result.powerToWeight.psPerTonne)} PS/tonne`,
      );
    }
    return lines.join("\n");
  }, [failed, result, value]);

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
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setDrivetrain(DEFAULTS.drivetrain);
    setWeight(DEFAULTS.weight);
    setWeightUnit(DEFAULTS.weightUnit);
    setCopied(false);
  };

  const headlineKw = failed
    ? DASH
    : `${smart(result.conversions.find((row) => row.key === "kw").value)} kW`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Power units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">HP to kW Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts between mechanical horsepower, metric PS, kilowatts, BTU/h and the rest using
          their exact definitions — then optionally applies drivetrain loss and works out
          power-to-weight.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-value">
              Power value
            </label>
            <input
              id="hp-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-unit">
              Unit of that value
            </label>
            <select
              id="hp-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hp-drive">
              Drivetrain (for crank vs wheel power)
            </label>
            <select
              id="hp-drive"
              className={`mt-2 ${INPUT_CLASS}`}
              value={drivetrain}
              onChange={(event) => setDrivetrain(event.target.value)}
            >
              {Object.values(DRIVETRAINS).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                  {option.lossPct > 0 ? ` — about ${option.lossPct}% loss` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-weight">
              Vehicle weight (optional)
            </label>
            <input
              id="hp-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-weight-unit">
              Weight unit
            </label>
            <select
              id="hp-weight-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={weightUnit}
              onChange={(event) => setWeightUnit(event.target.value)}
            >
              <option value="kg">Kilograms</option>
              <option value="lb">Pounds</option>
            </select>
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
              In kilowatts
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headlineKw}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Fix the input above to convert." : `from ${value} ${result.sourceShort}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy power conversion result"
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
          {(failed ? UNITS : result.conversions).map((row) => (
            <div key={row.key} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">
                {row.label}
                <span className="block text-xs">{row.note}</span>
              </dt>
              <dd
                className={`shrink-0 text-right font-semibold ${
                  !failed && row.isSource ? "text-[var(--primary)]" : ""
                }`}
              >
                {failed ? DASH : smart(row.value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Crank versus wheel power</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.drivetrainLabel}
              {result.lossPct > 0 ? ` — about ${result.lossPct}% is lost between the crankshaft and the tyres.` : "."}
            </p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["At the crankshaft", `${smart(result.crankHp)} hp · ${smart(result.crankKw)} kW`],
                [
                  "At the wheels",
                  `${smart(result.wheelHp)} hp · ${smart(result.wheelKw)} kW · ${smart(result.wheelPs)} PS`,
                ],
                ["Lost in the drivetrain", `${smart(result.lostHp)} hp · ${smart(result.lostKw)} kW`],
              ].map(([label, text]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{text}</dd>
                </div>
              ))}
            </dl>
          </section>

          {result.powerToWeight && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Power-to-weight</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Crank power against {TWO.format(result.powerToWeight.kg)} kg.
              </p>
              <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                {[
                  ["Horsepower per tonne", `${smart(result.powerToWeight.hpPerTonne)} hp/t`],
                  ["Kilowatts per tonne", `${smart(result.powerToWeight.kwPerTonne)} kW/t`],
                  ["PS per tonne", `${smart(result.powerToWeight.psPerTonne)} PS/t`],
                  ["Watts per kilogram", `${smart(result.powerToWeight.wattsPerKg)} W/kg`],
                ].map(([label, text]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{text}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Brake horsepower is not a separate unit — it is mechanical horsepower measured at the
        crankshaft on a brake dynamometer. Drivetrain-loss percentages are rules of thumb from
        chassis-dyno practice and vary with gearing, tyres and dyno type.
      </p>
    </main>
  );
}
