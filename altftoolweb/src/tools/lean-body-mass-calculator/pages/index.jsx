"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

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
const number0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Boer (1984), James (1976) and Hume (1966) lean body mass formulas. Weight in kg, height in cm. */
const FORMULAS = {
  boer: {
    label: "Boer (1984)",
    compute: (sex, kg, cm) =>
      sex === "female" ? 0.252 * kg + 0.473 * cm - 48.3 : 0.407 * kg + 0.267 * cm - 19.2,
  },
  james: {
    label: "James (1976)",
    compute: (sex, kg, cm) =>
      sex === "female" ? 1.07 * kg - 148 * (kg / cm) ** 2 : 1.1 * kg - 128 * (kg / cm) ** 2,
  },
  hume: {
    label: "Hume (1966)",
    compute: (sex, kg, cm) =>
      sex === "female" ? 0.29569 * kg + 0.41813 * cm - 43.2933 : 0.3281 * kg + 0.33929 * cm - 29.5336,
  },
};

const DEFAULTS = {
  mode: "bodyfat",
  sex: "male",
  units: "metric",
  weight: "80",
  height: "178",
  bodyFat: "20",
  formula: "boer",
};

const IMPERIAL_DEFAULTS = {
  mode: "bodyfat",
  sex: "male",
  units: "imperial",
  weight: "176",
  height: "70",
  bodyFat: "20",
  formula: "boer",
};

const toNumber = (value) => {
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setCopied(false);
  };

  const switchUnits = (units) => {
    if (units === form.units) return;
    // Convert the typed weight and height rather than loading the other
    // system's defaults — a unit toggle must not change whose body it is.
    const convert = (value, mult) => {
      const parsed = Number.parseFloat(String(value).trim());
      return Number.isFinite(parsed) && parsed > 0
        ? String(Number((parsed * mult).toFixed(1)))
        : value;
    };
    const toMetric = units === "metric";
    setForm((prev) => ({
      ...prev,
      units,
      weight: convert(prev.weight, toMetric ? 0.45359237 : 1 / 0.45359237),
      height: convert(prev.height, toMetric ? 2.54 : 1 / 2.54),
    }));
    setCopied(false);
  };

  const result = useMemo(() => {
    const metric = form.units === "metric";
    const massUnit = metric ? "kg" : "lb";
    const lengthUnit = metric ? "cm" : "in";

    const weight = toNumber(form.weight);
    const height = toNumber(form.height);
    const bodyFat = toNumber(form.bodyFat);

    const errors = [];
    if (!Number.isFinite(weight) || weight <= 0) errors.push(`Enter a valid weight in ${massUnit}.`);
    if (!Number.isFinite(height) || height <= 0) errors.push(`Enter a valid height in ${lengthUnit}.`);
    if (form.mode === "bodyfat") {
      if (!Number.isFinite(bodyFat) || bodyFat < 3 || bodyFat > 70) {
        errors.push("Body fat percentage must be between 3 and 70.");
      }
    }
    if (errors.length > 0) return { errors };

    const kg = metric ? weight : weight * LB_TO_KG;
    const cm = metric ? height : height * IN_TO_CM;

    if (cm < 100 || cm > 250) {
      return { errors: [`Height looks out of range. Enter between ${metric ? "100 and 250 cm" : "39 and 98 in"}.`] };
    }
    if (kg < 25 || kg > 350) {
      return { errors: [`Weight looks out of range. Enter between ${metric ? "25 and 350 kg" : "55 and 771 lb"}.`] };
    }

    const estimates = Object.entries(FORMULAS).map(([id, formula]) => {
      const value = formula.compute(form.sex, kg, cm);
      return { id, label: formula.label, kg: value };
    });

    const valid = estimates.filter((item) => Number.isFinite(item.kg) && item.kg > 0 && item.kg < kg);
    if (form.mode === "formula" && valid.length === 0) {
      return {
        errors: [
          "These height and weight values fall outside the range these formulas were built for. Use the body fat percentage mode instead.",
        ],
      };
    }

    let leanKg;
    let basis;
    if (form.mode === "bodyfat") {
      leanKg = kg * (1 - bodyFat / 100);
      basis = `Measured body fat ${number1.format(bodyFat)}%`;
    } else {
      const chosen = estimates.find((item) => item.id === form.formula);
      leanKg = chosen && Number.isFinite(chosen.kg) ? chosen.kg : Number.NaN;
      basis = `${FORMULAS[form.formula].label} estimate`;
      if (!Number.isFinite(leanKg) || leanKg <= 0 || leanKg >= kg) {
        return {
          errors: [
            "That formula gives an impossible lean mass for these inputs. Try another formula or use the body fat percentage mode.",
          ],
        };
      }
    }

    const fatKg = kg - leanKg;
    const fatPercent = (fatKg / kg) * 100;
    const heightM = cm / 100;
    const ffmi = leanKg / (heightM * heightM);
    const normalizedFfmi = ffmi + 6.1 * (1.8 - heightM);
    const bmi = kg / (heightM * heightM);

    const display = (valueKg) => (metric ? valueKg : valueKg / LB_TO_KG);

    return {
      errors: [],
      massUnit,
      basis,
      leanDisplay: display(leanKg),
      fatDisplay: display(fatKg),
      fatPercent,
      ffmi,
      normalizedFfmi,
      bmi,
      proteinLow: leanKg * 1.6,
      proteinHigh: leanKg * 2.2,
      estimates: estimates.map((item) => ({
        ...item,
        display: display(item.kg),
        usable: Number.isFinite(item.kg) && item.kg > 0 && item.kg < kg,
      })),
    };
  }, [form]);

  const hasError = !result.errors || result.errors.length > 0;

  const report = useMemo(() => {
    if (hasError) return "";
    return [
      "Lean body mass",
      `Basis: ${result.basis}`,
      `Lean body mass: ${result.leanDisplay.toFixed(1)} ${result.massUnit}`,
      `Fat mass: ${result.fatDisplay.toFixed(1)} ${result.massUnit} (${result.fatPercent.toFixed(1)}%)`,
      `FFMI: ${result.ffmi.toFixed(1)} (height-adjusted ${result.normalizedFfmi.toFixed(1)})`,
      `BMI: ${result.bmi.toFixed(1)}`,
      `Protein guide: ${Math.round(result.proteinLow)}-${Math.round(result.proteinHigh)} g per day`,
    ].join("\n");
  }, [hasError, result]);

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

  const massLabel = form.units === "metric" ? "kg" : "lb";
  const lengthLabel = form.units === "metric" ? "cm" : "in";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Dumbbell className="h-4 w-4" aria-hidden="true" />
            Body composition
          </div>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Lean Body Mass Calculator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            Split your weight into lean mass and fat mass — either from a body fat percentage you already
            know, or estimated with the Boer, James and Hume formulas.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your details</h2>

            <div className="mt-4 grid gap-4">
              <div>
                <span className={labelClass}>Calculate from</span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {[
                    ["bodyfat", "Known body fat %"],
                    ["formula", "Height and weight formula"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, mode: id }));
                        setCopied(false);
                      }}
                      aria-pressed={form.mode === id}
                      className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        form.mode === id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="lbm-sex">Sex (for the formulas)</label>
                  <select id="lbm-sex" value={form.sex} onChange={setField("sex")} className={`${inputClass} mt-2`}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <span className={labelClass}>Units</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      ["metric", "kg / cm"],
                      ["imperial", "lb / in"],
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
                  <label className={labelClass} htmlFor="lbm-weight">Weight ({massLabel})</label>
                  <input id="lbm-weight" type="number" inputMode="decimal" min="0" step="0.1" value={form.weight} onChange={setField("weight")} className={`${inputClass} mt-2`} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="lbm-height">Height ({lengthLabel})</label>
                  <input id="lbm-height" type="number" inputMode="decimal" min="0" step="0.1" value={form.height} onChange={setField("height")} className={`${inputClass} mt-2`} />
                </div>
              </div>

              {form.mode === "bodyfat" ? (
                <div>
                  <label className={labelClass} htmlFor="lbm-bodyfat">Body fat (%)</label>
                  <input id="lbm-bodyfat" type="number" inputMode="decimal" min="3" max="70" step="0.1" value={form.bodyFat} onChange={setField("bodyFat")} className={`${inputClass} mt-2`} />
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Use a figure from a tape estimate, calipers, a smart scale or a DEXA scan.
                  </p>
                </div>
              ) : (
                <div>
                  <label className={labelClass} htmlFor="lbm-formula">Formula</label>
                  <select id="lbm-formula" value={form.formula} onChange={setField("formula")} className={`${inputClass} mt-2`}>
                    {Object.entries(FORMULAS).map(([id, formula]) => (
                      <option key={id} value={id}>{formula.label}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Boer is the usual default for clinical dosing; James and Hume are shown alongside for comparison.
                  </p>
                </div>
              )}

              <div>
                <button type="button" onClick={reset} className={secondaryButtonClass} aria-label="Reset inputs to defaults">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
            {hasError ? (
              <div role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {result.errors[0]}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Lean body mass
                </p>
                <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                  {number1.format(result.leanDisplay)} {result.massUnit}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--muted-foreground)]">{result.basis}</p>

                <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Fat mass</dt>
                    <dd className="font-semibold">
                      {number1.format(result.fatDisplay)} {result.massUnit} ({number1.format(result.fatPercent)}%)
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Fat-free mass index (FFMI)</dt>
                    <dd className="font-semibold">{number1.format(result.ffmi)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Height-adjusted FFMI</dt>
                    <dd className="font-semibold">{number1.format(result.normalizedFfmi)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">BMI</dt>
                    <dd className="font-semibold">{number1.format(result.bmi)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Protein guide (1.6-2.2 g per kg lean)</dt>
                    <dd className="font-semibold">
                      {number0.format(result.proteinLow)}-{number0.format(result.proteinHigh)} g/day
                    </dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <button type="button" onClick={copyReport} className={primaryButtonClass} aria-label="Copy the lean body mass result">
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy result"}
                  </button>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Formula estimates for your height and weight
                  </p>
                  <ul className="mt-2 grid gap-2 text-sm">
                    {result.estimates.map((item) => (
                      <li
                        key={item.id}
                        className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${
                          form.mode === "formula" && item.id === form.formula
                            ? "border-[var(--primary)] font-semibold"
                            : "border-[var(--border)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span>
                          {item.usable ? `${number1.format(item.display)} ${result.massUnit}` : "out of range"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                  Formula estimates are population averages and can differ by several kilograms from a DEXA or
                  BIA measurement, especially at the extremes of body size. This is general information, not
                  medical or nutrition advice.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
