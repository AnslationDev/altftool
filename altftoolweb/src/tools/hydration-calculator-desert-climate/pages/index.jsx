"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw, TriangleAlert } from "lucide-react";
import {
  INTENSITY_LABELS,
  INTENSITY_SWEAT_LPH,
  buildDrinkingSchedule,
  computeDesertHydration,
} from "../lib";

const L = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const ML = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const litres = (value) => (Number.isFinite(value) ? `${L.format(value)} L` : "—");
const millilitres = (value) => (Number.isFinite(value) ? `${ML.format(value)} ml` : "—");
const milligrams = (value) => (Number.isFinite(value) ? `${ML.format(value)} mg` : "—");

const DEFAULTS = {
  weightKg: "70",
  ambientTempC: "40",
  humidityPct: "15",
  exposureHours: "6",
  intensity: "moderate",
  acclimatised: false,
  saltySweater: false,
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
  return Number(trimmed);
};

export default function ToolHome() {
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [ambientTempC, setAmbientTempC] = useState(DEFAULTS.ambientTempC);
  const [humidityPct, setHumidityPct] = useState(DEFAULTS.humidityPct);
  const [exposureHours, setExposureHours] = useState(DEFAULTS.exposureHours);
  const [intensity, setIntensity] = useState(DEFAULTS.intensity);
  const [acclimatised, setAcclimatised] = useState(DEFAULTS.acclimatised);
  const [saltySweater, setSaltySweater] = useState(DEFAULTS.saltySweater);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeDesertHydration({
        weightKg: toNumber(weightKg),
        ambientTempC: toNumber(ambientTempC),
        humidityPct: toNumber(humidityPct),
        exposureHours: toNumber(exposureHours),
        intensity,
        acclimatised,
        saltySweater,
      }),
    [weightKg, ambientTempC, humidityPct, exposureHours, intensity, acclimatised, saltySweater],
  );

  const schedule = useMemo(() => {
    if (result.error) return [];
    return buildDrinkingSchedule(result.replacementRateLph, toNumber(exposureHours));
  }, [result, exposureHours]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Desert Climate Hydration Calculator",
      `Body weight: ${weightKg} kg`,
      `Conditions: ${ambientTempC} C, ${humidityPct}% RH, ${exposureHours} h ${INTENSITY_LABELS[intensity]}`,
      `Total fluid to drink: ${litres(result.totalDrinkL)}`,
      `Drink during exposure: ${litres(result.exposureLossL)} (${L.format(result.replacementRateLph)} L/h)`,
      `Sip size every 15 min: ${millilitres(result.perServingMl)}`,
      `Baseline day intake: ${litres(result.baselineDrinkL)}`,
      `Estimated sweat volume: ${litres(result.sweatVolumeL)}`,
      `Sodium to replace: ${milligrams(result.sodiumMg)}`,
      `Potassium to replace: ${milligrams(result.potassiumMg)}`,
      `Pre-hydration 4 h before: ${millilitres(result.preHydrationMlLow)}-${millilitres(result.preHydrationMlHigh)}`,
    ].join("\n");
  }, [result, weightKg, ambientTempC, humidityPct, exposureHours, intensity]);

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
    setWeightKg(DEFAULTS.weightKg);
    setAmbientTempC(DEFAULTS.ambientTempC);
    setHumidityPct(DEFAULTS.humidityPct);
    setExposureHours(DEFAULTS.exposureHours);
    setIntensity(DEFAULTS.intensity);
    setAcclimatised(DEFAULTS.acclimatised);
    setSaltySweater(DEFAULTS.saltySweater);
    setCopied(false);
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Desert hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Desert Climate Hydration Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Very dry air evaporates sweat before you feel it, so thirst under-reads your losses. This
          works out how much to drink per hour, how much salt goes out with the sweat, and when the
          numbers say to shorten the exposure instead.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hyd-weight">
              Body weight (kg)
            </label>
            <input
              id="hyd-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="250"
              step="1"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hyd-hours">
              Hours in the heat
            </label>
            <input
              id="hyd-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={exposureHours}
              onChange={(event) => setExposureHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hyd-temp">
              Air temperature (C)
            </label>
            <input
              id="hyd-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-10"
              max="60"
              step="1"
              value={ambientTempC}
              onChange={(event) => setAmbientTempC(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hyd-humidity">
              Relative humidity (%)
            </label>
            <input
              id="hyd-humidity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={humidityPct}
              onChange={(event) => setHumidityPct(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hyd-intensity">
              Activity level
            </label>
            <select
              id="hyd-intensity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={intensity}
              onChange={(event) => setIntensity(event.target.value)}
            >
              {Object.keys(INTENSITY_SWEAT_LPH).map((key) => (
                <option key={key} value={key}>
                  {INTENSITY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            htmlFor="hyd-acclimatised"
          >
            <input
              id="hyd-acclimatised"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={acclimatised}
              onChange={(event) => setAcclimatised(event.target.checked)}
            />
            <span>
              Heat acclimatised
              <span className="block text-xs text-[var(--muted-foreground)]">
                2+ weeks of daily exposure
              </span>
            </span>
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            htmlFor="hyd-salty"
          >
            <input
              id="hyd-salty"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={saltySweater}
              onChange={(event) => setSaltySweater(event.target.checked)}
            />
            <span>
              Salty sweater
              <span className="block text-xs text-[var(--muted-foreground)]">
                White salt marks on skin or kit
              </span>
            </span>
          </label>
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
              Fluid to drink over the day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? litres(result.totalDrinkL) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${millilitres(result.perServingMl)} every 15 minutes while you are out there`
                : "Fix the inputs above to see a plan"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy desert hydration plan"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Drink during exposure", ok ? litres(result.exposureLossL) : "—"],
            ["Replacement rate", ok ? `${L.format(result.replacementRateLph)} L per hour` : "—"],
            ["Baseline day intake (food excluded)", ok ? litres(result.baselineDrinkL) : "—"],
            ["Estimated sweat produced", ok ? litres(result.sweatVolumeL) : "—"],
            ["Invisible dry-air loss", ok ? `${L.format(result.respLossLph)} L per hour` : "—"],
            ["Sodium to replace", ok ? milligrams(result.sodiumMg) : "—"],
            ["Potassium to replace", ok ? milligrams(result.potassiumMg) : "—"],
            [
              "Pre-hydrate 4 hours before",
              ok
                ? `${millilitres(result.preHydrationMlLow)} to ${millilitres(result.preHydrationMlHigh)}`
                : "—",
            ],
            [
              "Weight loss that means real dehydration",
              ok ? `${L.format(result.dehydrationAlarmL)} kg (2% of body mass)` : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && result.warnings.length > 0 ? (
        <section className="mt-6 space-y-2">
          {result.warnings.map((warning) => (
            <p
              key={warning}
              className="flex gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{warning}</span>
            </p>
          ))}
        </section>
      ) : null}

      {ok && schedule.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Hour-by-hour drinking plan</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Hour
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Drink this hour
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Running total
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.hour} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.hour}</td>
                    <td className="py-2 pr-3 text-right">{millilitres(row.litres * 1000)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {litres(row.cumulative)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Sweat rates vary enormously between individuals — weigh
        yourself before and after a session to calibrate. Seek medical help for confusion, stopped
        sweating, fainting or a body temperature above 40 C, which are signs of heat stroke.
      </p>
    </main>
  );
}
