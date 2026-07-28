"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Check, Copy, RotateCcw } from "lucide-react";

import { ACTIVITY_LEVELS, DAYS, KCAL_PER_KG_FAT, planFiveTwoWeek } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sex: "female",
  maintenanceMode: "calculate",
  weightKg: "65",
  heightCm: "165",
  age: "32",
  activity: "moderate",
  maintenanceKcal: "2000",
  fastDays: [0, 3],
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [maintenanceMode, setMaintenanceMode] = useState(DEFAULTS.maintenanceMode);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [age, setAge] = useState(DEFAULTS.age);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [maintenanceKcal, setMaintenanceKcal] = useState(DEFAULTS.maintenanceKcal);
  const [fastDays, setFastDays] = useState(DEFAULTS.fastDays);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planFiveTwoWeek({
        sex,
        maintenanceMode,
        weightKg: toNumber(weightKg),
        heightCm: toNumber(heightCm),
        age: toNumber(age),
        activity,
        maintenanceKcal: toNumber(maintenanceKcal),
        fastDayIndexes: fastDays,
      }),
    [sex, maintenanceMode, weightKg, heightCm, age, activity, maintenanceKcal, fastDays],
  );

  const hasError = Boolean(plan.error);
  const dash = "—";

  // Selecting a third day drops the oldest, so there are always exactly two.
  const toggleDay = (index) => {
    setFastDays((current) => {
      if (current.includes(index)) return current;
      return [...current.slice(1), index];
    });
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "5:2 week plan",
      `Restricted days: ${plan.fastDayNames.join(" and ")} at ${plan.fastKcal} kcal`,
      `Normal days: ${plan.normalDays} at about ${NUM0.format(plan.maintenanceRounded)} kcal`,
      "",
      ...plan.schedule.map((day) => `${day.name}: ${NUM0.format(day.kcal)} kcal (${day.label})`),
      "",
      `Weekly intake: ${NUM0.format(plan.weeklyIntake)} kcal`,
      `Weekly maintenance: ${NUM0.format(plan.weeklyMaintenance)} kcal`,
      `Weekly deficit: ${NUM0.format(plan.weeklyDeficit)} kcal`,
      `Projected loss: ${NUM2.format(plan.kgPerWeek)} kg a week`,
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
    setSex(DEFAULTS.sex);
    setMaintenanceMode(DEFAULTS.maintenanceMode);
    setWeightKg(DEFAULTS.weightKg);
    setHeightCm(DEFAULTS.heightCm);
    setAge(DEFAULTS.age);
    setActivity(DEFAULTS.activity);
    setMaintenanceKcal(DEFAULTS.maintenanceKcal);
    setFastDays(DEFAULTS.fastDays);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarRange className="h-4 w-4" aria-hidden="true" />
          Fasting plans
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">5:2 Fasting Week Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose two non-consecutive restricted days at 500 or 600 kcal, keep the other five normal,
          and see the resulting weekly calories, deficit and expected rate of loss.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ft-sex">
              Restricted-day allowance
            </label>
            <select
              id="ft-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="female">Women — 500 kcal</option>
              <option value="male">Men — 600 kcal</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ft-mode">
              Maintenance calories
            </label>
            <select
              id="ft-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={maintenanceMode}
              onChange={(event) => setMaintenanceMode(event.target.value)}
            >
              <option value="calculate">Estimate for me (Mifflin-St Jeor)</option>
              <option value="manual">I know my own figure</option>
            </select>
          </div>

          {maintenanceMode === "manual" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="ft-maintenance">
                Maintenance calories (kcal per day)
              </label>
              <input
                id="ft-maintenance"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="800"
                max="6000"
                step="10"
                value={maintenanceKcal}
                onChange={(event) => setMaintenanceKcal(event.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ft-weight">
                  Weight (kg)
                </label>
                <input
                  id="ft-weight"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="25"
                  max="300"
                  step="0.5"
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ft-height">
                  Height (cm)
                </label>
                <input
                  id="ft-height"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="100"
                  max="250"
                  step="1"
                  value={heightCm}
                  onChange={(event) => setHeightCm(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ft-age">
                  Age (years)
                </label>
                <input
                  id="ft-age"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="18"
                  max="100"
                  step="1"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ft-activity">
                  Activity level
                </label>
                <select
                  id="ft-activity"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={activity}
                  onChange={(event) => setActivity(event.target.value)}
                >
                  {ACTIVITY_LEVELS.map((level) => (
                    <option key={level.key} value={level.key}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Restricted days — pick two, ideally not next to each other
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DAYS.map((day, index) => {
              const selected = fastDays.includes(index);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleDay(index)}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    selected
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Selecting a third day replaces the one you chose first.
          </p>
        </fieldset>
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
              Weekly calorie deficit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${NUM0.format(plan.weeklyDeficit)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `About ${NUM2.format(plan.kgPerWeek)} kg a week at ${NUM0.format(KCAL_PER_KG_FAT)} kcal per kg of fat`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the 5:2 week plan"
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
            ["Restricted days", hasError ? dash : `${plan.fastDayNames.join(" and ")} — ${plan.fastKcal} kcal each`],
            ["Estimated BMR", hasError ? dash : plan.bmr === null ? "Not calculated" : `${NUM0.format(plan.bmr)} kcal`],
            ["Maintenance calories", hasError ? dash : `${NUM0.format(plan.maintenanceRounded)} kcal a day`],
            ["Weekly intake on this plan", hasError ? dash : `${NUM0.format(plan.weeklyIntake)} kcal`],
            ["Weekly maintenance", hasError ? dash : `${NUM0.format(plan.weeklyMaintenance)} kcal`],
            ["Deficit as a share of maintenance", hasError ? dash : `${NUM0.format(plan.deficitAsPct)}%`],
            ["Average across the week", hasError ? dash : `${NUM0.format(plan.averageDailyIntake)} kcal a day`],
            ["Projected loss in 4 weeks", hasError ? dash : `${NUM2.format(plan.kgPerFourWeeks)} kg`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
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
          <h2 className="text-base font-semibold">Your week</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Day</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                  <th scope="col" className="py-2 text-right font-semibold">Calories</th>
                </tr>
              </thead>
              <tbody>
                {plan.schedule.map((day) => (
                  <tr key={day.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{day.name}</td>
                    <td className={`py-2 pr-3 ${day.isFastDay ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
                      {day.label}
                    </td>
                    <td className="py-2 text-right font-semibold">{NUM0.format(day.kcal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Splitting a {plan.fastKcal} kcal day</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {plan.fastDayMeals.map((meal) => (
              <div key={meal.index} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{meal.name}</dt>
                <dd className="text-right font-semibold">{NUM0.format(meal.kcal)} kcal</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            Spend a restricted day&apos;s calories on protein and vegetables rather than on small
            portions of energy-dense food — eggs, dal, curd, fish, chicken, soup and salad give far
            more volume per calorie, which is what makes the day tolerable. Water, black coffee and
            plain tea are unrestricted.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not a substitute for advice from a doctor or registered dietitian.
        Projected loss assumes the five normal days are eaten at maintenance and uses a fixed 7,700
        kcal per kilogram of fat; real results vary and slow as bodyweight falls. Do not follow this
        pattern if you are pregnant or breastfeeding, under 18, underweight, taking insulin or other
        glucose-lowering medication, or living with an eating disorder or a history of one.
      </p>
    </main>
  );
}
