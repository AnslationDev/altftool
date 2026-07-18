"use client";

import { useMemo, useState } from "react";
import {
  CircleAlert,
  Copy,
  Info,
  RotateCcw,
  Ruler,
  Scale,
  Stethoscope,
  Target,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.45359237;
const INCHES_AT_5FT = 60;

const FORMULAS = [
  {
    id: "hamwi",
    name: "Hamwi",
    year: 1964,
    male: { base: 48, perInch: 2.7 },
    female: { base: 45.5, perInch: 2.2 },
    note: "Built for quick clinical dosing estimates. Runs the highest of the four for tall men.",
  },
  {
    id: "devine",
    name: "Devine",
    year: 1974,
    male: { base: 50, perInch: 2.3 },
    female: { base: 45.5, perInch: 2.3 },
    note: "The default in most drug-dosing maths, which is what it was actually designed for.",
  },
  {
    id: "robinson",
    name: "Robinson",
    year: 1983,
    male: { base: 52, perInch: 1.9 },
    female: { base: 49, perInch: 1.7 },
    note: "A rework of Devine against real insurance-table data. Usually the most conservative.",
  },
  {
    id: "miller",
    name: "Miller",
    year: 1983,
    male: { base: 56.2, perInch: 1.41 },
    female: { base: 53.1, perInch: 1.36 },
    note: "Flattest slope of the four, so it drifts high for short people and low for tall ones.",
  },
];

const FRAMES = [
  { id: "small", label: "Small", hint: "Fine-boned, narrow wrists" },
  { id: "medium", label: "Medium", hint: "Average build" },
  { id: "large", label: "Large", hint: "Broad, heavy-boned" },
];

const STANDARDS = [
  {
    id: "who",
    label: "WHO standard",
    hint: "Healthy BMI 18.5-24.9",
    healthy: [18.5, 24.9],
    overweight: 25,
    obese: 30,
  },
  {
    id: "icmr",
    label: "Asian / Indian (ICMR)",
    hint: "Healthy BMI 18.5-22.9",
    healthy: [18.5, 22.9],
    overweight: 23,
    obese: 25,
  },
];

const FRAME_WINDOW = {
  small: [0, 0.45],
  medium: [0.25, 0.75],
  large: [0.55, 1],
};

const WRIST_RULES = {
  male: { small: 10.4, large: 9.6 },
  female: { small: 11, large: 10.1 },
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

const formatNumber = (value, digits = 1) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

const toMassUnit = (kg, unit) => (unit === "lb" ? kg / KG_PER_LB : kg);

function frameFromWrist({ gender, heightValue, wristValue }) {
  if (heightValue <= 0 || wristValue <= 0) return null;
  const ratio = heightValue / wristValue;
  const rule = WRIST_RULES[gender];
  if (ratio > rule.small) return { ratio, frame: "small" };
  if (ratio < rule.large) return { ratio, frame: "large" };
  return { ratio, frame: "medium" };
}

export default function ToolHome() {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("30");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [heightCmInput, setHeightCmInput] = useState("175");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [massUnit, setMassUnit] = useState("kg");
  const [currentWeight, setCurrentWeight] = useState("78");
  const [frame, setFrame] = useState("medium");
  const [wrist, setWrist] = useState("17");
  const [standardId, setStandardId] = useState("who");
  const [copied, setCopied] = useState(false);

  const standard = STANDARDS.find((item) => item.id === standardId) || STANDARDS[0];

  const heightCm = useMemo(
    () =>
      heightUnit === "cm"
        ? toNum(heightCmInput)
        : (toNum(feet) * 12 + toNum(inches)) * CM_PER_INCH,
    [feet, heightCmInput, heightUnit, inches]
  );

  const weightKg = useMemo(
    () => toNum(currentWeight) * (massUnit === "lb" ? KG_PER_LB : 1),
    [currentWeight, massUnit]
  );

  const switchHeightUnit = (next) => {
    if (next === heightUnit) return;
    if (next === "ftin") {
      const totalInches = toNum(heightCmInput) / CM_PER_INCH;
      const wholeFeet = Math.floor(totalInches / 12);
      setFeet(String(Math.max(0, wholeFeet)));
      setInches(String(round(totalInches - wholeFeet * 12, 1)));
      setWrist(String(round(toNum(wrist) / CM_PER_INCH, 1)));
    } else {
      setHeightCmInput(String(round((toNum(feet) * 12 + toNum(inches)) * CM_PER_INCH, 1)));
      setWrist(String(round(toNum(wrist) * CM_PER_INCH, 1)));
    }
    setHeightUnit(next);
  };

  const switchMassUnit = (next) => {
    if (next === massUnit) return;
    const factor = next === "lb" ? 1 / KG_PER_LB : KG_PER_LB;
    setCurrentWeight(String(round(toNum(currentWeight) * factor, 1)));
    setMassUnit(next);
  };

  const reset = () => {
    setGender("male");
    setAge("30");
    setHeightUnit("cm");
    setHeightCmInput("175");
    setFeet("5");
    setInches("9");
    setMassUnit("kg");
    setCurrentWeight("78");
    setFrame("medium");
    setWrist("17");
    setStandardId("who");
  };

  const wristUnit = heightUnit === "cm" ? "cm" : "in";
  const heightInWristUnit = heightUnit === "cm" ? heightCm : heightCm / CM_PER_INCH;

  const wristResult = useMemo(
    () =>
      frameFromWrist({
        gender,
        heightValue: heightInWristUnit,
        wristValue: toNum(wrist),
      }),
    [gender, heightInWristUnit, wrist]
  );

  const heightM = heightCm / 100;
  const heightSq = heightM * heightM;
  const inchesOver5ft = heightCm / CM_PER_INCH - INCHES_AT_5FT;
  const valid = heightCm >= 120 && heightCm <= 230;

  const formulaRows = useMemo(() => {
    if (!valid) return [];
    const frameFactor = frame === "small" ? 0.9 : frame === "large" ? 1.1 : 1;
    return FORMULAS.map((item) => {
      const coefficients = item[gender];
      const base = coefficients.base + coefficients.perInch * inchesOver5ft;
      return {
        ...item,
        base: Math.max(base, 0),
        adjusted: Math.max(base * frameFactor, 0),
      };
    });
  }, [frame, gender, inchesOver5ft, valid]);

  const ranges = useMemo(() => {
    if (!valid || heightSq <= 0) return null;
    const [bmiLow, bmiHigh] = standard.healthy;
    const span = bmiHigh - bmiLow;
    const [startFraction, endFraction] = FRAME_WINDOW[frame];
    const recommendedBmi = [bmiLow + span * startFraction, bmiLow + span * endFraction];
    return {
      healthyBmi: [bmiLow, bmiHigh],
      healthyKg: [bmiLow * heightSq, bmiHigh * heightSq],
      recommendedBmi,
      recommendedKg: [recommendedBmi[0] * heightSq, recommendedBmi[1] * heightSq],
    };
  }, [frame, heightSq, standard, valid]);

  const status = useMemo(() => {
    if (!ranges || weightKg <= 0) return null;
    const [low, high] = ranges.recommendedKg;
    if (weightKg < low) {
      return { state: "under", delta: low - weightKg, bound: low, tone: "warning" };
    }
    if (weightKg > high) {
      return { state: "over", delta: weightKg - high, bound: high, tone: "warning" };
    }
    return { state: "within", delta: 0, tone: "success" };
  }, [ranges, weightKg]);

  const currentBmi = heightSq > 0 && weightKg > 0 ? weightKg / heightSq : null;

  const bar = useMemo(() => {
    if (!ranges) return null;
    const minBmi = 15;
    const maxBmi = 35;
    const toPercent = (bmi) => clamp(((bmi - minBmi) / (maxBmi - minBmi)) * 100, 0, 100);
    return {
      minKg: minBmi * heightSq,
      maxKg: maxBmi * heightSq,
      segments: [
        { id: "under", label: "Underweight", from: minBmi, to: 18.5, tone: "info" },
        { id: "healthy", label: "Healthy", from: 18.5, to: standard.overweight, tone: "success" },
        {
          id: "overweight",
          label: "Overweight",
          from: standard.overweight,
          to: standard.obese,
          tone: "warning",
        },
        { id: "obese", label: "Obese", from: standard.obese, to: maxBmi, tone: "danger" },
      ].map((segment) => ({
        ...segment,
        width: ((segment.to - segment.from) / (maxBmi - minBmi)) * 100,
      })),
      recommendedLeft: toPercent(ranges.recommendedBmi[0]),
      recommendedWidth: toPercent(ranges.recommendedBmi[1]) - toPercent(ranges.recommendedBmi[0]),
      markerPercent: currentBmi === null ? null : toPercent(currentBmi),
      markerClamped: currentBmi !== null && (currentBmi < minBmi || currentBmi > maxBmi),
    };
  }, [currentBmi, heightSq, ranges, standard]);

  const ageYears = toNum(age);

  const report = useMemo(() => {
    if (!ranges) return "Enter a height between 120 cm and 230 cm.";
    const unitLabel = massUnit;
    const lines = [
      "Ideal Weight Report",
      `Profile: ${gender === "male" ? "Male" : "Female"}, ${formatNumber(ageYears, 0)} years, ${formatNumber(heightCm)} cm, ${frame} frame`,
      `Standard: ${standard.label} (healthy BMI ${standard.healthy[0]}-${standard.healthy[1]})`,
      "",
      `Recommended range: ${formatNumber(toMassUnit(ranges.recommendedKg[0], massUnit))}-${formatNumber(
        toMassUnit(ranges.recommendedKg[1], massUnit)
      )} ${unitLabel}`,
      `Full healthy BMI range: ${formatNumber(toMassUnit(ranges.healthyKg[0], massUnit))}-${formatNumber(
        toMassUnit(ranges.healthyKg[1], massUnit)
      )} ${unitLabel}`,
      `Current weight: ${formatNumber(toMassUnit(weightKg, massUnit))} ${unitLabel}${
        currentBmi === null ? "" : ` (BMI ${formatNumber(currentBmi)})`
      }`,
    ];
    if (status) {
      lines.push(
        status.state === "within"
          ? "Status: within the recommended range"
          : `Status: ${formatNumber(toMassUnit(status.delta, massUnit))} ${unitLabel} ${status.state} the recommended range`
      );
    }
    lines.push("", "Classic formulas:");
    formulaRows.forEach((item) => {
      lines.push(
        `  ${item.name} (${item.year}): ${formatNumber(toMassUnit(item.base, massUnit))} ${unitLabel} | frame-adjusted ${formatNumber(
          toMassUnit(item.adjusted, massUnit)
        )} ${unitLabel}`
      );
    });
    lines.push(
      "",
      "Population averages, not personal targets. Not medical advice."
    );
    return lines.join("\n");
  }, [
    ageYears,
    currentBmi,
    formulaRows,
    frame,
    gender,
    heightCm,
    massUnit,
    ranges,
    standard,
    status,
    weightKg,
  ]);

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const inputClass =
    "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

  const toneColor = {
    info: "var(--anslation-ds-info)",
    success: "var(--anslation-ds-success)",
    warning: "var(--anslation-ds-warning)",
    danger: "var(--anslation-ds-danger)",
  };

  const toneSoft = {
    info: "var(--anslation-ds-info-soft)",
    success: "var(--anslation-ds-success-soft)",
    warning: "var(--anslation-ds-warning-soft)",
    danger: "var(--anslation-ds-danger-soft)",
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Scale className="h-4 w-4" />
            Healthy weight range
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Ideal Weight Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            There is no single ideal weight — there is a range, and it shifts with your frame. See
            what the four classic clinical formulas say, compare them against BMI-based bands
            (including the tighter Indian cutoffs), and find where your weight actually sits.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-4">
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
                      onClick={() => setGender(item.id)}
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
              </div>

              <div>
                <span className="text-sm font-semibold">Height</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: "cm", label: "cm" },
                    { id: "ftin", label: "ft + in" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => switchHeightUnit(item.id)}
                      className={`h-10 rounded-md border text-sm font-semibold transition ${
                        heightUnit === item.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {heightUnit === "cm" ? (
                  <label className="mt-3 block">
                    <span className="text-sm font-semibold">Height in cm</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      value={heightCmInput}
                      onChange={(event) => setHeightCmInput(event.target.value)}
                      className={inputClass}
                    />
                  </label>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-sm font-semibold">Feet</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={feet}
                        onChange={(event) => setFeet(event.target.value)}
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold">Inches</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        value={inches}
                        onChange={(event) => setInches(event.target.value)}
                        className={inputClass}
                      />
                    </label>
                  </div>
                )}
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
                <div>
                  <span className="text-sm font-semibold">Weight unit</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {["kg", "lb"].map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => switchMassUnit(unit)}
                        className={`h-12 rounded-md border text-sm font-semibold transition ${
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

              <label className="block">
                <span className="text-sm font-semibold">Your current weight ({massUnit})</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={currentWeight}
                  onChange={(event) => setCurrentWeight(event.target.value)}
                  className={inputClass}
                />
              </label>

              <div>
                <span className="text-sm font-semibold">Frame size</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {FRAMES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFrame(item.id)}
                      className={`rounded-md border px-2 py-2 text-xs font-semibold transition ${
                        frame === item.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span className="block text-sm">{item.label}</span>
                      <span className="mt-0.5 block font-medium opacity-80">{item.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Ruler className="h-4 w-4 text-[var(--primary)]" />
                  Not sure? Measure your wrist
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  Wrap a tape around the smallest part of your wrist, just past the bony bump towards
                  your hand. Frame comes from height ÷ wrist.
                </p>
                <label className="mt-3 block">
                  <span className="text-sm font-semibold">Wrist circumference ({wristUnit})</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={wrist}
                    onChange={(event) => setWrist(event.target.value)}
                    className={inputClass}
                  />
                </label>
                {wristResult && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Ratio {formatNumber(wristResult.ratio, 2)} ={" "}
                      <span className="font-semibold text-[var(--foreground)]">
                        {wristResult.frame} frame
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setFrame(wristResult.frame)}
                      className="btn-secondary min-h-8 px-3 py-1 text-xs"
                      disabled={frame === wristResult.frame}
                    >
                      {frame === wristResult.frame ? "Applied" : "Apply"}
                    </button>
                  </div>
                )}
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  {gender === "male"
                    ? "Men: over 10.4 is a small frame, 9.6-10.4 medium, under 9.6 large."
                    : "Women: over 11.0 is a small frame, 10.1-11.0 medium, under 10.1 large."}
                </p>
              </div>

              <div>
                <span className="text-sm font-semibold">BMI standard</span>
                <div className="mt-2 grid gap-2">
                  {STANDARDS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStandardId(item.id)}
                      className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                        standardId === item.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span className="block">{item.label}</span>
                      <span className="mt-0.5 block text-xs font-medium opacity-80">
                        {item.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to defaults
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Recommended range · {frame} frame · {standard.label}
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

              {!ranges ? (
                <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--muted)] p-5 text-sm leading-6 text-[var(--muted-foreground)]">
                  Enter a height between 120 cm and 230 cm (roughly 3 ft 11 in to 7 ft 7 in). These
                  formulas were built for adults and do not extend meaningfully beyond that.
                </div>
              ) : (
                <>
                  <div className="mt-4 flex flex-wrap items-end gap-4" aria-live="polite">
                    <div className="rounded-lg bg-[var(--muted)] px-5 py-4">
                      <p className="text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                        {formatNumber(toMassUnit(ranges.recommendedKg[0], massUnit))}
                        <span className="mx-1 text-3xl">-</span>
                        {formatNumber(toMassUnit(ranges.recommendedKg[1], massUnit))}
                        <span className="ml-2 text-2xl">{massUnit}</span>
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                        Your healthy target range
                      </p>
                    </div>
                    {status && (
                      <div
                        className="inline-flex flex-col rounded-lg px-4 py-3"
                        style={{ background: toneSoft[status.tone] }}
                      >
                        <span
                          className="text-lg font-semibold"
                          style={{ color: toneColor[status.tone] }}
                        >
                          {status.state === "within"
                            ? "Within range"
                            : `${formatNumber(toMassUnit(status.delta, massUnit))} ${massUnit} ${status.state}`}
                        </span>
                        <span className="text-xs font-medium text-[var(--muted-foreground)]">
                          {status.state === "within"
                            ? `At ${formatNumber(toMassUnit(weightKg, massUnit))} ${massUnit}`
                            : `To reach ${formatNumber(toMassUnit(status.bound, massUnit))} ${massUnit}`}
                        </span>
                      </div>
                    )}
                    {currentBmi !== null && (
                      <div className="inline-flex flex-col rounded-lg border border-[var(--border)] px-4 py-3">
                        <span className="text-lg font-semibold">{formatNumber(currentBmi)}</span>
                        <span className="text-xs font-medium text-[var(--muted-foreground)]">
                          Current BMI
                        </span>
                      </div>
                    )}
                  </div>

                  {bar && (
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)]">
                        <span>
                          {formatNumber(toMassUnit(bar.minKg, massUnit), 0)} {massUnit}
                        </span>
                        <span>Weight scale at your height</span>
                        <span>
                          {formatNumber(toMassUnit(bar.maxKg, massUnit), 0)} {massUnit}
                        </span>
                      </div>
                      <div className="relative pb-1 pt-6">
                        <div
                          className="absolute top-0 flex h-5 items-center justify-center rounded-t-md border-2 border-b-0 border-dashed border-[var(--primary)]"
                          style={{
                            left: `${bar.recommendedLeft}%`,
                            width: `${bar.recommendedWidth}%`,
                          }}
                        >
                          <span className="whitespace-nowrap text-[10px] font-semibold text-[var(--primary)]">
                            Target
                          </span>
                        </div>
                        <div className="flex h-7 overflow-hidden rounded-md">
                          {bar.segments.map((segment) => (
                            <div
                              key={segment.id}
                              className="h-full"
                              style={{
                                width: `${segment.width}%`,
                                background: toneColor[segment.tone],
                              }}
                              title={`${segment.label}: BMI ${segment.from}-${segment.to}`}
                            />
                          ))}
                        </div>
                        {bar.markerPercent !== null && (
                          <>
                            <div
                              className="absolute bottom-1 h-9 w-0.5 rounded-full bg-[var(--foreground)]"
                              style={{ left: `${bar.markerPercent}%` }}
                            />
                            <div
                              className="absolute bottom-0 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm border border-[var(--card)] bg-[var(--foreground)]"
                              style={{ left: `${bar.markerPercent}%` }}
                            />
                          </>
                        )}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {bar.segments.map((segment) => (
                          <div
                            key={segment.id}
                            className="rounded-md border border-[var(--border)] p-2 text-center"
                          >
                            <span
                              className="block h-1 w-full rounded-full"
                              style={{ background: toneColor[segment.tone] }}
                            />
                            <p className="mt-2 text-xs font-semibold">{segment.label}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {formatNumber(toMassUnit(segment.from * heightSq, massUnit), 0)}-
                              {formatNumber(toMassUnit(segment.to * heightSq, massUnit), 0)}{" "}
                              {massUnit}
                            </p>
                          </div>
                        ))}
                      </div>
                      {bar.markerClamped && (
                        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                          Your weight sits outside this BMI 15-35 scale, so the marker is pinned to
                          the edge.
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                    Maths: the healthy band for {standard.label} is BMI {ranges.healthyBmi[0]}-
                    {ranges.healthyBmi[1]}, which at {formatNumber(heightCm)} cm is{" "}
                    {formatNumber(toMassUnit(ranges.healthyKg[0], massUnit))}-
                    {formatNumber(toMassUnit(ranges.healthyKg[1], massUnit))} {massUnit} (BMI ×
                    height in metres squared). A {frame} frame carries{" "}
                    {frame === "small"
                      ? "less bone and lean tissue, so the lower slice of that band fits"
                      : frame === "large"
                        ? "more bone and lean tissue, so the upper slice of that band fits"
                        : "an average build, so the middle of that band fits"}{" "}
                    — narrowing it to BMI {formatNumber(ranges.recommendedBmi[0])}-
                    {formatNumber(ranges.recommendedBmi[1])}. Every number here stays inside the
                    healthy band; frame shifts where in it you land, it does not push you past it.
                  </p>
                </>
              )}
            </div>

            {ranges && standardId === "who" && (
              <div
                className="rounded-lg border border-[var(--border)] p-5"
                style={{ background: toneSoft.info }}
              >
                <p className="flex items-start gap-2 text-sm leading-6">
                  <Info
                    className="mt-1 h-4 w-4 shrink-0"
                    style={{ color: "var(--anslation-ds-info)" }}
                  />
                  <span className="text-[var(--foreground)]">
                    <span className="font-semibold">Indian or South Asian? Use the ICMR cutoffs.</span>{" "}
                    South Asians carry more visceral fat and develop insulin resistance at lower
                    BMIs, so ICMR and the WHO Asian guidance call 23 overweight and 25 obese — not 25
                    and 30. That moves your healthy ceiling from{" "}
                    {formatNumber(toMassUnit(24.9 * heightSq, massUnit))} {massUnit} down to{" "}
                    {formatNumber(toMassUnit(22.9 * heightSq, massUnit))} {massUnit}. Switch the BMI
                    standard on the left to see your range under those numbers.
                  </span>
                </p>
              </div>
            )}

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5 text-[var(--primary)]" />
                Every classic formula, side by side
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                All four take a base weight at 5 ft and add a fixed amount per inch above it. They
                disagree by several kilos because each was fitted to different data — which is
                exactly why a range beats any single number.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Formula</th>
                      <th className="py-2 pr-3 font-semibold">Year</th>
                      <th className="py-2 pr-3 font-semibold">Ideal weight</th>
                      <th className="py-2 pr-3 font-semibold">Frame-adjusted</th>
                      <th className="py-2 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formulaRows.map((item) => (
                      <tr key={item.id} className="border-b border-[var(--border)]">
                        <td className="py-3 pr-3 font-semibold">{item.name}</td>
                        <td className="py-3 pr-3 text-[var(--muted-foreground)]">{item.year}</td>
                        <td className="py-3 pr-3 font-semibold">
                          {formatNumber(toMassUnit(item.base, massUnit))} {massUnit}
                        </td>
                        <td className="py-3 pr-3 font-semibold text-[var(--primary)]">
                          {formatNumber(toMassUnit(item.adjusted, massUnit))} {massUnit}
                        </td>
                        <td className="py-3 text-[var(--muted-foreground)]">{item.note}</td>
                      </tr>
                    ))}
                    {ranges && (
                      <>
                        <tr className="border-b border-[var(--border)]">
                          <td className="py-3 pr-3 font-semibold">BMI healthy range</td>
                          <td className="py-3 pr-3 text-[var(--muted-foreground)]">WHO</td>
                          <td className="py-3 pr-3 font-semibold" colSpan={2}>
                            {formatNumber(toMassUnit(18.5 * heightSq, massUnit))}-
                            {formatNumber(toMassUnit(24.9 * heightSq, massUnit))} {massUnit}
                          </td>
                          <td className="py-3 text-[var(--muted-foreground)]">
                            BMI 18.5-24.9 × height². A range, not a point — the honest answer.
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-3 font-semibold">BMI healthy range</td>
                          <td className="py-3 pr-3 text-[var(--muted-foreground)]">ICMR</td>
                          <td className="py-3 pr-3 font-semibold text-[var(--primary)]" colSpan={2}>
                            {formatNumber(toMassUnit(18.5 * heightSq, massUnit))}-
                            {formatNumber(toMassUnit(22.9 * heightSq, massUnit))} {massUnit}
                          </td>
                          <td className="py-3 text-[var(--muted-foreground)]">
                            Asian and Indian cutoffs: 23 is overweight, 25 is obese. More relevant if
                            you are South Asian.
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              {valid && (
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  Worked example — Devine ({gender === "male" ? "men" : "women"}):{" "}
                  {gender === "male" ? "50" : "45.5"} + 2.3 × {formatNumber(inchesOver5ft)} inches
                  over 5 ft = {formatNumber(toMassUnit(formulaRows[1]?.base || 0, massUnit))}{" "}
                  {massUnit}. The frame-adjusted column applies the standard Hamwi convention of ±10%
                  for a large or small frame.
                </p>
              )}
              {valid && heightCm < 152.4 && (
                <p
                  className="mt-4 rounded-md p-3 text-sm leading-6"
                  style={{ background: toneSoft.warning, color: "var(--foreground)" }}
                >
                  You are under 5 ft, so all four formulas are extrapolating backwards from their
                  base weight rather than adding to it. They are unreliable here — lean on the
                  BMI-based range instead.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <CircleAlert className="h-5 w-5 text-[var(--primary)]" />
                Read this before you chase a number
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold">Muscle weighs more than fat</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    A lifter and a sedentary person of the same height can be 12 kg apart on the
                    scale and the lifter is the healthier one. None of these formulas can tell the
                    difference — they only know your height.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold">Athletes should ignore this entirely</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    If you train seriously, BMI will label you overweight while your body fat says
                    otherwise. Rugby players and rowers routinely land in the obese band on paper.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold">Composition beats scale weight</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    Waist circumference and body fat percentage predict health outcomes better than
                    weight alone. A stable scale with a shrinking waist is progress, not a plateau.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold">These are population averages</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    Devine was built to dose medication, not to set life goals, and the insurance
                    tables behind the others describe crowds, not you. Treat the range as a sanity
                    check, not a target.
                  </p>
                </div>
              </div>
              {ageYears > 0 && ageYears < 18 && (
                <p
                  className="mt-4 rounded-md p-3 text-sm leading-6"
                  style={{ background: toneSoft.warning, color: "var(--foreground)" }}
                >
                  Under 18: none of this applies to you. Growing bodies are assessed with age-and-sex
                  BMI percentile charts, not adult formulas. Ask a paediatrician.
                </p>
              )}
              {ageYears >= 65 && (
                <p
                  className="mt-4 rounded-md p-3 text-sm leading-6"
                  style={{ background: toneSoft.info, color: "var(--foreground)" }}
                >
                  Over 65: a slightly higher BMI, roughly 23-27, is linked to better outcomes in older
                  adults, partly because some reserve protects against illness and falls. Do not chase
                  the bottom of this range, and protect muscle before you cut weight.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <Stethoscope className="mt-1 h-4 w-4 shrink-0" />
            These ranges are estimates for awareness, not medical advice. A healthy weight for you
            depends on your body composition, medical history, medication, and life stage — consult a
            doctor or a registered dietitian before setting a weight target or starting a diet.
          </p>
        </section>
      </div>
    </main>
  );
}
