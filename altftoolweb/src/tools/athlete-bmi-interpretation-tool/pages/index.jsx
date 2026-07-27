"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, Info, RotateCcw } from "lucide-react";

import {
  ATHLETE_FAT_LIMIT,
  BMI_CUTOFFS,
  BODY_FAT_BANDS,
  NATURAL_FFMI_CEILING,
  WHTR_LIMIT,
  feetInchesToCm,
  inchesToCm,
  interpretAthleteBmi,
  poundsToKg,
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
  sex: "male",
  heightCm: "180",
  feet: "5",
  inches: "11",
  weightKg: "92",
  weightLb: "203",
  waist: "84",
  neck: "40",
  hip: "98",
  fatSource: "tape",
  knownFat: "14",
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

const bandRange = (band) =>
  band.max === Infinity ? `${band.min}% and above` : `${band.min}–${band.max}%`;

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [feet, setFeet] = useState(DEFAULTS.feet);
  const [inches, setInches] = useState(DEFAULTS.inches);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [weightLb, setWeightLb] = useState(DEFAULTS.weightLb);
  const [waist, setWaist] = useState(DEFAULTS.waist);
  const [neck, setNeck] = useState(DEFAULTS.neck);
  const [hip, setHip] = useState(DEFAULTS.hip);
  const [fatSource, setFatSource] = useState(DEFAULTS.fatSource);
  const [knownFat, setKnownFat] = useState(DEFAULTS.knownFat);
  const [copied, setCopied] = useState(false);

  const metric = unit === "metric";
  const useTape = fatSource === "tape";

  const result = useMemo(() => {
    const h = metric ? toNum(heightCm) : feetInchesToCm(toNum(feet) || 0, toNum(inches) || 0);
    const w = metric ? toNum(weightKg) : poundsToKg(toNum(weightLb));
    const waistCm = metric ? toNum(waist) : inchesToCm(toNum(waist));
    const neckCm = metric ? toNum(neck) : inchesToCm(toNum(neck));
    const hipCm = metric ? toNum(hip) : inchesToCm(toNum(hip));

    return interpretAthleteBmi({
      sex,
      heightCm: h,
      weightKg: w,
      waistCm,
      neckCm: useTape ? neckCm : undefined,
      hipCm: useTape ? hipCm : undefined,
      knownBodyFatPct: useTape ? undefined : toNum(knownFat),
    });
  }, [metric, sex, heightCm, feet, inches, weightKg, weightLb, waist, neck, hip, useTape, knownFat]);

  const hasError = Boolean(result.error);
  const lengthUnit = metric ? "cm" : "in";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Athlete BMI interpretation",
      `BMI: ${result.bmi} — ${result.bmiBandLabel}`,
      `Body fat: ${result.bodyFatPct}% (${result.bodyFatBand.label}, from the ${result.bodyFatSource})`,
      `Lean mass: ${result.leanMassKg} kg · FFMI ${result.ffmi}, normalised ${result.normalisedFfmi}`,
      `Waist-to-height ratio: ${result.whtr} (limit ${WHTR_LIMIT})`,
      `At ${result.targetFatPct}% body fat with the same muscle, BMI would still be ${result.bmiAtTargetFat}`,
      `Verdict: ${result.verdict.label}`,
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
    setSex(DEFAULTS.sex);
    setHeightCm(DEFAULTS.heightCm);
    setFeet(DEFAULTS.feet);
    setInches(DEFAULTS.inches);
    setWeightKg(DEFAULTS.weightKg);
    setWeightLb(DEFAULTS.weightLb);
    setWaist(DEFAULTS.waist);
    setNeck(DEFAULTS.neck);
    setHip(DEFAULTS.hip);
    setFatSource(DEFAULTS.fatSource);
    setKnownFat(DEFAULTS.knownFat);
    setCopied(false);
  };

  const bands = BODY_FAT_BANDS[sex] ?? BODY_FAT_BANDS.male;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          BMI variants
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Athlete BMI Interpretation Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          BMI counts a kilogram of muscle exactly like a kilogram of fat. This tool puts your BMI
          next to three measures that can tell them apart — body fat percentage, fat-free mass index
          and waist-to-height ratio — and says which story the numbers actually support.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-2 sm:grid-cols-2">
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ath-sex">
              Sex
            </label>
            <select
              id="ath-sex"
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

          {metric ? (
            <div>
              <label className={LABEL} htmlFor="ath-height">
                Height (cm)
              </label>
              <input
                id="ath-height"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="130"
                max="230"
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
                <label className={LABEL} htmlFor="ath-feet">
                  Height (feet)
                </label>
                <input
                  id="ath-feet"
                  className={INPUT}
                  type="number"
                  inputMode="numeric"
                  min="4"
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
                <label className={LABEL} htmlFor="ath-inches">
                  Height (inches)
                </label>
                <input
                  id="ath-inches"
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
            <label className={LABEL} htmlFor="ath-weight">
              Weight ({metric ? "kg" : "lb"})
            </label>
            <input
              id="ath-weight"
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
            <label className={LABEL} htmlFor="ath-waist">
              Waist at the navel ({lengthUnit})
            </label>
            <input
              id="ath-waist"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={waist}
              onChange={(event) => {
                setWaist(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="ath-fatsource">
              Body fat figure
            </label>
            <select
              id="ath-fatsource"
              className={INPUT}
              value={fatSource}
              onChange={(event) => {
                setFatSource(event.target.value);
                setCopied(false);
              }}
            >
              <option value="tape">Estimate it from tape measurements</option>
              <option value="known">I already have a DEXA or skinfold figure</option>
            </select>
          </div>

          {useTape ? (
            <div>
              <label className={LABEL} htmlFor="ath-neck">
                Neck below the larynx ({lengthUnit})
              </label>
              <input
                id="ath-neck"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={neck}
                onChange={(event) => {
                  setNeck(event.target.value);
                  setCopied(false);
                }}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL} htmlFor="ath-knownfat">
                Known body fat (%)
              </label>
              <input
                id="ath-knownfat"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="2"
                max="70"
                step="0.1"
                value={knownFat}
                onChange={(event) => {
                  setKnownFat(event.target.value);
                  setCopied(false);
                }}
              />
            </div>
          )}

          {useTape && sex === "female" ? (
            <div>
              <label className={LABEL} htmlFor="ath-hip">
                Hip at the widest point ({lengthUnit})
              </label>
              <input
                id="ath-hip"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={hip}
                onChange={(event) => {
                  setHip(event.target.value);
                  setCopied(false);
                }}
              />
            </div>
          ) : null}
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
                hasError ? "text-[var(--muted-foreground)]" : toneClass(result.verdict.tone)
              }`}
            >
              {hasError ? "Fix the input above to see a reading." : result.verdict.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the BMI interpretation"
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
            ["BMI band", hasError ? DASH : result.bmiBandLabel],
            [
              "Body fat",
              hasError
                ? DASH
                : `${NUM1.format(result.bodyFatPct)}% — ${result.bodyFatBand.label}`,
            ],
            ["Fat mass", hasError ? DASH : `${NUM1.format(result.fatMassKg)} kg`],
            ["Lean (fat-free) mass", hasError ? DASH : `${NUM1.format(result.leanMassKg)} kg`],
            [
              "FFMI (height-normalised)",
              hasError
                ? DASH
                : `${NUM1.format(result.ffmi)} (${NUM1.format(result.normalisedFfmi)}), drug-free ceiling about ${result.ffmiCeiling}`,
            ],
            [
              "Waist-to-height ratio",
              hasError
                ? DASH
                : `${NUM2.format(result.whtr)} — ${result.whtrHigh ? "above" : "below"} the ${WHTR_LIMIT} limit`,
            ],
            [
              `Weight at BMI ${BMI_CUTOFFS.overweight}`,
              hasError ? DASH : `${NUM1.format(result.weightAtBmi25)} kg`,
            ],
            [
              "BMI at a lean body fat with the same muscle",
              hasError
                ? DASH
                : `${NUM1.format(result.bmiAtTargetFat)} at ${result.targetFatPct}% fat (${NUM1.format(result.leanWeightAtTargetFat)} kg)`,
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
            <p
              className={`rounded-md px-3 py-2 text-sm leading-6 ${
                result.verdict.tone === "bad"
                  ? "bg-[var(--danger-soft)] font-medium text-[var(--danger)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              }`}
            >
              {result.verdict.detail}
            </p>
            {result.bmiStuckHigh ? (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Even stripped to {result.targetFatPct}% body fat while keeping every kilogram of
                muscle, BMI would still read {NUM1.format(result.bmiAtTargetFat)} — above the{" "}
                {BMI_CUTOFFS.overweight} line. At this much lean mass, BMI cannot return a
                &quot;normal&quot; result.
              </p>
            ) : null}
            {result.ffmiNearCeiling ? (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
                A normalised FFMI of {NUM1.format(result.normalisedFfmi)} is close to the{" "}
                {NATURAL_FFMI_CEILING[sex]} that drug-free trained people rarely pass — a lot of
                muscle for the frame, which is exactly what inflates BMI.
              </p>
            ) : null}
            <p className="text-xs text-[var(--muted-foreground)]">
              Body fat taken from the {result.bodyFatSource}. Tape estimates typically sit within
              three to four percentage points of a DEXA scan, and can read high on very muscular
              necks or low on very lean waists.
            </p>
          </div>
        ) : null}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">
          Body fat bands ({sex === "female" ? "female" : "male"})
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Band
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Body fat
                </th>
              </tr>
            </thead>
            <tbody>
              {bands.map((band) => {
                const active = !hasError && band.key === result.bodyFatBand.key;
                return (
                  <tr
                    key={band.key}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      active ? "font-semibold text-[var(--primary)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">{band.label}</td>
                    <td className="py-2 text-right">{bandRange(band)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          <span>
            Bands follow the American Council on Exercise. Body fat below{" "}
            {ATHLETE_FAT_LIMIT[sex]}% with a proportionate waist is the pattern that makes a high BMI
            a measurement artefact rather than a health signal.
          </span>
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice or a diagnosis. Circumference equations are estimates,
        not scans, and every method here was validated on general populations rather than elite
        athletes. A high BMI explained by muscle still deserves the usual checks — blood pressure,
        lipids and glucose — because those are what the risk actually rests on. Discuss any concern
        with a doctor rather than acting on a single index.
      </p>
    </main>
  );
}
