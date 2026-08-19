"use client";

import { useMemo, useState } from "react";
import { Check, ChartPie, Copy, RotateCcw } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

// kcal per gram
const KCAL = { protein: 4, carbs: 4, fat: 9 };

const SPLITS = [
  { id: "balanced", label: "Balanced (30P / 40C / 30F)", protein: 30, carbs: 40, fat: 30 },
  { id: "high-protein", label: "High protein (40P / 35C / 25F)", protein: 40, carbs: 35, fat: 25 },
  { id: "low-carb", label: "Low carb (35P / 20C / 45F)", protein: 35, carbs: 20, fat: 45 },
  { id: "keto", label: "Ketogenic (25P / 5C / 70F)", protein: 25, carbs: 5, fat: 70 },
  { id: "endurance", label: "Endurance / high carb (20P / 60C / 20F)", protein: 20, carbs: 60, fat: 20 },
  { id: "custom", label: "Custom split", protein: 30, carbs: 40, fat: 30 },
];

const DEFAULTS = {
  calories: "2200",
  splitId: "balanced",
  customProtein: "30",
  customCarbs: "40",
  customFat: "30",
  meals: "4",
};

const wholeNumber = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

function toNumber(value) {
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export default function ToolHome() {
  const [calories, setCalories] = useState(DEFAULTS.calories);
  const [splitId, setSplitId] = useState(DEFAULTS.splitId);
  const [customProtein, setCustomProtein] = useState(DEFAULTS.customProtein);
  const [customCarbs, setCustomCarbs] = useState(DEFAULTS.customCarbs);
  const [customFat, setCustomFat] = useState(DEFAULTS.customFat);
  const [meals, setMeals] = useState(DEFAULTS.meals);
  const [copied, setCopied] = useState(false);

  const isCustom = splitId === "custom";

  const calc = useMemo(() => {
    const kcal = toNumber(calories);
    if (!Number.isFinite(kcal) || kcal < 800 || kcal > 8000) {
      return { error: "Enter a daily calorie target between 800 and 8,000 kcal." };
    }

    const preset = SPLITS.find((item) => item.id === splitId) || SPLITS[0];
    let pPct = preset.protein;
    let cPct = preset.carbs;
    let fPct = preset.fat;

    if (isCustom) {
      pPct = toNumber(customProtein);
      cPct = toNumber(customCarbs);
      fPct = toNumber(customFat);
      if (![pPct, cPct, fPct].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) {
        return { error: "Each custom percentage must be a number between 0 and 100." };
      }
      const total = pPct + cPct + fPct;
      if (Math.abs(total - 100) > 0.51) {
        return {
          error: `Your custom split adds up to ${oneDecimal.format(total)}%. Adjust the three values so they total 100%.`,
        };
      }
    }

    const mealCount = Math.round(toNumber(meals));
    if (!Number.isFinite(mealCount) || mealCount < 1 || mealCount > 10) {
      return { error: "Choose between 1 and 10 meals per day." };
    }

    const rows = [
      { key: "protein", label: "Protein", pct: pPct, kcalPerGram: KCAL.protein },
      { key: "carbs", label: "Carbohydrate", pct: cPct, kcalPerGram: KCAL.carbs },
      { key: "fat", label: "Fat", pct: fPct, kcalPerGram: KCAL.fat },
    ].map((row) => {
      const kcalFromMacro = (kcal * row.pct) / 100;
      const grams = kcalFromMacro / row.kcalPerGram;
      return {
        ...row,
        kcal: kcalFromMacro,
        grams,
        perMeal: grams / mealCount,
      };
    });

    return {
      kcal,
      mealCount,
      rows,
      splitLabel: isCustom ? "Custom split" : preset.label,
      pPct,
      cPct,
      fPct,
      kcalPerMeal: kcal / mealCount,
    };
  }, [calories, customCarbs, customFat, customProtein, isCustom, meals, splitId]);

  const reset = () => {
    setCalories(DEFAULTS.calories);
    setSplitId(DEFAULTS.splitId);
    setCustomProtein(DEFAULTS.customProtein);
    setCustomCarbs(DEFAULTS.customCarbs);
    setCustomFat(DEFAULTS.customFat);
    setMeals(DEFAULTS.meals);
    setCopied(false);
  };

  const applyPresetToCustom = () => {
    const preset = SPLITS.find((item) => item.id === splitId) || SPLITS[0];
    setCustomProtein(String(preset.protein));
    setCustomCarbs(String(preset.carbs));
    setCustomFat(String(preset.fat));
    setSplitId("custom");
  };

  const copySummary = async () => {
    if (calc.error) return;
    const text = [
      "Macro Split Calculator",
      `Daily calories: ${wholeNumber.format(Math.round(calc.kcal))} kcal`,
      `Split: ${calc.splitLabel}`,
      ...calc.rows.map(
        (row) =>
          `${row.label}: ${wholeNumber.format(Math.round(row.grams))} g (${oneDecimal.format(row.pct)}%, ${wholeNumber.format(Math.round(row.kcal))} kcal)`
      ),
      `Meals per day: ${calc.mealCount}`,
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
            <ChartPie className="h-4 w-4" aria-hidden="true" />
            Nutrition planning
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Macro Split Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert a daily calorie target into grams of protein, carbohydrate and fat. Pick a ready-made split or
            enter your own percentages, then see the per-meal amounts.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your targets
            </h2>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="macro-calories" className="text-sm font-semibold">
                    Daily calories (kcal)
                  </label>
                  <input
                    id="macro-calories"
                    type="number"
                    inputMode="numeric"
                    min="800"
                    max="8000"
                    value={calories}
                    onChange={(event) => setCalories(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="macro-meals" className="text-sm font-semibold">
                    Meals per day
                  </label>
                  <input
                    id="macro-meals"
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
                <label htmlFor="macro-split" className="text-sm font-semibold">
                  Diet split
                </label>
                <select
                  id="macro-split"
                  value={splitId}
                  onChange={(event) => setSplitId(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                >
                  {SPLITS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {isCustom ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="macro-custom-p" className="text-sm font-semibold">
                      Protein %
                    </label>
                    <input
                      id="macro-custom-p"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="100"
                      value={customProtein}
                      onChange={(event) => setCustomProtein(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="macro-custom-c" className="text-sm font-semibold">
                      Carb %
                    </label>
                    <input
                      id="macro-custom-c"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="100"
                      value={customCarbs}
                      onChange={(event) => setCustomCarbs(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="macro-custom-f" className="text-sm font-semibold">
                      Fat %
                    </label>
                    <input
                      id="macro-custom-f"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="100"
                      value={customFat}
                      onChange={(event) => setCustomFat(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                </div>
              ) : (
                <button type="button" onClick={applyPresetToCustom} className={GHOST_BTN_CLASS}>
                  Fine-tune these percentages
                </button>
              )}

              <button type="button" onClick={reset} className={GHOST_BTN_CLASS} aria-label="Reset all inputs">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </section>

          <section
            className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            aria-live="polite"
            role="status"
          >
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
                      Protein target
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                      {wholeNumber.format(Math.round(calc.rows[0].grams))}
                      <span className="ml-2 text-base font-semibold text-[var(--muted-foreground)]">g / day</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copySummary}
                    aria-label="Copy macro split result to clipboard"
                    className={PRIMARY_BTN_CLASS}
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy result"}
                  </button>
                </div>

                <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]" aria-hidden="true">
                  <div className="h-full bg-[var(--primary)]" style={{ width: `${calc.pPct}%` }} />
                  <div className="h-full bg-[var(--primary)]/55" style={{ width: `${calc.cPct}%` }} />
                  <div className="h-full bg-[var(--primary)]/25" style={{ width: `${calc.fPct}%` }} />
                </div>

                <dl className="mt-4 divide-y divide-[var(--border)] rounded-md ring-1 ring-[var(--border)]">
                  {calc.rows.map((row) => (
                    <div key={row.key} className="flex items-center justify-between gap-4 px-3 py-3">
                      <dt className="text-sm">
                        <span className="font-semibold">{row.label}</span>
                        <span className="ml-2 text-[var(--muted-foreground)]">
                          {oneDecimal.format(row.pct)}% &middot; {row.kcalPerGram} kcal/g
                        </span>
                      </dt>
                      <dd className="text-right text-sm font-semibold">
                        {wholeNumber.format(Math.round(row.grams))} g
                        <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                          {wholeNumber.format(Math.round(row.kcal))} kcal
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Per meal ({calc.mealCount} meals &middot; {wholeNumber.format(Math.round(calc.kcalPerMeal))} kcal each)
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {calc.rows.map((row) => (
                      <div key={row.key} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">{row.label}</p>
                        <p className="mt-1 font-semibold">{wholeNumber.format(Math.round(row.perMeal))} g</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                  Grams are derived using 4 kcal per gram for protein and carbohydrate and 9 kcal per gram for fat,
                  so rounded totals may differ from your calorie target by a few kcal. This is general
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
