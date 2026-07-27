"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sprout } from "lucide-react";

import {
  ACTIVITY_FACTORS,
  FAT_SHARE,
  FLEXITARIAN_LEVELS,
  GOALS,
  LIMITS,
  PROTEIN_PER_OZ_MEAT,
  flexitarianPlan,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const g0 = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} g` : DASH);
const kcal = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} kcal` : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM0.format(v * 100)}%` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sex: "female",
  age: "30",
  weightKg: "65",
  heightCm: "165",
  activity: "moderate",
  goal: "maintain",
  level: "advanced",
  weeklyMeatOz: "18",
  servingOz: "4",
  proteinPerKg: "1.2",
  fatSharePercent: "30",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const chooseLevel = (event) => {
    const level = event.target.value;
    setForm((prev) => ({
      ...prev,
      level,
      weeklyMeatOz: String(FLEXITARIAN_LEVELS[level].maxMeatOzPerWeek),
    }));
    setCopied(false);
  };

  const plan = useMemo(
    () =>
      flexitarianPlan({
        sex: form.sex,
        age: toNumber(form.age),
        weightKg: toNumber(form.weightKg),
        heightCm: toNumber(form.heightCm),
        activity: form.activity,
        goal: form.goal,
        level: form.level,
        weeklyMeatOz: toNumber(form.weeklyMeatOz),
        servingOz: toNumber(form.servingOz),
        proteinPerKg: toNumber(form.proteinPerKg),
        fatShare: toNumber(form.fatSharePercent) / 100,
      }),
    [form],
  );

  const ok = !plan.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Flexitarian Macro Calculator",
      `${plan.levelName} level · ${plan.levelMeatlessDays} meatless`,
      `Daily calories: ${NUM0.format(plan.calories)} kcal`,
      `Protein: ${NUM0.format(plan.proteinGrams)} g (${NUM0.format(plan.plantProteinToEat)} g from plants)`,
      `Carbohydrate: ${NUM0.format(plan.carbGrams)} g`,
      `Fat: ${NUM0.format(plan.fatGrams)} g`,
      `Weekly meat allowance: ${NUM1.format(plan.weeklyMeatOz)} oz (${NUM0.format(plan.weeklyMeatGrams)} g), about ${NUM1.format(plan.meatServingsPerWeek)} servings`,
      `Fibre target: ${NUM0.format(plan.fibreTargetG)} g a day`,
    ].join("\n");
  }, [ok, plan]);

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

  const macroRows = [
    ["Protein to eat", ok ? g0(plan.proteinGrams) : DASH],
    ["…from the meat allowance", ok ? `${g0(plan.meatProteinPerDay)} a day` : DASH],
    ["…from plants (10% uplift applied)", ok ? g0(plan.plantProteinToEat) : DASH],
    ["Carbohydrate", ok ? g0(plan.carbGrams) : DASH],
    ["Fat", ok ? g0(plan.fatGrams) : DASH],
    ["Fibre target (14 g per 1,000 kcal)", ok ? g0(plan.fibreTargetG) : DASH],
    ["Daily calories", ok ? kcal(plan.calories) : DASH],
    ["Maintenance calories (TDEE)", ok ? kcal(plan.tdee) : DASH],
    [
      "Energy split (protein / carb / fat)",
      ok ? `${pct(plan.proteinShare)} / ${pct(plan.carbShare)} / ${pct(plan.fatShare)}` : DASH,
    ],
  ];

  const meatRows = [
    ["Weekly allowance", ok ? `${NUM1.format(plan.weeklyMeatOz)} oz (${NUM0.format(plan.weeklyMeatGrams)} g)` : DASH],
    ["Servings a week", ok ? NUM1.format(plan.meatServingsPerWeek) : DASH],
    ["Meatless days a week", ok ? NUM0.format(plan.meatlessDaysPerWeek) : DASH],
    ["Level this intake matches", ok ? (plan.actualLevelName ?? "Above all three levels") : DASH],
    ["Plant share of protein", ok ? pct(plan.plantShareOfProtein) : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sprout className="h-4 w-4" aria-hidden="true" />
          Plant-first eating
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Flexitarian Macro Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sets daily macros for mostly-plant eating and splits the protein between your weekly meat
          allowance and plant sources, using the Beginner, Advanced and Expert level caps.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-sex">
              Sex (for the BMR equation)
            </label>
            <select id="fx-sex" className={`mt-2 ${INPUT_CLASS}`} value={form.sex} onChange={set("sex")}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-age">
              Age (years)
            </label>
            <input
              id="fx-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.age.min}
              max={LIMITS.age.max}
              step="1"
              value={form.age}
              onChange={set("age")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-weight">
              Weight (kg)
            </label>
            <input
              id="fx-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.weightKg.min}
              max={LIMITS.weightKg.max}
              step="0.5"
              value={form.weightKg}
              onChange={set("weightKg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-height">
              Height (cm)
            </label>
            <input
              id="fx-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.heightCm.min}
              max={LIMITS.heightCm.max}
              step="1"
              value={form.heightCm}
              onChange={set("heightCm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-activity">
              Activity level
            </label>
            <select
              id="fx-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.activity}
              onChange={set("activity")}
            >
              {Object.entries(ACTIVITY_FACTORS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-goal">
              Goal
            </label>
            <select id="fx-goal" className={`mt-2 ${INPUT_CLASS}`} value={form.goal} onChange={set("goal")}>
              {Object.entries(GOALS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-level">
              Flexitarian level
            </label>
            <select id="fx-level" className={`mt-2 ${INPUT_CLASS}`} value={form.level} onChange={chooseLevel}>
              {Object.values(FLEXITARIAN_LEVELS).map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name} — {level.meatlessDays} meatless, ≤{level.maxMeatOzPerWeek} oz
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-meat">
              Meat, poultry and fish (oz per week)
            </label>
            <input
              id="fx-meat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.weeklyMeatOz.min}
              max={LIMITS.weeklyMeatOz.max}
              step="1"
              value={form.weeklyMeatOz}
              onChange={set("weeklyMeatOz")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-serving">
              One serving (oz)
            </label>
            <input
              id="fx-serving"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.servingOz.min}
              max={LIMITS.servingOz.max}
              step="0.5"
              value={form.servingOz}
              onChange={set("servingOz")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-protein">
              Usable protein target (g per kg)
            </label>
            <input
              id="fx-protein"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.proteinPerKg.min}
              max={LIMITS.proteinPerKg.max}
              step="0.1"
              value={form.proteinPerKg}
              onChange={set("proteinPerKg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-fat">
              Fat (% of calories, {Math.round(FAT_SHARE.min * 100)}–{Math.round(FAT_SHARE.max * 100)})
            </label>
            <input
              id="fx-fat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={Math.round(FAT_SHARE.min * 100)}
              max={Math.round(FAT_SHARE.max * 100)}
              step="1"
              value={form.fatSharePercent}
              onChange={set("fatSharePercent")}
            />
          </div>
        </div>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Daily protein target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? g0(plan.proteinGrams) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${plan.levelName} level · ${NUM0.format(plan.calories)} kcal, ${NUM0.format(plan.carbGrams)} g carbs, ${NUM0.format(plan.fatGrams)} g fat`
                : "Fix the highlighted input to see your targets."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy flexitarian macro plan"
              className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
            >
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {macroRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Carbs ${pct(plan.carbShare)}, protein ${pct(plan.proteinShare)}, fat ${pct(plan.fatShare)} of calories`}
            >
              <span className="block h-full bg-[var(--success)]" style={{ width: `${plan.carbShare * 100}%` }} />
              <span className="block h-full bg-[var(--primary)]" style={{ width: `${plan.proteinShare * 100}%` }} />
              <span className="block h-full bg-[var(--danger)]" style={{ width: `${plan.fatShare * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Carbs {pct(plan.carbShare)} · Protein {pct(plan.proteinShare)} · Fat {pct(plan.fatShare)}
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Weekly meat plan</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {meatRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && plan.aboveAllLevels ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {NUM1.format(plan.weeklyMeatOz)} oz a week is above even the Beginner cap of{" "}
            {FLEXITARIAN_LEVELS.beginner.maxMeatOzPerWeek} oz, so this is not a flexitarian pattern
            yet. Drop a serving or two a week to get inside the Beginner level.
          </p>
        ) : ok && plan.aboveChosenLevel ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {NUM1.format(plan.weeklyMeatOz)} oz is above the {plan.levelName} cap of {plan.levelCapOz}{" "}
            oz — this intake actually sits at the {plan.actualLevelName} level.
          </p>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Level
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Meatless
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Meat cap
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.values(FLEXITARIAN_LEVELS).map((level) => (
                <tr
                  key={level.id}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    form.level === level.id ? "font-semibold text-[var(--primary)]" : ""
                  }`}
                >
                  <td className="py-2 pr-3">{level.name}</td>
                  <td className="py-2 pr-3">{level.meatlessDays}</td>
                  <td className="py-2 text-right">{level.maxMeatOzPerWeek} oz/week</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          One ounce of cooked meat, poultry or fish counts as about {PROTEIN_PER_OZ_MEAT} g of
          protein. As the meat share falls, watch vitamin B12 (adult RDA{" "}
          {plan.b12RdaMcg ?? 2.4} µg a day), iron and long-chain omega-3s — fortified foods, dairy,
          eggs or a supplement usually cover the gap.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical or dietetic advice. If you are pregnant, managing a chronic
        condition or planning a large change in how much animal food you eat, run the plan past a
        doctor or registered dietitian.
      </p>
    </main>
  );
}
