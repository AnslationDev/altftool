"use client";

import { useMemo, useState } from "react";
import { Bandage, Check, Copy, RotateCcw } from "lucide-react";

import {
  ENERGY_KCAL_PER_KG_MAX,
  ENERGY_KCAL_PER_KG_MIN,
  MAX_MEALS,
  MIN_MEALS,
  SURGERY_TYPES,
  computePostSurgeryProtein,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const grams = (v) => (Number.isFinite(v) ? `${NUM.format(v)} g` : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  weightKg: "70",
  heightCm: "170",
  sex: "male",
  ageYears: "55",
  surgeryType: "major",
  meals: "5",
  currentProteinG: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [surgeryType, setSurgeryType] = useState(DEFAULTS.surgeryType);
  const [meals, setMeals] = useState(DEFAULTS.meals);
  const [currentProteinG, setCurrentProteinG] = useState(DEFAULTS.currentProteinG);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePostSurgeryProtein({
        weightKg: weightKg === "" ? NaN : Number(weightKg),
        heightCm: heightCm === "" ? NaN : Number(heightCm),
        sex,
        ageYears: ageYears === "" ? NaN : Number(ageYears),
        surgeryType,
        meals: meals === "" ? NaN : Number(meals),
        currentProteinG: currentProteinG === "" ? null : Number(currentProteinG),
      }),
    [weightKg, heightCm, sex, ageYears, surgeryType, meals, currentProteinG],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Post-Surgery Protein Calculator (informational)",
      `Weight ${num1(result.weightKg)} kg, height ${num1(result.heightCm)} cm, BMI ${num1(result.bmi)}`,
      `Reference weight: ${num1(result.referenceKg)} kg (${result.referenceLabel})`,
      `Recovery stage: ${result.surgeryLabel}`,
      `Protein estimate: ${NUM.format(result.proteinTarget)} g/day at ${num2(result.gPerKg)} g/kg`,
      `Guideline band: ${NUM.format(result.proteinLow)}-${NUM.format(result.proteinHigh)} g/day`,
      `Energy estimate: ${NUM.format(result.energyMin)}-${NUM.format(result.energyMax)} kcal/day`,
      `Split across ${result.meals} meals: about ${NUM.format(result.perMeal)} g each`,
      "Discuss these figures with your surgical team or dietitian before acting on them.",
    ].join("\n");
  }, [hasError, result]);

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
    setWeightKg(DEFAULTS.weightKg);
    setHeightCm(DEFAULTS.heightCm);
    setSex(DEFAULTS.sex);
    setAgeYears(DEFAULTS.ageYears);
    setSurgeryType(DEFAULTS.surgeryType);
    setMeals(DEFAULTS.meals);
    setCurrentProteinG(DEFAULTS.currentProteinG);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bandage className="h-4 w-4" aria-hidden="true" />
          Recovery nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Post-Surgery Protein Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An informational estimate of recovery-phase protein and energy, built from the ESPEN
          surgical guideline bands. It shows the numbers a dietitian would start from — it is not a
          prescription.
        </p>
      </header>

      <p className="mb-6 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
        Your surgical team may set a different target, especially after bowel, kidney, liver or
        bariatric surgery, or if you are on dialysis or fluid restriction. Always follow the plan
        they give you over anything shown here.
      </p>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-weight">
              Usual weight before surgery (kg)
            </label>
            <input
              id="ps-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="300"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-height">
              Height (cm)
            </label>
            <input
              id="ps-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="120"
              max="230"
              step="0.5"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-sex">
              Sex (for the ideal-weight formula)
            </label>
            <select
              id="ps-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-age">
              Age (years)
            </label>
            <input
              id="ps-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="16"
              max="110"
              step="1"
              value={ageYears}
              onChange={(event) => setAgeYears(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ps-type">
              Type of surgery and recovery
            </label>
            <select
              id="ps-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={surgeryType}
              onChange={(event) => setSurgeryType(event.target.value)}
            >
              {SURGERY_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-meals">
              Meals and supplements per day
            </label>
            <input
              id="ps-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_MEALS}
              max={MAX_MEALS}
              step="1"
              value={meals}
              onChange={(event) => setMeals(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-current">
              Protein eaten so far today (g, optional)
            </label>
            <input
              id="ps-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="400"
              step="1"
              placeholder="e.g. 45"
              value={currentProteinG}
              onChange={(event) => setCurrentProteinG(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Daily protein estimate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : grams(result.proteinTarget)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the estimate."
                : `Guideline band ${NUM.format(result.proteinLow)}–${NUM.format(result.proteinHigh)} g per day`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy recovery protein estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Rate applied", hasError ? DASH : `${num2(result.gPerKg)} g/kg per day`],
            [
              "Reference weight",
              hasError ? DASH : `${num1(result.referenceKg)} kg (${result.referenceLabel})`,
            ],
            ["BMI", hasError ? DASH : num1(result.bmi)],
            ["Ideal body weight (Devine)", hasError ? DASH : `${num1(result.ibwKg)} kg`],
            [
              `Energy estimate (${NUM.format(ENERGY_KCAL_PER_KG_MIN)}–${NUM.format(ENERGY_KCAL_PER_KG_MAX)} kcal/kg)`,
              hasError
                ? DASH
                : `${NUM.format(result.energyMin)}–${NUM.format(result.energyMax)} kcal/day`,
            ],
            [
              "Of which protein supplies",
              hasError ? DASH : `${NUM.format(result.proteinKcal)} kcal`,
            ],
            [
              "Protein per meal",
              hasError ? DASH : `${grams(result.perMeal)} across ${NUM.format(result.meals)} servings`,
            ],
            [
              "Eaten so far today",
              hasError || result.currentProteinG === null
                ? DASH
                : `${grams(result.currentProteinG)} (${NUM.format(result.percentOfTarget)}% of target)`,
            ],
            [
              "Still to eat today",
              hasError || result.shortfall === null ? DASH : grams(result.shortfall),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.surgerySource}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-4 grid gap-2">
          {result.notes.map((note) => (
            <p
              key={note}
              className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Guideline bands used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Recovery stage
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Band (g/kg)
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Used here
                </th>
              </tr>
            </thead>
            <tbody>
              {SURGERY_TYPES.map((type) => (
                <tr key={type.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{type.label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">
                    {num2(type.low)}–{num2(type.high)}
                  </td>
                  <td className="py-2 text-right">
                    {!hasError && result.surgeryTypeId === type.id ? (
                      <span className="font-semibold text-[var(--primary)]">Selected</span>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not medical advice. These figures come from published guideline
        ranges for adults and do not account for kidney or liver impairment, fluid restriction,
        diabetes, tube feeding or drug interactions. Ask your surgeon, ward nurse or dietitian what
        your own target should be, and seek medical help if you cannot eat, are losing weight
        rapidly, or the wound is not healing.
      </p>
    </main>
  );
}
