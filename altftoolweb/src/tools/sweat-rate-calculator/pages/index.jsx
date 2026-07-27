"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import {
  DEFAULT_SWEAT_SODIUM_MMOL_PER_L,
  computeSweatRate,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  preKg: "70",
  postKg: "68.6",
  fluidMl: "500",
  urineMl: "0",
  durationMin: "60",
  sodium: String(DEFAULT_SWEAT_SODIUM_MMOL_PER_L),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  return Number(trimmed);
};

export default function ToolHome() {
  const [preKg, setPreKg] = useState(DEFAULTS.preKg);
  const [postKg, setPostKg] = useState(DEFAULTS.postKg);
  const [fluidMl, setFluidMl] = useState(DEFAULTS.fluidMl);
  const [urineMl, setUrineMl] = useState(DEFAULTS.urineMl);
  const [durationMin, setDurationMin] = useState(DEFAULTS.durationMin);
  const [sodium, setSodium] = useState(DEFAULTS.sodium);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSweatRate({
        preKg: toNumber(preKg),
        postKg: toNumber(postKg),
        fluidMl: toNumber(fluidMl),
        urineMl: toNumber(urineMl),
        durationMin: toNumber(durationMin),
        sweatSodiumMmolPerL: toNumber(sodium),
      }),
    [preKg, postKg, fluidMl, urineMl, durationMin, sodium],
  );

  const ok = !result.error;

  const rows = ok
    ? [
        ["Total sweat lost in the session", `${NUM2.format(result.sweatLossL)} L`],
        ["Body-mass change", `${NUM2.format(result.massChangeKg)} kg (${NUM2.format(result.bodyMassLossPct)}%)`],
        ["Session length", `${NUM2.format(result.hours)} h`],
        ["Fluid you replaced during exercise", `${NUM0.format(result.replacedPct)}% of sweat lost`],
        ["Drink target to break even", `${NUM0.format(result.drinkTargetMlPerHour)} ml/hour`],
        ["That is roughly", `${NUM0.format(result.drinkTargetMlPer15Min)} ml every 15 minutes`],
        [
          "Rehydration after the session",
          `${NUM0.format(result.rehydrationMinMl)}–${NUM0.format(result.rehydrationMaxMl)} ml`,
        ],
        ["Estimated sodium lost", `${NUM0.format(result.sodiumLossMg)} mg (${NUM0.format(result.sodiumLossPerHourMg)} mg/h)`],
      ]
    : [
        ["Total sweat lost in the session", DASH],
        ["Body-mass change", DASH],
        ["Session length", DASH],
        ["Fluid you replaced during exercise", DASH],
        ["Drink target to break even", DASH],
        ["That is roughly", DASH],
        ["Rehydration after the session", DASH],
        ["Estimated sodium lost", DASH],
      ];

  const summary = ok
    ? [
        "Sweat Rate Calculator",
        `Sweat rate: ${NUM2.format(result.sweatRateLPerH)} L/hour`,
        `Total sweat lost: ${NUM2.format(result.sweatLossL)} L over ${NUM2.format(result.hours)} h`,
        `Body-mass loss: ${NUM2.format(result.bodyMassLossPct)}% (${result.band.label})`,
        `Drink target: ${NUM0.format(result.drinkTargetMlPerHour)} ml/hour`,
        `Post-session rehydration: ${NUM0.format(result.rehydrationMinMl)}-${NUM0.format(result.rehydrationMaxMl)} ml`,
        `Estimated sodium loss: ${NUM0.format(result.sodiumLossMg)} mg`,
      ].join("\n")
    : "";

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
    setPreKg(DEFAULTS.preKg);
    setPostKg(DEFAULTS.postKg);
    setFluidMl(DEFAULTS.fluidMl);
    setUrineMl(DEFAULTS.urineMl);
    setDurationMin(DEFAULTS.durationMin);
    setSodium(DEFAULTS.sodium);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sweat Rate Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weigh yourself before and after a session, note what you drank, and get your personal
          sweat rate in litres per hour — the weigh-in weigh-out method used in sports science.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sweat-pre">
              Weight before exercise (kg)
            </label>
            <input
              id="sweat-pre"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="250"
              step="0.1"
              value={preKg}
              onChange={(event) => setPreKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sweat-post">
              Weight after exercise, towel-dried (kg)
            </label>
            <input
              id="sweat-post"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="250"
              step="0.1"
              value={postKg}
              onChange={(event) => setPostKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sweat-fluid">
              Fluid drunk during the session (ml)
            </label>
            <input
              id="sweat-fluid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={fluidMl}
              onChange={(event) => setFluidMl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sweat-urine">
              Urine passed during the session (ml)
            </label>
            <input
              id="sweat-urine"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={urineMl}
              onChange={(event) => setUrineMl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sweat-duration">
              Exercise duration (minutes)
            </label>
            <input
              id="sweat-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="720"
              step="5"
              value={durationMin}
              onChange={(event) => setDurationMin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sweat-sodium">
              Sweat sodium (mmol/L, typical 20–80)
            </label>
            <input
              id="sweat-sodium"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="100"
              step="5"
              value={sodium}
              onChange={(event) => setSodium(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["45 min", "45"],
            ["60 min", "60"],
            ["90 min", "90"],
            ["120 min", "120"],
          ].map(([label, value]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDurationMin(value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {result.error && (
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
              Your sweat rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM2.format(result.sweatRateLPerH)} L/h` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${NUM0.format(result.sweatRateMlPerH)} ml every hour of exercise` : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy sweat rate result"
              className={GHOST_BTN}
              disabled={!ok}
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

        {ok && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            <span className="font-semibold">{result.band.label}.</span>{" "}
            <span className="text-[var(--muted-foreground)]">{result.band.note}</span>
          </p>
        )}

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
        <h2 className="text-base font-semibold">How to take the measurements</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>Empty your bladder, then weigh yourself in minimal dry clothing.</li>
          <li>Train as normal and keep track of exactly how much you drink.</li>
          <li>Towel off completely, change out of the wet kit, then weigh again on the same scale.</li>
          <li>Repeat on a hot day and a cool day — sweat rate can double between the two.</li>
        </ol>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          A scale that reads to 0.1 kg is accurate enough — 0.1 kg is 100 ml of sweat.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Sweat rate varies with heat, humidity, clothing, fitness and intensity.
        If you have a heart, kidney or blood-pressure condition, or you are on fluid or salt
        restriction, talk to your doctor before changing how much you drink.
      </p>
    </main>
  );
}
