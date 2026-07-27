"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Drumstick, RotateCcw } from "lucide-react";

import {
  ACTIVITY_LEVELS,
  EXCLUDED_GROUPS,
  FAT_PCT_DEFAULT,
  GOALS,
  PROTEIN_PER_KG_DEFAULT,
  computePaleoMacros,
} from "../lib";

const G = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const G1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const grams = (value) => (Number.isFinite(value) ? `${G.format(value)} g` : DASH);
const kcal = (value) => (Number.isFinite(value) ? `${G.format(value)} kcal` : DASH);
const pct = (value) => (Number.isFinite(value) ? `${G1.format(value)}%` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sex: "male",
  weight: "85",
  height: "178",
  age: "40",
  activity: "very",
  goal: "maintain",
  proteinPerKg: String(PROTEIN_PER_KG_DEFAULT),
  fatPct: String(FAT_PCT_DEFAULT),
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      computePaleoMacros({
        sex: form.sex,
        weightKg: Number(form.weight),
        heightCm: Number(form.height),
        age: Number(form.age),
        activityId: form.activity,
        goalId: form.goal,
        proteinPerKg: Number(form.proteinPerKg),
        fatPct: Number(form.fatPct),
      }),
    [form],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Paleo Macro Calculator",
      `BMR (Mifflin-St Jeor): ${kcal(result.bmr)}`,
      `TDEE: ${kcal(result.tdee)}`,
      `Daily calories: ${kcal(result.calories)}`,
      `Protein: ${grams(result.protein.grams)} (${pct(result.protein.pct)})`,
      `Fat: ${grams(result.fat.grams)} (${pct(result.fat.pct)})`,
      `Carbohydrate: ${grams(result.carbs.grams)} (${pct(result.carbs.pct)})`,
      `Fibre target: ${grams(result.fibreGrams)}`,
    ].join("\n");
  }, [result, failed]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Drumstick className="h-4 w-4" aria-hidden="true" />
          Paleo diet
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Paleo Macro Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paleo is defined by which foods are in, not by a fixed ratio — so this sets protein from
          body weight, fat as a share of energy, and lets carbohydrate take the rest, then shows what
          those carbs look like in tubers, fruit and vegetables.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About you</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="paleo-sex">
              Sex (for the BMR equation)
            </label>
            <select
              id="paleo-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sex}
              onChange={(event) => setField("sex", event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="paleo-age">
              Age (years)
            </label>
            <input
              id="paleo-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="14"
              max="100"
              step="1"
              value={form.age}
              onChange={(event) => setField("age", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="paleo-weight">
              Weight (kg)
            </label>
            <input
              id="paleo-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="300"
              step="0.5"
              value={form.weight}
              onChange={(event) => setField("weight", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="paleo-height">
              Height (cm)
            </label>
            <input
              id="paleo-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="100"
              max="250"
              step="1"
              value={form.height}
              onChange={(event) => setField("height", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="paleo-activity">
              Activity level
            </label>
            <select
              id="paleo-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.activity}
              onChange={(event) => setField("activity", event.target.value)}
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="paleo-goal">
              Goal
            </label>
            <select
              id="paleo-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.goal}
              onChange={(event) => setField("goal", event.target.value)}
            >
              {GOALS.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="paleo-protein">
              Protein (g per kg of body weight)
            </label>
            <input
              id="paleo-protein"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.8"
              max="2.5"
              step="0.1"
              value={form.proteinPerKg}
              onChange={(event) => setField("proteinPerKg", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="paleo-fat">
              Fat (% of energy)
            </label>
            <input
              id="paleo-fat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="60"
              step="1"
              value={form.fatPct}
              onChange={(event) => setField("fatPct", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              35-45% is the usual paleo range, because the grain and legume calories have to be
              replaced somewhere.
            </p>
          </div>
        </div>
      </section>

      {failed ? (
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
              Daily calorie target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : kcal(result.calories)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `BMR ${kcal(result.bmr)} · TDEE ${kcal(result.tdee)} · ${G1.format(result.weeklyKgChange)} kg/week projected`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy paleo macro targets" className={GHOST_BTN}>
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Protein", failed ? null : result.protein],
            ["Fat", failed ? null : result.fat],
            ["Carbohydrate", failed ? null : result.carbs],
          ].map(([label, macro]) => (
            <div key={label} className="rounded-md border border-[var(--border)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                {macro ? grams(macro.grams) : DASH}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {macro ? `${kcal(macro.kcal)} · ${pct(macro.pct)}` : DASH}
              </p>
            </div>
          ))}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Resting metabolic rate (BMR)", failed ? DASH : kcal(result.bmr)],
            ["Maintenance calories (TDEE)", failed ? DASH : kcal(result.tdee)],
            ["Goal adjustment", failed ? DASH : result.goalLabel],
            ["Activity level used", failed ? DASH : result.activityLabel],
            ["Fibre target (14 g per 1,000 kcal)", failed ? DASH : grams(result.fibreGrams)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.floored ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">
            Your deficit would fall below {kcal(result.floor)} a day, so the target is held at the
            floor. Go no lower without medical supervision.
          </p>
        ) : null}

        {!failed && result.proteinWarning ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Protein is over 35% of your energy. That is a high share to sustain — consider lowering
            the grams per kilogram or raising fat.
          </p>
        ) : null}
      </section>

      {failed ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What the targets look like in food</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            How much of a single source would cover the whole day. A real plate mixes several — this
            is a scale check.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Protein source</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Protein /100 g</th>
                  <th scope="col" className="py-2 text-right font-semibold">Grams for the day</th>
                </tr>
              </thead>
              <tbody>
                {result.proteinPortions.map((source) => (
                  <tr key={source.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{source.label}</td>
                    <td className="py-2 pr-3 text-right">{G1.format(source.proteinPer100g)} g</td>
                    <td className="py-2 text-right font-semibold">
                      {source.gramsForDailyProtein === null ? DASH : grams(source.gramsForDailyProtein)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Carb source</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Carbs /100 g</th>
                  <th scope="col" className="py-2 text-right font-semibold">Grams for the day</th>
                </tr>
              </thead>
              <tbody>
                {result.carbPortions.map((source) => (
                  <tr key={source.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{source.label}</td>
                    <td className="py-2 pr-3 text-right">{G1.format(source.carbsPer100g)} g</td>
                    <td className="py-2 text-right font-semibold">
                      {source.gramsForDailyCarbs === null ? DASH : grams(source.gramsForDailyCarbs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What a strict paleo template excludes</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {EXCLUDED_GROUPS.map(([group, detail]) => (
            <li key={group} className="rounded-md border border-[var(--border)] px-3 py-2">
              <span className="font-semibold">{group}</span>
              <span className="block text-xs text-[var(--muted-foreground)]">{detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical or dietary advice. Removing grains, legumes and dairy takes
        out common sources of calcium, vitamin D and fibre, so review those with a doctor or
        registered dietitian before committing to the template.
      </p>
    </main>
  );
}
