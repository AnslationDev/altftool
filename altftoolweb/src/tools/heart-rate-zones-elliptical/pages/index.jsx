"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";
import { MAX_HR_FORMULAS, classifyHeartRate, computeEllipticalZones } from "../lib";

const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const bpm = (value) => (Number.isFinite(value) ? `${N0.format(value)} bpm` : DASH);

const DEFAULTS = {
  age: "40",
  restingHr: "65",
  formula: "tanaka",
  machineMaxLevel: "20",
  observedHr: "",
  method: "max",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [restingHr, setRestingHr] = useState(DEFAULTS.restingHr);
  const [formula, setFormula] = useState(DEFAULTS.formula);
  const [machineMaxLevel, setMachineMaxLevel] = useState(DEFAULTS.machineMaxLevel);
  const [observedHr, setObservedHr] = useState(DEFAULTS.observedHr);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeEllipticalZones({
        age: toNumber(age),
        restingHr: toNumber(restingHr),
        formula,
        machineMaxLevel: toNumber(machineMaxLevel),
      }),
    [age, restingHr, formula, machineMaxLevel],
  );

  const ok = !result.error;
  const usingHrr = method === "hrr";

  const matched = useMemo(() => {
    if (!ok) return null;
    return classifyHeartRate(result.zones, toNumber(observedHr), method);
  }, [ok, result, observedHr, method]);

  const lowOf = (zone) => (usingHrr ? zone.hrrLowBpm : zone.maxLowBpm);
  const highOf = (zone) => (usingHrr ? zone.hrrHighBpm : zone.maxHighBpm);

  const steadyLow = ok ? (usingHrr ? result.steadyHrrLowBpm : result.steadyLowBpm) : NaN;
  const steadyHigh = ok ? (usingHrr ? result.steadyHrrHighBpm : result.steadyHighBpm) : NaN;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Heart Rate Zones for Elliptical",
      `Age ${age}, resting heart rate ${restingHr} bpm, console max resistance ${result.machineMaxLevel}`,
      `Estimated maximum heart rate: ${result.maxHrRounded} bpm (${result.formulaLabel})`,
      `Steady cardio target: ${steadyLow}-${steadyHigh} bpm at resistance ${result.steadyResistanceLow}-${result.steadyResistanceHigh}`,
      "",
      ...result.zones.map(
        (zone) =>
          `${zone.label}: ${lowOf(zone)}-${highOf(zone)} bpm | ${zone.strideRate[0]}-${zone.strideRate[1]} spm | resistance ${zone.resistanceLow}-${zone.resistanceHigh}`,
      ),
      "",
      result.rampTip,
    ].join("\n");
  }, [ok, result, age, restingHr, steadyLow, steadyHigh, usingHrr]);

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
    setAge(DEFAULTS.age);
    setRestingHr(DEFAULTS.restingHr);
    setFormula(DEFAULTS.formula);
    setMachineMaxLevel(DEFAULTS.machineMaxLevel);
    setObservedHr(DEFAULTS.observedHr);
    setMethod(DEFAULTS.method);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Cross-trainer
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Heart Rate Zones for Elliptical
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Console resistance scales are arbitrary, so a zone chart is useless unless it is scaled to
          your machine. Enter the top level on your console and each heart rate band comes back with
          the resistance number and stride rate that normally sits inside it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hre-age">
              Age (years)
            </label>
            <input
              id="hre-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hre-resting">
              Resting heart rate (bpm)
            </label>
            <input
              id="hre-resting"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="30"
              max="120"
              step="1"
              value={restingHr}
              onChange={(event) => setRestingHr(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hre-machine">
              Top resistance level on your console
            </label>
            <input
              id="hre-machine"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="40"
              step="1"
              value={machineMaxLevel}
              onChange={(event) => setMachineMaxLevel(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hre-formula">
              Maximum heart rate formula
            </label>
            <select
              id="hre-formula"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formula}
              onChange={(event) => setFormula(event.target.value)}
            >
              {Object.values(MAX_HR_FORMULAS).map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hre-observed">
              Reading on the console right now (optional)
            </label>
            <input
              id="hre-observed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="30"
              max="230"
              step="1"
              placeholder="e.g. 132 — tells you which zone you are in"
              value={observedHr}
              onChange={(event) => setObservedHr(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["max", "% of maximum HR"],
            ["hrr", "% of heart rate reserve"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMethod(value)}
              aria-pressed={method === value}
              className={`min-h-11 rounded-md px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                method === value
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Steady cardio zone
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${steadyLow}–${steadyHigh}` : DASH}
              <span className="ml-2 text-base font-semibold text-[var(--muted-foreground)]">bpm</span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Resistance ${result.steadyResistanceLow}–${result.steadyResistanceHigh} at 50–65 strides per minute`
                : "Fix the inputs above to see your zones"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy elliptical heart rate zones"
              className={`${GHOST_BTN} disabled:opacity-50`}
              disabled={!ok}
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
          {[
            ["Estimated maximum heart rate", ok ? bpm(result.maxHrRounded) : DASH],
            ["Heart rate reserve", ok ? bpm(Math.round(result.heartRateReserve)) : DASH],
            ["Formula used", ok ? result.formulaLabel : DASH],
            ["Console scale", ok ? `1 to ${result.machineMaxLevel}` : DASH],
            [
              "Your current reading",
              ok && matched
                ? matched.label
                : ok && String(observedHr).trim() !== ""
                  ? "Outside every band — re-check the reading"
                  : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">{result.formulaNote}</p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">
            Zones by {usingHrr ? "heart rate reserve" : "percentage of maximum"}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Zone
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Heart rate
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Strides/min
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Resistance
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    What it is for
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.zones.map((zone) => (
                  <tr
                    key={zone.key}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      matched && matched.key === zone.key ? "bg-[var(--muted)] font-semibold" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-semibold">{zone.label}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {lowOf(zone)}–{highOf(zone)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {zone.strideRate[0]}–{zone.strideRate[1]}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {zone.resistanceLow}–{zone.resistanceHigh}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{zone.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">{result.rampTip}</p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Resistance and stride-rate suggestions are starting points — machines differ, so calibrate by
        watching your own heart rate and adjust the numbers you use. Hand-grip sensors on gym
        consoles are notoriously inaccurate; a chest strap is far more reliable. Ask your doctor
        before starting a new programme if you have a heart condition or take medication that
        controls heart rate.
      </p>
    </main>
  );
}
