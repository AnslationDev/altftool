"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";

import { FLAT_WATER_BANDS, WATER_TYPES, computePaddleSession, distanceForTarget } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const kcal = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} kcal` : DASH);
const kcal1 = (value) => (Number.isFinite(value) ? `${NUM1.format(value)} kcal` : DASH);

const DEFAULTS = {
  weight: "70",
  distance: "8",
  minutes: "90",
  waterType: "flat",
  target: "500",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [waterType, setWaterType] = useState(DEFAULTS.waterType);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePaddleSession({
        weightKg: toNumber(weight),
        distanceKm: toNumber(distance),
        minutes: toNumber(minutes),
        waterType,
      }),
    [weight, distance, minutes, waterType],
  );

  const ok = !result.error;

  const targetDistance = useMemo(() => {
    if (!ok) return null;
    return distanceForTarget({ kcalPerKm: result.kcalPerKm, targetKcal: toNumber(target) });
  }, [ok, result.kcalPerKm, target]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Kayaking Calorie Burn Calculator",
      `Body weight: ${NUM1.format(toNumber(weight))} kg`,
      `Paddled: ${NUM2.format(toNumber(distance))} km in ${NUM0.format(toNumber(minutes))} minutes`,
      `Average speed: ${NUM2.format(result.speedKmh)} km/h (${NUM2.format(result.speedMph)} mph)`,
      `Water type: ${result.waterLabel}`,
      `Intensity used: ${result.met} METs — ${result.intensityLabel}`,
      `Gross energy: ${kcal(result.grossKcal)}`,
      `Net energy (above resting): ${kcal(result.netKcal)}`,
      `Energy per km: ${kcal1(result.kcalPerKm)}`,
    ].join("\n");
  }, [ok, weight, distance, minutes, result]);

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
    setWeight(DEFAULTS.weight);
    setDistance(DEFAULTS.distance);
    setMinutes(DEFAULTS.minutes);
    setWaterType(DEFAULTS.waterType);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  const rows = [
    ["Net energy (above resting)", ok ? kcal(result.netKcal) : DASH],
    [
      "Average speed",
      ok ? `${NUM2.format(result.speedKmh)} km/h (${NUM2.format(result.speedMph)} mph)` : DASH,
    ],
    ["Pace", ok ? `${NUM1.format(result.minutesPerKm)} min per km` : DASH],
    ["Intensity used", ok ? `${result.met} METs` : DASH],
    ["Why that intensity", ok ? result.intensityLabel : DASH],
    ["Energy per km paddled", ok ? kcal1(result.kcalPerKm) : DASH],
    ["Energy per hour on the water", ok ? kcal(result.kcalPerHour) : DASH],
    ["Energy per minute", ok ? `${NUM2.format(result.kcalPerMinute)} kcal` : DASH],
    ["Burned at rest over the same time", ok ? kcal(result.restingKcal) : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Paddling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kayaking Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the distance you covered, how long it took and the kind of water you were on. On
          flat water your actual boat speed picks the published intensity band; sea and whitewater
          paddling use their own MET rows.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kayak-weight">
              Body weight (kg)
            </label>
            <input
              id="kayak-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kayak-water">
              Water type
            </label>
            <select
              id="kayak-water"
              className={`mt-2 ${INPUT_CLASS}`}
              value={waterType}
              onChange={(event) => setWaterType(event.target.value)}
            >
              {WATER_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kayak-distance">
              Distance paddled (km)
            </label>
            <input
              id="kayak-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="200"
              step="0.1"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kayak-minutes">
              Time on the water (minutes)
            </label>
            <input
              id="kayak-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1440"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
        </div>
        {ok ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.waterNote}</p>
        ) : null}
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
              Calories burned paddling
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? kcal(result.grossKcal) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM2.format(toNumber(distance))} km at ${NUM2.format(result.speedKmh)} km/h`
                : "Fix the highlighted input to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy kayaking calorie result"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Distance to hit a calorie target</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kayak-target">
              Calorie target (kcal)
            </label>
            <input
              id="kayak-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="25"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <p className="text-sm text-[var(--muted-foreground)]">
              Distance needed at the same pace:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {targetDistance === null ? DASH : `${NUM1.format(targetDistance)} km`}
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Flat-water intensity bands</h2>
        <table className="mt-3 w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Boat speed
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                METs
              </th>
            </tr>
          </thead>
          <tbody>
            {FLAT_WATER_BANDS.map((band) => (
              <tr key={band.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-2 pr-3">{band.label}</td>
                <td className="py-2 text-right font-semibold">{band.met}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        MET values come from the 2011 Compendium of Physical Activities and are population averages;
        wind, tide, boat type and how much you drift between strokes all move the real number. Treat
        this as an informational estimate.
      </p>
    </main>
  );
}
