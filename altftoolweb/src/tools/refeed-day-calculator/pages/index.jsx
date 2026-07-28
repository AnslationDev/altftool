"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";

import { ACTIVITY_LEVELS, REFEED_LEVELS, planRefeedDay } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
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
  sex: "male",
  age: "30",
  height: "180",
  weight: "80",
  activityKey: "moderate",
  dietDayKcal: "2000",
  refeedKey: "maintenance",
  refeedDays: "1",
  protein: "2",
  fat: "0.6",
  bodyFat: "14",
};

export default function ToolHome() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [age, setAge] = useState(DEFAULTS.age);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [activityKey, setActivityKey] = useState(DEFAULTS.activityKey);
  const [dietDayKcal, setDietDayKcal] = useState(DEFAULTS.dietDayKcal);
  const [refeedKey, setRefeedKey] = useState(DEFAULTS.refeedKey);
  const [refeedDays, setRefeedDays] = useState(DEFAULTS.refeedDays);
  const [protein, setProtein] = useState(DEFAULTS.protein);
  const [fat, setFat] = useState(DEFAULTS.fat);
  const [bodyFat, setBodyFat] = useState(DEFAULTS.bodyFat);
  const [copied, setCopied] = useState(false);

  const bind = (setter) => (event) => {
    setter(event.target.value);
    setCopied(false);
  };

  const plan = useMemo(
    () =>
      planRefeedDay({
        sex,
        age: Number(age),
        heightCm: Number(height),
        weightKg: Number(weight),
        activityKey,
        dietDayKcal: Number(dietDayKcal),
        refeedKey,
        refeedDaysPerWeek: Number(refeedDays),
        proteinGPerKg: Number(protein),
        fatGPerKg: Number(fat),
        bodyFatPercent: Number(bodyFat),
      }),
    [sex, age, height, weight, activityKey, dietDayKcal, refeedKey, refeedDays, protein, fat, bodyFat],
  );

  const failed = Boolean(plan.error);

  const reset = () => {
    setSex(DEFAULTS.sex);
    setAge(DEFAULTS.age);
    setHeight(DEFAULTS.height);
    setWeight(DEFAULTS.weight);
    setActivityKey(DEFAULTS.activityKey);
    setDietDayKcal(DEFAULTS.dietDayKcal);
    setRefeedKey(DEFAULTS.refeedKey);
    setRefeedDays(DEFAULTS.refeedDays);
    setProtein(DEFAULTS.protein);
    setFat(DEFAULTS.fat);
    setBodyFat(DEFAULTS.bodyFat);
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (failed) return "";
    return [
      "Refeed Day Calculator",
      `Maintenance: ${int(plan.maintenance)} kcal/day (BMR ${int(plan.bmr)})`,
      `Refeed day: ${int(plan.refeedKcal)} kcal (${int(plan.refeedFactorPercent)}% of maintenance)`,
      `Refeed macros: ${num(plan.refeed.proteinG)} g protein · ${num(plan.refeed.fatG)} g fat · ${num(plan.refeed.carbG)} g carbs (${num(plan.refeed.carbGPerKg)} g/kg)`,
      `Diet day: ${int(plan.dietDayKcal)} kcal — ${num(plan.dietDay.proteinG)} g protein · ${num(plan.dietDay.fatG)} g fat · ${num(plan.dietDay.carbG)} g carbs`,
      `Extra on the refeed day: +${int(plan.extraKcal)} kcal, +${num(plan.extraCarbG)} g carbs`,
      `Upper-bound temporary scale rise: ${num(plan.waterWeightKg)} kg of glycogen + water`,
      "",
      `Week: ${plan.weekly.dietDays} diet days + ${plan.weekly.refeedDays} refeed day(s)`,
      `Weekly deficit with refeeds: ${int(plan.weekly.deficitWithRefeed)} kcal (${num(plan.weekly.changeWithRefeedKg)} kg)`,
      `Weekly deficit without: ${int(plan.weekly.deficitWithoutRefeed)} kcal (${num(plan.weekly.changeWithoutRefeedKg)} kg)`,
      `Cost of the refeed: ${num(plan.weekly.costKg)} kg per week`,
    ].join("\n");
  }, [failed, plan]);

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
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Diet planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Refeed Day Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A refeed is a planned day at or slightly above maintenance where the extra calories come
          from carbohydrate. This works out the calorie ceiling, the macro split with protein held
          steady and fat pulled to a floor, and what the refeed costs your weekly deficit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-sex">
              Sex (for the BMR equation)
            </label>
            <select id="rf-sex" className={`mt-2 ${INPUT_CLASS}`} value={sex} onChange={bind(setSex)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-age">
              Age (years)
            </label>
            <input id="rf-age" type="number" inputMode="numeric" min="15" max="100" step="1" className={`mt-2 ${INPUT_CLASS}`} value={age} onChange={bind(setAge)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-height">
              Height (cm)
            </label>
            <input id="rf-height" type="number" inputMode="decimal" min="100" max="250" step="1" className={`mt-2 ${INPUT_CLASS}`} value={height} onChange={bind(setHeight)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-weight">
              Body weight (kg)
            </label>
            <input id="rf-weight" type="number" inputMode="decimal" min="30" max="400" step="0.5" className={`mt-2 ${INPUT_CLASS}`} value={weight} onChange={bind(setWeight)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-activity">
              Activity level
            </label>
            <select id="rf-activity" className={`mt-2 ${INPUT_CLASS}`} value={activityKey} onChange={bind(setActivityKey)}>
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.key} value={level.key}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-diet">
              Normal diet-day calories (kcal)
            </label>
            <input id="rf-diet" type="number" inputMode="numeric" min="800" max="6000" step="25" className={`mt-2 ${INPUT_CLASS}`} value={dietDayKcal} onChange={bind(setDietDayKcal)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-level">
              Refeed level
            </label>
            <select id="rf-level" className={`mt-2 ${INPUT_CLASS}`} value={refeedKey} onChange={bind(setRefeedKey)}>
              {REFEED_LEVELS.map((level) => (
                <option key={level.key} value={level.key}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-days">
              Refeed days per week
            </label>
            <select id="rf-days" className={`mt-2 ${INPUT_CLASS}`} value={refeedDays} onChange={bind(setRefeedDays)}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-protein">
              Protein (g per kg body weight)
            </label>
            <input id="rf-protein" type="number" inputMode="decimal" min="0.5" max="4" step="0.1" className={`mt-2 ${INPUT_CLASS}`} value={protein} onChange={bind(setProtein)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-fat">
              Refeed-day fat (g per kg body weight)
            </label>
            <input id="rf-fat" type="number" inputMode="decimal" min="0.2" max="3" step="0.05" className={`mt-2 ${INPUT_CLASS}`} value={fat} onChange={bind(setFat)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-bodyfat">
              Body fat % (optional, for frequency advice)
            </label>
            <input id="rf-bodyfat" type="number" inputMode="decimal" min="0" max="70" step="0.5" className={`mt-2 ${INPUT_CLASS}`} value={bodyFat} onChange={bind(setBodyFat)} />
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Refeed day carbohydrate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${num(plan.refeed.carbG)} g`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see the plan."
                : `${int(plan.refeedKcal)} kcal total — ${num(plan.refeed.carbGPerKg)} g of carbs per kg of body weight`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the refeed day plan" disabled={failed} className={`${GHOST_BTN} disabled:opacity-40`}>
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
            ["Maintenance calories", failed ? DASH : `${int(plan.maintenance)} kcal/day`],
            ["Resting metabolic rate", failed ? DASH : `${int(plan.bmr)} kcal/day`],
            ["Refeed target", failed ? DASH : `${int(plan.refeedKcal)} kcal (${int(plan.refeedFactorPercent)}% of maintenance)`],
            ["Protein (unchanged)", failed ? DASH : `${num(plan.refeed.proteinG)} g`],
            ["Fat (pulled to the floor)", failed ? DASH : `${num(plan.refeed.fatG)} g`],
            ["Extra calories vs a diet day", failed ? DASH : `+${int(plan.extraKcal)} kcal`],
            ["Extra carbohydrate vs a diet day", failed ? DASH : `+${num(plan.extraCarbG)} g`],
            ["Upper-bound scale rise next morning", failed ? DASH : `${num(plan.waterWeightKg)} kg`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Diet day vs refeed day</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Macro</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Diet day</th>
                    <th scope="col" className="py-2 text-right font-semibold">Refeed day</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Calories", `${int(plan.dietDayKcal)} kcal`, `${int(plan.refeedKcal)} kcal`],
                    ["Protein", `${num(plan.dietDay.proteinG)} g`, `${num(plan.refeed.proteinG)} g`],
                    ["Fat", `${num(plan.dietDay.fatG)} g`, `${num(plan.refeed.fatG)} g`],
                    ["Carbohydrate", `${num(plan.dietDay.carbG)} g`, `${num(plan.refeed.carbG)} g`],
                    ["Carbs per kg", `${num(plan.dietDay.carbGPerKg)} g/kg`, `${num(plan.refeed.carbGPerKg)} g/kg`],
                  ].map(([label, dietValue, refeedValue]) => (
                    <tr key={label} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{dietValue}</td>
                      <td className="py-2 text-right font-semibold">{refeedValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What it costs the week</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Week structure", `${plan.weekly.dietDays} diet days + ${plan.weekly.refeedDays} refeed day(s)`],
                ["Weekly maintenance", `${int(plan.weekly.maintenance)} kcal`],
                ["Weekly intake with refeeds", `${int(plan.weekly.withRefeed)} kcal`],
                ["Weekly deficit with refeeds", `${int(plan.weekly.deficitWithRefeed)} kcal`],
                ["Weekly deficit without refeeds", `${int(plan.weekly.deficitWithoutRefeed)} kcal`],
                ["Projected change with refeeds", `${num(plan.weekly.changeWithRefeedKg)} kg/week`],
                ["Projected change without refeeds", `${num(plan.weekly.changeWithoutRefeedKg)} kg/week`],
                ["Cost of the refeed pattern", `${num(plan.weekly.costKg)} kg/week`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {plan.notes.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Notes on this plan</h2>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {plan.notes.map((note) => (
                  <li key={note} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not dietary advice. The scale rise after a refeed is glycogen and its
        bound water, not fat gain, and it clears over the following days. Anyone with diabetes, an
        eating disorder history or a medical condition affecting carbohydrate handling should talk to
        a doctor or registered dietitian before planning refeeds.
      </p>
    </main>
  );
}
