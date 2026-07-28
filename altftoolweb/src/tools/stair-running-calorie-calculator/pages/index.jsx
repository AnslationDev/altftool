"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import {
  ASCENT_EFFORTS,
  DESCENT_MODES,
  STAIR_EFFICIENCY,
  computeStairSession,
  flightsForTarget,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const kcal = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} kcal` : DASH);
const kcal1 = (value) => (Number.isFinite(value) ? `${NUM1.format(value)} kcal` : DASH);
const mins = (value) => (Number.isFinite(value) ? `${NUM1.format(value)} min` : DASH);
const metres = (value) => (Number.isFinite(value) ? `${NUM1.format(value)} m` : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM0.format(value)}%` : DASH);

const DEFAULTS = {
  weight: "70",
  flights: "10",
  stepsPerFlight: "13",
  stepHeight: "17",
  effort: "run",
  cadence: "100",
  descentMode: "walk",
  descentCadence: "120",
  target: "300",
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
  const [flights, setFlights] = useState(DEFAULTS.flights);
  const [stepsPerFlight, setStepsPerFlight] = useState(DEFAULTS.stepsPerFlight);
  const [stepHeight, setStepHeight] = useState(DEFAULTS.stepHeight);
  const [effort, setEffort] = useState(DEFAULTS.effort);
  const [cadence, setCadence] = useState(DEFAULTS.cadence);
  const [descentMode, setDescentMode] = useState(DEFAULTS.descentMode);
  const [descentCadence, setDescentCadence] = useState(DEFAULTS.descentCadence);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeStairSession({
        weightKg: toNumber(weight),
        flights: toNumber(flights),
        stepsPerFlight: toNumber(stepsPerFlight),
        stepHeightCm: toNumber(stepHeight),
        ascentEffort: effort,
        cadence: toNumber(cadence),
        descentMode,
        descentCadence: toNumber(descentCadence),
      }),
    [weight, flights, stepsPerFlight, stepHeight, effort, cadence, descentMode, descentCadence],
  );

  const ok = !result.error;

  const flightsNeeded = useMemo(() => {
    if (!ok) return null;
    return flightsForTarget({
      kcalPerFlight: result.kcalPerFlight,
      targetKcal: toNumber(target),
    });
  }, [ok, result.kcalPerFlight, target]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Stair Running Calorie Calculator",
      `Body weight: ${NUM1.format(toNumber(weight))} kg`,
      `Climb: ${NUM0.format(toNumber(flights))} flights x ${NUM0.format(toNumber(stepsPerFlight))} steps = ${NUM0.format(result.totalSteps)} steps`,
      `Vertical rise: ${metres(result.verticalMetres)}`,
      `Effort: ${result.effortLabel} (${result.met} METs)`,
      `Ascent time: ${mins(result.ascentMinutes)} | Descent: ${result.descentLabel}, ${mins(result.descentMinutes)}`,
      `Gross energy: ${kcal(result.grossKcal)}`,
      `Net energy (above resting): ${kcal(result.netKcal)}`,
      `Vertical-work cross-check: ${kcal(result.workBasedKcal)}`,
    ].join("\n");
  }, [ok, weight, flights, stepsPerFlight, result]);

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
    setFlights(DEFAULTS.flights);
    setStepsPerFlight(DEFAULTS.stepsPerFlight);
    setStepHeight(DEFAULTS.stepHeight);
    setEffort(DEFAULTS.effort);
    setCadence(DEFAULTS.cadence);
    setDescentMode(DEFAULTS.descentMode);
    setDescentCadence(DEFAULTS.descentCadence);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  const rows = [
    ["Net energy (above resting)", ok ? kcal(result.netKcal) : DASH],
    ["Steps climbed", ok ? NUM0.format(result.totalSteps) : DASH],
    ["Vertical rise", ok ? metres(result.verticalMetres) : DASH],
    ["Ascent time", ok ? mins(result.ascentMinutes) : DASH],
    ["Descent", ok ? `${result.descentLabel} — ${mins(result.descentMinutes)}` : DASH],
    ["Total session length", ok ? mins(result.sessionMinutes) : DASH],
    ["Intensity used", ok ? `${result.met} METs — ${result.effortLabel}` : DASH],
    ["Energy going up", ok ? kcal1(result.ascentKcal) : DASH],
    ["Energy coming down", ok ? kcal1(result.descentKcal) : DASH],
    ["Energy per flight (ascent)", ok ? kcal1(result.kcalPerFlight) : DASH],
    ["Energy per step (ascent)", ok ? `${NUM2.format(result.kcalPerStep)} kcal` : DASH],
    ["Flights per minute", ok ? NUM1.format(result.flightsPerMinute) : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Stair training
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Stair Running Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the flights you climbed, the riser height and your body weight to get the calories
          for the ascent, the descent and the whole session — plus a physics cross-check from the
          vertical work you actually did.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-weight">
              Body weight (kg)
            </label>
            <input
              id="stair-weight"
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
            <label className={LABEL_CLASS} htmlFor="stair-flights">
              Flights climbed
            </label>
            <input
              id="stair-flights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="500"
              step="1"
              value={flights}
              onChange={(event) => setFlights(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-steps">
              Steps per flight
            </label>
            <input
              id="stair-steps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="100"
              step="1"
              value={stepsPerFlight}
              onChange={(event) => setStepsPerFlight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-height">
              Step (riser) height in cm
            </label>
            <input
              id="stair-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              max="40"
              step="0.5"
              value={stepHeight}
              onChange={(event) => setStepHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-effort">
              How hard you go up
            </label>
            <select
              id="stair-effort"
              className={`mt-2 ${INPUT_CLASS}`}
              value={effort}
              onChange={(event) => {
                const next = event.target.value;
                setEffort(next);
                const match = ASCENT_EFFORTS.find((item) => item.id === next);
                if (match) setCadence(String(match.defaultCadence));
              }}
            >
              {ASCENT_EFFORTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.met} METs
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-cadence">
              Climbing cadence (steps per minute)
            </label>
            <input
              id="stair-cadence"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="400"
              step="5"
              value={cadence}
              onChange={(event) => setCadence(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-descent">
              Coming back down
            </label>
            <select
              id="stair-descent"
              className={`mt-2 ${INPUT_CLASS}`}
              value={descentMode}
              onChange={(event) => setDescentMode(event.target.value)}
            >
              {DESCENT_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-descent-cadence">
              Descent cadence (steps per minute)
            </label>
            <input
              id="stair-descent-cadence"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="400"
              step="5"
              value={descentCadence}
              onChange={(event) => setDescentCadence(event.target.value)}
              disabled={descentMode !== "walk"}
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
              Calories burned this stair session
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? kcal(result.grossKcal) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM0.format(result.totalSteps)} steps and ${metres(result.verticalMetres)} of climbing`
                : "Fix the highlighted input to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy stair session result"
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

        <div className="mt-5">
          <div
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={
              ok
                ? `Ascent is ${pct(result.ascentShare)} of the calories and descent is ${pct(result.descentShare)}`
                : "Session split unavailable"
            }
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: ok ? `${result.ascentShare}%` : "0%" }}
            />
            <span
              className="block h-full bg-[var(--success)]"
              style={{ width: ok ? `${result.descentShare}%` : "0%" }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Going up {ok ? pct(result.ascentShare) : DASH} · Coming down{" "}
            {ok ? pct(result.descentShare) : DASH}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Vertical-work cross-check</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lifting your body mass through the total rise is pure physics: W = m x g x h. At the
          roughly {NUM0.format(STAIR_EFFICIENCY * 100)}% gross efficiency measured for stair
          climbing, that vertical work alone accounts for{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {ok ? kcal1(result.workBasedKcal) : DASH}
          </span>
          . The MET figure above is higher because it also covers arm swing, balance and the
          horizontal part of each stride.
        </p>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Mechanical work done</dt>
            <dd className="text-right font-semibold">
              {ok ? `${NUM0.format(result.mechanicalJoules)} J` : DASH}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">As energy at 100% efficiency</dt>
            <dd className="text-right font-semibold">
              {ok ? kcal1(result.mechanicalKcal) : DASH}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Flights to hit a calorie target</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-target">
              Calorie target (kcal)
            </label>
            <input
              id="stair-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <p className="text-sm text-[var(--muted-foreground)]">
              Flights needed at these settings:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {flightsNeeded === null ? DASH : NUM0.format(flightsNeeded)}
              </span>
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        MET values come from the 2011 Compendium of Physical Activities and are population averages.
        Stair sprinting is a high-intensity activity; if you have a heart, joint or blood-pressure
        condition, check with a clinician before adding it to your training.
      </p>
    </main>
  );
}
