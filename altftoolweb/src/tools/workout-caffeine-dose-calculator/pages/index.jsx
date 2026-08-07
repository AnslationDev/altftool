"use client";

import { useMemo, useState } from "react";
import { Check, Coffee, Copy, RotateCcw } from "lucide-react";

import {
  DOSE_LEVELS,
  EFSA_DAILY_LIMIT_MG,
  EFSA_SINGLE_DOSE_MG,
  ERGOGENIC_MAX_MG_PER_KG,
  ERGOGENIC_MIN_MG_PER_KG,
  FORMS,
  HALF_LIFE_HOURS_MAX,
  HALF_LIFE_HOURS_MIN,
  NO_EXTRA_BENEFIT_MG_PER_KG,
  SLEEP_THRESHOLD_MG,
  computeCaffeinePlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULTS = {
  weight: "75",
  doseLevel: "moderate",
  custom: "3",
  form: "capsule",
  trainingTime: "18:00",
  bedTime: "23:00",
  halfLife: "5",
  other: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [doseLevel, setDoseLevel] = useState(DEFAULTS.doseLevel);
  const [custom, setCustom] = useState(DEFAULTS.custom);
  const [form, setForm] = useState(DEFAULTS.form);
  const [trainingTime, setTrainingTime] = useState(DEFAULTS.trainingTime);
  const [bedTime, setBedTime] = useState(DEFAULTS.bedTime);
  const [halfLife, setHalfLife] = useState(DEFAULTS.halfLife);
  const [other, setOther] = useState(DEFAULTS.other);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      computeCaffeinePlan({
        bodyWeightKg: Number(weight),
        doseLevel,
        customMgPerKg: Number(custom),
        form,
        trainingTime,
        bedTime,
        halfLifeHours: Number(halfLife),
        otherCaffeineMg: other.trim() === "" ? 0 : Number(other),
      }),
    [weight, doseLevel, custom, form, trainingTime, bedTime, halfLife, other],
  );

  const hasError = Boolean(plan.error);
  const show = (value) => (hasError ? DASH : value);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Pre-workout caffeine plan",
      `${plan.doseMg} mg (${plan.mgPerKg} mg/kg at ${plan.weight} kg)`,
      `Take at ${plan.intakeTime} — ${plan.leadMinutes} minutes before a ${plan.trainingTime} start`,
      `Form: ${plan.formLabel}`,
      `Still in you at ${plan.bedTime}: about ${plan.remainingAtBedMg} mg (${plan.hoursToBed} h later, ${plan.halfLifeHours} h half-life)`,
      `Below ${SLEEP_THRESHOLD_MG} mg from about ${plan.sleepSafeTime}`,
      `Total caffeine today: ${plan.dailyTotalMg} mg of the ${EFSA_DAILY_LIMIT_MG} mg adult guideline`,
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
    setWeight(DEFAULTS.weight);
    setDoseLevel(DEFAULTS.doseLevel);
    setCustom(DEFAULTS.custom);
    setForm(DEFAULTS.form);
    setTrainingTime(DEFAULTS.trainingTime);
    setBedTime(DEFAULTS.bedTime);
    setHalfLife(DEFAULTS.halfLife);
    setOther(DEFAULTS.other);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coffee className="h-4 w-4" aria-hidden="true" />
          Sports nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Workout Caffeine Dose Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Scale caffeine to your bodyweight in the {ERGOGENIC_MIN_MG_PER_KG}-{ERGOGENIC_MAX_MG_PER_KG}{" "}
          mg/kg range that improves performance, see exactly when to take it, and check how much is
          still circulating at bedtime.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-weight">
              Bodyweight (kg)
            </label>
            <input
              id="cf-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="250"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-level">
              Dose level
            </label>
            <select
              id="cf-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={doseLevel}
              onChange={(event) => setDoseLevel(event.target.value)}
            >
              {DOSE_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
              <option value="custom">Custom mg/kg</option>
            </select>
          </div>
          {doseLevel === "custom" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="cf-custom">
                Custom dose (mg per kg)
              </label>
              <input
                id="cf-custom"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.5"
                max="12"
                step="0.5"
                value={custom}
                onChange={(event) => setCustom(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-form">
              How you are taking it
            </label>
            <select
              id="cf-form"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form}
              onChange={(event) => setForm(event.target.value)}
            >
              {FORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-training">
              Training starts at
            </label>
            <input
              id="cf-training"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={trainingTime}
              onChange={(event) => setTrainingTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-bed">
              Bedtime
            </label>
            <input
              id="cf-bed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={bedTime}
              onChange={(event) => setBedTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-halflife">
              Your caffeine half-life (hours)
            </label>
            <input
              id="cf-halflife"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={HALF_LIFE_HOURS_MIN}
              max={HALF_LIFE_HOURS_MAX}
              step="0.5"
              value={halfLife}
              onChange={(event) => setHalfLife(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              About 5 hours in healthy adults; longer in pregnancy or on oral contraceptives, shorter
              in smokers.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-other">
              Other caffeine already today (mg)
            </label>
            <input
              id="cf-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="2000"
              step="10"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
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
              Your dose
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(`${plan.doseMg} mg`)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {show(`${plan.mgPerKg} mg/kg — take it at ${plan.intakeTime}`)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy caffeine dosing plan"
              className={GHOST_BTN}
              disabled={hasError}
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
            ["Take it", show(`${plan.leadMinutes} minutes before training, at ${plan.intakeTime}`)],
            [
              "Ergogenic range at your weight",
              show(`${plan.ergogenicRangeMg.low}-${plan.ergogenicRangeMg.high} mg`),
            ],
            ["Still circulating at bedtime", show(`${plan.remainingAtBedMg} mg after ${NUM.format(plan.hoursToBed)} h`)],
            [`Drops below ${SLEEP_THRESHOLD_MG} mg at`, show(`${plan.sleepSafeTime} (${NUM.format(plan.hoursToSleepSafe)} h after the dose)`)],
            [
              "Total caffeine today",
              show(`${plan.dailyTotalMg} mg of the ${EFSA_DAILY_LIMIT_MG} mg adult guideline`),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            {plan.formNote} {plan.levelNote}
          </p>
        )}
        {!hasError && plan.overDailyLimit && (
          <p className="mt-2 text-sm font-medium text-[var(--danger)]">
            This puts you over the {EFSA_DAILY_LIMIT_MG} mg per day that EFSA considers of no safety
            concern for healthy adults.
          </p>
        )}
        {!hasError && !plan.overDailyLimit && plan.overSingleDoseGuide && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Above the {EFSA_SINGLE_DOSE_MG} mg single-dose figure EFSA describes as of no concern,
            though still inside the daily {EFSA_DAILY_LIMIT_MG} mg guideline.
          </p>
        )}
        {!hasError && plan.aboveErgogenicRange && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Above {NO_EXTRA_BENEFIT_MG_PER_KG} mg/kg, the evidence shows no further performance gain —
            only more jitteriness, higher heart rate and worse sleep.
          </p>
        )}
        {!hasError && plan.belowErgogenicRange && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Below {ERGOGENIC_MIN_MG_PER_KG} mg/kg. Low doses still help some people, particularly for
            alertness, but the performance evidence is strongest from {ERGOGENIC_MIN_MG_PER_KG} mg/kg
            upwards.
          </p>
        )}
        {!hasError && plan.sleepRisk && (
          <p className="mt-2 text-sm font-medium text-[var(--danger)]">
            About {plan.remainingAtBedMg} mg is still in your system at {plan.bedTime}. Moving the
            dose earlier, or dropping it, is the usual fix if sleep matters more than this session.
          </p>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Caffeine still in you, hour by hour</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Hours after</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Clock</th>
                    <th scope="col" className="py-2 text-right font-semibold">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.decay.map((row) => (
                    <tr key={row.hours} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.hours} h</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.clock}</td>
                      <td className="py-2 text-right font-semibold">{row.mg} mg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Where {plan.doseMg} mg could come from</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Source</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Serving</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Per serving</th>
                    <th scope="col" className="py-2 text-right font-semibold">Servings</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.sources.map((source) => (
                    <tr key={source.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{source.label}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{source.serving}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {source.mgPerServing} mg
                      </td>
                      <td className="py-2 text-right font-semibold">{NUM.format(source.servings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Caffeine sensitivity varies genetically and the figures here are
        population averages. Do not use this if you are pregnant or breastfeeding (the guideline drops
        to 200 mg a day), under 18, or have a heart rhythm disorder, high blood pressure or an anxiety
        disorder without talking to a doctor first.
      </p>
    </main>
  );
}
