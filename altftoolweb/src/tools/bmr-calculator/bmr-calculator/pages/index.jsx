"use client";

import { useState, useEffect } from "react";
import {
  Flame, Calendar, Scale, Ruler, User, Copy,
  Download, RotateCcw, Check, Sparkles, Apple, Target, Compass, Heart,
  Calculator, ChevronDown, Award, Trash2, ArrowLeft, RefreshCw,
  TrendingUp, Activity, ShieldAlert, FileText, Droplet
} from "lucide-react";

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "light", label: "Lightly Active", desc: "Light exercise/sports 1–3 days/week" },
  { value: "moderate", label: "Moderate Exercise", desc: "3–5 days/week of moderate exercise" },
  { value: "very", label: "Very Active", desc: "Hard exercise/sports 6–7 days/week" },
  { value: "extra", label: "Extra Active", desc: "Very hard exercise/sports & physical job" }
];

export default function BmrCalculator() {
  // Input states
  const [unitSystem, setUnitSystem] = useState("metric"); // metric or imperial
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState("male"); // male or female
  const [heightCm, setHeightCm] = useState(175);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);
  const [weight, setWeight] = useState(68); // 68 kg or lbs equivalent
  const [activityLevel, setActivityLevel] = useState("moderate");

  // App UI states
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState("maintain");
  const [gaugeOffset, setGaugeOffset] = useState(125.6);

  // Reset inputs
  const handleReset = () => {
    setUnitSystem("metric");
    setAge(30);
    setGender("male");
    setHeightCm(175);
    setHeightFt(5);
    setHeightIn(9);
    setWeight(68);
    setActivityLevel("moderate");
    setSelectedGoal("maintain");
    setGaugeOffset(125.6);
    setShowResult(false);
    setIsLoading(false);
  };

  const handleCalculate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowResult(true);
    }, 1800); // 1.8 seconds premium loading
  };

  const handleCmChange = (val) => {
    setHeightCm(val);
    if (val === "") {
      setHeightFt("");
      setHeightIn("");
      return;
    }
    const cm = parseFloat(val) || 0;
    const totalInches = cm / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inch = Math.round(totalInches % 12);
    setHeightFt(ft || "");
    setHeightIn(inch || 0);
  };

  const handleFtChange = (val) => {
    setHeightFt(val);
    const ft = parseFloat(val) || 0;
    const inch = parseFloat(heightIn) || 0;
    const cm = Math.round(((ft * 12) + inch) * 2.54);
    setHeightCm(cm || "");
  };

  const handleInChange = (val) => {
    setHeightIn(val);
    const ft = parseFloat(heightFt) || 0;
    const inch = parseFloat(val) || 0;
    const cm = Math.round(((ft * 12) + inch) * 2.54);
    setHeightCm(cm || "");
  };

  // Convert inputs to metric values
  const weightKg = unitSystem === "metric" ? (parseFloat(weight) || 0) : (parseFloat(weight) || 0) * 0.45359237;
  const heightCmVal = parseFloat(heightCm) || (((parseFloat(heightFt) || 0) * 12) + (parseFloat(heightIn) || 0)) * 2.54;
  const heightMVal = heightCmVal / 100;

  // BMR Calculation (Mifflin-St Jeor - More perfect & modern standard)
  const finalBmr = Math.max(0, Math.round(
    (10 * weightKg) + (6.25 * heightCmVal) - (5 * age) + (gender === "male" ? 5 : -161)
  ));

  // TDEE Calculation
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, extra: 1.9 };
  const finalTdee = Math.round(finalBmr * multipliers[activityLevel]);

  // Health Metrics Calculations
  // 1. BMI
  const bmi = heightMVal > 0 ? (weightKg / (heightMVal * heightMVal)) : 0;
  const finalBmi = bmi.toFixed(1);
  let bmiCategory = "Normal";
  let bmiColor = "text-emerald-500";
  if (bmi < 18.5) {
    bmiCategory = "Underweight";
    bmiColor = "text-blue-500";
  } else if (bmi >= 25 && bmi < 29.9) {
    bmiCategory = "Overweight";
    bmiColor = "text-amber-500";
  } else if (bmi >= 30) {
    bmiCategory = "Obese";
    bmiColor = "text-rose-500";
  }

  // 2. Healthy Weight Range (BMI 18.5 to 24.9)
  const minHealthyKg = 18.5 * heightMVal * heightMVal;
  const maxHealthyKg = 24.9 * heightMVal * heightMVal;
  const finalMinWeight = unitSystem === "metric" ? Math.round(minHealthyKg) : Math.round(minHealthyKg * 2.20462);
  const finalMaxWeight = unitSystem === "metric" ? Math.round(maxHealthyKg) : Math.round(maxHealthyKg * 2.20462);

  // 3. Body Fat Estimate (Deurenberg Formula)
  const bodyFat = heightMVal > 0 ? ((1.20 * bmi) + (0.23 * age) - (gender === "male" ? 16.2 : 5.4)) : 0;
  const finalBodyFat = Math.max(0, Math.round(bodyFat));
  let fatCategory = "Fitness";
  let fatColor = "text-emerald-500";
  if (gender === "male") {
    if (finalBodyFat < 6) { fatCategory = "Essential Fat"; fatColor = "text-blue-400"; }
    else if (finalBodyFat >= 6 && finalBodyFat < 14) { fatCategory = "Athlete"; fatColor = "text-emerald-400"; }
    else if (finalBodyFat >= 14 && finalBodyFat < 18) { fatCategory = "Fitness"; fatColor = "text-emerald-500"; }
    else if (finalBodyFat >= 18 && finalBodyFat < 25) { fatCategory = "Acceptable"; fatColor = "text-amber-500"; }
    else { fatCategory = "Obese"; fatColor = "text-rose-500"; }
  } else {
    if (finalBodyFat < 14) { fatCategory = "Essential Fat"; fatColor = "text-blue-400"; }
    else if (finalBodyFat >= 14 && finalBodyFat < 21) { fatCategory = "Athlete"; fatColor = "text-emerald-400"; }
    else if (finalBodyFat >= 21 && finalBodyFat < 25) { fatCategory = "Fitness"; fatColor = "text-emerald-500"; }
    else if (finalBodyFat >= 25 && finalBodyFat < 32) { fatCategory = "Acceptable"; fatColor = "text-amber-500"; }
    else { fatCategory = "Obese"; fatColor = "text-rose-500"; }
  }

  // 4. Ideal Protein Intake (1.6g to 2.0g per kg of bodyweight)
  const minProtein = Math.round(weightKg * 1.6);
  const maxProtein = Math.round(weightKg * 2.0);

  // 5. Daily Water Intake (35ml per kg of bodyweight +/- 10%)
  const minWater = ((weightKg * 35 * 0.9) / 1000).toFixed(1);
  const maxWater = ((weightKg * 35 * 1.1) / 1000).toFixed(1);

  // Calorie level indicator (based on activity level & BMR vs TDEE difference)
  let calorieCategory = "Moderate";
  let calorieDesc = "Good job! Keep maintaining your activity.";
  let gaugeDashOffset = 80; // Arc stroke dashes
  if (activityLevel === "sedentary") {
    calorieCategory = "Low";
    calorieDesc = "Lower activity level. Consider light walking.";
    gaugeDashOffset = 110;
  } else if (activityLevel === "light") {
    calorieCategory = "Moderate-Low";
    calorieDesc = "Balanced baseline. Maintain good habits.";
    gaugeDashOffset = 90;
  } else if (activityLevel === "moderate") {
    calorieCategory = "Moderate";
    calorieDesc = "Good job! Keep maintaining your activity.";
    gaugeDashOffset = 60;
  } else if (activityLevel === "very") {
    calorieCategory = "High";
    calorieDesc = "High calorie expenditure. Keep fueled.";
    gaugeDashOffset = 30;
  } else {
    calorieCategory = "Very High";
    calorieDesc = "Athletic metabolism level. Prioritize recovery.";
    gaugeDashOffset = 10;
  }

  const calorieGoals = {
    lose_05: {
      label: unitSystem === "metric" ? "Lose 0.5 kg / week" : "Lose 1 lb / week",
      value: Math.max(1200, finalTdee - 500),
      colorClass: "text-emerald-600 bg-emerald-50/40 border-emerald-250/20",
      radioColor: "border-emerald-500 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 focus:ring-1"
    },
    lose_025: {
      label: unitSystem === "metric" ? "Lose 0.25 kg / week" : "Lose 0.5 lb / week",
      value: Math.max(1200, finalTdee - 250),
      colorClass: "text-emerald-600 bg-emerald-50/30 border-emerald-250/10",
      radioColor: "border-emerald-500 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 focus:ring-1"
    },
    maintain: {
      label: "Maintain Weight",
      value: finalTdee,
      colorClass: "text-blue-600 bg-blue-50/40 border-blue-250/20",
      radioColor: "border-blue-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1"
    },
    gain_025: {
      label: unitSystem === "metric" ? "Gain 0.25 kg / week" : "Gain 0.5 lb / week",
      value: finalTdee + 250,
      colorClass: "text-amber-600 bg-amber-50/40 border-amber-250/20",
      radioColor: "border-amber-500 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 focus:ring-1"
    },
    gain_05: {
      label: unitSystem === "metric" ? "Gain 0.5 kg / week" : "Gain 1 lb / week",
      value: finalTdee + 500,
      colorClass: "text-rose-600 bg-rose-50/40 border-rose-250/20",
      radioColor: "border-rose-500 text-rose-500 focus:ring-rose-500 focus:ring-offset-0 focus:ring-1"
    }
  };

  const targetKcal = calorieGoals[selectedGoal]?.value || finalTdee;

  // Macros (25% Protein, 45% Carbs, 30% Fat)
  const proteinKcal = targetKcal * 0.25;
  const carbsKcal = targetKcal * 0.45;
  const fatKcal = targetKcal * 0.30;

  const proteinG = Math.round(proteinKcal / 4);
  const carbsG = Math.round(carbsKcal / 4);
  const fatG = Math.round(fatKcal / 9);

  // Meals split (Breakfast 25%, Lunch 35%, Dinner 30%, Snacks 10%)
  const breakfastKcal = Math.round(targetKcal * 0.25);
  const lunchKcal = Math.round(targetKcal * 0.35);
  const dinnerKcal = Math.round(targetKcal * 0.30);
  const snacksKcal = Math.round(targetKcal * 0.10);

  const finalMinWater = unitSystem === "metric" ? minWater : (parseFloat(minWater) * 33.814).toFixed(0);
  const finalMaxWater = unitSystem === "metric" ? maxWater : (parseFloat(maxWater) * 33.814).toFixed(0);
  const waterUnit = unitSystem === "metric" ? "L" : "oz";
  useEffect(() => {
    if (showResult) {
      const t = setTimeout(() => {
        setGaugeOffset(gaugeDashOffset);
      }, 150);
      return () => clearTimeout(t);
    } else {
      setGaugeOffset(125.6);
    }
  }, [showResult, gaugeDashOffset]);

  const handleCopy = () => {
    const text = `BMR & Daily Calorie Calculator Results:
---------------------------------------------
Basal Metabolic Rate (BMR): ${finalBmr.toLocaleString()} kcal/day
Total Daily Energy Expenditure (TDEE): ${finalTdee.toLocaleString()} kcal/day
Selected Calorie Goal (${calorieGoals[selectedGoal]?.label}): ${targetKcal.toLocaleString()} kcal/day

Macronutrient Split:
- Protein (25%): ${proteinG}g (${Math.round(proteinKcal)} kcal)
- Carbs (45%): ${carbsG}g (${Math.round(carbsKcal)} kcal)
- Fat (30%): ${fatG}g (${Math.round(fatKcal)} kcal)

Suggested Meal Allocation:
- Breakfast (25%): ${breakfastKcal} kcal
- Lunch (35%): ${lunchKcal} kcal
- Dinner (30%): ${dinnerKcal} kcal
- Snacks (10%): ${snacksKcal} kcal

General Health Metrics:
- BMI: ${finalBmi} (${bmiCategory})
- Healthy Weight Range: ${finalMinWeight} - ${finalMaxWeight} ${unitSystem === "metric" ? "kg" : "lbs"}
- Body Fat (Est.): ${finalBodyFat}% (${fatCategory})
- Ideal Daily Water Intake: ${finalMinWater} - ${finalMaxWater} ${waterUnit}/day`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `BMR & Daily Calorie Calculator Results:
---------------------------------------------
Basal Metabolic Rate (BMR): ${finalBmr.toLocaleString()} kcal/day
Total Daily Energy Expenditure (TDEE): ${finalTdee.toLocaleString()} kcal/day
Selected Calorie Goal (${calorieGoals[selectedGoal]?.label}): ${targetKcal.toLocaleString()} kcal/day

Macronutrient Split:
- Protein (25%): ${proteinG}g (${Math.round(proteinKcal)} kcal)
- Carbs (45%): ${carbsG}g (${Math.round(carbsKcal)} kcal)
- Fat (30%): ${fatG}g (${Math.round(fatKcal)} kcal)

Suggested Meal Allocation:
- Breakfast (25%): ${breakfastKcal} kcal
- Lunch (35%): ${lunchKcal} kcal
- Dinner (30%): ${dinnerKcal} kcal
- Snacks (10%): ${snacksKcal} kcal

General Health Metrics:
- BMI: ${finalBmi} (${bmiCategory})
- Healthy Weight Range: ${finalMinWeight} - ${finalMaxWeight} ${unitSystem === "metric" ? "kg" : "lbs"}
- Body Fat (Est.): ${finalBodyFat}% (${fatCategory})
- Ideal Daily Water Intake: ${finalMinWater} - ${finalMaxWater} ${waterUnit}/day`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bmr-results.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#f8fafc] text-[#1e293b] min-h-screen py-10 px-4 md:px-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-5xl space-y-6">

        {/* Banner / Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-3xl p-6 md:p-8 border border-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex-1 space-y-4 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-current" />
              Health
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
              BMR Calculator
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
              Calculate your Basal Metabolic Rate (BMR) to understand how many calories your body burns at rest.
            </p>
          </div>

          {/* Decorative Floating Graphic */}
          <div className="relative flex items-center justify-center w-48 h-48 md:w-56 md:h-56 z-10 shrink-0">
            <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-pulse" />
            <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-emerald-500/20 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Flame className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Floating Pill Tags */}
            <div className="absolute -top-1 right-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm text-[10px] font-bold text-slate-600 flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-500" />
              Know your baseline
            </div>
            <div className="absolute top-20 -left-6 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm text-[10px] font-bold text-slate-600 flex items-center gap-1">
              <Apple className="w-3 h-3 text-emerald-500" />
              Plan your nutrition
            </div>
            <div className="absolute -bottom-2 right-4 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm text-[10px] font-bold text-slate-600 flex items-center gap-1">
              <Target className="w-3 h-3 text-emerald-500" />
              Achieve your goals
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full">

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 shadow-sm text-center space-y-6 max-w-md mx-auto animate-pulse flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-emerald-500 animate-spin" />
              <Flame className="w-7 h-7 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-700">Analyzing Profile</h3>
              <p className="text-xs text-slate-450 leading-relaxed">
                Calculating basal metabolic rate, body fat estimation, and daily energy expenditure...
              </p>
            </div>
          </div>
        )}

        {/* Form Input Screen (Hidden when loading or showing results) */}
        {!isLoading && !showResult && (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 w-full">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-700">
                <User className="w-4.5 h-4.5 text-emerald-500" />
                Your Information
              </h2>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-450 hover:text-slate-650 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Row 1: Unit System & Activity Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unit System selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Unit System</label>
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/40">
                  <button
                    onClick={() => {
                      setUnitSystem("metric");
                      setWeight(68);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      unitSystem === "metric"
                        ? "bg-white text-emerald-600 shadow-sm border border-emerald-500/10"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Metric (kg, cm)
                  </button>
                  <button
                    onClick={() => {
                      setUnitSystem("imperial");
                      setWeight(150);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      unitSystem === "imperial"
                        ? "bg-white text-emerald-600 shadow-sm border border-emerald-500/10"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Imperial (lbs, in)
                  </button>
                </div>
              </div>

              {/* Activity Level */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Activity Level</label>
                <div className="relative flex items-center">
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors cursor-pointer"
                  >
                    {ACTIVITY_LEVELS.map(a => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-455 absolute right-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 font-medium pl-1">
                  {ACTIVITY_LEVELS.find(a => a.value === activityLevel).desc}
                </p>
              </div>
            </div>

            {/* Row 2: Age, Gender, Height, Weight side-by-side in 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Age</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-455">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl pl-10 pr-12 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  />
                  <span className="absolute right-3.5 text-[9px] font-bold text-slate-400 uppercase">years</span>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Gender</label>
                <div className="relative flex items-center">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-455 absolute right-3 pointer-events-none" />
                </div>
              </div>

              {/* Height */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Height</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-450">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div className="w-full pl-10 grid grid-cols-2 gap-1.5">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={heightFt}
                        onChange={(e) => handleFtChange(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl px-2 py-2.5 text-xs font-bold text-center focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                      />
                      <span className="absolute right-2 text-[9px] font-bold text-slate-400">ft</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={heightIn}
                        onChange={(e) => handleInChange(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl px-2 py-2.5 text-xs font-bold text-center focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                      />
                      <span className="absolute right-2 text-[9px] font-bold text-slate-400">in</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Weight</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-450">
                    <Scale className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl pl-10 pr-12 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  />
                  <span className="absolute right-3.5 text-[9px] font-bold text-slate-400 uppercase font-bold">
                    {unitSystem === "metric" ? "kg" : "lbs"}
                  </span>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              className="w-full bg-[#2e9d63] hover:bg-[#258250] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/10 transition-colors mt-6"
            >
              <span>Calculate BMR</span>
              <Calculator className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

        {/* Results Screen Dashboard (Fills entire container) */}
        {!isLoading && showResult && (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 w-full animate-fadeIn">

            {/* Header Action Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-700">Your Results</h2>
                <p className="text-[10px] text-slate-400 font-medium">Metabolic profiles calculated successfully.</p>
              </div>
              <div className="flex gap-2 self-end">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Results"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Download Report
                </button>
              </div>
            </div>

            {/* Core Stats Cards Grid (3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

              {/* BMR Card */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between text-center relative overflow-hidden">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Basal Metabolic Rate (BMR)</h3>
                  <div className="text-4xl font-black text-emerald-600 tracking-tight">
                    {finalBmr.toLocaleString()}
                  </div>
                  <div className="text-xs font-bold text-emerald-700/80 uppercase tracking-widest mt-1">
                    calories/day
                  </div>
                </div>
                <div className="text-[10px] text-slate-450 leading-relaxed mt-6 border-t border-slate-200/55 pt-3">
                  This is the number of calories your body burns at rest.
                </div>
              </div>

              {/* TDEE Card */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between text-center">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Total Daily Energy Expenditure (TDEE)</h3>
                  <div className="text-4xl font-black text-slate-800 tracking-tight">
                    {finalTdee.toLocaleString()}
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                    calories/day
                  </div>
                </div>
                <div className="text-[10px] text-slate-450 leading-relaxed mt-6 border-t border-slate-200/55 pt-3">
                  Based on your activity level ({ACTIVITY_LEVELS.find(a => a.value === activityLevel).label})
                </div>
              </div>

              {/* Calorie level indicator gauge */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-between text-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Calorie Level</h3>
                <div className="relative w-48 h-24 overflow-hidden flex items-center justify-center">
                  <svg className="w-40 h-40 transform rotate-180 absolute -bottom-16" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                      strokeDasharray="125.6 251.2"
                      strokeLinecap="round"
                    />
                    {/* Color gauge track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#calorieGradient)"
                      strokeWidth="8.5"
                      strokeDasharray="125.6 251.2"
                      strokeDashoffset={gaugeOffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute bottom-0 text-center">
                    <span className="text-lg font-black text-slate-800 tracking-tight">{calorieCategory}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-450 leading-relaxed border-t border-slate-200/55 pt-3 w-full">
                  {calorieDesc}
                </div>
              </div>

            </div>

            {/* Bottom Info Badges Grid (5 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-4">

              {/* BMI Badge */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-slate-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">BMI</span>
                  <span className="text-xs font-black text-slate-700 block">{finalBmi}</span>
                  <span className={`text-[9px] font-bold ${bmiColor}`}>{bmiCategory}</span>
                </div>
              </div>

              {/* Healthy Weight Range */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-slate-400">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Healthy Weight</span>
                  <span className="text-xs font-black text-slate-700 block mt-0.5">
                    {finalMinWeight} – {finalMaxWeight}
                  </span>
                  <span className="text-[9px] text-slate-450 font-bold uppercase">{unitSystem === "metric" ? "kg" : "lbs"}</span>
                </div>
              </div>

              {/* Body Fat Est. */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-slate-400">
                  <Apple className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Body Fat (Est.)</span>
                  <span className="text-xs font-black text-slate-700 block">{finalBodyFat}%</span>
                  <span className={`text-[9px] font-bold ${fatColor}`}>{fatCategory}</span>
                </div>
              </div>

              {/* Protein Intake */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-slate-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Protein Intake</span>
                  <span className="text-xs font-black text-slate-700 block mt-0.5">
                    {minProtein} – {maxProtein}
                  </span>
                  <span className="text-[9px] text-slate-450 font-bold uppercase">g / day</span>
                </div>
              </div>

              {/* Water Intake */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-slate-400">
                  <Droplet className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Water Intake</span>
                  <span className="text-xs font-black text-slate-700 block mt-0.5">
                    {finalMinWater} – {finalMaxWater}
                  </span>
                  <span className="text-[9px] text-slate-455 font-bold uppercase">{waterUnit} / day</span>
                </div>
              </div>

            </div>

            {/* Third Row: Daily Calorie Goal, Macronutrient Breakdown, Calorie Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">

              {/* Daily Calorie Goal */}
              <div className="bg-slate-50/30 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Daily Calorie Goal</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Choose your goal to see daily calorie target</p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    {Object.entries(calorieGoals).map(([key, goal]) => {
                      const isSelected = selectedGoal === key;
                      return (
                        <label
                          key={key}
                          onClick={() => setSelectedGoal(key)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            isSelected
                              ? "bg-white border-emerald-500/25 shadow-sm text-slate-700"
                              : "bg-white/40 border-slate-150 text-slate-500 hover:bg-white/70"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="calorie_goal"
                              checked={isSelected}
                              onChange={() => {}}
                              className={`w-3.5 h-3.5 border-slate-350 ${goal.radioColor}`}
                            />
                            <span>{goal.label}</span>
                          </div>
                          <span className={isSelected ? "text-emerald-600 font-extrabold" : "text-slate-600"}>
                            {goal.value.toLocaleString()} kcal
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-5 p-3 rounded-xl bg-amber-50/30 border border-amber-100/50 text-[10px] text-amber-700 font-bold flex items-center gap-1.5">
                  <span>💡</span>
                  <span>A safe weight loss is 0.25 – 0.5 kg per week.</span>
                </div>
              </div>

              {/* Macronutrient Breakdown */}
              <div className="bg-slate-50/30 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Macronutrient Breakdown</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Balanced split for clean performance</p>
                    </div>
                  </div>

                  {/* Donut Chart with Stats */}
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4 mt-6">
                    {/* SVG Donut */}
                    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="10"
                          strokeDasharray="219.9"
                          strokeDashoffset="0"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="10.5"
                          strokeDasharray="219.9"
                          strokeDashoffset={219.9 * 0.25}
                          strokeLinecap="round"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="11"
                          strokeDasharray="219.9"
                          strokeDashoffset={219.9 * 0.70}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Donut Center Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-black text-slate-800 tracking-tight">{targetKcal.toLocaleString()}</span>
                        <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest">kcal</span>
                      </div>
                    </div>

                    {/* Macro details list */}
                    <div className="space-y-3 w-full sm:w-auto flex-1">
                      <div className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-1.5">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          Protein (25%)
                        </span>
                        <span className="text-slate-800 font-black">{proteinG}g</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-1.5">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          Carbs (45%)
                        </span>
                        <span className="text-slate-800 font-black">{carbsG}g</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold pb-0.5">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Fat (30%)
                        </span>
                        <span className="text-slate-800 font-black">{fatG}g</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-emerald-50/30 border border-emerald-100/50 text-[10px] text-emerald-700 font-bold flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Balanced macros help you stay healthy and reach your goals.</span>
                </div>
              </div>

              {/* Calorie Breakdown */}
              <div className="bg-slate-50/30 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Apple className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Calorie Breakdown (Example)</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Suggested calorie allocation per meal</p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-150 text-xs font-bold">
                      <span className="text-slate-500">Breakfast (25%)</span>
                      <span className="text-slate-800 font-black">{breakfastKcal} kcal</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-150 text-xs font-bold">
                      <span className="text-slate-500">Lunch (35%)</span>
                      <span className="text-slate-800 font-black">{lunchKcal} kcal</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-150 text-xs font-bold">
                      <span className="text-slate-500">Dinner (30%)</span>
                      <span className="text-slate-800 font-black">{dinnerKcal} kcal</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-150 text-xs font-bold">
                      <span className="text-slate-500">Snacks (10%)</span>
                      <span className="text-slate-800 font-black">{snacksKcal} kcal</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 p-3 rounded-xl bg-sky-50/30 border border-sky-100/50 text-[10px] text-sky-700 font-bold flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Adjust based on your schedule and preferences.</span>
                </div>
              </div>

            </div>

            {/* Fourth Row: Calories Burned by Activities & Health Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">

              {/* Calories Burned by Activities (Col-span 2) */}
              <div className="bg-slate-50/30 p-5 rounded-2xl border border-slate-100 md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Calories Burned by Activities (30 min)</h4>
                    </div>
                  </div>

                  {/* Activities Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                    {/* Walking */}
                    <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col items-center justify-center text-center">
                      <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mb-2 font-bold text-xs">🚶</span>
                      <span className="text-[9px] text-slate-400 font-bold block">Walking</span>
                      <span className="text-xs font-black text-slate-800 mt-1">{Math.round(weightKg * 1.9)} kcal</span>
                    </div>
                    {/* Running */}
                    <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col items-center justify-center text-center">
                      <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mb-2 font-bold text-xs">🏃</span>
                      <span className="text-[9px] text-slate-400 font-bold block">Running</span>
                      <span className="text-xs font-black text-slate-800 mt-1">{Math.round(weightKg * 4.7)} kcal</span>
                    </div>
                    {/* Cycling */}
                    <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col items-center justify-center text-center">
                      <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mb-2 font-bold text-xs">🚴</span>
                      <span className="text-[9px] text-slate-400 font-bold block">Cycling</span>
                      <span className="text-xs font-black text-slate-800 mt-1">{Math.round(weightKg * 3.8)} kcal</span>
                    </div>
                    {/* Swimming */}
                    <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col items-center justify-center text-center">
                      <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mb-2 font-bold text-xs">🏊</span>
                      <span className="text-[9px] text-slate-400 font-bold block">Swimming</span>
                      <span className="text-xs font-black text-slate-800 mt-1">{Math.round(weightKg * 4.1)} kcal</span>
                    </div>
                    {/* Strength Training */}
                    <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col items-center justify-center text-center">
                      <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mb-2 font-bold text-xs">🏋️</span>
                      <span className="text-[9px] text-slate-400 font-bold block">Strength</span>
                      <span className="text-xs font-black text-slate-800 mt-1">{Math.round(weightKg * 2.9)} kcal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Insights (Col-span 1) */}
              <div className="bg-slate-50/30 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-emerald-500" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Health Insights</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-bold text-sm shrink-0">✓</span>
                      <span>Your BMR is {finalBmr > 1550 ? "higher than" : "normal for"} average for your age.</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-bold text-sm shrink-0">✓</span>
                      <span>You have a <span className="text-slate-850 font-black">{bmiCategory.toLowerCase()} BMI</span>. Great job!</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-bold text-sm shrink-0">✓</span>
                      <span>Stay consistent with exercise and balanced diet.</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-bold text-sm shrink-0">✓</span>
                      <span>Drink plenty of water and get enough sleep.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  </div>
  );
}
