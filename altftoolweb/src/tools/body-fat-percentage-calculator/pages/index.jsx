"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const labelClass = "text-sm font-semibold text-[var(--foreground)]";

const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const IN_TO_CM = 2.54;
const LB_TO_KG = 0.45359237;

const number1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

// American Council on Exercise body-fat ranges.
const CATEGORIES = {
  male: [
    { max: 6, label: "Essential fat (2-5%)" },
    { max: 14, label: "Athletic (6-13%)" },
    { max: 18, label: "Fitness (14-17%)" },
    { max: 25, label: "Average (18-24%)" },
    { max: Infinity, label: "Above average (25%+)" },
  ],
  female: [
    { max: 14, label: "Essential fat (10-13%)" },
    { max: 21, label: "Athletic (14-20%)" },
    { max: 25, label: "Fitness (21-24%)" },
    { max: 32, label: "Average (25-31%)" },
    { max: Infinity, label: "Above average (32%+)" },
  ],
};

const DEFAULTS = {
  sex: "male",
  units: "metric",
  height: "175",
  neck: "38",
  waist: "88",
  hip: "95",
  weight: "72",
};

const IMPERIAL_DEFAULTS = {
  sex: "male",
  units: "imperial",
  height: "69",
  neck: "15",
  waist: "34.5",
  hip: "37.5",
  weight: "159",
};

const toNumber = (value) => {
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const log10 = (value) => Math.log10(value);

/** US Navy (Hodgdon-Beckett) circumference method, metric form. */
function navyBodyFat({ sex, heightCm, neckCm, waistCm, hipCm }) {
  if (sex === "female") {
    const inner = waistCm + hipCm - neckCm;
    if (inner <= 0) return Number.NaN;
    return 495 / (1.29579 - 0.35004 * log10(inner) + 0.221 * log10(heightCm)) - 450;
  }
  const inner = waistCm - neckCm;
  if (inner <= 0) return Number.NaN;
  return 495 / (1.0324 - 0.19077 * log10(inner) + 0.15456 * log10(heightCm)) - 450;
}

function categoryFor(sex, bodyFat) {
  const table = CATEGORIES[sex] || CATEGORIES.male;
  return table.find((band) => bodyFat < band.max)?.label || table[table.length - 1].label;
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setCopied(false);
  };

  const switchUnits = (units) => {
    if (units === form.units) return;
    // Convert what the user typed instead of loading the other system's
    // defaults — dropping their measurements on a unit toggle silently
    // replaces their body fat result with one for a stranger.
    const factor = units === "metric" ? 2.54 : 1 / 2.54;
    const weightFactor = units === "metric" ? 0.45359237 : 1 / 0.45359237;
    const convert = (value, mult) => {
      const parsed = Number.parseFloat(String(value).trim());
      return Number.isFinite(parsed) && parsed > 0
        ? String(Number((parsed * mult).toFixed(1)))
        : value;
    };
    setForm((prev) => ({
      ...prev,
      units,
      height: convert(prev.height, factor),
      neck: convert(prev.neck, factor),
      waist: convert(prev.waist, factor),
      hip: convert(prev.hip, factor),
      weight: convert(prev.weight, weightFactor),
    }));
    setCopied(false);
  };

  const result = useMemo(() => {
    const metric = form.units === "metric";
    const lengthUnit = metric ? "cm" : "in";
    const massUnit = metric ? "kg" : "lb";

    const height = toNumber(form.height);
    const neck = toNumber(form.neck);
    const waist = toNumber(form.waist);
    const hip = toNumber(form.hip);
    const weightRaw = String(form.weight).trim();
    const weight = weightRaw === "" ? null : toNumber(weightRaw);

    const errors = [];
    const positive = (value, name) => {
      if (!Number.isFinite(value) || value <= 0) errors.push(`Enter a valid ${name} in ${lengthUnit}.`);
    };

    positive(height, "height");
    positive(neck, "neck measurement");
    positive(waist, "waist measurement");
    if (form.sex === "female") positive(hip, "hip measurement");
    if (weight !== null && (!Number.isFinite(weight) || weight <= 0)) {
      errors.push(`Weight must be a positive number in ${massUnit}, or left blank.`);
    }

    if (errors.length > 0) return { errors };

    const factor = metric ? 1 : IN_TO_CM;
    const heightCm = height * factor;
    const neckCm = neck * factor;
    const waistCm = waist * factor;
    const hipCm = (form.sex === "female" ? hip : 0) * factor;

    if (heightCm < 100 || heightCm > 250) {
      return { errors: [`Height looks out of range. Enter a value between ${metric ? "100 and 250 cm" : "39 and 98 in"}.`] };
    }

    if (form.sex === "female") {
      if (waistCm + hipCm - neckCm <= 0) {
        return { errors: ["Waist plus hip must be larger than the neck measurement for this formula to work."] };
      }
    } else if (waistCm - neckCm <= 0) {
      return { errors: ["Waist must be larger than the neck measurement for this formula to work."] };
    }

    const bodyFat = navyBodyFat({ sex: form.sex, heightCm, neckCm, waistCm, hipCm });

    if (!Number.isFinite(bodyFat) || bodyFat <= 0 || bodyFat >= 75) {
      return {
        errors: [
          "Those measurements produce an impossible result. Re-check the tape numbers — waist at the navel, neck below the larynx.",
        ],
      };
    }

    const weightBase = weight === null ? null : metric ? weight : weight * LB_TO_KG;
    const fatMass = weightBase === null ? null : (weightBase * bodyFat) / 100;
    const leanMass = weightBase === null ? null : weightBase - fatMass;

    return {
      errors: [],
      bodyFat,
      category: categoryFor(form.sex, bodyFat),
      heightCm,
      neckCm,
      waistCm,
      hipCm,
      waistToHeight: waistCm / heightCm,
      fatMassDisplay: fatMass === null ? null : metric ? fatMass : fatMass / LB_TO_KG,
      leanMassDisplay: leanMass === null ? null : metric ? leanMass : leanMass / LB_TO_KG,
      massUnit,
      lengthUnit,
    };
  }, [form]);

  const hasError = !result.errors || result.errors.length > 0;

  const report = useMemo(() => {
    if (hasError) return "";
    return [
      "US Navy body fat estimate",
      `Sex: ${form.sex === "female" ? "Female" : "Male"}`,
      `Height: ${form.height} ${result.lengthUnit}`,
      `Neck: ${form.neck} ${result.lengthUnit}`,
      `Waist: ${form.waist} ${result.lengthUnit}`,
      form.sex === "female" ? `Hip: ${form.hip} ${result.lengthUnit}` : "",
      `Body fat: ${result.bodyFat.toFixed(1)}%`,
      `Category: ${result.category}`,
      result.fatMassDisplay === null ? "" : `Fat mass: ${result.fatMassDisplay.toFixed(1)} ${result.massUnit}`,
      result.leanMassDisplay === null ? "" : `Lean mass: ${result.leanMassDisplay.toFixed(1)} ${result.massUnit}`,
      `Waist-to-height ratio: ${result.waistToHeight.toFixed(2)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [form, hasError, result]);

  const copyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(form.units === "metric" ? DEFAULTS : IMPERIAL_DEFAULTS);
    setCopied(false);
  };

  const unitLabel = form.units === "metric" ? "cm" : "in";
  const massLabel = form.units === "metric" ? "kg" : "lb";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Activity className="h-4 w-4" aria-hidden="true" />
            Body composition
          </div>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Body Fat Percentage Calculator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            Estimate body fat with the US Navy tape method — height, neck and waist for men, plus hip for
            women. Add your weight to also see fat mass and lean mass.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Measurements</h2>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="bf-sex">Sex (for the formula)</label>
                  <select id="bf-sex" value={form.sex} onChange={setField("sex")} className={`${inputClass} mt-2`}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <span className={labelClass}>Units</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      ["metric", "Metric (cm/kg)"],
                      ["imperial", "Imperial (in/lb)"],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => switchUnits(id)}
                        aria-pressed={form.units === id}
                        className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                          form.units === id
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="bf-height">Height ({unitLabel})</label>
                  <input id="bf-height" type="number" inputMode="decimal" min="0" step="0.1" value={form.height} onChange={setField("height")} className={`${inputClass} mt-2`} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="bf-neck">Neck ({unitLabel})</label>
                  <input id="bf-neck" type="number" inputMode="decimal" min="0" step="0.1" value={form.neck} onChange={setField("neck")} className={`${inputClass} mt-2`} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="bf-waist">Waist ({unitLabel})</label>
                  <input id="bf-waist" type="number" inputMode="decimal" min="0" step="0.1" value={form.waist} onChange={setField("waist")} className={`${inputClass} mt-2`} />
                </div>
                {form.sex === "female" && (
                  <div>
                    <label className={labelClass} htmlFor="bf-hip">Hip ({unitLabel})</label>
                    <input id="bf-hip" type="number" inputMode="decimal" min="0" step="0.1" value={form.hip} onChange={setField("hip")} className={`${inputClass} mt-2`} />
                  </div>
                )}
                <div>
                  <label className={labelClass} htmlFor="bf-weight">Weight ({massLabel}, optional)</label>
                  <input id="bf-weight" type="number" inputMode="decimal" min="0" step="0.1" value={form.weight} onChange={setField("weight")} className={`${inputClass} mt-2`} />
                </div>
              </div>

              <div>
                <button type="button" onClick={reset} className={secondaryButtonClass} aria-label="Reset measurements to defaults">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>

              <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                Measure with a flexible tape, snug but not compressing. Neck just below the larynx, waist at
                the navel for men and at the narrowest point for women, hip at the widest point.
              </p>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {hasError ? (
              <div role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {result.errors[0]}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Estimated body fat
                </p>
                <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                  {number1.format(result.bodyFat)}%
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--muted-foreground)]">{result.category}</p>

                <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                  {result.fatMassDisplay !== null && (
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-[var(--muted-foreground)]">Fat mass</dt>
                      <dd className="font-semibold">{number1.format(result.fatMassDisplay)} {result.massUnit}</dd>
                    </div>
                  )}
                  {result.leanMassDisplay !== null && (
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-[var(--muted-foreground)]">Lean body mass</dt>
                      <dd className="font-semibold">{number1.format(result.leanMassDisplay)} {result.massUnit}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Waist-to-height ratio</dt>
                    <dd className="font-semibold">
                      {result.waistToHeight.toFixed(2)}{" "}
                      <span className={result.waistToHeight < 0.5 ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                        {result.waistToHeight < 0.5 ? "healthy" : "elevated"}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Method</dt>
                    <dd className="text-right font-semibold">US Navy circumference</dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <button type="button" onClick={copyReport} className={primaryButtonClass} aria-label="Copy the body fat result">
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy result"}
                  </button>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    ACE reference ranges ({form.sex === "female" ? "women" : "men"})
                  </p>
                  <ul className="mt-2 grid gap-2 text-sm">
                    {CATEGORIES[form.sex].map((band) => (
                      <li
                        key={band.label}
                        className={`rounded-md border px-3 py-2 ${
                          band.label === result.category
                            ? "border-[var(--primary)] font-semibold"
                            : "border-[var(--border)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {band.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                  Tape estimates typically sit within about 3-4 percentage points of a DEXA scan and can be
                  less accurate for very lean or very heavy people. This is general information, not medical
                  advice — talk to a clinician about your own health.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
