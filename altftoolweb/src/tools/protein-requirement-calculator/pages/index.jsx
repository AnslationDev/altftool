"use client";

import { useMemo, useState } from "react";
import { Beef, Check, Copy, RotateCcw } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

// Grams of protein per kg of body mass, widely cited ranges.
const GOALS = [
  {
    id: "rda",
    label: "Sedentary — meet the basic RDA",
    low: 0.8,
    high: 1.0,
    note: "The WHO/US RDA of 0.8 g/kg prevents deficiency in inactive adults.",
  },
  {
    id: "general",
    label: "General fitness — active a few days a week",
    low: 1.0,
    high: 1.4,
    note: "Recreationally active adults typically do well between 1.0 and 1.4 g/kg.",
  },
  {
    id: "endurance",
    label: "Endurance training — running, cycling, swimming",
    low: 1.2,
    high: 1.6,
    note: "Endurance athletes need extra protein for repair and some fuel contribution.",
  },
  {
    id: "muscle",
    label: "Build muscle — resistance training",
    low: 1.6,
    high: 2.2,
    note: "Around 1.6 g/kg is where muscle-gain benefits plateau in most studies; up to 2.2 g/kg adds a safety margin.",
  },
  {
    id: "cut",
    label: "Fat loss — keep muscle in a calorie deficit",
    low: 1.8,
    high: 2.4,
    note: "Higher protein during a deficit helps preserve lean mass and keeps you fuller.",
  },
  {
    id: "older",
    label: "Adult over 65 — protect muscle with age",
    low: 1.2,
    high: 1.5,
    note: "Older adults need more protein per kg to trigger the same muscle-protein response.",
  },
  {
    id: "pregnancy",
    label: "Pregnancy or breastfeeding (informational)",
    low: 1.1,
    high: 1.5,
    note: "Requirements rise in pregnancy and lactation — confirm your target with your doctor or midwife.",
  },
];

const DEFAULTS = {
  unit: "metric",
  weightKg: "70",
  weightLb: "155",
  goal: "muscle",
  useLean: false,
  bodyFat: "22",
  meals: "4",
};

const wholeNumber = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const twoDecimal = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

function toNumber(value) {
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [weightLb, setWeightLb] = useState(DEFAULTS.weightLb);
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [useLean, setUseLean] = useState(DEFAULTS.useLean);
  const [bodyFat, setBodyFat] = useState(DEFAULTS.bodyFat);
  const [meals, setMeals] = useState(DEFAULTS.meals);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const kg = unit === "metric" ? toNumber(weightKg) : toNumber(weightLb) * 0.45359237;
    if (!Number.isFinite(kg) || kg < 25 || kg > 300) {
      return { error: "Enter a body weight between 25 kg and 300 kg (55 lb to 660 lb)." };
    }

    let basis = kg;
    let basisLabel = "total body weight";
    let leanMass = null;
    if (useLean) {
      const bf = toNumber(bodyFat);
      if (!Number.isFinite(bf) || bf < 3 || bf > 70) {
        return { error: "Enter a body fat percentage between 3% and 70%, or switch back to total body weight." };
      }
      leanMass = kg * (1 - bf / 100);
      basis = leanMass;
      basisLabel = "lean body mass";
    }

    const mealCount = Math.round(toNumber(meals));
    if (!Number.isFinite(mealCount) || mealCount < 1 || mealCount > 10) {
      return { error: "Choose between 1 and 10 protein-containing meals per day." };
    }

    const selected = GOALS.find((item) => item.id === goal) || GOALS[1];
    // When working from lean mass the same absolute intake is a higher g/kg figure,
    // so the per-kg band is scaled up by the usual 1.15x convention.
    const scale = useLean ? 1.15 : 1;
    const lowPerKg = selected.low * scale;
    const highPerKg = selected.high * scale;

    const low = basis * lowPerKg;
    const high = basis * highPerKg;
    const midpoint = (low + high) / 2;

    return {
      kg,
      basis,
      basisLabel,
      leanMass,
      lowPerKg,
      highPerKg,
      low,
      high,
      midpoint,
      mealCount,
      perMeal: midpoint / mealCount,
      kcal: midpoint * 4,
      goalLabel: selected.label,
      goalNote: selected.note,
      perMealHigh: high / mealCount,
    };
  }, [bodyFat, goal, meals, unit, useLean, weightKg, weightLb]);

  const reset = () => {
    setUnit(DEFAULTS.unit);
    setWeightKg(DEFAULTS.weightKg);
    setWeightLb(DEFAULTS.weightLb);
    setGoal(DEFAULTS.goal);
    setUseLean(DEFAULTS.useLean);
    setBodyFat(DEFAULTS.bodyFat);
    setMeals(DEFAULTS.meals);
    setCopied(false);
  };

  const copySummary = async () => {
    if (calc.error) return;
    const text = [
      "Protein Requirement Calculator",
      `Goal: ${calc.goalLabel}`,
      `Basis: ${oneDecimal.format(calc.basis)} kg ${calc.basisLabel}`,
      `Range: ${wholeNumber.format(Math.round(calc.low))}-${wholeNumber.format(Math.round(calc.high))} g/day (${twoDecimal.format(calc.lowPerKg)}-${twoDecimal.format(calc.highPerKg)} g/kg)`,
      `Suggested target: ${wholeNumber.format(Math.round(calc.midpoint))} g/day`,
      `Per meal across ${calc.mealCount} meals: ${wholeNumber.format(Math.round(calc.perMeal))} g`,
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
            <Beef className="h-4 w-4" aria-hidden="true" />
            Daily nutrition
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Protein Requirement Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Find how much protein to eat each day based on your body weight, how you train and what you're training
            for — as a sensible range, not a single guess.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your details
            </h2>

            <div className="mt-4 grid gap-4">
              <div>
                <span className="text-sm font-semibold" id="protein-unit-label">
                  Units
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-labelledby="protein-unit-label">
                  {[
                    { id: "metric", label: "Kilograms" },
                    { id: "imperial", label: "Pounds" },
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
                {unit === "metric" ? (
                  <div>
                    <label htmlFor="protein-weight-kg" className="text-sm font-semibold">
                      Body weight (kg)
                    </label>
                    <input
                      id="protein-weight-kg"
                      type="number"
                      inputMode="decimal"
                      value={weightKg}
                      onChange={(event) => setWeightKg(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="protein-weight-lb" className="text-sm font-semibold">
                      Body weight (lb)
                    </label>
                    <input
                      id="protein-weight-lb"
                      type="number"
                      inputMode="decimal"
                      value={weightLb}
                      onChange={(event) => setWeightLb(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="protein-meals" className="text-sm font-semibold">
                    Protein meals per day
                  </label>
                  <input
                    id="protein-meals"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="10"
                    value={meals}
                    onChange={(event) => setMeals(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="protein-goal" className="text-sm font-semibold">
                  Activity and goal
                </label>
                <select
                  id="protein-goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                >
                  {GOALS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <label htmlFor="protein-use-lean" className="flex items-center gap-3 text-sm font-semibold">
                  <input
                    id="protein-use-lean"
                    type="checkbox"
                    checked={useLean}
                    onChange={(event) => setUseLean(event.target.checked)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  Base the target on lean body mass instead
                </label>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  Useful at higher body-fat levels, where total body weight overstates how much tissue actually
                  needs protein.
                </p>
                {useLean && (
                  <div className="mt-3">
                    <label htmlFor="protein-bodyfat" className="text-sm font-semibold">
                      Body fat (%)
                    </label>
                    <input
                      id="protein-bodyfat"
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
                      Suggested daily protein
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                      {wholeNumber.format(Math.round(calc.midpoint))}
                      <span className="ml-2 text-base font-semibold text-[var(--muted-foreground)]">g / day</span>
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Sensible range {wholeNumber.format(Math.round(calc.low))}-
                      {wholeNumber.format(Math.round(calc.high))} g
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copySummary}
                    aria-label="Copy protein target to clipboard"
                    className={PRIMARY_BTN_CLASS}
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy result"}
                  </button>
                </div>

                <dl className="mt-5 divide-y divide-[var(--border)] rounded-md ring-1 ring-[var(--border)]">
                  {[
                    [
                      "Calculation basis",
                      `${oneDecimal.format(calc.basis)} kg ${calc.basisLabel}`,
                    ],
                    [
                      "Per-kilogram band",
                      `${twoDecimal.format(calc.lowPerKg)} - ${twoDecimal.format(calc.highPerKg)} g/kg`,
                    ],
                    [
                      `Per meal (x${calc.mealCount})`,
                      `${wholeNumber.format(Math.round(calc.perMeal))} g`,
                    ],
                    [
                      "Calories from protein",
                      `${wholeNumber.format(Math.round(calc.kcal))} kcal`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
                      <dt className="text-[var(--muted-foreground)]">{label}</dt>
                      <dd className="text-right font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    What that looks like on a plate
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {[
                      ["Chicken breast, cooked", 31],
                      ["Paneer", 18],
                      ["Whole eggs", 12.6],
                      ["Cooked lentils (dal)", 9],
                    ].map(([food, per100g]) => (
                      <div key={food} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">{food}</p>
                        <p className="mt-1 text-sm font-semibold">
                          {wholeNumber.format(Math.round((calc.midpoint / per100g) * 100))} g/day to hit the target
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                  {calc.goalNote} Spreading intake across meals (roughly{" "}
                  {wholeNumber.format(Math.round(calc.perMeal))} g each) supports muscle protein synthesis better
                  than one large serving. This is general information, not medical or dietary advice — people with
                  kidney disease or other conditions should ask their doctor before raising protein intake.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
