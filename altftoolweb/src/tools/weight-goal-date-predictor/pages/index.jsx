"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import { ACTIVITY_LEVELS, fromKg, predictGoalDate, toMetric } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const int = (value) => (Number.isFinite(value) ? INT.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  units: "metric",
  sex: "male",
  age: "35",
  height: "180",
  currentWeight: "90",
  targetWeight: "80",
  intake: "2000",
  activityKey: "moderate",
  startDate: "2026-08-01",
};

const IMPERIAL_DEFAULTS = {
  height: "71",
  currentWeight: "198",
  targetWeight: "176",
};

export default function ToolHome() {
  const [units, setUnits] = useState(DEFAULTS.units);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [age, setAge] = useState(DEFAULTS.age);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [currentWeight, setCurrentWeight] = useState(DEFAULTS.currentWeight);
  const [targetWeight, setTargetWeight] = useState(DEFAULTS.targetWeight);
  const [intake, setIntake] = useState(DEFAULTS.intake);
  const [activityKey, setActivityKey] = useState(DEFAULTS.activityKey);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [copied, setCopied] = useState(false);

  const weightUnit = units === "imperial" ? "lb" : "kg";
  const heightUnit = units === "imperial" ? "in" : "cm";

  const result = useMemo(() => {
    const current = toMetric({ weight: currentWeight, height, units });
    const target = toMetric({ weight: targetWeight, height, units });
    return predictGoalDate({
      sex,
      age: Number(age),
      heightCm: current.heightCm,
      currentWeightKg: current.weightKg,
      targetWeightKg: target.weightKg,
      dailyIntakeKcal: Number(intake),
      activityKey,
      startDate,
    });
  }, [sex, age, height, currentWeight, targetWeight, intake, activityKey, startDate, units]);

  const failed = Boolean(result.error);

  const switchUnits = (next) => {
    if (next === units) return;
    setUnits(next);
    if (next === "imperial") {
      setHeight(IMPERIAL_DEFAULTS.height);
      setCurrentWeight(IMPERIAL_DEFAULTS.currentWeight);
      setTargetWeight(IMPERIAL_DEFAULTS.targetWeight);
    } else {
      setHeight(DEFAULTS.height);
      setCurrentWeight(DEFAULTS.currentWeight);
      setTargetWeight(DEFAULTS.targetWeight);
    }
    setCopied(false);
  };

  const reset = () => {
    setUnits(DEFAULTS.units);
    setSex(DEFAULTS.sex);
    setAge(DEFAULTS.age);
    setHeight(DEFAULTS.height);
    setCurrentWeight(DEFAULTS.currentWeight);
    setTargetWeight(DEFAULTS.targetWeight);
    setIntake(DEFAULTS.intake);
    setActivityKey(DEFAULTS.activityKey);
    setStartDate(DEFAULTS.startDate);
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (failed) return "";
    return [
      "Weight Goal Date Predictor",
      `Start: ${startDate} at ${currentWeight} ${weightUnit}`,
      `Target: ${targetWeight} ${weightUnit}`,
      `Projected goal date: ${result.goalDate} (${result.days} days, ${result.weeks} weeks)`,
      `Maintenance now: ${int(result.startTdee)} kcal/day (BMR ${int(result.startBmr)})`,
      `Daily balance now: ${result.startBalance > 0 ? "+" : ""}${int(result.startBalance)} kcal`,
      `Maintenance at target: ${int(result.endTdee)} kcal/day`,
      `Average change: ${num(fromKg(result.avgWeeklyChangeKg, units))} ${weightUnit}/week`,
      `BMI ${result.bmiStart} to ${result.bmiEnd}`,
      ...(result.warnings.length ? ["", "Notes:", ...result.warnings.map((w) => `- ${w}`)] : []),
    ].join("\n");
  }, [failed, result, startDate, currentWeight, targetWeight, weightUnit, units]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Weight management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Weight Goal Date Predictor</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimates the date you reach a target weight from your calorie intake. Maintenance is
          recalculated every simulated week with Mifflin-St Jeor, so the projection slows down as you
          get lighter — the way real weight loss actually behaves.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          {[
            ["metric", "Metric (kg / cm)"],
            ["imperial", "Imperial (lb / in)"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={units === key}
              onClick={() => switchUnits(key)}
              className={`min-h-11 rounded-md border px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                units === key
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wgd-sex">
              Sex (for the BMR equation)
            </label>
            <select
              id="wgd-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => {
                setSex(event.target.value);
                setCopied(false);
              }}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wgd-age">
              Age (years)
            </label>
            <input
              id="wgd-age"
              type="number"
              inputMode="numeric"
              min="15"
              max="100"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={age}
              onChange={(event) => {
                setAge(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wgd-height">
              Height ({heightUnit})
            </label>
            <input
              id="wgd-height"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={height}
              onChange={(event) => {
                setHeight(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wgd-activity">
              Activity level
            </label>
            <select
              id="wgd-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activityKey}
              onChange={(event) => {
                setActivityKey(event.target.value);
                setCopied(false);
              }}
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.key} value={level.key}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wgd-current">
              Current weight ({weightUnit})
            </label>
            <input
              id="wgd-current"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currentWeight}
              onChange={(event) => {
                setCurrentWeight(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wgd-target">
              Target weight ({weightUnit})
            </label>
            <input
              id="wgd-target"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={targetWeight}
              onChange={(event) => {
                setTargetWeight(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wgd-intake">
              Average daily intake (kcal)
            </label>
            <input
              id="wgd-intake"
              type="number"
              inputMode="numeric"
              min="500"
              max="8000"
              step="25"
              className={`mt-2 ${INPUT_CLASS}`}
              value={intake}
              onChange={(event) => {
                setIntake(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wgd-start">
              Start date
            </label>
            <input
              id="wgd-start"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setCopied(false);
              }}
            />
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
              Projected goal date
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.goalDate}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Adjust the inputs above to get a projection."
                : `${int(result.days)} days (${num(result.weeks)} weeks) from ${startDate}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the weight goal projection"
              disabled={failed}
              className={`${GHOST_BTN} disabled:opacity-40`}
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
            ["Maintenance calories now", failed ? DASH : `${int(result.startTdee)} kcal/day`],
            ["Resting metabolic rate (BMR)", failed ? DASH : `${int(result.startBmr)} kcal/day`],
            [
              "Daily energy balance",
              failed ? DASH : `${result.startBalance > 0 ? "+" : ""}${int(result.startBalance)} kcal/day`,
            ],
            [
              "Average weekly change",
              failed ? DASH : `${num(fromKg(result.avgWeeklyChangeKg, units))} ${weightUnit}`,
            ],
            [
              "First-week change",
              failed ? DASH : `${num(fromKg(result.firstWeekChangeKg, units))} ${weightUnit}`,
            ],
            ["Maintenance at target weight", failed ? DASH : `${int(result.endTdee)} kcal/day`],
            ["BMI now to BMI at target", failed ? DASH : `${num(result.bmiStart)} → ${num(result.bmiEnd)}`],
            [
              "Weight this intake settles at",
              failed ? DASH : `${num(fromKg(result.plateauKg, units))} ${weightUnit}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Checkpoints along the way</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Week</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Weight</th>
                  <th scope="col" className="py-2 text-right font-semibold">Maintenance</th>
                </tr>
              </thead>
              <tbody>
                {result.milestones.map((row) => (
                  <tr key={`${row.week}-${row.date}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.week}</td>
                    <td className="py-2 pr-3">{row.date}</td>
                    <td className="py-2 pr-3 text-right">
                      {num(fromKg(row.weightKg, units))} {weightUnit}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{int(row.tdee)} kcal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!failed && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Things to check</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Mifflin-St Jeor predicts group averages and can be 10-15% out for
        an individual, and the 7,700 kcal-per-kilogram figure assumes tissue loss is mostly fat. Speak
        to a doctor or registered dietitian before starting a restrictive diet, especially with a
        medical condition, during pregnancy, or under 18.
      </p>
    </main>
  );
}
