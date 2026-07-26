"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary — desk job, little or no exercise", factor: 1.2 },
  { id: "light", label: "Lightly active — light exercise 1-3 days/week", factor: 1.375 },
  { id: "moderate", label: "Moderately active — exercise 3-5 days/week", factor: 1.55 },
  { id: "very", label: "Very active — hard exercise 6-7 days/week", factor: 1.725 },
  { id: "athlete", label: "Extra active — physical job or 2x daily training", factor: 1.9 },
];

const FORMULAS = [
  { id: "mifflin", label: "Mifflin-St Jeor" },
  { id: "harris", label: "Harris-Benedict (revised)" },
  { id: "katch", label: "Katch-McArdle (needs body fat %)" },
];

const GOALS = [
  { id: "cut-fast", label: "Aggressive fat loss", delta: -1000, note: "about 1 kg / week" },
  { id: "cut", label: "Steady fat loss", delta: -500, note: "about 0.5 kg / week" },
  { id: "cut-mild", label: "Mild fat loss", delta: -250, note: "about 0.25 kg / week" },
  { id: "maintain", label: "Maintain weight", delta: 0, note: "energy balance" },
  { id: "gain-mild", label: "Lean gain", delta: 250, note: "about 0.25 kg / week" },
  { id: "gain", label: "Muscle gain", delta: 500, note: "about 0.5 kg / week" },
];

const DEFAULTS = {
  unit: "metric",
  sex: "male",
  age: "30",
  heightCm: "175",
  heightFt: "5",
  heightIn: "9",
  weightKg: "72",
  weightLb: "160",
  bodyFat: "20",
  activity: "moderate",
  formula: "mifflin",
  goal: "cut",
};

const wholeNumber = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

function toNumber(value) {
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [age, setAge] = useState(DEFAULTS.age);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [weightLb, setWeightLb] = useState(DEFAULTS.weightLb);
  const [bodyFat, setBodyFat] = useState(DEFAULTS.bodyFat);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [formula, setFormula] = useState(DEFAULTS.formula);
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const ageYears = toNumber(age);
    const kg = unit === "metric" ? toNumber(weightKg) : toNumber(weightLb) * 0.45359237;
    const cm =
      unit === "metric"
        ? toNumber(heightCm)
        : (toNumber(heightFt) * 12 + (String(heightIn).trim() === "" ? 0 : toNumber(heightIn))) * 2.54;

    if (!Number.isFinite(ageYears) || ageYears < 10 || ageYears > 100) {
      return { error: "Enter an age between 10 and 100 years." };
    }
    if (!Number.isFinite(cm) || cm < 90 || cm > 250) {
      return { error: "Enter a height between 90 cm and 250 cm (about 3 ft to 8 ft 2 in)." };
    }
    if (!Number.isFinite(kg) || kg < 25 || kg > 300) {
      return { error: "Enter a weight between 25 kg and 300 kg (55 lb to 660 lb)." };
    }

    let bmr;
    let bmrNote;
    if (formula === "katch") {
      const bf = toNumber(bodyFat);
      if (!Number.isFinite(bf) || bf < 3 || bf > 70) {
        return { error: "Katch-McArdle needs a body fat percentage between 3% and 70%." };
      }
      const leanMass = kg * (1 - bf / 100);
      bmr = 370 + 21.6 * leanMass;
      bmrNote = `Katch-McArdle on ${oneDecimal.format(leanMass)} kg lean mass`;
    } else if (formula === "harris") {
      bmr =
        sex === "male"
          ? 88.362 + 13.397 * kg + 4.799 * cm - 5.677 * ageYears
          : 447.593 + 9.247 * kg + 3.098 * cm - 4.33 * ageYears;
      bmrNote = "Revised Harris-Benedict (Roza & Shizgal, 1984)";
    } else {
      bmr = 10 * kg + 6.25 * cm - 5 * ageYears + (sex === "male" ? 5 : -161);
      bmrNote = "Mifflin-St Jeor equation";
    }

    if (!Number.isFinite(bmr) || bmr <= 0) {
      return { error: "Those numbers produce an impossible BMR. Please check your inputs." };
    }

    const level = ACTIVITY_LEVELS.find((item) => item.id === activity) || ACTIVITY_LEVELS[2];
    const tdee = bmr * level.factor;
    const selectedGoal = GOALS.find((item) => item.id === goal) || GOALS[3];
    const rawTarget = tdee + selectedGoal.delta;
    const floor = sex === "male" ? 1500 : 1200;
    const target = Math.max(rawTarget, floor);
    const flooredByMinimum = selectedGoal.delta < 0 && rawTarget < floor;

    return {
      bmr,
      bmrNote,
      tdee,
      factor: level.factor,
      levelLabel: level.label,
      target,
      goalLabel: selectedGoal.label,
      goalNote: selectedGoal.note,
      delta: selectedGoal.delta,
      flooredByMinimum,
      floor,
      kg,
      cm,
      goals: GOALS.map((item) => ({
        ...item,
        calories: Math.max(tdee + item.delta, floor),
      })),
    };
  }, [activity, age, bodyFat, formula, goal, heightCm, heightFt, heightIn, sex, unit, weightKg, weightLb]);

  const reset = () => {
    setUnit(DEFAULTS.unit);
    setSex(DEFAULTS.sex);
    setAge(DEFAULTS.age);
    setHeightCm(DEFAULTS.heightCm);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setWeightKg(DEFAULTS.weightKg);
    setWeightLb(DEFAULTS.weightLb);
    setBodyFat(DEFAULTS.bodyFat);
    setActivity(DEFAULTS.activity);
    setFormula(DEFAULTS.formula);
    setGoal(DEFAULTS.goal);
    setCopied(false);
  };

  const copySummary = async () => {
    if (calc.error) return;
    const text = [
      "TDEE Calculator",
      `BMR: ${wholeNumber.format(Math.round(calc.bmr))} kcal/day (${calc.bmrNote})`,
      `Activity factor: ${calc.factor}`,
      `TDEE (maintenance): ${wholeNumber.format(Math.round(calc.tdee))} kcal/day`,
      `Goal: ${calc.goalLabel} (${calc.goalNote})`,
      `Target intake: ${wholeNumber.format(Math.round(calc.target))} kcal/day`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Flame className="h-4 w-4" aria-hidden="true" />
            Energy expenditure
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">TDEE Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Estimate your basal metabolic rate, multiply it by how active you actually are, and get a daily
            calorie target for fat loss, maintenance or muscle gain.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your details
            </h2>

            <div className="mt-4 grid gap-4">
              <div>
                <span className="text-sm font-semibold" id="unit-label">
                  Units
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-labelledby="unit-label">
                  {[
                    { id: "metric", label: "Metric (kg / cm)" },
                    { id: "imperial", label: "Imperial (lb / ft)" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={unit === option.id}
                      onClick={() => setUnit(option.id)}
                      className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        unit === option.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="tdee-sex" className="text-sm font-semibold">
                    Sex at birth
                  </label>
                  <select
                    id="tdee-sex"
                    value={sex}
                    onChange={(event) => setSex(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="tdee-age" className="text-sm font-semibold">
                    Age (years)
                  </label>
                  <input
                    id="tdee-age"
                    type="number"
                    inputMode="numeric"
                    min="10"
                    max="100"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
              </div>

              {unit === "metric" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tdee-height-cm" className="text-sm font-semibold">
                      Height (cm)
                    </label>
                    <input
                      id="tdee-height-cm"
                      type="number"
                      inputMode="decimal"
                      value={heightCm}
                      onChange={(event) => setHeightCm(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="tdee-weight-kg" className="text-sm font-semibold">
                      Weight (kg)
                    </label>
                    <input
                      id="tdee-weight-kg"
                      type="number"
                      inputMode="decimal"
                      value={weightKg}
                      onChange={(event) => setWeightKg(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-sm font-semibold">Height</span>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="tdee-height-ft" className="sr-only">
                          Height feet
                        </label>
                        <input
                          id="tdee-height-ft"
                          type="number"
                          inputMode="numeric"
                          placeholder="ft"
                          value={heightFt}
                          onChange={(event) => setHeightFt(event.target.value)}
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label htmlFor="tdee-height-in" className="sr-only">
                          Height inches
                        </label>
                        <input
                          id="tdee-height-in"
                          type="number"
                          inputMode="numeric"
                          placeholder="in"
                          value={heightIn}
                          onChange={(event) => setHeightIn(event.target.value)}
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="tdee-weight-lb" className="text-sm font-semibold">
                      Weight (lb)
                    </label>
                    <input
                      id="tdee-weight-lb"
                      type="number"
                      inputMode="decimal"
                      value={weightLb}
                      onChange={(event) => setWeightLb(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="tdee-activity" className="text-sm font-semibold">
                  Activity level
                </label>
                <select
                  id="tdee-activity"
                  value={activity}
                  onChange={(event) => setActivity(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                >
                  {ACTIVITY_LEVELS.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tdee-formula" className="text-sm font-semibold">
                  BMR formula
                </label>
                <select
                  id="tdee-formula"
                  value={formula}
                  onChange={(event) => setFormula(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                >
                  {FORMULAS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {formula === "katch" && (
                <div>
                  <label htmlFor="tdee-bodyfat" className="text-sm font-semibold">
                    Body fat (%)
                  </label>
                  <input
                    id="tdee-bodyfat"
                    type="number"
                    inputMode="decimal"
                    min="3"
                    max="70"
                    value={bodyFat}
                    onChange={(event) => setBodyFat(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
              )}

              <div>
                <label htmlFor="tdee-goal" className="text-sm font-semibold">
                  Goal
                </label>
                <select
                  id="tdee-goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                >
                  {GOALS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} ({item.note})
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" onClick={reset} className={GHOST_BTN_CLASS} aria-label="Reset all inputs">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {calc.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {calc.error}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Daily target — {calc.goalLabel}
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                      {wholeNumber.format(Math.round(calc.target))}
                      <span className="ml-2 text-base font-semibold text-[var(--muted-foreground)]">kcal/day</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copySummary}
                    aria-label="Copy TDEE result to clipboard"
                    className={PRIMARY_BTN_CLASS}
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy result"}
                  </button>
                </div>

                <dl className="mt-5 divide-y divide-[var(--border)] rounded-md ring-1 ring-[var(--border)]">
                  {[
                    ["BMR (at rest)", `${wholeNumber.format(Math.round(calc.bmr))} kcal/day`],
                    ["Activity multiplier", `x ${calc.factor}`],
                    ["TDEE (maintenance)", `${wholeNumber.format(Math.round(calc.tdee))} kcal/day`],
                    [
                      "Goal adjustment",
                      calc.delta === 0
                        ? "No change"
                        : `${calc.delta > 0 ? "+" : "-"}${wholeNumber.format(Math.abs(calc.delta))} kcal/day`,
                    ],
                    ["Weekly change", calc.goalNote],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
                      <dt className="text-[var(--muted-foreground)]">{label}</dt>
                      <dd className="text-right font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>

                {calc.flooredByMinimum && (
                  <p
                    role="alert"
                    className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                  >
                    That deficit would drop you below {wholeNumber.format(calc.floor)} kcal/day, so the target has
                    been raised to the commonly used minimum. Very low intakes should only be done under medical
                    supervision.
                  </p>
                )}

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    All goals at a glance
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {calc.goals.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-md border p-3 ${
                          item.id === goal
                            ? "border-[var(--primary)] bg-[var(--muted)]"
                            : "border-[var(--border)] bg-[var(--background)]"
                        }`}
                      >
                        <p className="text-xs text-[var(--muted-foreground)]">{item.label}</p>
                        <p className="mt-1 font-semibold">
                          {wholeNumber.format(Math.round(item.calories))} kcal
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                  Calculated with the {calc.bmrNote}. TDEE equations are population estimates and can be off by
                  10-15% for any one person — track your weight for two weeks and adjust. This is general
                  information, not medical or dietary advice.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
