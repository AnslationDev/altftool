"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GlassWater, RotateCcw } from "lucide-react";

import {
  SWEAT_RATES_L_PER_HOUR,
  WHO_SODIUM_LIMIT_MG,
  formatClock,
  formatDuration,
  planEighteenSix,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  anchor: "start",
  anchorTime: "13:00",
  eatingHours: "6",
  bedtime: "23:00",
  wakeTime: "07:00",
  sex: "male",
  trainingMinutes: "60",
  sweatRate: 0.6,
};

const SWEAT_LABEL = {
  0.4: "Light — cool room, easy pace (0.4 L/h)",
  0.6: "Moderate — typical gym session (0.6 L/h)",
  0.8: "Heavy — hot, humid or hard (0.8 L/h)",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [anchor, setAnchor] = useState(DEFAULTS.anchor);
  const [anchorTime, setAnchorTime] = useState(DEFAULTS.anchorTime);
  const [eatingHours, setEatingHours] = useState(DEFAULTS.eatingHours);
  const [bedtime, setBedtime] = useState(DEFAULTS.bedtime);
  const [wakeTime, setWakeTime] = useState(DEFAULTS.wakeTime);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [trainingMinutes, setTrainingMinutes] = useState(DEFAULTS.trainingMinutes);
  const [sweatRate, setSweatRate] = useState(DEFAULTS.sweatRate);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planEighteenSix({
        anchor,
        anchorTime,
        eatingHours: toNumber(eatingHours),
        bedtime,
        wakeTime,
        sex,
        trainingMinutes: toNumber(trainingMinutes),
        sweatRate,
      }),
    [anchor, anchorTime, eatingHours, bedtime, wakeTime, sex, trainingMinutes, sweatRate],
  );

  const hasError = Boolean(plan.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `${plan.ratioLabel} two-meal plan`,
      `Eating window: ${formatClock(plan.eatingStart)} – ${formatClock(plan.eatingEnd)}`,
      `Meal 1 ${formatClock(plan.meals[0].at)} · Meal 2 ${formatClock(plan.meals[1].at)}`,
      "",
      `Drink target: ${NUM0.format(plan.hydration.drinkTargetMl)} ml`,
      `During the fast: ${NUM0.format(plan.hydration.fastingShareMl)} ml · In the window: ${NUM0.format(plan.hydration.eatingShareMl)} ml`,
      `${plan.hydration.glassCount} drinks of about ${NUM0.format(plan.hydration.glassMl)} ml`,
      "",
      ...plan.hydration.schedule.map((glass) => `${formatClock(glass.at)} — ${NUM0.format(glass.ml)} ml`),
      "",
      `Sweat sodium lost in training: about ${NUM0.format(plan.electrolytes.sodiumLostMg)} mg`,
    ].join("\n");
  }, [hasError, plan]);

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
    setAnchor(DEFAULTS.anchor);
    setAnchorTime(DEFAULTS.anchorTime);
    setEatingHours(DEFAULTS.eatingHours);
    setBedtime(DEFAULTS.bedtime);
    setWakeTime(DEFAULTS.wakeTime);
    setSex(DEFAULTS.sex);
    setTrainingMinutes(DEFAULTS.trainingMinutes);
    setSweatRate(DEFAULTS.sweatRate);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GlassWater className="h-4 w-4" aria-hidden="true" />
          Fasting plans
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">18:6 Fasting Window Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two meals in a 6-hour window, an 18-hour fast around them, and the part people miss — a
          drink-by-drink hydration plan, because a fifth of your daily water normally arrives with food.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="es-anchor">
              Anchor the window to
            </label>
            <select
              id="es-anchor"
              className={`mt-2 ${INPUT_CLASS}`}
              value={anchor}
              onChange={(event) => setAnchor(event.target.value)}
            >
              <option value="start">My first meal (window opens)</option>
              <option value="end">My last bite (window closes)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="es-anchor-time">
              {anchor === "start" ? "First meal at" : "Last bite by"}
            </label>
            <input
              id="es-anchor-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={anchorTime}
              onChange={(event) => setAnchorTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="es-hours">
              Eating window length (hours)
            </label>
            <input
              id="es-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="4"
              max="10"
              step="0.5"
              value={eatingHours}
              onChange={(event) => setEatingHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="es-sex">
              Water intake reference
            </label>
            <select
              id="es-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Adult men — 2.5 L total water a day</option>
              <option value="female">Adult women — 2.0 L total water a day</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="es-bed">
              Usual bedtime
            </label>
            <input
              id="es-bed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={bedtime}
              onChange={(event) => setBedtime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="es-wake">
              Usual wake time
            </label>
            <input
              id="es-wake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={wakeTime}
              onChange={(event) => setWakeTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="es-training">
              Training per day (minutes)
            </label>
            <input
              id="es-training"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={trainingMinutes}
              onChange={(event) => setTrainingMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="es-sweat">
              Sweat rate while training
            </label>
            <select
              id="es-sweat"
              className={`mt-2 ${INPUT_CLASS}`}
              value={String(sweatRate)}
              onChange={(event) => setSweatRate(Number(event.target.value))}
            >
              {SWEAT_RATES_L_PER_HOUR.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {SWEAT_LABEL[rate]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Eating window
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${formatClock(plan.eatingStart)} – ${formatClock(plan.eatingEnd)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${plan.ratioLabel} — two meals at ${formatClock(plan.meals[0].at)} and ${formatClock(plan.meals[1].at)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the 18:6 plan and hydration schedule"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Fasting hours", hasError ? dash : formatDuration(plan.fastingMinutes)],
            ["Fasting hours asleep", hasError ? dash : formatDuration(plan.fastAsleepMinutes)],
            ["Fasting hours awake", hasError ? dash : formatDuration(plan.fastWakingMinutes)],
            ["Last meal to bedtime", hasError ? dash : formatDuration(plan.lastMealToBed)],
            ["Total water target (food + drink)", hasError ? dash : `${NUM0.format(plan.hydration.totalWaterMl)} ml`],
            ["Comes from food in the window", hasError ? dash : `${NUM0.format(plan.hydration.foodWaterMl)} ml`],
            ["Added for training sweat", hasError ? dash : `${NUM0.format(plan.hydration.exerciseMl)} ml`],
            ["To drink today", hasError ? dash : `${NUM0.format(plan.hydration.drinkTargetMl)} ml`],
            ["  · during the fast", hasError ? dash : `${NUM0.format(plan.hydration.fastingShareMl)} ml`],
            ["  · inside the window", hasError ? dash : `${NUM0.format(plan.hydration.eatingShareMl)} ml`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="whitespace-pre text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError &&
          plan.warnings.map((warning) => (
            <p key={warning} className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]">
              {warning}
            </p>
          ))}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Hydration schedule — {plan.hydration.glassCount} drinks of about{" "}
            {NUM0.format(plan.hydration.glassMl)} ml
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Time</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2 font-semibold">Phase</th>
                </tr>
              </thead>
              <tbody>
                {plan.hydration.schedule.map((glass) => (
                  <tr key={glass.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{glass.index}</td>
                    <td className="py-2 pr-3 font-semibold text-[var(--primary)]">{formatClock(glass.at)}</td>
                    <td className="py-2 pr-3 text-right">{NUM0.format(glass.ml)} ml</td>
                    <td className="py-2 text-[var(--muted-foreground)]">
                      {glass.insideWindow ? "Eating window" : "Fasting"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Electrolytes</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Sweat lost in training", `${NUM1.format(plan.electrolytes.sweatLitres)} L`],
              ["Sodium in that sweat", `about ${NUM0.format(plan.electrolytes.sodiumLostMg)} mg`],
              [
                "As a share of the WHO daily sodium guidance",
                `${NUM0.format(plan.electrolytes.sodiumAsPctOfLimit)}% of ${NUM0.format(WHO_SODIUM_LIMIT_MG)} mg`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            Sweat carries roughly a gram of sodium per litre, though individual concentration varies
            widely. For a daily 18:6 pattern, normally salted food inside the window usually replaces
            it, and routine electrolyte supplements are not required. Talk to a doctor before adding
            sodium, potassium or magnesium supplements if you have high blood pressure, kidney disease
            or heart failure, or take diuretics.
          </p>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Prompts for the fasting hours</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {plan.prompts.map((prompt) => (
              <li key={prompt} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">•</span>
                <span>{prompt}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. An 18-hour fast with two meals leaves little room to meet protein, fibre
        and micronutrient needs, so it does not suit everyone. Speak to a doctor first if you are
        pregnant or breastfeeding, under 18, taking insulin or other glucose-lowering medication,
        living with an eating disorder or a history of one, underweight, or taking medication that has
        to be taken with food.
      </p>
    </main>
  );
}
