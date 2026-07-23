"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Copy,
  Download,
  Flame,
  Info,
  PersonStanding,
  RotateCcw,
  Ruler,
  Stethoscope,
  Target,
  User,
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
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [gaugeValue, setGaugeValue] = useState(0);
  const [entries, setEntries] = useState([
    { date: "May 1", bodyFat: 23.6 },
    { date: "May 15", bodyFat: 22.0 },
    { date: "Jun 1", bodyFat: 20.5 },
    { date: "Jun 15", bodyFat: 19.8 },
    { date: "Jul 1", bodyFat: 19.2 },
  ]);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [newEntryVal, setNewEntryVal] = useState("");

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
    setShowResult(false);
    setIsLoading(false);
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

  useEffect(() => {
    if (showResult && active !== null) {
      setGaugeValue(0);
      const timer = setTimeout(() => {
        setGaugeValue(active);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showResult, active]);

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

  const handleCalculateClick = () => {
    setIsLoading(true);
    setShowResult(false);
    setTimeout(() => {
      setIsLoading(false);
      setShowResult(true);
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 750);
  };

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const downloadReport = () => {
    const text = `Body Fat Calculator Results:
-----------------------------
Estimation Method: ${method === "navy" ? "US Navy tape method" : "BMI-based method"}
Body Fat Percentage: ${active !== null ? formatNumber(active, 1) : "--"}% (${band?.label || ""})
Lean Mass: ${composition ? `${formatNumber(toMassUnit(composition.leanKg, massUnit), 1)} ${massUnit}` : "--"}
Fat Mass: ${composition ? `${formatNumber(toMassUnit(composition.fatKg, massUnit), 1)} ${massUnit}` : "--"}
BMI: ${results.bmi !== null ? formatNumber(results.bmi, 1) : "--"}
Healthy range for ${gender}: ${gender === "male" ? "6% - 24%" : "14% - 31%"}`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `body-fat-results.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const inputClass =
    "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Banner / Header (Full Width look matching BMR tool style) */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-3xl p-6 md:p-8 border border-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex-1 space-y-4 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              Body Composition
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
              Body Fat Percentage Calculator
            </h1>
            <p className="text-slate-650 text-sm md:text-base leading-relaxed max-w-xl">
              Get accurate body fat % using proven methods. See where you stand, track progress, and hit your goal.
            </p>
          </div>

          {/* Right Side: Live Interactive Body Composition Card */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl p-5 shadow-lg shadow-slate-100/50 flex items-center gap-6 z-10 w-full md:w-auto md:min-w-[380px]">
            {/* SVG Silhouette Visualizer */}
            <div className="relative w-24 h-24 rounded-full border border-slate-100 bg-slate-50/50 flex items-center justify-center shrink-0">
              {/* Circular segment progress */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 - (282.7 * (active || 0)) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Body visual */}
              <svg className="w-10 h-16 text-emerald-500" viewBox="0 0 40 100">
                <defs>
                  <clipPath id="bodyClip">
                    <path d="M20,10 C23,10 25,12 25,15 C25,18 23,20 20,20 C17,20 15,18 15,15 C15,12 17,10 20,10 Z M13,22 L27,22 C29,22 30,24 29,26 L27,45 C27,46 26,47 25,47 L25,90 C25,92 23,93 21,93 C19,93 19,91 19,90 L19,55 L17,55 L17,90 C17,91 17,93 15,93 C13,93 11,92 11,90 L11,47 C10,47 9,46 9,45 L7,26 C6,24 7,22 9,22 Z" />
                  </clipPath>
                </defs>
                <path d="M20,10 C23,10 25,12 25,15 C25,18 23,20 20,20 C17,20 15,18 15,15 C15,12 17,10 20,10 Z M13,22 L27,22 C29,22 30,24 29,26 L27,45 C27,46 26,47 25,47 L25,90 C25,92 23,93 21,93 C19,93 19,91 19,90 L19,55 L17,55 L17,90 C17,91 17,93 15,93 C13,93 11,92 11,90 L11,47 C10,47 9,46 9,45 L7,26 C6,24 7,22 9,22 Z" fill="#e2e8f0" />
                <rect x="0" y={100 - (active || 0)} width="40" height={active || 0} fill="#f59e0b" clipPath="url(#bodyClip)" className="transition-all duration-1000 ease-out" />
                <path d="M20,10 C23,10 25,12 25,15 C25,18 23,20 20,20 C17,20 15,18 15,15 C15,12 17,10 20,10 Z M13,22 L27,22 C29,22 30,24 29,26 L27,45 C27,46 26,47 25,47 L25,90 C25,92 23,93 21,93 C19,93 19,91 19,90 L19,55 L17,55 L17,90 C17,91 17,93 15,93 C13,93 11,92 11,90 L11,47 C10,47 9,46 9,45 L7,26 C6,24 7,22 9,22 Z" fill="none" stroke="#10b981" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 flex-1">
              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Lean Mass</span>
                <span className="text-sm font-black text-slate-800 block">
                  {composition ? `${formatNumber(toMassUnit(composition.leanKg, massUnit), 1)} ${massUnit}` : "--"}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Fat Mass</span>
                <span className="text-sm font-black text-slate-800 block">
                  {composition ? `${formatNumber(toMassUnit(composition.fatKg, massUnit), 1)} ${massUnit}` : "--"}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Body Fat</span>
                <span className="text-sm font-black text-amber-600 block">
                  {active !== null ? `${formatNumber(active, 1)}%` : "--"}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">BMI</span>
                <span className="text-sm font-black text-blue-600 block">
                  {results.bmi !== null ? formatNumber(results.bmi, 1) : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-1 gap-6 max-w-6xl mx-auto w-full">
          {!isLoading && !showResult && (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 w-full">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-650 text-white font-bold text-xs">
                  1
                </span>
                <h2 className="text-base font-bold text-slate-700">Enter Your Details</h2>
              </div>
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All
              </button>
            </div>

            {/* Grid for horizontal layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Configuration parameters */}
              <div className="space-y-6">
                {/* Method selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Estimation Method</label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod("navy")}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        method === "navy"
                          ? "bg-white border-emerald-500 text-emerald-600 shadow-sm"
                          : "bg-slate-50/50 border-slate-200/80 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-base">📏</span>
                      <div>
                        <span className="block text-xs font-black uppercase tracking-wider">US Navy Tape Method</span>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Circumference based</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod("bmi")}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        method === "bmi"
                          ? "bg-white border-emerald-500 text-emerald-600 shadow-sm"
                          : "bg-slate-50/50 border-slate-200/80 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-base">⚖️</span>
                      <div>
                        <span className="block text-xs font-black uppercase tracking-wider">BMI (Deurenberg)</span>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">No tape needed</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Gender selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setGender("male");
                        setTargetBodyFat("15");
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        gender === "male"
                          ? "bg-[#10b981] border-[#10b981] text-white shadow-md shadow-emerald-500/10"
                          : "bg-slate-50/50 border-slate-200/80 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGender("female");
                        setTargetBodyFat("24");
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        gender === "female"
                          ? "bg-[#10b981] border-[#10b981] text-white shadow-md shadow-emerald-500/10"
                          : "bg-slate-50/50 border-slate-200/80 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Female
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium pl-0.5">
                    Formulas use sex-specific constants for accuracy
                  </p>
                </div>

                {/* Units Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Units</label>
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/40 max-w-xs">
                    <button
                      type="button"
                      onClick={() => {
                        switchLengthUnit("cm");
                        switchMassUnit("kg");
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        lengthUnit === "cm" && massUnit === "kg"
                          ? "bg-white text-emerald-600 shadow-sm border border-emerald-500/10"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Metric (cm, kg)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        switchLengthUnit("in");
                        switchMassUnit("lb");
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        lengthUnit === "in" && massUnit === "lb"
                          ? "bg-white text-emerald-600 shadow-sm border border-emerald-500/10"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Imperial (in, lb)
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Input Fields */}
              <div className="space-y-5">
                {/* Grid Row 1: Age, Height, Weight */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Age</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                      />
                      <span className="absolute right-2 text-[8px] font-black text-slate-400 uppercase">Yrs</span>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Height</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.1"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                      />
                      <span className="absolute right-2 text-[8px] font-black text-slate-400 uppercase">{lengthUnit}</span>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Weight</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                      />
                      <span className="absolute right-2 text-[8px] font-black text-slate-400 uppercase">{massUnit}</span>
                    </div>
                  </div>
                </div>

                {/* Grid Row 2: Neck, Waist, Hip (dependent on method/gender) */}
                {method === "navy" && (
                  <div className={`grid grid-cols-1 gap-3 ${gender === "female" ? "grid-cols-3" : "grid-cols-2"}`}>
                    {/* Neck */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Neck ({lengthUnit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={neck}
                        onChange={(e) => setNeck(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Waist */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Waist ({lengthUnit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={waist}
                        onChange={(e) => setWaist(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Hips (Female Only) */}
                    {gender === "female" && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Hips ({lengthUnit})</label>
                        <input
                          type="number"
                          step="0.1"
                          value={hip}
                          onChange={(e) => setHip(e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Presets Row */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Presets</span>
                    <span className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer transition-colors">
                      + Save Preset
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-650 hover:bg-slate-50 hover:border-emerald-500/30 transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculate / Action Button */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCalculateClick}
                    className="w-full bg-[#10b981] hover:bg-[#0d9488] text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/10 transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    Calculate Body Fat %
                  </button>
                  <p className="text-[9px] text-slate-400 font-medium text-center">
                    Your data is used only in your browser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

            {/* Loader Spinner */}
            {isLoading && (
              <div className="bg-white border border-slate-200/60 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center space-y-6 max-w-6xl mx-auto animate-pulse">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="text-center space-y-2">
                  <h3 className="text-base font-bold text-slate-700">Analyzing Body Composition...</h3>
                  <p className="text-xs text-slate-400 font-medium max-w-xs">
                    Computing subcutaneous fat distribution and lean mass percentages using {method === "navy" ? "Navy Tape" : "BMI Deurenberg"} equations.
                  </p>
                </div>
              </div>
            )}

            {/* Results Section Dashboard */}
            {!isLoading && showResult && (
              <div className="grid gap-6 max-w-6xl mx-auto w-full" id="results-section">

                {/* Custom Results Card */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm space-y-4 w-full animate-fadeIn">

                  {/* Header row */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-650 text-white font-bold text-xs animate-bounce">
                        2
                      </span>
                      <h2 className="text-base font-bold text-slate-700">Your Results</h2>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowResult(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-650 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={copyReport}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-650 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied ? "Copied" : "Copy"}
                      </button>
                      <button
                        type="button"
                        onClick={downloadReport}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-650 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>

                  {active === null ? (
                    <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--muted)] p-5 text-sm leading-6 text-[var(--muted-foreground)]">
                      Check your measurements. The tape formula needs a waist larger than your neck
                      {gender === "female" ? " once hips are added" : ""}, and a height above zero.
                    </div>
                  ) : (
                    <>
                      {/* Core body fat display */}
                      <div className="text-center space-y-1 py-1 animate-fadeIn">
                        <h3 className="text-4xl md:text-5xl font-black text-emerald-600 tracking-tight transition-all duration-700 hover:scale-105">
                          {formatNumber(active, 1)}%
                        </h3>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Body Fat Percentage
                        </span>
                        {band && (
                          <span className={`inline-flex px-3 py-0.5 rounded-full text-xs font-bold border transition-all duration-300 hover:rotate-1 ${
                            band.tone === "info" ? "bg-blue-50 text-blue-600 border-blue-200/50" :
                            band.tone === "success" ? "bg-emerald-50 text-emerald-600 border-emerald-200/50" :
                            band.tone === "primary" ? "bg-sky-50 text-sky-600 border-sky-200/50" :
                            band.tone === "warning" ? "bg-amber-50 text-amber-600 border-amber-200/50" :
                            "bg-rose-50 text-rose-600 border-rose-200/50"
                          }`}>
                            {band.label}
                          </span>
                        )}
                      </div>

                      {/* Arc gauge visualizer */}
                      <div className="space-y-3">
                        <div className="relative flex justify-center">
                          <svg className="w-full max-w-sm h-22" viewBox="0 0 200 100">
                            <defs>
                              <linearGradient id="bodyFatArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#60a5fa" /> {/* Essential */}
                                <stop offset="25%" stopColor="#34d399" /> {/* Athletic */}
                                <stop offset="50%" stopColor="#059669" /> {/* Fitness */}
                                <stop offset="75%" stopColor="#f59e0b" /> {/* Average */}
                                <stop offset="100%" stopColor="#f87171" /> {/* Obese */}
                              </linearGradient>
                            </defs>
                            {/* Background track */}
                            <path
                              d="M 20,85 A 80,80 0 0,1 180,85"
                              fill="none"
                              stroke="#f1f5f9"
                              strokeWidth="8"
                              strokeLinecap="round"
                            />
                            {/* Colored gradient track */}
                            <path
                              d="M 20,85 A 80,80 0 0,1 180,85"
                              fill="none"
                              stroke="url(#bodyFatArcGrad)"
                              strokeWidth="8"
                              strokeLinecap="round"
                            />
                            {/* Needle pointer */}
                            <line
                              x1="100"
                              y1="85"
                              x2={100 + 62 * Math.cos(Math.PI - (clamp(((gaugeValue || 0) - scaleMin) / (scaleMax - scaleMin) * 100, 0, 100) / 100) * Math.PI)}
                              y2={85 - 62 * Math.sin(Math.PI - (clamp(((gaugeValue || 0) - scaleMin) / (scaleMax - scaleMin) * 100, 0, 100) / 100) * Math.PI)}
                              stroke="#1e293b"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                            />
                            <circle cx="100" cy="85" r="4" fill="#1e293b" />
                          </svg>
                        </div>

                        {/* Arc Categories List */}
                        <div className="grid grid-cols-5 text-center max-w-sm mx-auto gap-1">
                          {bands.map((b) => (
                            <div key={b.id} className="space-y-0.5">
                              <span className="text-[9px] font-bold text-slate-700 block leading-tight">{b.label}</span>
                              <span className="text-[8px] font-bold text-slate-400 block">{b.range}</span>
                            </div>
                          ))}
                        </div>

                        {/* Healthy Range Box */}
                        <div className="bg-emerald-50/50 text-emerald-800 border border-emerald-100/50 rounded-xl py-2.5 px-4 text-xs font-bold text-center max-w-md mx-auto mt-2">
                          Healthy body fat range for {gender === "male" ? "men" : "women"}: {gender === "male" ? "6% – 24%" : "14% – 31%"}
                        </div>
                      </div>

                      {/* 4 Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* Fat Mass */}
                        <div className="bg-amber-50/20 border border-amber-100/40 p-4 rounded-xl flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-white border border-amber-100/20 text-amber-500">
                            <Flame className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Fat Mass</span>
                            <span className="text-sm font-black text-slate-700 block mt-0.5">
                              {composition ? `${formatNumber(toMassUnit(composition.fatKg, massUnit), 1)} ${massUnit}` : "--"}
                            </span>
                          </div>
                        </div>

                        {/* Lean Mass */}
                        <div className="bg-emerald-50/20 border border-emerald-100/40 p-4 rounded-xl flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-white border border-emerald-100/20 text-emerald-600">
                            <span className="text-base font-bold">💪</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Lean Mass</span>
                            <span className="text-sm font-black text-slate-700 block mt-0.5">
                              {composition ? `${formatNumber(toMassUnit(composition.leanKg, massUnit), 1)} ${massUnit}` : "--"}
                            </span>
                          </div>
                        </div>

                        {/* BMI */}
                        <div className="bg-blue-50/20 border border-blue-100/40 p-4 rounded-xl flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-white border border-blue-100/20 text-blue-500">
                            <Activity className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">BMI</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-black text-slate-700">
                                {results.bmi !== null ? formatNumber(results.bmi, 1) : "--"}
                              </span>
                              {results.bmi !== null && (
                                <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md uppercase">
                                  {results.bmi < 18.5 ? "Underweight" : results.bmi < 25 ? "Normal" : results.bmi < 30 ? "Overweight" : "Obese"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Health Category */}
                        <div className="bg-amber-50/20 border border-amber-100/40 p-4 rounded-xl flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-white border border-amber-100/20 text-amber-500">
                            <span className="text-base font-bold">🛡️</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Health Category</span>
                            <span className="text-sm font-black text-amber-600 block mt-0.5">
                              {band?.label || "--"}
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold block">
                              {gender === "male" ? "Men" : "Women"}: {band?.range || "--"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Confidence Card */}
                      <div className="bg-emerald-50/30 border border-emerald-100/40 p-4.5 rounded-xl flex items-start gap-3 mt-4">
                        <span className="text-lg text-emerald-500">🛡️</span>
                        <div>
                          <span className="text-xs font-black text-emerald-800 block">Confidence: High</span>
                          <span className="text-[10px] text-emerald-700/80 font-bold block mt-0.5">
                            Based on {method === "navy" ? "US Navy tape method" : "BMI Deurenberg method"} calculations
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 3 Body Composition Overview Card */}
                {active !== null && composition && (
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm space-y-5 w-full animate-fadeIn">

                    {/* Header row */}
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-650 text-white font-bold text-xs">
                          3
                        </span>
                        <h2 className="text-base font-bold text-slate-700">Body Composition Overview</h2>
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold mt-1">Breakdown of your body composition</p>
                    </div>

                    {/* Progress bar and Donut layout row */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">

                      {/* Left: Horizontal breakdown bar */}
                      <div className="w-full flex-1 space-y-4">
                        <div className="h-6 flex rounded-lg overflow-hidden border border-slate-200/40">
                          <div
                            style={{ width: `${active}%` }}
                            className="bg-amber-500 flex items-center justify-center text-[10px] font-black text-white transition-all duration-[1000ms] ease-out"
                          >
                            {formatNumber(active, 1)}%
                          </div>
                          <div
                            style={{ width: `${100 - active}%` }}
                            className="bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white transition-all duration-[1000ms] ease-out"
                          >
                            {formatNumber(100 - active, 1)}%
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                          <span className="text-amber-500">Fat Mass</span>
                          <span className="text-emerald-500">Lean Mass</span>
                        </div>
                      </div>

                      {/* Right: Donut visualization chart */}
                      <div className="flex items-center gap-4.5 bg-slate-50/50 border border-slate-100 rounded-2xl p-3">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 60 60">
                          {/* Grey background circle */}
                          <circle
                            cx="30"
                            cy="30"
                            r="24"
                            fill="transparent"
                            stroke="#f1f5f9"
                            strokeWidth="5"
                          />
                          {/* Lean Mass (emerald) ring */}
                          <circle
                            cx="30"
                            cy="30"
                            r="24"
                            fill="transparent"
                            stroke="#10b981"
                            strokeWidth="5"
                            strokeDasharray="150.8"
                            strokeDashoffset="0"
                          />
                          {/* Fat Mass (orange) slice */}
                          <circle
                            cx="30"
                            cy="30"
                            r="24"
                            fill="transparent"
                            stroke="#f59e0b"
                            strokeWidth="5"
                            strokeDasharray="150.8"
                            strokeDashoffset={150.8 - (150.8 * active) / 100}
                            className="transition-all duration-[1000ms] ease-out"
                          />
                        </svg>
                        <div className="space-y-1 text-[10px] font-bold text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>Fat Mass: {formatNumber(toMassUnit(composition.fatKg, massUnit), 1)} {massUnit} ({formatNumber(active, 1)}%)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Lean Mass: {formatNumber(toMassUnit(composition.leanKg, massUnit), 1)} {massUnit} ({formatNumber(100 - active, 1)}%)</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bottom row: 5 cards grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">

                      {/* Ideal Body Fat */}
                      <div className="bg-amber-50/20 border border-amber-100/40 p-3 rounded-xl flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-white border border-amber-100/20 text-amber-500 shrink-0">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Ideal Fat</span>
                          <span className="text-xs font-black text-slate-700 block mt-1">{targetBodyFat}%</span>
                          <span className="text-[8px] text-slate-400 font-semibold block leading-none mt-0.5">Your target</span>
                        </div>
                      </div>

                      {/* Fat to Lose */}
                      <div className="bg-emerald-50/20 border border-emerald-100/40 p-3 rounded-xl flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-white border border-emerald-100/20 text-emerald-500 shrink-0">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Fat to Lose</span>
                          <span className="text-xs font-black text-slate-700 block mt-1">
                            {goal && !goal.reached ? `${formatNumber(toMassUnit(goal.fatLossKg, massUnit), 1)} ${massUnit}` : "—"}
                          </span>
                          <span className="text-[8px] text-slate-400 font-semibold block leading-none mt-0.5">To reach target</span>
                        </div>
                      </div>

                      {/* Weight at Goal */}
                      <div className="bg-blue-50/20 border border-blue-100/40 p-3 rounded-xl flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-white border border-blue-100/20 text-blue-500 shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Goal Weight</span>
                          <span className="text-xs font-black text-slate-700 block mt-1">
                            {goal ? `${formatNumber(toMassUnit(goal.targetWeightKg, massUnit), 1)} ${massUnit}` : "—"}
                          </span>
                          <span className="text-[8px] text-slate-400 font-semibold block leading-none mt-0.5">At target fat</span>
                        </div>
                      </div>

                      {/* Muscle to Gain */}
                      <div className="bg-slate-50/40 border border-slate-200/40 p-3 rounded-xl flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-white border border-slate-200/20 text-slate-450 shrink-0">
                          💪
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Muscle to Gain</span>
                          <span className="text-xs font-black text-slate-700 block mt-1">—</span>
                          <span className="text-[8px] text-slate-400 font-semibold block leading-none mt-0.5">Not needed</span>
                        </div>
                      </div>

                      {/* Goal Timeline */}
                      <div className="bg-amber-50/20 border border-amber-100/40 p-3 rounded-xl flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-white border border-amber-100/20 text-amber-500 shrink-0">
                          ⏱️
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Timeline</span>
                          <span className="text-xs font-black text-emerald-600 block mt-1">
                            {goal && !goal.reached ? `${Math.ceil(goal.fastWeeks)}–${Math.ceil(goal.slowWeeks)} weeks` : "—"}
                          </span>
                          <span className="text-[8px] text-slate-400 font-semibold block leading-none mt-0.5">Estimated</span>
                        </div>
                      </div>

                    </div>

                  </div>
                )}



                {/* Row 4: Method Comparison and Progress Tracker side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Card #4: Method Comparison */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-650 text-white font-bold text-xs">
                          4
                        </span>
                        <h2 className="text-base font-bold text-slate-700">Method Comparison</h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold">
                              <th className="py-2">Method</th>
                              <th className="py-2">Body Fat %</th>
                              <th className="py-2">Difference</th>
                              <th className="py-2">Accuracy</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-50 font-bold text-slate-700">
                              <td className="py-3 text-emerald-600">US Navy Tape (You)</td>
                              <td className="py-3">{results.navy !== null ? `${formatNumber(results.navy, 1)}%` : "—"}</td>
                              <td className="py-3 text-slate-400">—</td>
                              <td className="py-3 text-emerald-500">★★★★★</td>
                            </tr>
                            <tr className="font-bold text-slate-700">
                              <td className="py-3">BMI (Deurenberg)</td>
                              <td className="py-3">{results.bmiBased !== null ? `${formatNumber(results.bmiBased, 1)}%` : "—"}</td>
                              <td className="py-3 text-amber-600">
                                {results.navy !== null && results.bmiBased !== null
                                  ? `${results.bmiBased >= results.navy ? "+" : ""}${formatNumber(results.bmiBased - results.navy, 1)}%`
                                  : "—"}
                              </td>
                              <td className="py-3 text-amber-500">★★★★☆</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex items-center gap-2 mt-2">
                      <span className="text-xs">💡</span>
                      <span className="text-[10px] text-slate-550 font-semibold leading-relaxed">
                        Both methods are accurate. Small differences are normal.
                      </span>
                    </div>
                  </div>

                  {/* Card #5: Progress Tracker */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-650 text-white font-bold text-xs">
                            5
                          </span>
                          <h2 className="text-base font-bold text-slate-700">Progress Tracker</h2>
                        </div>

                      </div>

                      {/* Line chart & current stats row */}
                      <div className="flex items-stretch gap-4 mt-3">
                        {/* Line Chart */}
                        <div className="flex-1 bg-slate-50/30 border border-slate-100 rounded-2xl p-2 flex flex-col justify-between h-36">
                          <div className="relative w-full h-28">
                            <svg className="w-full h-full" viewBox="0 0 240 100" preserveAspectRatio="none">
                              {/* Grid lines */}
                              <line x1="0" y1="20" x2="240" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                              <line x1="0" y1="50" x2="240" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                              <line x1="0" y1="80" x2="240" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

                              {/* Plot line */}
                              <path
                                d={entries.map((e, idx) => {
                                  const x = idx * (220 / (entries.length - 1)) + 10;
                                  const y = 80 - ((e.bodyFat - 15) / 15) * 60;
                                  return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                                }).join(" ")}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />

                              {/* Dot markers */}
                              {entries.map((e, idx) => {
                                const x = idx * (220 / (entries.length - 1)) + 10;
                                const y = 80 - ((e.bodyFat - 15) / 15) * 60;
                                return (
                                  <g key={idx} className="group cursor-pointer">
                                    <circle cx={x} cy={y} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                                    <circle cx={x} cy={y} r="8" fill="#10b981" fillOpacity="0.15" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </g>
                                );
                              })}
                            </svg>
                          </div>
                          {/* X Axis Labels */}
                          <div className="flex justify-between text-[8px] font-bold text-slate-400 px-1">
                            {entries.map((e, idx) => (
                              <span key={idx}>{e.date}</span>
                            ))}
                          </div>
                        </div>

                        {/* Metrics Column */}
                        <div className="w-28 space-y-1.5 flex flex-col justify-center">
                          <div className="bg-slate-50/50 border border-slate-100/50 p-1.5 rounded-lg flex items-center justify-between text-[9px] font-bold text-slate-500">
                            <span>Start</span>
                            <span className="text-slate-700 font-extrabold">{entries[0].bodyFat}%</span>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100/50 p-1.5 rounded-lg flex items-center justify-between text-[9px] font-bold text-slate-500">
                            <span>Current</span>
                            <span className="text-slate-700 font-extrabold">{active !== null ? `${formatNumber(active, 1)}%` : `${entries[entries.length - 1].bodyFat}%`}</span>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100/50 p-1.5 rounded-lg flex items-center justify-between text-[9px] font-bold text-slate-500">
                            <span>Change</span>
                            <span className="text-emerald-600 font-extrabold">
                              {active !== null ? `${formatNumber(active - entries[0].bodyFat, 1)}%` : `${formatNumber(entries[entries.length - 1].bodyFat - entries[0].bodyFat, 1)}%`}
                            </span>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100/50 p-1.5 rounded-lg flex items-center justify-between text-[9px] font-bold text-slate-500">
                            <span>Progress</span>
                            <span className="text-emerald-600 font-extrabold">
                              {active !== null ? `${formatNumber(active - entries[0].bodyFat, 1)}%` : `${formatNumber(entries[entries.length - 1].bodyFat - entries[0].bodyFat, 1)}%`}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewEntryVal(active ? formatNumber(active, 1) : "19.2");
                        setShowAddEntryModal(true);
                      }}
                      className="w-full py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      + Add New Entry
                    </button>
                  </div>

                </div>

                {/* Card #6: Goal Planner */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-650 text-white font-bold text-xs">
                      6
                    </span>
                    <h2 className="text-base font-bold text-slate-700">Goal Planner</h2>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold">Set your target and get a personalized plan</p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

                    {/* Target Inputs & Slider */}
                    <div className="lg:col-span-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Target Body Fat %</label>
                        <div className="relative w-20 flex items-center">
                          <input
                            type="number"
                            min="3"
                            max="50"
                            value={targetBodyFat}
                            onChange={(e) => setTargetBodyFat(e.target.value)}
                            className="w-full bg-slate-50/60 border border-slate-200/60 rounded-xl px-2.5 py-1.5 text-xs font-black text-center focus:outline-none focus:border-emerald-500 focus:bg-white"
                          />
                          <span className="absolute right-2.5 text-[10px] font-bold text-slate-400">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={targetBodyFat}
                        onChange={(e) => setTargetBodyFat(e.target.value)}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-550"
                      />
                      <div className="flex justify-between text-[8px] font-bold text-slate-400">
                        <span>5%</span>
                        <span>10%</span>
                        <span>15%</span>
                        <span>20%</span>
                        <span>25%</span>
                        <span>30%</span>
                      </div>
                    </div>

                    {/* target metrics grid cards */}
                    <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Fat to Lose */}
                      <div className="bg-slate-50/50 border border-slate-100/80 p-3 rounded-xl">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Fat to Lose</span>
                        <span className="text-sm font-black text-emerald-600 block mt-1.5">
                          {goal && !goal.reached ? `${formatNumber(toMassUnit(goal.fatLossKg, massUnit), 1)} ${massUnit}` : "—"}
                        </span>
                      </div>

                      {/* Weight at Goal */}
                      <div className="bg-slate-50/50 border border-slate-100/80 p-3 rounded-xl">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Weight at Goal</span>
                        <span className="text-sm font-black text-slate-700 block mt-1.5">
                          {goal ? `${formatNumber(toMassUnit(goal.targetWeightKg, massUnit), 1)} ${massUnit}` : "—"}
                        </span>
                      </div>

                      {/* Weekly Loss Target */}
                      <div className="bg-slate-50/50 border border-slate-100/80 p-3 rounded-xl">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Weekly Loss Target</span>
                        <span className="text-sm font-black text-slate-700 block mt-1.5">
                          {formatNumber(toMassUnit(measures.weightKg * 0.005, massUnit), 1)} - {formatNumber(toMassUnit(measures.weightKg * 0.01, massUnit), 1)} {massUnit}
                        </span>
                        <span className="text-[8px] text-slate-400 font-semibold block leading-tight mt-0.5">(0.5-1% of body weight)</span>
                      </div>

                      {/* Estimated Time */}
                      <div className="bg-slate-50/50 border border-slate-100/80 p-3 rounded-xl">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Estimated Time</span>
                        <span className="text-sm font-black text-emerald-600 block mt-1.5">
                          {goal && !goal.reached ? `${Math.ceil(goal.fastWeeks)}–${Math.ceil(goal.slowWeeks)} weeks` : "—"}
                        </span>
                        <span className="text-[8px] text-slate-400 font-semibold block leading-tight mt-0.5">Sustainable pace</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Row 7: How to Take Measurements and Why It Matters side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Card #7: How to Take Measurements */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-650 text-white font-bold text-xs">
                          7
                        </span>
                        <h2 className="text-base font-bold text-slate-700">How to Take Measurements</h2>
                      </div>
                      <p className="text-[10px] text-slate-450 font-bold">Get accurate results with these tips</p>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-slate-50/50 border border-slate-100/80 p-3 rounded-xl space-y-1">
                          <span className="text-xs">🥦</span>
                          <span className="text-[10px] font-black text-slate-700 block">Neck</span>
                          <span className="text-[9px] text-slate-400 font-semibold leading-relaxed block">
                            Measure just below the larynx (Adam's apple).
                          </span>
                        </div>
                        <div className="bg-slate-50/50 border border-slate-100/80 p-3 rounded-xl space-y-1">
                          <span className="text-xs">👖</span>
                          <span className="text-[10px] font-black text-slate-700 block">Waist</span>
                          <span className="text-[9px] text-slate-400 font-semibold leading-relaxed block">
                            Measure at the narrowest point, above the navel.
                          </span>
                        </div>
                        <div className="bg-slate-50/50 border border-slate-100/80 p-3 rounded-xl space-y-1">
                          <span className="text-xs">🍑</span>
                          <span className="text-[10px] font-black text-slate-700 block">Hips ({gender === "female" ? "Women" : "Men"})</span>
                          <span className="text-[9px] text-slate-400 font-semibold leading-relaxed block">
                            Measure at the widest part of your hips.
                          </span>
                        </div>
                        <div className="bg-slate-50/50 border border-slate-100/80 p-3 rounded-xl space-y-1">
                          <span className="text-xs">📐</span>
                          <span className="text-[10px] font-black text-slate-700 block">Every Measurement</span>
                          <span className="text-[9px] text-slate-400 font-semibold leading-relaxed block">
                            Keep tape level, snug but not tight. Exhale normally.
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex items-center gap-2 mt-2">
                      <span className="text-xs">💡</span>
                      <span className="text-[10px] text-slate-550 font-semibold leading-relaxed">
                        Measure in the morning, before eating or drinking, for best results.
                      </span>
                    </div>
                  </div>

                  {/* Card #8: Why It Matters */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-650 text-white font-bold text-xs">
                          8
                        </span>
                        <h2 className="text-base font-bold text-slate-700">Why It Matters</h2>
                      </div>
                      <p className="text-[10px] text-slate-450 font-bold">Benefits of knowing your body fat %</p>

                      <div className="flex gap-4 items-center">
                        <div className="flex-1 space-y-2 text-[10px] font-bold text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500">✔</span>
                            <span>Better understand your fitness level</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500">✔</span>
                            <span>Track progress beyond the scale</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500">✔</span>
                            <span>Set realistic goals</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500">✔</span>
                            <span>Improve health and reduce disease risk</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500">✔</span>
                            <span>Optimize training and nutrition</span>
                          </div>
                        </div>

                        {/* cartoon figure container */}
                        <div className="w-18 h-28 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 100 200" className="w-full h-full">
                            {/* Simple clean cartoon human figure vector */}
                            <circle cx="50" cy="30" r="14" fill="#34d399" />
                            <path d="M42,48 L58,48 C61,48 64,51 64,54 L64,120 C64,122 62,124 60,124 L56,124 L56,190 C56,193 53,195 50,195 C47,195 44,193 44,190 L44,124 L40,124 C38,124 36,122 36,120 L36,54 C36,51 39,48 42,48 Z" fill="#10b981" />
                            <rect x="36" y="55" width="28" height="65" rx="4" fill="#34d399" />
                            <rect x="42" y="120" width="16" height="45" rx="3" fill="#1e293b" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}
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

      {/* Premium Inline Modal for Adding New Entry */}
      {showAddEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-700">Add Progress Entry</h3>
              <button
                type="button"
                onClick={() => setShowAddEntryModal(false)}
                className="text-slate-400 hover:text-slate-650 text-xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Body Fat %</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="60"
                  value={newEntryVal}
                  onChange={(e) => setNewEntryVal(e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-200/60 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  placeholder="e.g. 19.2"
                  autoFocus
                />
                <span className="absolute right-3.5 text-[10px] font-bold text-slate-400">%</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddEntryModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const num = parseFloat(newEntryVal);
                  if (!isNaN(num) && num > 0) {
                    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    setEntries([...entries, { date: today, bodyFat: num }]);
                    setShowAddEntryModal(false);
                  }
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
