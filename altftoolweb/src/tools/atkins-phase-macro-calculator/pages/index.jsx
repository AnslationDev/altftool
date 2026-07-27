"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Salad } from "lucide-react";

import {
  ACTIVITY_FACTORS,
  ATKINS_PHASES,
  FOUNDATION_VEG_NET_CARBS,
  GOALS,
  LIMITS,
  atkinsPlan,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const g0 = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} g` : DASH);
const kcal = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} kcal` : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM1.format(v * 100)}%` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sex: "male",
  age: "35",
  weightKg: "90",
  heightCm: "178",
  activity: "moderate",
  phase: "induction",
  weeksInPhase: "1",
  goal: "lose",
  proteinPerKg: "1.4",
  maintenanceCarbs: "90",
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

  const plan = useMemo(
    () =>
      atkinsPlan({
        sex: form.sex,
        age: toNumber(form.age),
        weightKg: toNumber(form.weightKg),
        heightCm: toNumber(form.heightCm),
        activity: form.activity,
        phase: form.phase,
        weeksInPhase: toNumber(form.weeksInPhase),
        goal: form.goal,
        proteinPerKg: toNumber(form.proteinPerKg),
        maintenanceCarbs: toNumber(form.maintenanceCarbs),
      }),
    [form],
  );

  const ok = !plan.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Atkins Phase Macro Calculator",
      plan.phaseName,
      `Daily calories: ${NUM0.format(plan.calories)} kcal`,
      `Net carbs: ${NUM0.format(plan.netCarbs)} g (${NUM0.format(plan.foundationVeg.min)}-${NUM0.format(plan.foundationVeg.max)} g from foundation vegetables)`,
      `Protein: ${NUM0.format(plan.proteinGrams)} g`,
      `Fat: ${NUM0.format(plan.fatGrams)} g`,
      `Estimated BMR: ${NUM0.format(plan.bmr)} kcal, maintenance: ${NUM0.format(plan.tdee)} kcal`,
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

  const rows = [
    ["Net carbs (Atkins counts net, not total)", ok ? g0(plan.netCarbs) : DASH],
    [
      "…from foundation vegetables",
      ok ? `${NUM0.format(plan.foundationVeg.min)}–${NUM0.format(plan.foundationVeg.max)} g` : DASH,
    ],
    ["Protein", ok ? g0(plan.proteinGrams) : DASH],
    ["Fat", ok ? g0(plan.fatGrams) : DASH],
    ["Daily calories", ok ? kcal(plan.calories) : DASH],
    ["Estimated BMR (Mifflin-St Jeor)", ok ? kcal(plan.bmr) : DASH],
    ["Maintenance calories (TDEE)", ok ? kcal(plan.tdee) : DASH],
    [
      "Energy split (carb / protein / fat)",
      ok ? `${pct(plan.carbShare)} / ${pct(plan.proteinShare)} / ${pct(plan.fatShare)}` : DASH,
    ],
    [
      "Next week's carb allowance",
      ok ? (plan.atCeiling ? "Unchanged — phase ceiling reached" : g0(plan.nextWeekCarbs)) : DASH,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Salad className="h-4 w-4" aria-hidden="true" />
          Low-carb macros
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Atkins Phase Macro Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Find the daily net carb allowance for the Atkins phase you are in, then the protein and
          fat that fill the rest of your calories. Energy is estimated with the Mifflin-St Jeor
          equation.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="atk-sex">
              Sex (for the BMR equation)
            </label>
            <select id="atk-sex" className={`mt-2 ${INPUT_CLASS}`} value={form.sex} onChange={set("sex")}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="atk-age">
              Age (years)
            </label>
            <input
              id="atk-age"
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
            <label className={LABEL_CLASS} htmlFor="atk-weight">
              Weight (kg)
            </label>
            <input
              id="atk-weight"
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
            <label className={LABEL_CLASS} htmlFor="atk-height">
              Height (cm)
            </label>
            <input
              id="atk-height"
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
            <label className={LABEL_CLASS} htmlFor="atk-activity">
              Activity level
            </label>
            <select
              id="atk-activity"
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
            <label className={LABEL_CLASS} htmlFor="atk-goal">
              Goal
            </label>
            <select id="atk-goal" className={`mt-2 ${INPUT_CLASS}`} value={form.goal} onChange={set("goal")}>
              {Object.entries(GOALS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="atk-phase">
              Atkins phase
            </label>
            <select
              id="atk-phase"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.phase}
              onChange={set("phase")}
            >
              {Object.values(ATKINS_PHASES).map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.name}
                </option>
              ))}
            </select>
          </div>
          {form.phase === "maintenance" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="atk-tolerance">
                Your carb tolerance (g net carbs/day)
              </label>
              <input
                id="atk-tolerance"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={LIMITS.maintenanceCarbs.min}
                max={LIMITS.maintenanceCarbs.max}
                step="5"
                value={form.maintenanceCarbs}
                onChange={set("maintenanceCarbs")}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="atk-weeks">
                Week number in this phase
              </label>
              <input
                id="atk-weeks"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={LIMITS.weeks.min}
                max={LIMITS.weeks.max}
                step="1"
                value={form.weeksInPhase}
                onChange={set("weeksInPhase")}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="atk-protein">
              Protein (g per kg body weight)
            </label>
            <input
              id="atk-protein"
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
              Daily net carb allowance
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? g0(plan.netCarbs) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? plan.phaseSummary : "Fix the highlighted input to see your targets."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy Atkins macro result"
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
          {rows.map(([label, value]) => (
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
              aria-label={`Fat ${pct(plan.fatShare)}, protein ${pct(plan.proteinShare)}, carbs ${pct(plan.carbShare)} of calories`}
            >
              <span className="block h-full bg-[var(--primary)]" style={{ width: `${plan.fatShare * 100}%` }} />
              <span className="block h-full bg-[var(--success)]" style={{ width: `${plan.proteinShare * 100}%` }} />
              <span className="block h-full bg-[var(--danger)]" style={{ width: `${plan.carbShare * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Fat {pct(plan.fatShare)} · Protein {pct(plan.proteinShare)} · Carbs {pct(plan.carbShare)}
            </p>
          </div>
        ) : null}

        {ok && plan.lowFatWarning ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            Fat is under 20% of calories at this protein level, which is very hard to eat on a
            low-carb plan. Reduce protein per kg or raise the calorie target.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The Atkins carb ladder</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Phase
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Start
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Weekly step
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Ceiling
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.values(ATKINS_PHASES).map((phase) => (
                <tr
                  key={phase.id}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    form.phase === phase.id ? "font-semibold text-[var(--primary)]" : ""
                  }`}
                >
                  <td className="py-2 pr-3">{phase.name}</td>
                  <td className="py-2 pr-3 text-right">{phase.start} g</td>
                  <td className="py-2 pr-3 text-right">
                    {phase.stepPerWeek > 0 ? `+${phase.stepPerWeek} g` : "—"}
                  </td>
                  <td className="py-2 text-right">{phase.ceiling} g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Net carbs = total carbohydrate − fibre − sugar alcohols. In every phase Atkins asks for{" "}
          {FOUNDATION_VEG_NET_CARBS.min}–{FOUNDATION_VEG_NET_CARBS.max} g of the daily allowance to
          come from foundation vegetables such as spinach, broccoli, cauliflower and salad leaves.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Very-low-carbohydrate eating changes fluid balance
        and can interact with insulin, sulfonylureas and SGLT2 inhibitors — talk to your doctor or a
        registered dietitian before starting, especially if you are pregnant or have kidney, liver
        or heart disease.
      </p>
    </main>
  );
}
