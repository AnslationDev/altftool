"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Copy,
  Info,
  PersonStanding,
  RotateCcw,
  Ruler,
  Stethoscope,
  Target,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.45359237;

const METHODS = [
  { id: "navy", label: "US Navy tape method", hint: "Circumference based" },
  { id: "bmi", label: "BMI estimate (Deurenberg)", hint: "No tape needed" },
];

const MALE_BANDS = [
  { id: "essential", label: "Essential fat", range: "2-5%", from: 2, to: 6, tone: "info" },
  { id: "athlete", label: "Athlete", range: "6-13%", from: 6, to: 14, tone: "success" },
  { id: "fitness", label: "Fitness", range: "14-17%", from: 14, to: 18, tone: "primary" },
  { id: "average", label: "Average", range: "18-24%", from: 18, to: 25, tone: "warning" },
  { id: "obese", label: "Obese", range: "25%+", from: 25, to: 45, tone: "danger" },
];

const FEMALE_BANDS = [
  { id: "essential", label: "Essential fat", range: "10-13%", from: 10, to: 14, tone: "info" },
  { id: "athlete", label: "Athlete", range: "14-20%", from: 14, to: 21, tone: "success" },
  { id: "fitness", label: "Fitness", range: "21-24%", from: 21, to: 25, tone: "primary" },
  { id: "average", label: "Average", range: "25-31%", from: 25, to: 32, tone: "warning" },
  { id: "obese", label: "Obese", range: "32%+", from: 32, to: 50, tone: "danger" },
];

const TONE_COLOR = {
  info: "var(--anslation-ds-info)",
  success: "var(--anslation-ds-success)",
  primary: "var(--primary)",
  warning: "var(--anslation-ds-warning)",
  danger: "var(--anslation-ds-danger)",
};

const TONE_SOFT = {
  info: "var(--anslation-ds-info-soft)",
  success: "var(--anslation-ds-success-soft)",
  primary: "var(--anslation-ds-primary-soft)",
  warning: "var(--anslation-ds-warning-soft)",
  danger: "var(--anslation-ds-danger-soft)",
};

const PRESETS = [
  {
    label: "Lean male runner",
    gender: "male",
    age: "32",
    height: "178",
    weight: "68",
    neck: "36",
    waist: "76",
    hip: "92",
  },
  {
    label: "Average male desk job",
    gender: "male",
    age: "38",
    height: "175",
    weight: "84",
    neck: "40",
    waist: "97",
    hip: "99",
  },
  {
    label: "Active female",
    gender: "female",
    age: "29",
    height: "163",
    weight: "58",
    neck: "31",
    waist: "70",
    hip: "94",
  },
];

const DEFAULTS = {
  gender: "male",
  age: "30",
  height: "175",
  weight: "75",
  neck: "38",
  waist: "88",
  hip: "95",
};

const toNum = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toMassUnit = (kg, unit) => (unit === "lb" ? kg / KG_PER_LB : kg);

const formatNumber = (value, digits = 1) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

function navyBodyFat({ gender, heightCm, neckCm, waistCm, hipCm }) {
  if (heightCm <= 0) return null;
  if (gender === "male") {
    const gap = waistCm - neckCm;
    if (gap <= 0) return null;
    const value =
      495 / (1.0324 - 0.19077 * Math.log10(gap) + 0.15456 * Math.log10(heightCm)) - 450;
    return Number.isFinite(value) ? value : null;
  }
  const gap = waistCm + hipCm - neckCm;
  if (gap <= 0) return null;
  const value =
    495 / (1.29579 - 0.35004 * Math.log10(gap) + 0.221 * Math.log10(heightCm)) - 450;
  return Number.isFinite(value) ? value : null;
}

function deurenbergBodyFat({ bmi, age, gender }) {
  if (!Number.isFinite(bmi) || bmi <= 0) return null;
  const value = 1.2 * bmi + 0.23 * age - 10.8 * (gender === "male" ? 1 : 0) - 5.4;
  return Number.isFinite(value) ? value : null;
}

function bandFor(bands, bodyFat) {
  for (const band of bands) {
    if (bodyFat < band.to) return band;
  }
  return bands[bands.length - 1];
}

export default function ToolHome() {
  const [method, setMethod] = useState("navy");
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [age, setAge] = useState(DEFAULTS.age);
  const [lengthUnit, setLengthUnit] = useState("cm");
  const [massUnit, setMassUnit] = useState("kg");
  const [height, setHeight] = useState(DEFAULTS.height);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [neck, setNeck] = useState(DEFAULTS.neck);
  const [waist, setWaist] = useState(DEFAULTS.waist);
  const [hip, setHip] = useState(DEFAULTS.hip);
  const [targetBodyFat, setTargetBodyFat] = useState("15");
  const [copied, setCopied] = useState(false);

  const bands = gender === "male" ? MALE_BANDS : FEMALE_BANDS;
  const scaleMin = bands[0].from;
  const scaleMax = bands[bands.length - 1].to;

  const switchLengthUnit = (next) => {
    if (next === lengthUnit) return;
    const factor = next === "in" ? 1 / CM_PER_INCH : CM_PER_INCH;
    setHeight(String(round(toNum(height) * factor, 1)));
    setNeck(String(round(toNum(neck) * factor, 1)));
    setWaist(String(round(toNum(waist) * factor, 1)));
    setHip(String(round(toNum(hip) * factor, 1)));
    setLengthUnit(next);
  };

  const switchMassUnit = (next) => {
    if (next === massUnit) return;
    const factor = next === "lb" ? 1 / KG_PER_LB : KG_PER_LB;
    setWeight(String(round(toNum(weight) * factor, 1)));
    setMassUnit(next);
  };

  const applyPreset = (preset) => {
    setLengthUnit("cm");
    setMassUnit("kg");
    setGender(preset.gender);
    setAge(preset.age);
    setHeight(preset.height);
    setWeight(preset.weight);
    setNeck(preset.neck);
    setWaist(preset.waist);
    setHip(preset.hip);
    setTargetBodyFat(preset.gender === "male" ? "15" : "24");
  };

  const reset = () => {
    setMethod("navy");
    setLengthUnit("cm");
    setMassUnit("kg");
    setGender(DEFAULTS.gender);
    setAge(DEFAULTS.age);
    setHeight(DEFAULTS.height);
    setWeight(DEFAULTS.weight);
    setNeck(DEFAULTS.neck);
    setWaist(DEFAULTS.waist);
    setHip(DEFAULTS.hip);
    setTargetBodyFat("15");
  };

  const measures = useMemo(() => {
    const lengthFactor = lengthUnit === "in" ? CM_PER_INCH : 1;
    const massFactor = massUnit === "lb" ? KG_PER_LB : 1;
    return {
      heightCm: toNum(height) * lengthFactor,
      neckCm: toNum(neck) * lengthFactor,
      waistCm: toNum(waist) * lengthFactor,
      hipCm: toNum(hip) * lengthFactor,
      weightKg: toNum(weight) * massFactor,
      ageYears: clamp(toNum(age), 0, 120),
    };
  }, [age, height, hip, lengthUnit, massUnit, neck, waist, weight]);

  const results = useMemo(() => {
    const { heightCm, weightKg, ageYears } = measures;
    const heightM = heightCm / 100;
    const bmi = heightM > 0 && weightKg > 0 ? weightKg / (heightM * heightM) : null;
    const navy = navyBodyFat({ gender, ...measures });
    const bmiBased = bmi ? deurenbergBodyFat({ bmi, age: ageYears, gender }) : null;
    return {
      bmi,
      navy: navy === null ? null : clamp(navy, 1, 70),
      bmiBased: bmiBased === null ? null : clamp(bmiBased, 1, 70),
    };
  }, [gender, measures]);

  const active = method === "navy" ? results.navy : results.bmiBased;

  const composition = useMemo(() => {
    if (active === null || measures.weightKg <= 0) return null;
    const fatKg = (measures.weightKg * active) / 100;
    return {
      fatKg,
      leanKg: measures.weightKg - fatKg,
    };
  }, [active, measures.weightKg]);

  const band = active === null ? null : bandFor(bands, active);
  const belowEssential = active !== null && active < scaleMin;
  const markerPercent =
    active === null ? 0 : clamp(((active - scaleMin) / (scaleMax - scaleMin)) * 100, 0, 100);

  const goal = useMemo(() => {
    if (active === null || !composition || measures.weightKg <= 0) return null;
    const target = clamp(toNum(targetBodyFat), 3, 60);
    if (target >= active) {
      return { reached: true, target };
    }
    const targetWeightKg = composition.leanKg / (1 - target / 100);
    const fatLossKg = measures.weightKg - targetWeightKg;
    const fastWeeks = fatLossKg / (measures.weightKg * 0.01);
    const slowWeeks = fatLossKg / (measures.weightKg * 0.005);
    return {
      reached: false,
      target,
      targetWeightKg,
      fatLossKg,
      fastWeeks,
      slowWeeks,
      targetBand: bandFor(bands, target),
    };
  }, [active, bands, composition, measures.weightKg, targetBodyFat]);

  const toMass = (kg) => toMassUnit(kg, massUnit);

  const report = useMemo(() => {
    const lines = [
      "Body Fat Percentage Estimate",
      `Profile: ${gender === "male" ? "Male" : "Female"}, ${formatNumber(measures.ageYears, 0)} years`,
      `Height: ${formatNumber(toNum(height))} ${lengthUnit} | Weight: ${formatNumber(toNum(weight))} ${massUnit}`,
      `Neck: ${formatNumber(toNum(neck))} ${lengthUnit} | Waist: ${formatNumber(toNum(waist))} ${lengthUnit}${
        gender === "female" ? ` | Hips: ${formatNumber(toNum(hip))} ${lengthUnit}` : ""
      }`,
      "",
      `US Navy tape method: ${results.navy === null ? "needs valid measurements" : `${formatNumber(results.navy)}%`}`,
      `BMI estimate (Deurenberg): ${
        results.bmiBased === null ? "needs valid measurements" : `${formatNumber(results.bmiBased)}%`
      }`,
      `BMI: ${results.bmi === null ? "-" : formatNumber(results.bmi)}`,
      "",
      `Selected method: ${METHODS.find((item) => item.id === method)?.label}`,
      `Body fat: ${active === null ? "-" : `${formatNumber(active)}%`}`,
      `Category: ${band ? `${band.label} (${band.range})` : "-"}`,
    ];
    if (composition) {
      lines.push(
        `Fat mass: ${formatNumber(toMassUnit(composition.fatKg, massUnit))} ${massUnit}`,
        `Lean mass: ${formatNumber(toMassUnit(composition.leanKg, massUnit))} ${massUnit}`
      );
    }
    if (goal && !goal.reached) {
      lines.push(
        "",
        `Goal: ${formatNumber(goal.target)}% body fat`,
        `Fat to lose: ${formatNumber(toMassUnit(goal.fatLossKg, massUnit))} ${massUnit}`,
        `Target weight: ${formatNumber(toMassUnit(goal.targetWeightKg, massUnit))} ${massUnit}`,
        `Realistic timeline: ${Math.ceil(goal.fastWeeks)}-${Math.ceil(goal.slowWeeks)} weeks`
      );
    }
    lines.push("", "Tape estimates carry roughly +/- 3-4% error. Not medical advice.");
    return lines.join("\n");
  }, [
    active,
    band,
    composition,
    gender,
    goal,
    height,
    hip,
    lengthUnit,
    massUnit,
    measures.ageYears,
    method,
    neck,
    results,
    waist,
    weight,
  ]);

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const inputClass =
    "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <PersonStanding className="h-4 w-4" />
            Body composition
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Body Fat Percentage Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Two proven estimates from a tape measure or your BMI. See how much of your weight is fat
            versus lean tissue, where you land on the standard category scale, and what it takes to
            reach a target you can actually hold.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-2">
              {METHODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id)}
                  className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                    method === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="block">{item.label}</span>
                  <span className="mt-0.5 block text-xs font-medium opacity-80">{item.hint}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <span className="text-sm font-semibold">Gender</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: "male", label: "Male" },
                    { id: "female", label: "Female" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setGender(item.id);
                        setTargetBodyFat(item.id === "male" ? "15" : "24");
                      }}
                      className={`h-11 rounded-md border text-sm font-semibold transition ${
                        gender === item.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Both formulas use sex-specific constants, so this changes the maths, not just the
                  labels.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm font-semibold">Length unit</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {["cm", "in"].map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => switchLengthUnit(unit)}
                        className={`h-10 rounded-md border text-sm font-semibold transition ${
                          lengthUnit === unit
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-semibold">Weight unit</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {["kg", "lb"].map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => switchMassUnit(unit)}
                        className={`h-10 rounded-md border text-sm font-semibold transition ${
                          massUnit === unit
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Age</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Height ({lengthUnit})</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold">Weight ({massUnit})</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  className={inputClass}
                />
              </label>

              {method === "navy" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-sm font-semibold">Neck ({lengthUnit})</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        value={neck}
                        onChange={(event) => setNeck(event.target.value)}
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold">Waist ({lengthUnit})</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        value={waist}
                        onChange={(event) => setWaist(event.target.value)}
                        className={inputClass}
                      />
                    </label>
                  </div>
                  {gender === "female" && (
                    <label className="block">
                      <span className="text-sm font-semibold">Hips ({lengthUnit})</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        value={hip}
                        onChange={(event) => setHip(event.target.value)}
                        className={inputClass}
                      />
                      <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                        The female formula needs hips — the male one does not.
                      </span>
                    </label>
                  )}
                </>
              )}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  {method === "navy" ? "US Navy tape estimate" : "BMI-based estimate"}
                </p>
                <button
                  type="button"
                  onClick={copyReport}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy report"}
                </button>
              </div>

              {active === null ? (
                <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--muted)] p-5 text-sm leading-6 text-[var(--muted-foreground)]">
                  Check your measurements. The tape formula needs a waist larger than your neck
                  {gender === "female" ? " once hips are added" : ""}, and a height above zero.
                </div>
              ) : (
                <>
                  <div className="mt-4 flex flex-wrap items-end gap-4" aria-live="polite">
                    <div className="rounded-lg bg-[var(--muted)] px-5 py-4">
                      <p className="text-5xl font-semibold text-[var(--primary)]">
                        {formatNumber(active)}%
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                        Body fat
                      </p>
                    </div>
                    {band && (
                      <div
                        className="inline-flex flex-col rounded-lg px-4 py-3"
                        style={{ background: TONE_SOFT[band.tone] }}
                      >
                        <span
                          className="text-lg font-semibold"
                          style={{ color: TONE_COLOR[band.tone] }}
                        >
                          {band.label}
                        </span>
                        <span className="text-xs font-medium text-[var(--muted-foreground)]">
                          {gender === "male" ? "Men" : "Women"} · {band.range}
                        </span>
                      </div>
                    )}
                    {results.bmi !== null && (
                      <div className="inline-flex flex-col rounded-lg border border-[var(--border)] px-4 py-3">
                        <span className="text-lg font-semibold">{formatNumber(results.bmi)}</span>
                        <span className="text-xs font-medium text-[var(--muted-foreground)]">
                          BMI
                        </span>
                      </div>
                    )}
                  </div>

                  {belowEssential && (
                    <p
                      className="mt-4 rounded-md p-3 text-sm leading-6"
                      style={{
                        background: "var(--anslation-ds-danger-soft)",
                        color: "var(--anslation-ds-danger)",
                      }}
                    >
                      This estimate falls below the essential fat your body needs for hormones,
                      organs, and nerve function. Re-check your measurements, and speak to a doctor
                      before dropping any lower.
                    </p>
                  )}

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)]">
                      <span>{scaleMin}%</span>
                      <span>Category scale · {gender === "male" ? "men" : "women"}</span>
                      <span>{scaleMax}%</span>
                    </div>
                    <div className="relative">
                      <div className="flex h-6 overflow-hidden rounded-md">
                        {bands.map((item) => (
                          <div
                            key={item.id}
                            className="h-full"
                            style={{
                              width: `${((item.to - item.from) / (scaleMax - scaleMin)) * 100}%`,
                              background: TONE_COLOR[item.tone],
                            }}
                            title={`${item.label} ${item.range}`}
                          />
                        ))}
                      </div>
                      <div
                        className="absolute -top-1 h-8 w-0.5 rounded-full bg-[var(--foreground)]"
                        style={{ left: `${markerPercent}%` }}
                      />
                      <div
                        className="absolute -top-2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm border border-[var(--card)] bg-[var(--foreground)]"
                        style={{ left: `${markerPercent}%` }}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {bands.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-md border p-2 text-center ${
                            band && band.id === item.id
                              ? "border-[var(--primary)]"
                              : "border-[var(--border)]"
                          }`}
                        >
                          <span
                            className="block h-1 w-full rounded-full"
                            style={{ background: TONE_COLOR[item.tone] }}
                          />
                          <p className="mt-2 text-xs font-semibold">{item.label}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{item.range}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {composition && (
                    <div className="mt-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                            Fat mass
                          </p>
                          <p
                            className="mt-1 text-2xl font-semibold"
                            style={{ color: "var(--anslation-ds-warning)" }}
                          >
                            {formatNumber(toMass(composition.fatKg))} {massUnit}
                          </p>
                        </div>
                        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                            Lean mass (muscle, bone, organs, water)
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                            {formatNumber(toMass(composition.leanKg))} {massUnit}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex h-8 overflow-hidden rounded-md border border-[var(--border)]">
                        <div
                          className="flex items-center justify-center text-xs font-semibold"
                          style={{
                            width: `${clamp(active, 0, 100)}%`,
                            background: "var(--anslation-ds-warning)",
                            color: "var(--anslation-ds-warning-soft)",
                          }}
                        >
                          {active >= 12 ? "Fat" : ""}
                        </div>
                        <div
                          className="flex items-center justify-center text-xs font-semibold"
                          style={{
                            width: `${clamp(100 - active, 0, 100)}%`,
                            background: "var(--primary)",
                            color: "var(--primary-foreground)",
                          }}
                        >
                          Lean
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                    {method === "navy" ? (
                      gender === "male" ? (
                        <>
                          Formula (US Navy, men): 495 / (1.0324 − 0.19077 × log10(waist − neck) +
                          0.15456 × log10(height)) − 450, with every length converted to cm.
                        </>
                      ) : (
                        <>
                          Formula (US Navy, women): 495 / (1.29579 − 0.35004 × log10(waist + hips −
                          neck) + 0.22100 × log10(height)) − 450, with every length converted to cm.
                        </>
                      )
                    ) : (
                      <>
                        Formula (Deurenberg 1991): 1.20 × BMI + 0.23 × age − 10.8 × sex − 5.4, where
                        sex is 1 for men and 0 for women. BMI = weight(kg) / height(m)².
                      </>
                    )}
                  </p>
                </>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Activity className="h-5 w-5 text-[var(--primary)]" />
                Both methods, side by side
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Method</th>
                      <th className="py-2 pr-3 font-semibold">Estimate</th>
                      <th className="py-2 pr-3 font-semibold">Typical error</th>
                      <th className="py-2 font-semibold">What it actually measures</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-3 pr-3 font-semibold">US Navy tape</td>
                      <td className="py-3 pr-3 font-semibold text-[var(--primary)]">
                        {results.navy === null ? "—" : `${formatNumber(results.navy)}%`}
                      </td>
                      <td className="py-3 pr-3 text-[var(--muted-foreground)]">±3-4%</td>
                      <td className="py-3 text-[var(--muted-foreground)]">
                        Your real girths, so it reacts to where fat is actually stored.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-semibold">BMI (Deurenberg)</td>
                      <td className="py-3 pr-3 font-semibold">
                        {results.bmiBased === null ? "—" : `${formatNumber(results.bmiBased)}%`}
                      </td>
                      <td className="py-3 pr-3 text-[var(--muted-foreground)]">±5% or worse</td>
                      <td className="py-3 text-[var(--muted-foreground)]">
                        Only height, weight, age, sex — it cannot tell muscle from fat.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 rounded-md bg-[var(--muted)] p-4">
                <p className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <Info className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" />
                  <span>
                    <span className="font-semibold text-[var(--foreground)]">
                      Trust the tape method more.
                    </span>{" "}
                    It measures you, not a population average: two people with an identical BMI can
                    differ by 15 points of body fat, and the BMI formula would score them the same.
                    The Deurenberg equation is a fallback for when you have no tape — it overstates
                    body fat in muscular people and understates it in someone lightly built who
                    carries fat around the middle.{" "}
                    {results.navy !== null &&
                      results.bmiBased !== null &&
                      `Yours differ by ${formatNumber(Math.abs(results.navy - results.bmiBased))} points right now.`}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5 text-[var(--primary)]" />
                Goal planner
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Assumes you hold on to every kilo of lean mass — which is what training hard and
                eating enough protein is for. Lose faster than this and some of that loss will be
                muscle.
              </p>
              <label className="mt-4 block max-w-xs">
                <span className="text-sm font-semibold">Target body fat %</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={targetBodyFat}
                  onChange={(event) => setTargetBodyFat(event.target.value)}
                  className={inputClass}
                />
              </label>

              {!goal && (
                <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                  Enter valid measurements to plan a goal.
                </p>
              )}

              {goal && goal.reached && (
                <p
                  className="mt-4 rounded-md p-4 text-sm leading-6"
                  style={{
                    background: "var(--anslation-ds-success-soft)",
                    color: "var(--anslation-ds-success)",
                  }}
                >
                  You are already at or below {formatNumber(goal.target)}%. Holding a level is its
                  own project — keep training and eating at maintenance rather than chasing lower.
                </p>
              )}

              {goal && !goal.reached && (
                <>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                        Fat to lose
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                        {formatNumber(toMass(goal.fatLossKg))} {massUnit}
                      </p>
                    </div>
                    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                        Weight at goal
                      </p>
                      <p className="mt-1 text-2xl font-semibold">
                        {formatNumber(toMass(goal.targetWeightKg))} {massUnit}
                      </p>
                    </div>
                    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                        Realistic timeline
                      </p>
                      <p className="mt-1 text-2xl font-semibold">
                        {Math.ceil(goal.fastWeeks)}-{Math.ceil(goal.slowWeeks)} weeks
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                    Maths: lean mass stays at {formatNumber(toMass(composition.leanKg))} {massUnit},
                    so goal weight = lean ÷ (1 − {formatNumber(goal.target)}%) ={" "}
                    {formatNumber(toMass(goal.targetWeightKg))} {massUnit}. Losing{" "}
                    {formatNumber(toMass(goal.fatLossKg))} {massUnit} at a sustainable 0.5-1% of body
                    weight per week ({formatNumber(toMass(measures.weightKg * 0.005), 2)}-
                    {formatNumber(toMass(measures.weightKg * 0.01), 2)} {massUnit} a week) puts you
                    in the {goal.targetBand.label.toLowerCase()} band in roughly{" "}
                    {Math.ceil(goal.fastWeeks)} to {Math.ceil(goal.slowWeeks)} weeks.
                  </p>
                </>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Ruler className="h-5 w-5 text-[var(--primary)]" />
                How to take the measurements
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                The tape method is only as good as the tape work. A centimetre of sloppiness at the
                waist moves the result by about a full point.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold">Neck</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    Just below the larynx, with the tape sloping very slightly down towards the
                    front. Look straight ahead, shoulders relaxed and not flared — hunching adds
                    girth and lowers your result artificially.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold">Waist</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    {gender === "male"
                      ? "Men: horizontally across the navel. Not the narrowest point, not where your belt sits — the navel."
                      : "Women: at the narrowest point of the natural waist, usually just above the navel. If there is no obvious narrow point, use the midpoint between your lowest rib and hip bone."}
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold">Hips</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    Feet together, tape horizontal all the way round at the widest part of the
                    buttocks. Used by the female formula only.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold">Every measurement</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    Bare skin, tape snug but never pulled tight enough to dent you. Read it at the
                    end of a normal exhale — do not suck in or hold your breath. Take each one twice
                    and average; if the two differ by more than half a centimetre, take a third.
                  </p>
                </div>
              </div>
              <p className="mt-4 rounded-md bg-[var(--muted)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
                Measure first thing in the morning, before eating or drinking, and keep it that way.
                Comparing a morning number to an after-dinner number invents change that is not
                there.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Info className="h-5 w-5 text-[var(--primary)]" />
                How accurate is this, honestly
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold">Tape method</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--primary)]">±3-4%</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    A reading of 20% honestly means somewhere around 16-24%.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold">BMI estimate</p>
                  <p className="mt-1 text-xl font-semibold">±5% or worse</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    Worst for athletes, older adults, and anyone away from the population average.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold">DEXA scan</p>
                  <p className="mt-1 text-xl font-semibold">±1-2%</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    The practical gold standard, and what these formulas are validated against.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Neither formula here can see inside you — both were fitted to a population and then
                applied to you. So treat the absolute number as a ballpark, and the trend as the real
                signal: the same tape, the same person measuring, the same time of day, every couple
                of weeks. A drop of three points measured consistently is real progress even if the
                starting number was two points off. If you need the true value — for a competition, a
                clinical question, or plain curiosity — book a DEXA scan.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <Stethoscope className="mt-1 h-4 w-4 shrink-0" />
            These figures are estimates for awareness, not medical advice. Body fat targets are
            personal and depend on your health history, training, and life stage — consult a doctor
            or a registered dietitian before starting a weight-loss plan, and especially before
            aiming for a low body fat percentage.
          </p>
        </section>
      </div>
    </main>
  );
}
