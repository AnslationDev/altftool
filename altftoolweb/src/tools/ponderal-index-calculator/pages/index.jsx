"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ruler } from "lucide-react";

import {
  ADULT_BANDS,
  ADULT_USUAL_PI,
  HEALTHY_BMI,
  NEWBORN_BANDS,
  REFERENCE_HEIGHT_M,
  adultPonderalIndex,
  feetInchesToCm,
  newbornPonderalIndex,
  poundsToKg,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  mode: "adult",
  unit: "metric",
  heightCm: "180",
  feet: "5",
  inches: "11",
  weightKg: "80",
  weightLb: "176",
  birthWeightG: "3200",
  lengthCm: "50",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const DASH = "—";

const toNum = (raw) => {
  const text = String(raw ?? "").trim();
  if (text === "") return NaN;
  const value = Number(text.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const toneClass = (tone) => {
  if (tone === "good") return "text-[var(--success)]";
  if (tone === "bad") return "text-[var(--danger)]";
  if (tone === "warn") return "text-[var(--warning-text)]";
  return "text-[var(--foreground)]";
};

const bandRange = (band) => {
  if (band.min === 0) return `under ${NUM2.format(band.max)}`;
  if (band.max === Infinity) return `${NUM2.format(band.min)} and above`;
  return `${NUM2.format(band.min)} – ${NUM2.format(band.max)}`;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [feet, setFeet] = useState(DEFAULTS.feet);
  const [inches, setInches] = useState(DEFAULTS.inches);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [weightLb, setWeightLb] = useState(DEFAULTS.weightLb);
  const [birthWeightG, setBirthWeightG] = useState(DEFAULTS.birthWeightG);
  const [lengthCm, setLengthCm] = useState(DEFAULTS.lengthCm);
  const [copied, setCopied] = useState(false);

  const adult = mode === "adult";

  const result = useMemo(() => {
    if (!adult) {
      return newbornPonderalIndex({
        birthWeightG: toNum(birthWeightG),
        lengthCm: toNum(lengthCm),
      });
    }
    const metric = unit === "metric";
    const h = metric ? toNum(heightCm) : feetInchesToCm(toNum(feet) || 0, toNum(inches) || 0);
    const w = metric ? toNum(weightKg) : poundsToKg(toNum(weightLb));
    return adultPonderalIndex({ heightCm: h, weightKg: w });
  }, [adult, unit, heightCm, feet, inches, weightKg, weightLb, birthWeightG, lengthCm]);

  const ok = !result.error;
  const bands = adult ? ADULT_BANDS : NEWBORN_BANDS;
  const unitLabel = adult ? "kg/m³" : "g/cm³ × 100";

  const summary = useMemo(() => {
    if (!ok) return "";
    if (!adult) {
      return [
        "Ponderal Index Calculator — newborn",
        `Ponderal index: ${NUM2.format(result.pi)} (100 × g / cm³)`,
        `Interpretation: ${result.band.label}`,
        `Weight range for this length at PI 2.2–3.0: ${NUM0.format(result.weightMinG)}–${NUM0.format(result.weightMaxG)} g`,
      ].join("\n");
    }
    return [
      "Ponderal Index Calculator — adult",
      `Ponderal index: ${NUM2.format(result.pi)} kg/m³`,
      `BMI for comparison: ${NUM1.format(result.bmi)} kg/m²`,
      `Interpretation: ${result.band.label}`,
      `Weight range at PI ${ADULT_USUAL_PI.min}–${ADULT_USUAL_PI.max}: ${NUM1.format(result.piWeightMin)}–${NUM1.format(result.piWeightMax)} kg`,
      `Weight range at BMI ${HEALTHY_BMI.min}–${HEALTHY_BMI.max}: ${NUM1.format(result.bmiWeightMin)}–${NUM1.format(result.bmiWeightMax)} kg`,
      `Same build at ${REFERENCE_HEIGHT_M * 100} cm: ${NUM1.format(result.weightAtReferenceHeight)} kg`,
    ].join("\n");
  }, [ok, adult, result]);

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
    setMode(DEFAULTS.mode);
    setUnit(DEFAULTS.unit);
    setHeightCm(DEFAULTS.heightCm);
    setFeet(DEFAULTS.feet);
    setInches(DEFAULTS.inches);
    setWeightKg(DEFAULTS.weightKg);
    setWeightLb(DEFAULTS.weightLb);
    setBirthWeightG(DEFAULTS.birthWeightG);
    setLengthCm(DEFAULTS.lengthCm);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Weight ÷ height³
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Ponderal Index Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Body mass scales closer to height cubed than height squared, so BMI reads high for tall
          people and low for short ones. The ponderal index divides by height cubed and removes that
          bias. Newborn mode uses the 100 × grams ÷ cm³ form used in neonatology.
        </p>
      </header>

      <section className={CARD}>
        <fieldset>
          <legend className="text-sm font-semibold">Who is this for?</legend>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            {[
              ["adult", "Adult (kg / m³)"],
              ["newborn", "Newborn (100 × g / cm³)"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  mode === value
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {adult ? (
          <>
            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Units</legend>
              <div className="mt-2 flex gap-2">
                {[
                  ["metric", "cm / kg"],
                  ["imperial", "ft-in / lb"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={unit === value}
                    onClick={() => setUnit(value)}
                    className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      unit === value
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {unit === "metric" ? (
                <div>
                  <label className={LABEL} htmlFor="pi-height">
                    Height (cm)
                  </label>
                  <input
                    id="pi-height"
                    className={INPUT}
                    type="number"
                    inputMode="decimal"
                    min="100"
                    max="250"
                    step="0.5"
                    value={heightCm}
                    onChange={(event) => setHeightCm(event.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL} htmlFor="pi-feet">
                      Height (ft)
                    </label>
                    <input
                      id="pi-feet"
                      className={INPUT}
                      type="number"
                      inputMode="numeric"
                      min="3"
                      max="8"
                      step="1"
                      value={feet}
                      onChange={(event) => setFeet(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="pi-inches">
                      and (in)
                    </label>
                    <input
                      id="pi-inches"
                      className={INPUT}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="11.9"
                      step="0.5"
                      value={inches}
                      onChange={(event) => setInches(event.target.value)}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className={LABEL} htmlFor="pi-weight">
                  Weight ({unit === "metric" ? "kg" : "lb"})
                </label>
                <input
                  id="pi-weight"
                  className={INPUT}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={unit === "metric" ? weightKg : weightLb}
                  onChange={(event) =>
                    unit === "metric" ? setWeightKg(event.target.value) : setWeightLb(event.target.value)
                  }
                />
              </div>
            </div>
          </>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="pi-birthweight">
                Birth weight (g)
              </label>
              <input
                id="pi-birthweight"
                className={INPUT}
                type="number"
                inputMode="numeric"
                min="0"
                step="10"
                value={birthWeightG}
                onChange={(event) => setBirthWeightG(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="pi-length">
                Crown-heel length (cm)
              </label>
              <input
                id="pi-length"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={lengthCm}
                onChange={(event) => setLengthCm(event.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`} aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Ponderal index ({unitLabel})
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? NUM2.format(result.pi) : DASH}
            </p>
            <p className={`mt-1 text-sm font-semibold ${ok ? toneClass(result.band.tone) : "text-[var(--muted-foreground)]"}`}>
              {ok ? result.band.label : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the ponderal index result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
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
          {(adult
            ? [
                ["BMI for comparison", ok ? `${NUM1.format(result.bmi)} kg/m²` : DASH],
                [
                  `Weight range at PI ${ADULT_USUAL_PI.min}–${ADULT_USUAL_PI.max}`,
                  ok ? `${NUM1.format(result.piWeightMin)} – ${NUM1.format(result.piWeightMax)} kg` : DASH,
                ],
                [
                  `Weight range at BMI ${HEALTHY_BMI.min}–${HEALTHY_BMI.max}`,
                  ok ? `${NUM1.format(result.bmiWeightMin)} – ${NUM1.format(result.bmiWeightMax)} kg` : DASH,
                ],
                [
                  "Gap between the two ceilings",
                  ok
                    ? `${NUM1.format(Math.abs(result.ceilingGapKg))} kg ${result.ceilingGapKg >= 0 ? "more allowed by PI" : "more allowed by BMI"}`
                    : DASH,
                ],
                [
                  `Same build at ${REFERENCE_HEIGHT_M * 100} cm`,
                  ok ? `${NUM1.format(result.weightAtReferenceHeight)} kg` : DASH,
                ],
              ]
            : [
                [
                  "Appropriate weight for this length (PI 2.2–3.0)",
                  ok ? `${NUM0.format(result.weightMinG)} – ${NUM0.format(result.weightMaxG)} g` : DASH,
                ],
                ["Below 2.2 means", "Thin for length — suggests asymmetric growth restriction"],
                ["Above 3.0 means", "Heavy for length — worth checking for macrosomia"],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">
          {adult ? "Adult reference bands" : "Newborn reference bands"}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Ponderal index</th>
                <th scope="col" className="py-2 font-semibold">Reading</th>
              </tr>
            </thead>
            <tbody>
              {bands.map((band) => {
                const active = ok && result.band.key === band.key;
                return (
                  <tr
                    key={band.key}
                    className={`border-b border-[var(--border)] last:border-0 ${active ? "bg-[var(--muted)]" : ""}`}
                  >
                    <td className="py-2 pr-3 font-semibold">{bandRange(band)}</td>
                    <td className={`py-2 ${active ? toneClass(band.tone) : "text-[var(--muted-foreground)]"}`}>
                      {band.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          {adult
            ? "There is no WHO classification for adult ponderal index. The band above is a descriptive reference range from the anthropometry literature, useful for tracking yourself over time rather than for diagnosis."
            : "The 2.2 and 3.0 lines come from Miller and Hassanein (Pediatrics, 1971) and remain the usual neonatal convention for separating symmetric from asymmetric growth restriction."}
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not a diagnosis. Newborn measurements in particular should be
        interpreted by a paediatrician alongside gestational age and growth charts.
      </p>
    </main>
  );
}
