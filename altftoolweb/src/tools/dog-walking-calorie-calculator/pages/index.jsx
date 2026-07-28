"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dog, RotateCcw } from "lucide-react";

import { DOG_ENERGY_LEVELS, DOG_LIFE_STAGES, WALK_PACES, computeDogWalk } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const kcal = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} kcal` : DASH);
const kcal1 = (value) => (Number.isFinite(value) ? `${NUM1.format(value)} kcal` : DASH);
const mins = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} min` : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM0.format(value)}%` : DASH);

const DEFAULTS = {
  humanWeight: "70",
  minutes: "45",
  pace: "moderate",
  stopPercent: "20",
  walksPerDay: "2",
  dogWeight: "20",
  dogLifeStage: "neutered",
  dogEnergyLevel: "moderate",
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

const GUIDANCE_TEXT = {
  below: "Below the usual guidance for this energy level.",
  meets: "Around the usual guidance for this energy level.",
  "at-or-above": "At or above the usual guidance for this energy level.",
};

export default function ToolHome() {
  const [humanWeight, setHumanWeight] = useState(DEFAULTS.humanWeight);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [pace, setPace] = useState(DEFAULTS.pace);
  const [stopPercent, setStopPercent] = useState(DEFAULTS.stopPercent);
  const [walksPerDay, setWalksPerDay] = useState(DEFAULTS.walksPerDay);
  const [dogWeight, setDogWeight] = useState(DEFAULTS.dogWeight);
  const [dogLifeStage, setDogLifeStage] = useState(DEFAULTS.dogLifeStage);
  const [dogEnergyLevel, setDogEnergyLevel] = useState(DEFAULTS.dogEnergyLevel);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeDogWalk({
        humanWeightKg: toNumber(humanWeight),
        minutes: toNumber(minutes),
        pace,
        stopPercent: toNumber(stopPercent),
        walksPerDay: toNumber(walksPerDay),
        dogWeightKg: toNumber(dogWeight),
        dogLifeStage,
        dogEnergyLevel,
      }),
    [
      humanWeight,
      minutes,
      pace,
      stopPercent,
      walksPerDay,
      dogWeight,
      dogLifeStage,
      dogEnergyLevel,
    ],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Dog Walking Calorie Calculator",
      `You: ${NUM1.format(toNumber(humanWeight))} kg, ${mins(toNumber(minutes))} walk at ${result.paceLabel}`,
      `Standing still: ${pct(result.stoppedShare)} of the walk`,
      `Distance covered: ${NUM2.format(result.distanceKm)} km`,
      `Calories this walk: ${kcal(result.grossKcal)} gross, ${kcal(result.netKcal)} net`,
      `Across ${NUM0.format(toNumber(walksPerDay))} walks a day: ${kcal(result.dailyKcal)} per day, ${kcal(result.weeklyKcal)} per week`,
      `Dog: ${NUM1.format(toNumber(dogWeight))} kg, ${result.dogStageLabel}`,
      `Dog resting energy (RER): ${kcal(result.dogRer)} per day`,
      `Dog maintenance energy (MER): ${kcal(result.dogMer)} per day`,
      `Daily walk time: ${mins(result.dailyWalkMinutes)} against a ${mins(result.dogTargetMinutes)} guide`,
    ].join("\n");
  }, [ok, humanWeight, minutes, walksPerDay, dogWeight, result]);

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
    setHumanWeight(DEFAULTS.humanWeight);
    setMinutes(DEFAULTS.minutes);
    setPace(DEFAULTS.pace);
    setStopPercent(DEFAULTS.stopPercent);
    setWalksPerDay(DEFAULTS.walksPerDay);
    setDogWeight(DEFAULTS.dogWeight);
    setDogLifeStage(DEFAULTS.dogLifeStage);
    setDogEnergyLevel(DEFAULTS.dogEnergyLevel);
    setCopied(false);
  };

  const humanRows = [
    ["Net energy (above resting)", ok ? kcal(result.netKcal) : DASH],
    ["Time actually moving", ok ? mins(result.movingMinutes) : DASH],
    ["Time standing at sniff stops", ok ? mins(result.stoppedMinutes) : DASH],
    ["Distance covered", ok ? `${NUM2.format(result.distanceKm)} km` : DASH],
    ["Walking intensity used", ok ? `${result.met} METs` : DASH],
    [
      "Effective intensity for the whole walk",
      ok ? `${NUM2.format(result.effectiveMet)} METs` : DASH,
    ],
    ["Energy while moving", ok ? kcal1(result.movingKcal) : DASH],
    ["Energy while stopped", ok ? kcal1(result.stoppedKcal) : DASH],
    ["Energy per km", ok ? kcal1(result.kcalPerKm) : DASH],
    ["All walks today", ok ? kcal(result.dailyKcal) : DASH],
    ["All walks this week", ok ? kcal(result.weeklyKcal) : DASH],
  ];

  const dogRows = [
    ["Resting energy requirement (RER)", ok ? `${kcal(result.dogRer)} / day` : DASH],
    ["Maintenance energy requirement (MER)", ok ? `${kcal(result.dogMer)} / day` : DASH],
    ["Life-stage factor applied", ok ? `${result.dogStageFactor} x RER` : DASH],
    ["Daily walk time from these walks", ok ? mins(result.dailyWalkMinutes) : DASH],
    [
      "Usual guidance for this energy level",
      ok ? `about ${mins(result.dogTargetMinutes)} / day` : DASH,
    ],
    ["How today compares", ok ? GUIDANCE_TEXT[result.guidanceStatus] : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dog className="h-4 w-4" aria-hidden="true" />
          Dog walking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dog Walking Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Dog walks stop and start, so the time you spend standing at lamp posts is scored
          separately from the time you spend actually walking. You also get your dog&apos;s daily
          energy requirement and how the walk compares to usual exercise guidance.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your walk</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dog-human-weight">
              Your body weight (kg)
            </label>
            <input
              id="dog-human-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.5"
              value={humanWeight}
              onChange={(event) => setHumanWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dog-minutes">
              Walk length (minutes)
            </label>
            <input
              id="dog-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dog-pace">
              Walking pace when moving
            </label>
            <select
              id="dog-pace"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pace}
              onChange={(event) => setPace(event.target.value)}
            >
              {WALK_PACES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dog-stops">
              Share of the walk standing still (%)
            </label>
            <input
              id="dog-stops"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="5"
              value={stopPercent}
              onChange={(event) => setStopPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dog-walks">
              Walks per day
            </label>
            <input
              id="dog-walks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={walksPerDay}
              onChange={(event) => setWalksPerDay(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your dog</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dog-weight">
              Dog&apos;s weight (kg)
            </label>
            <input
              id="dog-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="100"
              step="0.5"
              value={dogWeight}
              onChange={(event) => setDogWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dog-stage">
              Life stage
            </label>
            <select
              id="dog-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dogLifeStage}
              onChange={(event) => setDogLifeStage(event.target.value)}
            >
              {DOG_LIFE_STAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dog-energy">
              Energy level
            </label>
            <select
              id="dog-energy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dogEnergyLevel}
              onChange={(event) => setDogEnergyLevel(event.target.value)}
            >
              {DOG_ENERGY_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
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
              Calories you burn on this walk
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? kcal(result.grossKcal) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM2.format(result.distanceKm)} km covered, ${mins(result.stoppedMinutes)} of it standing still`
                : "Fix the highlighted input to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy dog walk result"
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
          {humanRows.map(([label, value]) => (
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
                ? `Moving for ${pct(result.movingShare)} of the walk and standing for ${pct(result.stoppedShare)}`
                : "Walk split unavailable"
            }
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: ok ? `${result.movingShare}%` : "0%" }}
            />
            <span
              className="block h-full bg-[var(--success)]"
              style={{ width: ok ? `${result.stoppedShare}%` : "0%" }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Moving {ok ? pct(result.movingShare) : DASH} · Standing{" "}
            {ok ? pct(result.stoppedShare) : DASH}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your dog&apos;s daily energy and activity</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {dogRows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          RER = 70 x weight in kg to the power 0.75, the standard allometric equation used in
          veterinary nutrition; MER multiplies it by a life-stage factor. These are starting
          estimates for a healthy animal, not a feeding plan — your vet should set the real target,
          especially for puppies, seniors and any dog with a health condition.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Human MET values come from the 2011 Compendium of Physical Activities and are population
        averages. Exercise guidance by energy level is general advice — breed, age, joints and
        weather all matter more than a single number.
      </p>
    </main>
  );
}
