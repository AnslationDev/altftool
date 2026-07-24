"use client";

import { useState, useEffect, useRef } from "react";
import waistHeightHeroImg from "../assets/waist-height-hero.png";
import bodyShapeApple from "../assets/body-shape-apple.png";
import bodyShapePear from "../assets/body-shape-pear.png";
import bodyShapeHourglass from "../assets/body-shape-hourglass.png";
import bodyShapeRectangle from "../assets/body-shape-rectangle.png";
import {
  Scale,
  Activity,
  Ruler,
  Heart,
  Award,
  AlertTriangle,
  Sparkles,
  Printer,
  Check,
  Info,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  User,
  Share2,
  TrendingUp,
  ShieldCheck,
  Zap,
  BookOpen,
  HelpCircle,
  Download,
  Copy,
  Target,
  Star,
  Activity as Pulse,
  Layers,
  ChevronRight,
  TrendingDown,
  Clock
} from "lucide-react";

export default function WaistToHeightRatioCalculator() {
  // Input states
  const [unitSystem, setUnitSystem] = useState("imperial"); // "metric" | "imperial"
  const [waist, setWaist] = useState("31.5");
  const [height, setHeight] = useState("175");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("9");
  const [gender, setGender] = useState("Male"); // "Male" | "Female" | "Other"
  const [age, setAge] = useState("30");
  const [activityLevel, setActivityLevel] = useState("Moderately Active");

  // Flow states
  const [isCalculated, setIsCalculated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState(null);

  // Saved calculations for Trend Chart
  const [history, setHistory] = useState([
    { date: "3 months ago", ratio: 0.52, waist: 91, score: 85 },
    { date: "2 months ago", ratio: 0.50, waist: 88, score: 90 },
    { date: "1 month ago", ratio: 0.48, waist: 84, score: 95 },
  ]);

  // Accordion states
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);
  const [scientificOpenIndex, setScientificOpenIndex] = useState(null);

  // Alert confirmations
  const [copiedState, setCopiedState] = useState("");

  const resultsRef = useRef(null);

  // Sync default values when unit system changes
  useEffect(() => {
    if (unitSystem === "metric") {
      setWaist("80");
      setHeight("175");
    } else {
      setWaist("31.5");
      setHeightFt("5");
      setHeightIn("9");
    }
  }, [unitSystem]);

  // Trigger copied banner reset
  useEffect(() => {
    if (copiedState) {
      const t = setTimeout(() => setCopiedState(""), 2000);
      return () => clearTimeout(t);
    }
  }, [copiedState]);

  const handleCalculate = (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setLoadingStep(0);

    // Step-by-step loading simulation (0.8s total)
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= 3) {
          clearInterval(stepInterval);
          return 3;
        }
        return prev + 1;
      });
    }, 200);

    setTimeout(() => {
      let wCm = 0;
      let hCm = 0;

      const wNum = parseFloat(waist);
      if (unitSystem === "metric") {
        wCm = wNum;
        hCm = parseFloat(height);
      } else {
        wCm = wNum * 2.54;
        const ft = parseFloat(heightFt) || 0;
        const inch = parseFloat(heightIn) || 0;
        hCm = (ft * 12 + inch) * 2.54;
      }

      if (isNaN(wCm) || isNaN(hCm) || wCm <= 0 || hCm <= 0) {
        clearInterval(stepInterval);
        setIsLoading(false);
        alert("Please enter valid positive measurements.");
        return;
      }

      const ratio = wCm / hCm;
      const targetMaxWaist = hCm * 0.5;
      const difference = wCm - targetMaxWaist;

      // Classifications
      let riskStatus = "Healthy";
      let riskColorClass = "text-[#16A34A] dark:text-[#4ADE80]";
      let riskBgClass = "bg-[#16A34A]/10";
      let riskBorderClass = "border-[#16A34A]/25";
      let riskLevel = "Healthy";
      let healthScore = 95;
      let healthAdvice = "Generally associated with lower health risk.";

      if (ratio < 0.35) {
        riskStatus = "Very Low";
        riskColorClass = "text-blue-600 dark:text-blue-400";
        riskBgClass = "bg-blue-600/10";
        riskBorderClass = "border-blue-600/25";
        riskLevel = "Very Low";
        healthScore = 75;
        healthAdvice = "Extremely lean, check dietary consistency.";
      } else if (ratio <= 0.50) {
        riskStatus = "Healthy";
        riskColorClass = "text-[#16A34A] dark:text-[#4ADE80]";
        riskBgClass = "bg-[#16A34A]/10";
        riskBorderClass = "border-[#16A34A]/25";
        riskLevel = "Healthy";
        healthScore = Math.round(98 - (Math.abs(ratio - 0.43) * 150));
        healthAdvice = "Generally associated with lower health risk.";
      } else if (ratio <= 0.60) {
        riskStatus = "Moderate";
        riskColorClass = "text-[#F59E0B]";
        riskBgClass = "bg-[#F59E0B]/10";
        riskBorderClass = "border-[#F59E0B]/25";
        riskLevel = "Moderate";
        healthScore = Math.max(10, Math.round(80 - (ratio - 0.50) * 250));
        healthAdvice = "Moderate visceral fat indicator. Consider diet optimization.";
      } else if (ratio <= 0.70) {
        riskStatus = "High";
        riskColorClass = "text-orange-600 dark:text-orange-400";
        riskBgClass = "bg-orange-600/10";
        riskBorderClass = "border-orange-600/25";
        riskLevel = "High";
        healthScore = Math.max(10, Math.round(55 - (ratio - 0.60) * 350));
        healthAdvice = "Elevated visceral adiposity. Active training recommended.";
      } else {
        riskStatus = "Very High";
        riskColorClass = "text-[#DC2626]";
        riskBgClass = "bg-[#DC2626]/10";
        riskBorderClass = "border-[#DC2626]/25";
        riskLevel = "Very High";
        healthScore = Math.max(5, Math.round(30 - (ratio - 0.70) * 450));
        healthAdvice = "High cardiovascular marker risk. Consult clinical practitioner.";
      }

      // Est. Body Fat %
      let estBodyFat = 0;
      const ageNum = parseInt(age) || 30;
      if (gender === "Male") {
        estBodyFat = Math.round((ratio * 100) * 1.1 + (ageNum * 0.15) - 34);
        estBodyFat = Math.max(6, Math.min(45, estBodyFat));
      } else {
        estBodyFat = Math.round((ratio * 100) * 1.25 + (ageNum * 0.15) - 26);
        estBodyFat = Math.max(12, Math.min(55, estBodyFat));
      }

      // Body Shape
      let bodyShape = "Rectangle";
      if (gender === "Female") {
        if (ratio < 0.42) bodyShape = "Hourglass";
        else if (ratio < 0.51) bodyShape = "Pear";
        else bodyShape = "Apple";
      } else {
        if (ratio < 0.46) bodyShape = "Rectangle";
        else if (ratio < 0.54) bodyShape = "Pear";
        else bodyShape = "Apple";
      }

      // Safe weeks to goal
      const safeWaistLossPerWeek = unitSystem === "metric" ? 0.8 : 0.3; // cm or inches
      const weeksToGoal = difference > 0
        ? Math.ceil((difference / (unitSystem === "metric" ? 1 : 2.54)) / safeWaistLossPerWeek)
        : 0;

      const newResult = {
        ratio: parseFloat(ratio.toFixed(2)),
        riskStatus,
        riskColorClass,
        riskBgClass,
        riskBorderClass,
        riskLevel,
        healthScore,
        healthAdvice,
        estimatedBodyFat: estBodyFat,
        recommendedMaxWaistVal: targetMaxWaist,
        recommendedWaist: unitSystem === "metric" ? `${targetMaxWaist.toFixed(1)} cm` : `${(targetMaxWaist / 2.54).toFixed(1)} in`,
        minHealthyWaist: unitSystem === "metric" ? `${(hCm * 0.35).toFixed(1)} cm` : `${((hCm * 0.35) / 2.54).toFixed(1)} in`,
        maxHealthyWaist: unitSystem === "metric" ? `${(hCm * 0.50).toFixed(1)} cm` : `${((hCm * 0.50) / 2.54).toFixed(1)} in`,
        difference: unitSystem === "metric"
          ? `${difference >= 0 ? "+" : ""}${difference.toFixed(1)} cm`
          : `${difference >= 0 ? "+" : ""}${(difference / 2.54).toFixed(1)} in`,
        differenceLabel: unitSystem === "metric"
          ? `${difference >= 0 ? "+" : ""}${difference.toFixed(1)} cm`
          : `${difference >= 0 ? "+" : ""}${(difference / 2.54).toFixed(1)} in`,
        differenceVal: difference,
        bodyShape,
        weeksToGoal,
        waistInput: parseFloat(waist),
        heightInputStr: unitSystem === "metric" ? `${height} cm` : `${heightFt} ft ${heightIn} in`,
      };

      setResults(newResult);

      // Add to history
      setHistory(prev => {
        const filtered = prev.filter(p => p.date !== "Today");
        return [...filtered, { date: "Today", ratio: parseFloat(ratio.toFixed(2)), waist: parseFloat(waist), score: healthScore }];
      });

      setIsLoading(false);
      setIsCalculated(true);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }, 850);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyResult = () => {
    if (!results) return;
    navigator.clipboard.writeText(`Waist-to-Height Ratio: ${results.ratio} (${results.riskStatus}). Health Score: ${results.healthScore}/100. Calculate yours at Waist-to-Height Ratio Calculator.`);
    setCopiedState("result");
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedState("link");
  };

  const getRecommendations = () => {
    if (!results) return [];
    const isHigh = results.ratio > 0.50;
    return [
      {
        type: "Exercise",
        icon: Activity,
        title: isHigh ? "Visceral Fat Burn Plan" : "Cardiovascular Fitness",
        desc: isHigh
          ? "Target visceral deposits with 150+ minutes of aerobic intervals weekly combined with body weight resistance programs."
          : "Maintain current status using aerobic jogs and flexibility drills."
      },
      {
        type: "Nutrition",
        icon: Scale,
        title: isHigh ? "Caloric Deficit Adjustments" : "Nutritional Maintenance",
        desc: isHigh
          ? "Incorporate high fiber diet components that slow glucose loading into visceral vascular systems."
          : "Keep clean energy ratios using whole grains and green hydration inputs."
      },
      {
        type: "Lifestyle",
        icon: Heart,
        title: "Cortisol Management",
        desc: "High stress elevates waist accumulation. Practice deep diaphragmatic breathing daily."
      }
    ];
  };

  return (
    <div className="bg-[#F8FAF9] dark:bg-[#070b09] min-h-screen text-slate-800 dark:text-slate-100 py-10 px-4 transition-colors duration-300 antialiased font-sans">

      {/* Dynamic Copy Confirmation Toast */}
      {copiedState && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16A34A] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{copiedState === "link" ? "Link copied to clipboard!" : "Results copied to clipboard!"}</span>
        </div>
      )}

      {/* 1. HERO BANNER CARD (Premium Glassmorphic Design) */}
      <div className="mx-auto max-w-5xl rounded-[32px] border border-green-150/40 dark:border-emerald-950/20 bg-gradient-to-r from-emerald-500/[0.03] via-[#22C55E]/[0.04] to-[#4ADE80]/[0.06] dark:from-emerald-950/15 dark:to-emerald-900/5 p-6 md:p-10 text-left relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8 transition-all">
        {/* Background glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04)_0%,transparent_70%)] pointer-events-none" />

        {/* Left Side: Badge, Title, Description */}
        <div className="space-y-4 flex-1 z-10">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-[#15803D] bg-green-500/10 dark:bg-emerald-950/40 dark:text-[#4ADE80] shrink-0 border border-[#DCFCE7]/40 shadow-sm">
            <Pulse className="w-3.5 h-3.5" />
            SaaS Medical Biometrics
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-[44px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            Waist-to-Height Ratio <br className="hidden sm:inline" />
            Calculator
          </h1>

          {/* Description */}
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed max-w-xl">
            Calculate your waist-to-height ratio (WHtR) to assess abdominal visceral fat accumulation and estimate potential cardiometabolic health risk profile.
          </p>
        </div>

          {/* Right Side: Premium Healthcare Hero Illustration */}
          <div className="w-full md:w-[360px] h-[260px] shrink-0 relative flex items-center justify-center select-none z-10">
            <img
              src={waistHeightHeroImg.src || waistHeightHeroImg}
              alt="Waist-to-height ratio measurement illustration showing measuring tape, human silhouette with waist indicators, and height measurement"
              className="w-full h-full object-contain drop-shadow-sm"
              draggable={false}
            />
          </div>
      </div>

      {/* 2. MAIN LAYOUT GRID (Premium SaaS Double Panel Card Layout) */}
      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pb-12">

        {/* Left Card: Your Measurements (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <form
            onSubmit={handleCalculate}
            className="rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1210] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-left space-y-6 flex-1 flex flex-col"
          >
            {/* Header inside Card */}
            <div className="flex items-center gap-3 border-b border-slate-50 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">Your Measurements</h2>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">Enter waist and height specifications</p>
              </div>
            </div>

            {/* Input 1: Waist Circumference */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                  Waist Circumference
                  <span className="text-slate-400 cursor-pointer hover:text-[#16A34A] transition-colors" title="Measure your waist at the midpoint between the bottom of your ribs and the top of your hip bone.">
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </label>
                {/* unit switcher */}
                <button
                  type="button"
                  onClick={() => setUnitSystem(unitSystem === "metric" ? "imperial" : "metric")}
                  className="bg-[#16A34A]/10 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-[9px] font-black uppercase cursor-pointer hover:bg-[#16A34A]/25 select-none border border-[#DCFCE7]/30 shadow-sm"
                >
                  {unitSystem === "metric" ? "cm" : "in"}
                </button>
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center justify-center bg-green-500/10 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 p-2.5 rounded-xl select-none shrink-0 pointer-events-none z-10 border border-[#DCFCE7]/20">
                  <Ruler className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder={unitSystem === "metric" ? "80" : "31.5"}
                  className="w-full bg-[#f8fafc] dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl pl-16 pr-6 py-4 text-base font-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left"
                />
              </div>
            </div>

            {/* Input 2: Height */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                  Height
                  <span className="text-slate-400 cursor-pointer hover:text-[#16A34A] transition-colors" title="Enter your height measured flat against a wall.">
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setUnitSystem(unitSystem === "metric" ? "imperial" : "metric")}
                  className="bg-[#16A34A]/10 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-[9px] font-black uppercase cursor-pointer hover:bg-[#16A34A]/25 select-none border border-[#DCFCE7]/30 shadow-sm"
                >
                  {unitSystem === "metric" ? "cm" : "ft/in"}
                </button>
              </div>

              {unitSystem === "metric" ? (
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center justify-center bg-green-500/10 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 p-2.5 rounded-xl select-none shrink-0 pointer-events-none z-10 border border-[#DCFCE7]/20">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                    className="w-full bg-[#f8fafc] dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl pl-16 pr-6 py-4 text-base font-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      placeholder="5"
                      className="w-full bg-[#f8fafc] dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-4 text-base font-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 select-none uppercase">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      placeholder="9"
                      className="w-full bg-[#f8fafc] dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-4 text-base font-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 select-none uppercase">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Demographics collapsible header */}
            <div className="border border-slate-100 dark:border-white/5 rounded-2xl p-4 bg-slate-50/50 dark:bg-white/5 space-y-4">
              <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-350">
                <span>DEMOGRAPHIC CONFIGURATION</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400">GENDER</span>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-white focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400">AGE</span>
                  <select
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-white focus:outline-none"
                  >
                    {Array.from({ length: 73 }, (_, i) => i + 18).map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Calculate Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1b5e20] dark:bg-emerald-650 hover:bg-[#16A34A] text-white font-extrabold text-xs py-4 px-6 rounded-2xl shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between"
            >
              {isLoading ? (
                <div className="w-full flex justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <span className="flex-1 text-center font-black tracking-wide pl-6">Calculate Ratio</span>
                  <div className="w-6 h-6 rounded-full bg-white text-emerald-800 flex items-center justify-center shrink-0 shadow-md">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3.5]" />
                  </div>
                </>
              )}
            </button>

            {/* Privacy note */}
            <div className="text-center pt-2">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wide select-none flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                Your data is processed locally and never stored.
              </span>
            </div>
          </form>

          {/* TRANSITION LOADING CHECKLIST */}
          {isLoading && (
            <div className="mt-4 p-5 rounded-2xl border border-green-150 bg-white dark:bg-[#0c1210] shadow-md text-left space-y-4 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Analyzing Measures...</span>
              </div>
              <div className="space-y-2 text-[9px] font-bold text-slate-400">
                <div className={loadingStep >= 1 ? "text-green-600 font-extrabold" : ""}>✓ Calculating WHtR</div>
                <div className={loadingStep >= 2 ? "text-green-600 font-extrabold" : ""}>✓ Assessing Risk</div>
                <div className={loadingStep >= 3 ? "text-green-600 font-extrabold" : ""}>✓ Generating Recommendations</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Your Result / Placeholder (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          {isCalculated && results && !isLoading ? (
            /* Result Card */
            <div className="rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1210] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-left space-y-6 flex-1 transition-all">

              {/* Header inside Card */}
              <div className="flex justify-between items-center border-b border-slate-50 dark:border-white/5 pb-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">Your Result</h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Waist-to-height ratio output analysis</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 text-slate-655 dark:text-slate-200 border border-slate-200 dark:border-white/5 font-extrabold text-[10px] py-2 px-4.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>

              {/* Main value display with glow ring */}
              <div className="text-center py-4 space-y-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,165,74,0.05)_0%,transparent_70%)] pointer-events-none" />
                <span className="text-7xl font-black text-green-600 dark:text-[#4ADE80] tracking-tight block">
                  {results.ratio}
                </span>
                <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full text-xs font-black uppercase bg-[#16A34A]/10 text-[#16A34A] dark:text-[#4ADE80] select-none border border-green-500/20 shadow-inner">
                  ✓ {results.riskStatus}
                </span>
              </div>

              {/* Grid of 5 smaller metric cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* 1. Risk Category */}
                <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 flex gap-3 text-left hover:shadow-sm transition-all duration-300">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Risk Category</span>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{results.riskStatus}</h4>
                    <p className="text-[8px] font-semibold text-slate-400 mt-0.5">Low health risk</p>
                  </div>
                </div>

                {/* 2. Health Advice */}
                <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 flex gap-3 text-left hover:shadow-sm transition-all duration-300">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                    <Heart className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Health Advice</span>
                    <h4 className="text-xs font-black text-slate-850 dark:text-white mt-0.5 leading-normal">{results.healthAdvice}</h4>
                  </div>
                </div>

                {/* 3. Recommended Max Waist */}
                <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 flex gap-3 text-left hover:shadow-sm transition-all duration-300">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Recommended Max Waist</span>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{results.recommendedWaist}</h4>
                    <p className="text-[8px] font-semibold text-slate-400 mt-0.5">For your height</p>
                  </div>
                </div>

                {/* 4. Difference from Target */}
                <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 flex gap-3 text-left hover:shadow-sm transition-all duration-300">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                    <Target className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Difference from Target</span>
                    <h4 className={`text-xs font-black mt-0.5 ${results.differenceVal >= 0 ? "text-rose-500" : "text-[#16A34A]"}`}>
                      {results.differenceLabel}
                    </h4>
                    <p className="text-[8px] font-semibold text-slate-400 mt-0.5">
                      {results.differenceVal >= 0 ? "Above target limit" : "Below recommended limit"}
                    </p>
                  </div>
                </div>

                {/* 5. Healthy Target Ratio */}
                <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 flex gap-3 text-left hover:shadow-sm transition-all duration-300">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Healthy Target Ratio</span>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white mt-0.5">&lt; 0.50</h4>
                    <p className="text-[8px] font-semibold text-slate-400 mt-0.5">Ideal WHtR for most adults</p>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Placeholder Card before calculation */
            <div className="rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1210] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-center flex flex-col items-center justify-center min-h-[460px] space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner animate-pulse">
                <Pulse className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Await Measurements calculation</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold max-w-sm leading-relaxed">
                Enter your waist size and height values in the left form and click **Calculate Ratio** to load your health score, target outlines, and medical recommendations.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 3. ADDITIONAL DASHBOARD METRICS — Smooth reveals beneath when calculated */}
      {isCalculated && results && !isLoading && (
        <div className="mx-auto max-w-5xl space-y-8 pt-4">

          {/* Risk scale meter slider */}
          <div className="rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1210] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-left space-y-4">
            <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider">WHtR Bio Risk Scale</h3>
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                <span>Very Low</span>
                <span>Healthy</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Very High</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full relative">
                <div className="absolute inset-0 flex rounded-full overflow-hidden opacity-90">
                  <div className="w-[35%] bg-blue-500/50" />
                  <div className="w-[15%] bg-[#16A34A]/50" />
                  <div className="w-[10%] bg-[#F59E0B]/50" />
                  <div className="w-[10%] bg-orange-500/50" />
                  <div className="w-[30%] bg-[#DC2626]/50" />
                </div>
                {/* User indicator arrow pin */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#16A34A] dark:bg-[#4ADE80] border-2 border-white dark:border-[#0c1210] shadow-md transition-all duration-1000 flex items-center justify-center z-20"
                  style={{ left: `${Math.min(98, Math.max(2, (results.ratio / 0.90) * 100))}%` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
              {/* marker bubble */}
              <div className="relative h-6 w-full mt-2">
                <div
                  className="absolute -top-1 -translate-x-1/2 bg-[#16A34A] dark:bg-[#4ADE80] text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-md shadow-md transition-all duration-1000 whitespace-nowrap"
                  style={{ left: `${Math.min(98, Math.max(2, (results.ratio / 0.90) * 100))}%` }}
                >
                  Your WHtR: {results.ratio}
                </div>
              </div>
            </div>
          </div>

          {/* AI Health Summary Section */}
          <div className="rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1210] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-left">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-50 dark:border-white/5 pb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">AI Health Summary</h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Personalized feedback based on your metrics</p>
                  </div>
                </div>

                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                  {results.ratio <= 0.50 ? (
                    <span>Your waist-to-height ratio is within the healthy range. Current cardiometabolic risk appears low. Continue maintaining your weight through regular activity and balanced nutrition. A healthy ratio suggests optimized visceral fat deposition.</span>
                  ) : (
                    <span>Your waist-to-height ratio of {results.ratio} exceeds the recommended healthy threshold of 0.50. This indicates an increased accumulation of visceral abdominal fat, which is linked to metabolic conditions. We suggest reviewing your physical activity and nutrition plans.</span>
                  )}
                </p>
              </div>

              {/* Silhouette Shape indicator */}
              <div className="w-full lg:w-72 bg-[#F7FCF8] dark:bg-white/5 rounded-2xl border border-green-150/40 dark:border-white/5 p-8 flex flex-col items-center justify-center shrink-0 self-stretch">
                <div className="w-36 h-52">
                  {(() => {
                    const shapeMap = {
                      Apple: bodyShapeApple,
                      Pear: bodyShapePear,
                      Hourglass: bodyShapeHourglass,
                      Rectangle: bodyShapeRectangle,
                    };
                    const shapeImg = shapeMap[results.bodyShape] || bodyShapeRectangle;
                    return (
                      <img
                        src={shapeImg.src || shapeImg}
                        alt={`${results.bodyShape} body shape silhouette`}
                        className="w-full h-full object-contain drop-shadow-sm"
                        draggable={false}
                      />
                    );
                  })()}
                </div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4">Calculated Shape</span>
                <span className="text-sm font-black text-slate-800 dark:text-white mt-1">{results.bodyShape}</span>
              </div>
            </div>
          </div>

          {/* Wellness Recommendations */}
          <div className="space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider px-1">Biometric Wellness Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getRecommendations().map((rec, i) => {
                const Icon = rec.icon;
                return (
                  <div key={i} className="rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1210] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-3 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white">{rec.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{rec.desc}</p>
                    </div>
                    <span className="text-[8px] font-black text-[#16A34A] dark:text-[#4ADE80] uppercase tracking-wider">{rec.type} Guide</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goal Tracker */}
          <div className="rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1210] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-left space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 dark:border-white/5 pb-4 text-left">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">Waist Goal Tracker</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Abdominal reduction targets and timeline predictions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 grid grid-cols-3 md:grid-cols-1 gap-4 text-center md:text-left">
                <div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">Current Waist</span>
                  <span className="text-base font-black text-slate-855 dark:text-white block mt-0.5">
                    {results.waistInput} {unitSystem === "metric" ? "cm" : "in"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">Target Waist</span>
                  <span className="text-base font-black text-emerald-600 block mt-0.5">
                    {results.maxHealthyWaist}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">Waist Difference</span>
                  <span className={`text-base font-black block mt-0.5 ${results.differenceVal >= 0 ? "text-rose-500" : "text-[#16A34A] dark:text-[#4ADE80]"}`}>
                    {results.differenceVal > 0 ? `-${results.difference.replace("+", "")}` : "Goal Met 🎉"}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-450 dark:text-slate-500">Progress to healthy ratio (&lt; 0.50)</span>
                    <span className="text-emerald-600 dark:text-emerald-450">
                      {results.differenceVal > 0 ? `${Math.round(Math.max(10, 100 - (results.differenceVal / results.waistInput) * 100))}%` : "100%"}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-1000"
                      style={{ width: results.differenceVal > 0 ? `${Math.round(Math.max(10, 100 - (results.differenceVal / results.waistInput) * 100))}%` : "100%" }}
                    />
                  </div>
                </div>

                {results.differenceVal > 0 ? (
                  <div className="flex items-center gap-4 bg-[#F7FCF8] dark:bg-white/5 border border-green-150/40 dark:border-white/5 rounded-2xl p-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white">Estimated Timeline to Target</h4>
                      <p className="text-sm font-black text-[#15803D] dark:text-[#4ADE80] mt-0.5">{results.weeksToGoal} weeks</p>
                      <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">⚠️ This is an estimate based on safe, consistent fat loss of ~0.5–1cm per week.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-green-600 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white">All Targets Achieved</h4>
                      <p className="text-sm font-black text-emerald-600 mt-0.5">Healthy Visceral Ratio achieved</p>
                      <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">⚠️ Continue monitoring metrics monthly to ensure maintenance values.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trend Bar Chart */}
          <div className="rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1210] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-left space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">WHtR Trend Progress</h2>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">History track of all calculations</p>
                </div>
              </div>
              {/* Legends */}
              <div className="flex gap-3 text-[8px] font-black uppercase tracking-wider text-slate-400 select-none">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-600 rounded-full inline-block" /> Latest</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-300 rounded-full inline-block" /> Average</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#4ADE80] rounded-full inline-block" /> Goal (0.45)</span>
              </div>
            </div>

            <div className="relative h-48 flex items-end justify-between px-4 pt-8 pb-2">
              <div className="absolute inset-x-0 top-8 border-t border-dashed border-slate-100 dark:border-white/5" />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-100 dark:border-white/5" />
              <div className="absolute inset-x-0 bottom-8 border-t border-slate-200 dark:border-white/10" />

              {history.map((pt, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                  <span className="text-[9px] font-black text-slate-800 dark:text-white mb-0.5">
                    {pt.ratio}
                  </span>
                  <div className="w-8 bg-slate-100 dark:bg-white/5 rounded-t-lg h-24 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-650 to-[#4ADE80] transition-all duration-1000"
                      style={{ height: `${Math.min(100, (pt.ratio / 0.8) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {pt.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Research information accordion & FAQs */}
          <div className="rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1210] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-left space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-855 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-50 dark:border-white/5 pb-2 select-none">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Scientific Information & References
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {[
                  {
                    title: "What is Waist-to-Height Ratio (WHtR)?",
                    desc: "Waist-to-Height Ratio (WHtR) is a highly reliable metric to determine central adiposity (fat storage around the midsection). Dividing your waist size by height gives a proportional index of abdominal fat accumulation."
                  },
                  {
                    title: "Why is WHtR a better indicator than BMI?",
                    desc: "BMI only tracks gross body weight relative to height, ignoring actual body composition. A muscular athlete might get classified as overweight by BMI, while a normal weight individual with high abdominal fat deposits ('skinny fat') might get classified as healthy. WHtR directly maps visceral fat lines."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="py-3">
                    <button
                      onClick={() => setScientificOpenIndex(scientificOpenIndex === idx ? null : idx)}
                      className="w-full flex justify-between items-center text-left py-1 text-xs font-extrabold text-slate-800 dark:text-white cursor-pointer hover:text-emerald-600 transition-colors"
                    >
                      <span>{item.title}</span>
                      {scientificOpenIndex === idx ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        scientificOpenIndex === idx ? "max-h-40 mt-2 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export center */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1210] shadow-xl text-left">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-800 dark:text-white">Biometric Export Center</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Download, print, copy, or share your computed health ratio report</p>
            </div>
            <div className="flex flex-wrap gap-2.5 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={handlePrint}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 font-extrabold text-[10px] py-3 px-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Results
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-[10px] py-3 px-4 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}