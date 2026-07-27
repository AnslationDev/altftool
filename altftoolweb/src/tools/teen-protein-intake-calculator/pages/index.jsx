"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ruler, RotateCcw } from "lucide-react";

import { ACTIVITY_LEVELS, SPORT_LEVELS, teenProteinTarget } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const g0 = (value) => `${NUM0.format(value)} g`;
const g1 = (value) => `${NUM1.format(value)} g`;
const pct = (fraction) => `${NUM1.format(fraction * 100)}%`;

const DASH = "—";

const DEFAULTS = {
  sex: "male",
  age: "15",
  weightKg: "55",
  heightCm: "165",
  activity: "active",
  sport: "recreational",
  mealsPerDay: "4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const NOTE_CLASS =
  "mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [age, setAge] = useState(DEFAULTS.age);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [sport, setSport] = useState(DEFAULTS.sport);
  const [mealsPerDay, setMealsPerDay] = useState(DEFAULTS.mealsPerDay);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      teenProteinTarget({
        sex,
        age: toNumber(age),
        weightKg: toNumber(weightKg),
        heightCm: toNumber(heightCm),
        activity,
        sport,
        mealsPerDay: toNumber(mealsPerDay),
      }),
    [sex, age, weightKg, heightCm, activity, sport, mealsPerDay],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Teen Protein Intake Calculator",
      `Recommended: ${g0(result.recommendedGrams)} of protein a day`,
      `Range: ${g0(result.minGrams)} to ${g0(result.maxGrams)} (${result.minPerKg}-${result.maxPerKg} g/kg)`,
      `Age-band RDA (${result.bandLabel}): ${g0(result.rdaGrams)} at ${result.rdaPerKg} g/kg`,
      `Estimated energy need: ${NUM0.format(result.energyKcal)} kcal a day`,
      `Protein as a share of energy: ${pct(result.proteinShareOfEnergy)} (AMDR 10-30%)`,
      `Per meal across ${result.mealsPerDay}: ${g0(result.perMealGrams)}`,
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
    setSex(DEFAULTS.sex);
    setAge(DEFAULTS.age);
    setWeightKg(DEFAULTS.weightKg);
    setHeightCm(DEFAULTS.heightCm);
    setActivity(DEFAULTS.activity);
    setSport(DEFAULTS.sport);
    setMealsPerDay(DEFAULTS.mealsPerDay);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Daily range", DASH],
        ["Protein per kg", DASH],
        ["Age-band RDA", DASH],
        ["Age-band EAR (average requirement)", DASH],
        ["Extra above the RDA", DASH],
        ["Estimated energy need", DASH],
        ["Protein as a share of energy", DASH],
        ["AMDR window in grams (10-30% of energy)", DASH],
        ["Per meal", DASH],
        ["Useful minimum per meal (0.25 g/kg)", DASH],
      ]
    : [
        ["Daily range", `${g0(result.minGrams)} to ${g0(result.maxGrams)}`],
        ["Protein per kg", `${result.minPerKg} to ${result.maxPerKg} g/kg`],
        ["Age-band RDA", `${g0(result.rdaGrams)} · ${result.rdaPerKg} g/kg (${result.bandLabel})`],
        ["Age-band EAR (average requirement)", `${g0(result.earGrams)} · ${result.earPerKg} g/kg`],
        ["Extra above the RDA", g0(result.extraOverRdaGrams)],
        ["Estimated energy need", `${NUM0.format(result.energyKcal)} kcal`],
        ["Protein as a share of energy", pct(result.proteinShareOfEnergy)],
        [
          "AMDR window in grams (10-30% of energy)",
          `${g0(result.amdrMinGrams)} to ${g0(result.amdrMaxGrams)}`,
        ],
        ["Per meal", `${g0(result.perMealGrams)} across ${result.mealsPerDay}`],
        ["Useful minimum per meal (0.25 g/kg)", g1(result.perMealMinimumGrams)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Ages 9 to 18
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Teen Protein Intake Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Protein for a growing body, using the 0.95 g/kg and 0.85 g/kg DRI bands for ages 9-13 and
          14-18, raised inside the published athlete range where there is real training — and
          cross-checked against estimated daily energy.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-sex">
              Sex (for the energy equations)
            </label>
            <select
              id="tp-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-age">
              Age (years)
            </label>
            <input
              id="tp-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="9"
              max="18"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-weight">
              Weight (kg)
            </label>
            <input
              id="tp-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="150"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-height">
              Height (cm)
            </label>
            <input
              id="tp-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="110"
              max="210"
              step="0.5"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tp-activity">
              Everyday activity level
            </label>
            <select
              id="tp-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              {Object.entries(ACTIVITY_LEVELS).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tp-sport">
              Sport and training
            </label>
            <select
              id="tp-sport"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sport}
              onChange={(event) => setSport(event.target.value)}
            >
              {Object.entries(SPORT_LEVELS).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-meals">
              Meals and snacks with protein
            </label>
            <input
              id="tp-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="3"
              max="6"
              step="1"
              value={mealsPerDay}
              onChange={(event) => setMealsPerDay(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
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
              Protein a day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : g0(result.recommendedGrams)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the target."
                : `${g0(result.minGrams)} to ${g0(result.maxGrams)} · about ${g0(result.perMealGrams)} at each of ${result.mealsPerDay} meals`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy teen protein target"
              className={GHOST_BTN}
              disabled={hasError}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div className="mt-5">
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Protein supplies ${pct(result.proteinShareOfEnergy)} of estimated energy, against an acceptable range of 10 to 30 percent`}
              >
                <span
                  className={`block h-full ${result.belowAmdr || result.aboveAmdr ? "bg-[var(--danger)]" : "bg-[var(--success)]"}`}
                  style={{
                    width: `${Math.min(100, (result.proteinShareOfEnergy / result.amdrMaxShare) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {pct(result.proteinShareOfEnergy)} of energy from protein · acceptable range 10-30%
              </p>
            </div>

            {result.belowAmdr && (
              <p className={NOTE_CLASS}>
                At {g0(result.recommendedGrams)} protein supplies only{" "}
                {pct(result.proteinShareOfEnergy)} of an estimated{" "}
                {NUM0.format(result.energyKcal)} kcal a day, under the 10% floor of the IOM
                acceptable range for ages 4-18. Reaching {g0(result.amdrMinGrams)} would put it back
                inside the window — worth raising with a paediatrician or dietitian.
              </p>
            )}
            {result.aboveAmdr && (
              <p className={NOTE_CLASS}>
                Protein here is {pct(result.proteinShareOfEnergy)} of estimated energy, above the 30%
                ceiling for ages 4-18. At that level protein starts crowding out the carbohydrate a
                growing, training body runs on.
              </p>
            )}
            <p className={NOTE_CLASS}>
              Energy is estimated with the IOM equations for ages 9-18, which include an extra{" "}
              {result.growthKcal} kcal a day for growth. Individual needs vary widely through
              puberty, so treat the calorie figure as a rough scale rather than a prescription.
            </p>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, based on the IOM Dietary Reference Intakes and the 2016 joint sports
        nutrition position stand. It is not medical or dietetic advice. Growth, puberty and training
        loads vary enormously between teenagers — speak to a paediatrician or registered dietitian
        before setting a young athlete&apos;s nutrition plan or adding supplements.
      </p>
    </main>
  );
}
