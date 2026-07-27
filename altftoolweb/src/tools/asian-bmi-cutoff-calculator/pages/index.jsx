"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe, RotateCcw } from "lucide-react";

import {
  ASIA_PACIFIC_BANDS,
  ASIAN_WAIST_CM,
  WHO_ACTION_POINTS,
  WHO_STANDARD_BANDS,
  asianBmi,
  feetInchesToCm,
  poundsToKg,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  unit: "metric",
  heightCm: "170",
  feet: "5",
  inches: "7",
  weightKg: "68",
  weightLb: "150",
  age: "34",
  sex: "male",
  waistCm: "94",
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
  return "text-[var(--foreground)]";
};

const bandRange = (band) => {
  if (band.min === 0) return `below ${band.max}`;
  if (band.max === Infinity) return `${band.min} and above`;
  return `${band.min} – ${band.max - 0.1 >= band.min ? (band.max - 0.1).toFixed(1) : band.max}`;
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
  const [waistCm, setWaistCm] = useState(DEFAULTS.waistCm);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const metric = unit === "metric";
    const h = metric ? toNum(heightCm) : feetInchesToCm(toNum(feet) || 0, toNum(inches) || 0);
    const w = metric ? toNum(weightKg) : poundsToKg(toNum(weightLb));
    const ageValue = toNum(age);
    const waistRaw = String(waistCm ?? "").trim();
    const waistValue = waistRaw === "" ? undefined : toNum(waistCm);
    if (waistRaw !== "" && Number.isNaN(waistValue)) {
      return { error: "Waist must be a number, or left blank." };
    }
    return asianBmi({
      heightCm: h,
      weightKg: w,
      age: Number.isNaN(ageValue) ? undefined : ageValue,
      sex,
      waistCm: waistValue,
    });
  }, [unit, heightCm, feet, inches, weightKg, weightLb, age, sex, waistCm]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Asian BMI Cutoff Calculator",
      `BMI: ${NUM1.format(result.bmi)} kg/m2`,
      `WHO Asia-Pacific: ${result.asianBand.label}`,
      `WHO international: ${result.standardBand.label}`,
      `Asia-Pacific healthy weight for this height: ${NUM1.format(result.healthyMinKg)}–${NUM1.format(result.healthyMaxKg)} kg`,
    ];
    if (result.excessKg > 0) lines.push(`Above the healthy band by ${NUM1.format(result.excessKg)} kg`);
    if (result.deficitKg > 0) lines.push(`Below the healthy band by ${NUM1.format(result.deficitKg)} kg`);
    if (result.waist) {
      lines.push(
        `Waist: ${NUM1.format(result.waist.value)} cm against the ${result.waist.threshold} cm South Asian threshold (${result.waist.abdominalObesity ? "above" : "below"})`,
      );
    }
    return lines.join("\n");
  }, [ok, result]);

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
    setWaistCm(DEFAULTS.waistCm);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Globe className="h-4 w-4" aria-hidden="true" />
          WHO Asia-Pacific
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Asian BMI Cutoff Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The same BMI number, read against the lower thresholds WHO recommends for Asian
          populations: overweight starts at 23 and obesity at 25 instead of 25 and 30.
        </p>
      </header>

      <section className={CARD}>
        <fieldset>
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
              <label className={LABEL} htmlFor="abmi-height">
                Height (cm)
              </label>
              <input
                id="abmi-height"
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
                <label className={LABEL} htmlFor="abmi-feet">
                  Height (ft)
                </label>
                <input
                  id="abmi-feet"
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
                <label className={LABEL} htmlFor="abmi-inches">
                  and (in)
                </label>
                <input
                  id="abmi-inches"
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
            <label className={LABEL} htmlFor="abmi-weight">
              Weight ({unit === "metric" ? "kg" : "lb"})
            </label>
            <input
              id="abmi-weight"
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

          <div>
            <label className={LABEL} htmlFor="abmi-age">
              Age (years)
            </label>
            <input
              id="abmi-age"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="18"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="abmi-sex">
              Sex (for the waist threshold)
            </label>
            <select
              id="abmi-sex"
              className={INPUT}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="abmi-waist">
              Waist circumference (cm, optional)
            </label>
            <input
              id="abmi-waist"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={waistCm}
              onChange={(event) => setWaistCm(event.target.value)}
              aria-describedby="abmi-waist-help"
            />
            <p id="abmi-waist-help" className="mt-1 text-xs text-[var(--muted-foreground)]">
              South Asian abdominal-obesity thresholds: {ASIAN_WAIST_CM.male} cm for men,{" "}
              {ASIAN_WAIST_CM.female} cm for women.
            </p>
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Body Mass Index
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? NUM1.format(result.bmi) : DASH}
            </p>
            <p className={`mt-1 text-sm font-semibold ${ok ? toneClass(result.asianBand.tone) : "text-[var(--muted-foreground)]"}`}>
              {ok ? `${result.asianBand.label} on the Asia-Pacific scale` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the Asian BMI result"
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

        {ok && result.reclassified && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            On the standard WHO scale this BMI reads as{" "}
            <strong>{result.standardBand.label.toLowerCase()}</strong>. The Asia-Pacific cutoffs move
            it up a category, because cardiometabolic risk rises at a lower BMI in South and East
            Asian populations.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["WHO Asia-Pacific classification", ok ? result.asianBand.label : DASH],
            ["WHO international classification", ok ? result.standardBand.label : DASH],
            [
              "Asia-Pacific healthy weight for your height",
              ok ? `${NUM1.format(result.healthyMinKg)} – ${NUM1.format(result.healthyMaxKg)} kg` : DASH,
            ],
            [
              "Distance from that band",
              !ok
                ? DASH
                : result.excessKg > 0
                  ? `${NUM1.format(result.excessKg)} kg above`
                  : result.deficitKg > 0
                    ? `${NUM1.format(result.deficitKg)} kg below`
                    : "Inside the band",
            ],
            [
              "Next WHO action point",
              !ok || result.nextActionPoint === null
                ? DASH
                : `BMI ${result.nextActionPoint} — ${NUM1.format(Math.abs(result.kgToNextPoint))} kg away`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.waist && (
          <div className="mt-4 rounded-md border border-[var(--border)] px-3 py-3 text-sm">
            <p className="font-semibold">
              Waist {NUM1.format(result.waist.value)} cm vs {result.waist.threshold} cm threshold
            </p>
            <p className={`mt-1 ${result.waist.abdominalObesity ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
              {result.waist.abdominalObesity
                ? `Above the South Asian abdominal-obesity cutoff by ${NUM1.format(result.waist.overBy)} cm.`
                : "Below the South Asian abdominal-obesity cutoff."}{" "}
              Waist-to-height ratio {NUM2.format(result.waist.waistToHeight)} (keep it under 0.50).
            </p>
          </div>
        )}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Where the two scales differ</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Asia-Pacific BMI</th>
                <th scope="col" className="py-2 font-semibold">WHO international BMI</th>
              </tr>
            </thead>
            <tbody>
              {ASIA_PACIFIC_BANDS.map((band, index) => {
                const counterpart = WHO_STANDARD_BANDS[index];
                const active = ok && result.asianBand.key === band.key;
                return (
                  <tr
                    key={band.key}
                    className={`border-b border-[var(--border)] last:border-0 ${active ? "bg-[var(--muted)]" : ""}`}
                  >
                    <td className={`py-2 pr-3 font-semibold ${active ? toneClass(band.tone) : ""}`}>
                      {band.label}
                    </td>
                    <td className="py-2 pr-3">{bandRange(band)}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">
                      {counterpart ? `${counterpart.label}: ${bandRange(counterpart)}` : DASH}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The 2004 WHO Lancet consultation kept the international bands for reporting but added
          public-health action points at BMI {WHO_ACTION_POINTS.join(", ")} for Asian populations.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. BMI does not measure body fat directly and reads high for very muscular
        people and low for people who have lost muscle. Discuss your own numbers with a doctor before
        acting on them.
      </p>
    </main>
  );
}
