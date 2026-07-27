"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  AMDR,
  DAYS,
  MEAL_SLOTS,
  buildPlanText,
  caloriesFromMacros,
  planWeek,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_MEALS = [
  { id: "m1", day: "Monday", slot: "breakfast", name: "Oats, milk and berries", protein: 20, carbs: 65, fat: 12, servings: 1, ingredients: "80 g oats\n250 ml milk\n100 g berries" },
  { id: "m2", day: "Monday", slot: "lunch", name: "Rajma chawal", protein: 30, carbs: 95, fat: 14, servings: 2, ingredients: "150 g kidney beans\n180 g rice\n1 onion" },
  { id: "m3", day: "Monday", slot: "dinner", name: "Grilled paneer and salad", protein: 38, carbs: 40, fat: 30, servings: 2, ingredients: "200 g paneer\n150 g salad leaves\n1 lemon" },
  { id: "m4", day: "Tuesday", slot: "breakfast", name: "Oats, milk and berries", protein: 20, carbs: 65, fat: 12, servings: 1, ingredients: "80 g oats\n250 ml milk\n100 g berries" },
  { id: "m5", day: "Tuesday", slot: "lunch", name: "Rajma chawal", protein: 30, carbs: 95, fat: 14, servings: 2, ingredients: "150 g kidney beans\n180 g rice\n1 onion" },
  { id: "m6", day: "Tuesday", slot: "dinner", name: "Chickpea curry and roti", protein: 32, carbs: 88, fat: 22, servings: 2, ingredients: "200 g chickpeas\n4 pcs roti\n2 tbsp oil" },
];

const kcalFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [calorieTarget, setCalorieTarget] = useState(2200);
  const [meals, setMeals] = useState(DEFAULT_MEALS);
  const [dayFilter, setDayFilter] = useState("all");
  const [nextId, setNextId] = useState(7);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => planWeek({ meals, calorieTarget: Number(calorieTarget) }),
    [meals, calorieTarget]
  );
  const error = plan.error ?? null;
  const exported = useMemo(() => (error ? { error } : buildPlanText(plan)), [error, plan]);

  const visibleMeals = useMemo(
    () => (dayFilter === "all" ? meals : meals.filter((meal) => meal.day === dayFilter)),
    [meals, dayFilter]
  );

  const updateMeal = (id, patch) => {
    setMeals((previous) => previous.map((meal) => (meal.id === id ? { ...meal, ...patch } : meal)));
  };

  const addMeal = () => {
    const id = `m${nextId}`;
    setMeals((previous) => [
      ...previous,
      {
        id,
        day: dayFilter === "all" ? "Wednesday" : dayFilter,
        slot: "lunch",
        name: "New meal",
        protein: 25,
        carbs: 60,
        fat: 18,
        servings: 1,
        ingredients: "",
      },
    ]);
    setNextId((value) => value + 1);
  };

  const removeMeal = (id) => {
    setMeals((previous) => previous.filter((meal) => meal.id !== id));
  };

  const handleCopy = async () => {
    if (exported.error) return;
    try {
      await navigator.clipboard.writeText(exported.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setCalorieTarget(2200);
    setMeals(DEFAULT_MEALS);
    setDayFilter("all");
    setNextId(7);
    setCopied(false);
  };

  const dash = "—";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">
            Weekly Meal Planner
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Plan seven days of meals, see the calories and macro split each day, and get a
            combined shopping list. Calories come from grams using the Atwater factors.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="calorie-target">
            Daily calorie target (kcal)
          </label>
          <input
            id="calorie-target"
            type="number"
            min="1000"
            max="6000"
            step="50"
            className={`${INPUT_CLASS} mt-1.5`}
            value={calorieTarget}
            onChange={(event) => setCalorieTarget(event.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="day-filter">
            Show day
          </label>
          <select
            id="day-filter"
            className={`${INPUT_CLASS} mt-1.5`}
            value={dayFilter}
            onChange={(event) => setDayFilter(event.target.value)}
          >
            <option value="all">All days</option>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Average day
        </p>
        <p className="mt-1 text-4xl font-bold text-[var(--foreground)]">
          {error ? dash : `${kcalFmt.format(plan.averageKcal)} kcal`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {error
            ? dash
            : `${plan.plannedDayCount} of 7 days planned · target ${kcalFmt.format(plan.target)} kcal`}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Week total</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${kcalFmt.format(plan.weekKcal)} kcal`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Meals planned</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : kcalFmt.format(plan.mealCount)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">
              Protein ({AMDR.protein.min}-{AMDR.protein.max}%)
            </dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${plan.weekPercents.protein}% · ${plan.weekProtein} g`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">
              Carbs ({AMDR.carbs.min}-{AMDR.carbs.max}%)
            </dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${plan.weekPercents.carbs}% · ${plan.weekCarbs} g`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">
              Fat ({AMDR.fat.min}-{AMDR.fat.max}%)
            </dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${plan.weekPercents.fat}% · ${plan.weekFat} g`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Batch-cook candidates</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : plan.batchCandidates.length
                  ? plan.batchCandidates.map((entry) => `${entry.name} ×${entry.count}`).join(", ")
                  : "none"}
            </dd>
          </div>
        </dl>

        {!error && plan.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-4 text-sm text-[var(--danger)]">
            {plan.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {!error ? (
        <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Day by day
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Day</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">kcal</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">P / C / F (g)</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Split</th>
                  <th scope="col" className="py-2 font-semibold">vs target</th>
                </tr>
              </thead>
              <tbody>
                {plan.byDay.map((day) => (
                  <tr key={day.day} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--foreground)]">{day.day}</td>
                    <td className="py-2 pr-3 font-semibold text-[var(--foreground)]">
                      {day.meals.length ? kcalFmt.format(day.kcal) : dash}
                    </td>
                    <td className="py-2 pr-3 text-[var(--foreground)]">
                      {day.meals.length ? `${day.protein} / ${day.carbs} / ${day.fat}` : dash}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {day.meals.length
                        ? `${day.percents.protein}% / ${day.percents.carbs}% / ${day.percents.fat}%`
                        : dash}
                    </td>
                    <td
                      className={`py-2 font-semibold ${
                        day.overTolerance ? "text-[var(--danger)]" : "text-[var(--success)]"
                      }`}
                    >
                      {day.meals.length
                        ? `${day.deltaFromTarget > 0 ? "+" : ""}${kcalFmt.format(day.deltaFromTarget)}`
                        : dash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Meals ({visibleMeals.length})
        </h2>
        <button type="button" className={GHOST_BTN} onClick={addMeal} aria-label="Add a meal">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add meal
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {visibleMeals.map((meal) => (
          <div key={meal.id} className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor={`name-${meal.id}`}>
                  Meal
                </label>
                <input
                  id={`name-${meal.id}`}
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={meal.name}
                  onChange={(event) => updateMeal(meal.id, { name: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`day-${meal.id}`}>
                  Day
                </label>
                <select
                  id={`day-${meal.id}`}
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={meal.day}
                  onChange={(event) => updateMeal(meal.id, { day: event.target.value })}
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`slot-${meal.id}`}>
                  Slot
                </label>
                <select
                  id={`slot-${meal.id}`}
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={meal.slot}
                  onChange={(event) => updateMeal(meal.id, { slot: event.target.value })}
                >
                  {MEAL_SLOTS.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["protein", "Protein (g)"],
                ["carbs", "Carbs (g)"],
                ["fat", "Fat (g)"],
                ["servings", "Portions to cook"],
              ].map(([key, text]) => (
                <div key={key}>
                  <label className={LABEL_CLASS} htmlFor={`${key}-${meal.id}`}>
                    {text}
                  </label>
                  <input
                    id={`${key}-${meal.id}`}
                    type="number"
                    min="0"
                    step={key === "servings" ? "1" : "1"}
                    className={`${INPUT_CLASS} mt-1.5`}
                    value={meal[key]}
                    onChange={(event) => updateMeal(meal.id, { [key]: Number(event.target.value) })}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3">
              <label className={LABEL_CLASS} htmlFor={`ing-${meal.id}`}>
                Ingredients (one per line, e.g. &quot;200 g rice&quot;)
              </label>
              <textarea
                id={`ing-${meal.id}`}
                rows={3}
                className={`${TEXTAREA_CLASS} mt-1.5`}
                value={meal.ingredients}
                onChange={(event) => updateMeal(meal.id, { ingredients: event.target.value })}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[var(--muted-foreground)]">
                {kcalFmt.format(
                  caloriesFromMacros({
                    protein: Number(meal.protein) || 0,
                    carbs: Number(meal.carbs) || 0,
                    fat: Number(meal.fat) || 0,
                  })
                )}{" "}
                kcal per person
              </p>
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() => removeMeal(meal.id)}
                aria-label={`Remove ${meal.name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {!error && plan.shoppingList.length > 0 ? (
        <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Shopping list
          </p>
          <ul className="mt-3 grid gap-1.5 text-sm text-[var(--foreground)] sm:grid-cols-2">
            {plan.shoppingList.map((item) => (
              <li key={`${item.name}-${item.unit}`}>
                {item.quantity === null ? "" : `${item.quantity}${item.unit ? ` ${item.unit}` : ""} `}
                {item.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={handleCopy}
          aria-label="Copy the meal plan and shopping list to clipboard"
          disabled={Boolean(exported.error)}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy plan"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleReset} aria-label="Reset the planner">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Macro percentage ranges are the Institute of Medicine AMDR for adults. This is a
        planning aid, not dietary advice — talk to a dietitian about your own targets.
      </p>
    </div>
  );
}
