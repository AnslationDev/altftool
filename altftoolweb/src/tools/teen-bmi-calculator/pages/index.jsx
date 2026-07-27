"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Info, PersonStanding, RotateCcw } from "lucide-react";

import {
  ADULT_AGE,
  ADULT_CUTOFFS,
  AGE_RANGE,
  IOTF_CUTOFFS,
  feetInchesToCm,
  poundsToKg,
  teenBmi,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULTS = {
  unit: "metric",
  heightCm: "160",
  feet: "5",
  inches: "3",
  weightKg: "55",
  weightLb: "121",
  age: "13",
  sex: "male",
};

const toNum = (raw) => {
  const text = String(raw ?? "").trim();
  if (text === "") return NaN;
  const value = Number(text.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const toneClass = (tone) => {
  if (tone === "good") return "text-[var(--success)]";
  if (tone === "bad") return "text-[var(--danger)]";
  return "text-[var(--foreground)]";
};

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [feet, setFeet] = useState(DEFAULTS.feet);
  const [inches, setInches] = useState(DEFAULTS.inches);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [weightLb, setWeightLb] = useState(DEFAULTS.weightLb);
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [copied, setCopied] = useState(false);

  const metric = unit === "metric";

  const result = useMemo(() => {
    const h = metric ? toNum(heightCm) : feetInchesToCm(toNum(feet) || 0, toNum(inches) || 0);
    const w = metric ? toNum(weightKg) : poundsToKg(toNum(weightLb));
    return teenBmi({ heightCm: h, weightKg: w, ageYears: toNum(age), sex });
  }, [metric, heightCm, feet, inches, weightKg, weightLb, age, sex]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Teen BMI",
      `Age ${result.ageYears}, ${result.sex}`,
      `BMI: ${result.bmi}`,
      `Overweight cut-off for this age and sex: ${result.cutoffs.overweight}`,
      `Obesity cut-off for this age and sex: ${result.cutoffs.obesity}`,
      `Reading: ${result.band.label}`,
      `Adult lines would call the same BMI: ${result.adultBandLabel}`,
      result.cutoffs.source,
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
    setUnit(DEFAULTS.unit);
    setHeightCm(DEFAULTS.heightCm);
    setFeet(DEFAULTS.feet);
    setInches(DEFAULTS.inches);
    setWeightKg(DEFAULTS.weightKg);
    setWeightLb(DEFAULTS.weightLb);
    setAge(DEFAULTS.age);
    setSex(DEFAULTS.sex);
    setCopied(false);
  };

  const table = IOTF_CUTOFFS[sex] ?? IOTF_CUTOFFS.male;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <PersonStanding className="h-4 w-4" aria-hidden="true" />
          BMI variants
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Teen BMI Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Between {AGE_RANGE.min} and {ADULT_AGE} the adult 25 and 30 lines do not apply. This
          calculator reads BMI against the age- and sex-specific IOTF cut-offs, which are drawn so
          they arrive at exactly 25 and 30 on an eighteenth birthday.
        </p>
      </header>

      <section className={CARD}>
        <fieldset>
          <legend className={LABEL}>Units</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["metric", "Centimetres and kilograms"],
              ["imperial", "Feet, inches and pounds"],
            ].map(([key, label]) => {
              const active = key === unit;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setUnit(key);
                    setCopied(false);
                  }}
                  className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {metric ? (
            <div>
              <label className={LABEL} htmlFor="teen-height">
                Height (cm)
              </label>
              <input
                id="teen-height"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="110"
                max="220"
                step="0.5"
                value={heightCm}
                onChange={(event) => {
                  setHeightCm(event.target.value);
                  setCopied(false);
                }}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="teen-feet">
                  Height (feet)
                </label>
                <input
                  id="teen-feet"
                  className={INPUT}
                  type="number"
                  inputMode="numeric"
                  min="3"
                  max="7"
                  step="1"
                  value={feet}
                  onChange={(event) => {
                    setFeet(event.target.value);
                    setCopied(false);
                  }}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="teen-inches">
                  Height (inches)
                </label>
                <input
                  id="teen-inches"
                  className={INPUT}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="11.5"
                  step="0.5"
                  value={inches}
                  onChange={(event) => {
                    setInches(event.target.value);
                    setCopied(false);
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label className={LABEL} htmlFor="teen-weight">
              Weight ({metric ? "kg" : "lb"})
            </label>
            <input
              id="teen-weight"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={metric ? weightKg : weightLb}
              onChange={(event) => {
                if (metric) setWeightKg(event.target.value);
                else setWeightLb(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="teen-age">
              Age (years, decimals allowed)
            </label>
            <input
              id="teen-age"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min={AGE_RANGE.min}
              max={AGE_RANGE.max}
              step="0.5"
              value={age}
              onChange={(event) => {
                setAge(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="teen-sex">
              Sex
            </label>
            <select
              id="teen-sex"
              className={INPUT}
              value={sex}
              onChange={(event) => {
                setSex(event.target.value);
                setCopied(false);
              }}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              BMI
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM1.format(result.bmi)}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : toneClass(result.band.tone)
              }`}
            >
              {hasError ? "Fix the input above to see a reading." : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the teen BMI result"
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
          {[
            [
              "Overweight line for this age and sex",
              hasError ? DASH : NUM2.format(result.cutoffs.overweight),
            ],
            [
              "Obesity line for this age and sex",
              hasError ? DASH : NUM2.format(result.cutoffs.obesity),
            ],
            [
              "Distance to the overweight line",
              hasError
                ? DASH
                : result.gapToOverweight >= 0
                  ? `${NUM1.format(result.gapToOverweight)} BMI points below it`
                  : `${NUM1.format(Math.abs(result.gapToOverweight))} BMI points above it`,
            ],
            [
              "Weight at the overweight line for this height",
              hasError ? DASH : `${NUM1.format(result.weightAtOverweight)} kg`,
            ],
            [
              "Weight at the obesity line for this height",
              hasError ? DASH : `${NUM1.format(result.weightAtObesity)} kg`,
            ],
            [
              "Adult 25/30 lines would call this",
              hasError ? DASH : result.adultBandLabel,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-4 space-y-2">
            <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.band.meaning}
            </p>
            {result.adultWouldDiffer ? (
              <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm leading-6 font-medium text-[var(--danger)]">
                An adult BMI chart would miss this entirely — the same number reads as{" "}
                {result.adultBandLabel} on the adult scale, which is exactly why age-specific
                cut-offs exist.
              </p>
            ) : null}
            <p className="text-xs text-[var(--muted-foreground)]">{result.cutoffs.source}</p>
          </div>
        ) : null}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">
          IOTF cut-offs by age ({sex === "female" ? "female" : "male"})
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Age
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Overweight BMI
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Obesity BMI
                </th>
              </tr>
            </thead>
            <tbody>
              {table.map(([rowAge, overweight, obesity]) => (
                <tr key={rowAge} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{rowAge}</td>
                  <td className="py-2 pr-3 text-right">{NUM2.format(overweight)}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {NUM2.format(obesity)}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-2 pr-3 font-semibold">{ADULT_AGE}+</td>
                <td className="py-2 pr-3 text-right">{NUM2.format(ADULT_CUTOFFS.overweight)}</td>
                <td className="py-2 text-right text-[var(--muted-foreground)]">
                  {NUM2.format(ADULT_CUTOFFS.obesity)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          <span>
            Values between the half-year rows are interpolated. Notice how the overweight line climbs
            from under 20 at age {AGE_RANGE.min} to 25 at {ADULT_AGE} — the same BMI means different
            things a few birthdays apart.
          </span>
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice or a diagnosis. This tool deliberately does not assess
        thinness or underweight: a low adolescent BMI needs a clinician plotting height, weight and
        growth velocity on a full growth chart, not a single cut-off. BMI also cannot tell muscle
        from fat, so a heavily trained teenager can read high without excess body fat. Discuss any
        result that concerns you with a doctor rather than starting a diet.
      </p>
    </main>
  );
}
