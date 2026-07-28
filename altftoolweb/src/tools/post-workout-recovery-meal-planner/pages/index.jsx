"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";

import {
  INTENSITIES,
  LEUCINE_THRESHOLD_G,
  SESSION_TYPES,
  planRecoveryMeal,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULTS = {
  weight: "75",
  sessionType: "strength",
  minutes: "60",
  intensity: "moderate",
  gap: "24",
  age: "30",
  weightLost: "",
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
  const [sessionType, setSessionType] = useState(DEFAULTS.sessionType);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [intensity, setIntensity] = useState(DEFAULTS.intensity);
  const [gap, setGap] = useState(DEFAULTS.gap);
  const [age, setAge] = useState(DEFAULTS.age);
  const [weightLost, setWeightLost] = useState(DEFAULTS.weightLost);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planRecoveryMeal({
        bodyWeightKg: Number(weight),
        sessionType,
        sessionMinutes: Number(minutes),
        intensity,
        hoursToNextSession: Number(gap),
        weightLostKg: weightLost.trim() === "" ? null : Number(weightLost),
        age: Number(age),
      }),
    [weight, sessionType, minutes, intensity, gap, age, weightLost],
  );

  const hasError = Boolean(plan.error);
  const show = (value) => (hasError ? DASH : value);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Post-workout recovery targets",
      `Session: ${plan.sessionTypeLabel}, ${minutes} min, ${plan.intensityLabel}`,
      `Protein: ${plan.proteinG} g (${plan.proteinPerKg} g/kg)`,
      `Carbohydrate: ${plan.carbG} g (${plan.carbPerKg} g/kg)`,
      plan.urgentRefuel
        ? `Carbohydrate over the next ${plan.rapidWindowHours} h: ${plan.carbWindowTotalG} g`
        : "",
      `Fluid: ${plan.fluidMl} ml`,
      `Sodium: ${plan.sodiumMg} mg`,
      `Energy from this feed: ${plan.kcal} kcal`,
      plan.timingNote,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, plan, minutes]);

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
    setSessionType(DEFAULTS.sessionType);
    setMinutes(DEFAULTS.minutes);
    setIntensity(DEFAULTS.intensity);
    setGap(DEFAULTS.gap);
    setAge(DEFAULTS.age);
    setWeightLost(DEFAULTS.weightLost);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Sports nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Post-Workout Recovery Meal Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your bodyweight and what you just did. You get protein, carbohydrate, fluid and
          sodium targets for the recovery window, plus the food portions that actually hit them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-weight">
              Bodyweight (kg)
            </label>
            <input
              id="rm-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="250"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-type">
              Session type
            </label>
            <select
              id="rm-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sessionType}
              onChange={(event) => setSessionType(event.target.value)}
            >
              {SESSION_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-minutes">
              Session length (minutes)
            </label>
            <input
              id="rm-minutes"
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
            <label className={LABEL_CLASS} htmlFor="rm-intensity">
              How hard it felt
            </label>
            <select
              id="rm-intensity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={intensity}
              onChange={(event) => setIntensity(event.target.value)}
            >
              {INTENSITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-gap">
              Hours until your next session
            </label>
            <input
              id="rm-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="168"
              step="1"
              value={gap}
              onChange={(event) => setGap(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-age">
              Age (years)
            </label>
            <input
              id="rm-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rm-lost">
              Bodyweight lost during the session (kg, optional)
            </label>
            <input
              id="rm-lost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="8"
              step="0.1"
              placeholder="Leave blank to estimate from length and intensity"
              value={weightLost}
              onChange={(event) => setWeightLost(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Weigh yourself before and after training, towelled dry, for the most accurate fluid
              target.
            </p>
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
              Protein in this recovery feed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(`${plan.proteinG} g`)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {show(`${plan.proteinPerKg} g per kg bodyweight · ${plan.sessionTypeLabel}`)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy recovery nutrition targets"
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
            ["Carbohydrate in this feed", show(`${plan.carbG} g (${plan.carbPerKg} g/kg)`)],
            [
              "Carbohydrate over the rapid-refuel window",
              hasError
                ? DASH
                : plan.urgentRefuel
                  ? `${plan.carbWindowTotalG} g over ${plan.rapidWindowHours} h`
                  : "Not required — next session is 8+ hours away",
            ],
            ["Carb-to-protein ratio", show(`${plan.carbToProteinRatio} : 1`)],
            [
              "Fluid to drink back",
              show(
                `${NUM.format(plan.fluidMl)} ml (${plan.sweatLossKg} kg lost${plan.sweatEstimated ? ", estimated" : ", measured"})`,
              ),
            ],
            ["Sodium to replace", show(`${NUM.format(plan.sodiumMg)} mg`)],
            [
              "Leucine from whole food",
              show(`${plan.leucineFromMixedFood} g ${plan.leucineThresholdMetWithFood ? "(meets threshold)" : "(below threshold)"}`),
            ],
            [
              "Leucine from a whey shake",
              show(`${plan.leucineFromWhey} g ${plan.leucineThresholdMetWithWhey ? "(meets threshold)" : "(below threshold)"}`),
            ],
            ["Energy from protein + carbs", show(`${NUM.format(plan.kcal)} kcal`)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            {plan.timingNote}
          </p>
        )}
        {!hasError && plan.proteinCapped && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Capped at 40 g — the top of the per-meal band where extra protein stops adding to the
            muscle protein synthesis response.
          </p>
        )}
        {!hasError && plan.proteinFloored && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Raised to the 20 g per-meal floor, which is the smallest dose that reliably stimulates
            muscle protein synthesis in adults.
          </p>
        )}
        {!hasError && !plan.leucineThresholdMetWithFood && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Whole-food protein delivers roughly {LEUCINE_THRESHOLD_G} g of leucine only at higher
            doses — dairy, whey or eggs are leucine-dense options if you want to close the gap.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Portions that hit these targets</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Cooked weights unless stated. Delivered macros include what both foods contribute.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Meal</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Protein source</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Carb source</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Protein</th>
                  <th scope="col" className="py-2 text-right font-semibold">Carbs</th>
                </tr>
              </thead>
              <tbody>
                {plan.meals.map((meal) => (
                  <tr key={meal.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{meal.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{meal.diet}</span>
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {meal.proteinFoodGrams} g {meal.proteinFoodName}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {meal.carbFoodGrams > 0 ? `${meal.carbFoodGrams} g ${meal.carbFoodName}` : "not needed"}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{meal.deliveredProteinG} g</td>
                    <td className="py-2 text-right font-semibold">{meal.deliveredCarbG} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimates based on published sports-nutrition guidance. Individual sweat rates,
        sweat sodium and carbohydrate tolerance vary widely. Speak to a registered sports dietitian
        before making significant changes, especially if you have a medical condition.
      </p>
    </main>
  );
}
