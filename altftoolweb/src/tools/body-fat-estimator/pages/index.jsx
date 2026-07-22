import React, { useState, useMemo, useEffect } from "react";
import {
  Scale,
  Ruler,
  History,
  Trash2,
  Sparkles,
  Info,
  AlertTriangle
} from "lucide-react";
import MeasurementGuide from "../components/MeasurementGuide.jsx";
import ResultDashboard from "../components/ResultDashboard.jsx";

export default function ToolHome() {
  // Base State
  const [unitSystem, setUnitSystem] = useState("metric");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("30");
  const [method, setMethod] = useState("navy");

  // Inputs as strings to allow empty
  const [weight, setWeight] = useState("75");
  const [height, setHeight] = useState("175");
  const [waist, setWaist] = useState("88");
  const [neck, setNeck] = useState("38");
  const [hip, setHip] = useState("100");
  const [skinfold1, setSkinfold1] = useState("15");
  const [skinfold2, setSkinfold2] = useState("20");
  const [skinfold3, setSkinfold3] = useState("18");
  const [targetBodyFat, setTargetBodyFat] = useState(15);

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("body_fat_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("body_fat_history", JSON.stringify(history));
    } catch {}
  }, [history]);

  const parseNumber = (val, min, max, defaultValue) => {
    if (val === "" || val === undefined) return defaultValue;
    const num = parseFloat(val);
    if (isNaN(num)) return defaultValue;
    if (min !== undefined && num < min) return min;
    if (max !== undefined && num > max) return max;
    return num;
  };

  const handleSystemChange = (newSystem) => {
    if (newSystem === unitSystem) return;
    const w = parseNumber(weight, 0, 1000, 0);
    const h = parseNumber(height, 0, 300, 0);
    const wa = parseNumber(waist, 0, 300, 0);
    const ne = parseNumber(neck, 0, 200, 0);
    const hi = parseNumber(hip, 0, 300, 0);

    if (newSystem === "imperial") {
      setWeight((w * 2.20462).toFixed(1));
      setHeight((h / 2.54).toFixed(1));
      setWaist((wa / 2.54).toFixed(1));
      setNeck((ne / 2.54).toFixed(1));
      setHip((hi / 2.54).toFixed(1));
    } else {
      setWeight((w / 2.20462).toFixed(1));
      setHeight((h * 2.54).toFixed(1));
      setWaist((wa * 2.54).toFixed(1));
      setNeck((ne * 2.54).toFixed(1));
      setHip((hi * 2.54).toFixed(1));
    }
    setUnitSystem(newSystem);
  };

  const ageNum = parseNumber(age, 15, 100, 30);
  const weightKg = useMemo(() => {
    const val = parseNumber(weight, 0, 1000, 0);
    return unitSystem === "metric" ? val : val / 2.20462;
  }, [weight, unitSystem]);

  const heightCm = useMemo(() => {
    const val = parseNumber(height, 0, 300, 0);
    return unitSystem === "metric" ? val : val * 2.54;
  }, [height, unitSystem]);

  const waistCm = useMemo(() => {
    const val = parseNumber(waist, 0, 300, 0);
    return unitSystem === "metric" ? val : val * 2.54;
  }, [waist, unitSystem]);

  const neckCm = useMemo(() => {
    const val = parseNumber(neck, 0, 200, 0);
    return unitSystem === "metric" ? val : val * 2.54;
  }, [neck, unitSystem]);

  const hipCm = useMemo(() => {
    const val = parseNumber(hip, 0, 300, 0);
    return unitSystem === "metric" ? val : val * 2.54;
  }, [hip, unitSystem]);

  const bmiValue = useMemo(() => {
    if (heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }, [weightKg, heightCm]);

  const calculationResult = useMemo(() => {
    const fallback = (errMsg) => ({
      bf: 0,
      fatMass: 0,
      leanMass: 0,
      valid: false,
      error: errMsg
    });

    if (weightKg <= 20 || heightCm <= 100) {
      return fallback("Please enter a valid weight and height.");
    }

    let bf = 0;

    if (method === "navy") {
      const waistIn = waistCm / 2.54;
      const neckIn = neckCm / 2.54;
      const heightIn = heightCm / 2.54;
      const hipIn = hipCm / 2.54;

      if (waistCm <= 30 || neckCm <= 20) {
        return fallback("Please provide valid circumference measurements.");
      }

      if (gender === "male") {
        const diff = waistIn - neckIn;
        if (diff <= 0) {
          return fallback("Waist circumference must be greater than neck circumference.");
        }
        const denom = 1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(heightIn);
        bf = (495 / denom) - 450;
      } else {
        const sum = waistIn + hipIn - neckIn;
        if (sum <= 0 || hipCm <= 30) {
          return fallback("Please verify waist, hip, and neck measurements.");
        }
        const denom = 1.029669 - 0.35004 * Math.log10(sum) + 0.22100 * Math.log10(heightIn);
        bf = (495 / denom) - 450;
      }
    } else if (method === "bmi") {
      const heightM = heightCm / 100;
      const bmi = weightKg / (heightM * heightM);
      const genderFactor = gender === "male" ? 1 : 0;
      bf = (1.20 * bmi) + (0.23 * ageNum) - (10.8 * genderFactor) - 5.4;
    } else if (method === "skinfold") {
      const s1 = parseNumber(skinfold1, 0, 200, 0);
      const s2 = parseNumber(skinfold2, 0, 200, 0);
      const s3 = parseNumber(skinfold3, 0, 200, 0);
      const sum = s1 + s2 + s3;
      if (sum <= 5) return fallback("Reasonable caliper values required.");
      let bodyDensity = 1.0;
      if (gender === "male") {
        bodyDensity = 1.10938 - (0.0008267 * sum) + (0.0000016 * sum * sum) - (0.0002574 * ageNum);
      } else {
        bodyDensity = 1.0994921 - (0.0009929 * sum) + (0.0000023 * sum * sum) - (0.0001392 * ageNum);
      }
      if (bodyDensity > 0.8 && bodyDensity < 1.2) {
        bf = (495 / bodyDensity) - 450;
      } else {
        return fallback("Skinfold sum out of range.");
      }
    }

    if (isNaN(bf) || !isFinite(bf)) return fallback("Invalid computation.");
    const clampedBF = Math.max(2, Math.min(65, bf));
    const fatMassKg = weightKg * (clampedBF / 100);
    const leanMassKg = weightKg - fatMassKg;
    const fatMassDisplay = unitSystem === "metric" ? fatMassKg : fatMassKg * 2.20462;
    const leanMassDisplay = unitSystem === "metric" ? leanMassKg : leanMassKg * 2.20462;

    return {
      bf: clampedBF,
      fatMass: fatMassDisplay,
      leanMass: leanMassDisplay,
      valid: true,
      error: null
    };
  }, [method, weightKg, heightCm, waistCm, neckCm, hipCm, gender, ageNum, skinfold1, skinfold2, skinfold3, unitSystem]);

  const categoryInfo = useMemo(() => {
    const bf = calculationResult.bf;
    if (!calculationResult.valid) return { name: "Pending", color: "text-[var(--secondary-foreground)]", bg: "bg-[var(--muted)]/50", border: "border-[var(--card-border)]/50" };

    if (gender === "male") {
      if (bf < 6) return { name: "Essential Fat", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
      if (bf < 14) return { name: "Athletic", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      if (bf < 18) return { name: "Fitness", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10", border: "border-[var(--primary)]/30" };
      if (bf < 25) return { name: "Acceptable", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      return { name: "Excess Fat / Obese", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
    } else {
      if (bf < 14) return { name: "Essential Fat", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
      if (bf < 21) return { name: "Athletic", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      if (bf < 25) return { name: "Fitness", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10", border: "border-[var(--primary)]/30" };
      if (bf < 32) return { name: "Acceptable", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      return { name: "Excess Fat / Obese", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
    }
  }, [calculationResult.bf, calculationResult.valid, gender]);

  const goalSimulator = useMemo(() => {
    if (!calculationResult.valid) return null;
    const currentWeight = parseNumber(weight, 0, 1000, 0);
    const currentLeanMass = calculationResult.leanMass;
    const targetMultiplier = 1 - (targetBodyFat / 100);
    if (targetMultiplier <= 0.2) return null;
    const targetWeight = currentLeanMass / targetMultiplier;
    const weightDifference = targetWeight - currentWeight;
    return { targetWeight, weightDifference, isLoss: weightDifference < 0 };
  }, [calculationResult, weight, targetBodyFat]);

  const applyPreset = (presetGender, presetMethod) => {
    setGender(presetGender);
    setMethod(presetMethod);
    if (presetGender === "male") {
      setWeight(unitSystem === "metric" ? "80" : "176");
      setHeight(unitSystem === "metric" ? "180" : "71");
      setWaist(unitSystem === "metric" ? "90" : "35.5");
      setNeck(unitSystem === "metric" ? "39" : "15.4");
      setSkinfold1("14");
      setSkinfold2("18");
      setSkinfold3("16");
    } else {
      setWeight(unitSystem === "metric" ? "64" : "141");
      setHeight(unitSystem === "metric" ? "165" : "65");
      setWaist(unitSystem === "metric" ? "74" : "29");
      setNeck(unitSystem === "metric" ? "34" : "13.4");
      setHip(unitSystem === "metric" ? "98" : "38.5");
      setSkinfold1("18");
      setSkinfold2("15");
      setSkinfold3("22");
    }
  };

  const saveCurrentResult = () => {
    if (!calculationResult.valid) return;
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      method: method === "navy" ? "U.S. Navy Method" : method === "bmi" ? "BMI Estimate" : "Skinfold Caliper",
      weight: parseNumber(weight, 0, 1000, 0),
      unitSystem,
      bodyFatPercent: Number(calculationResult.bf.toFixed(1)),
      fatMass: Number(calculationResult.fatMass.toFixed(1)),
      leanMass: Number(calculationResult.leanMass.toFixed(1))
    };
    setHistory(prev => [newEntry, ...prev]);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const deleteEntry = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const [activeTab, setActiveTab] = useState("calculator");

  const showWarning = useMemo(() => {
    if (method !== "navy") return false;
    if (!calculationResult.valid) return false;
    return (bmiValue > 35) || (ageNum < 18);
  }, [method, calculationResult.valid, bmiValue, ageNum]);

  const handleAgeChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setAge("");
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 15 && num <= 100) {
      setAge(val);
    } else if (!isNaN(num)) {
      setAge(val);
    } else if (val !== "") {
      return;
    }
  };

  const handleAgeBlur = () => {
    let num = parseInt(age, 10);
    if (isNaN(num)) num = 30;
    num = Math.max(15, Math.min(100, num));
    setAge(num.toString());
  };

  const createNumberHandler = (setter, min, max, defaultValue) => (e) => {
    const val = e.target.value;
    if (val === "") {
      setter("");
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setter(val);
    }
  };

  const createNumberBlur = (setter, min, max, defaultValue) => () => {
    setter(prev => {
      let num = parseFloat(prev);
      if (isNaN(num)) num = defaultValue;
      if (min !== undefined && num < min) num = min;
      if (max !== undefined && num > max) num = max;
      return num.toString();
    });
  };

  const weightHandler = createNumberHandler(setWeight, 0, 1000, 75);
  const weightBlur = createNumberBlur(setWeight, 0, 1000, 75);
  const heightHandler = createNumberHandler(setHeight, 0, 300, 175);
  const heightBlur = createNumberBlur(setHeight, 0, 300, 175);
  const waistHandler = createNumberHandler(setWaist, 0, 300, 88);
  const waistBlur = createNumberBlur(setWaist, 0, 300, 88);
  const neckHandler = createNumberHandler(setNeck, 0, 200, 38);
  const neckBlur = createNumberBlur(setNeck, 0, 200, 38);
  const hipHandler = createNumberHandler(setHip, 0, 300, 100);
  const hipBlur = createNumberBlur(setHip, 0, 300, 100);
  const skinfoldHandler = (setter) => createNumberHandler(setter, 0, 200, 15);
  const skinfoldBlur = (setter, defaultVal) => createNumberBlur(setter, 0, 200, defaultVal);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">

        {/* Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Scale className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Body Fat % Estimator</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Fitness & Health</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Estimate your body fat percentage using Navy tape, BMI regression, or skinfold caliper methods.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Navy Method", "BMI Estimate", "Skinfold Caliper"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <Scale className="h-3 w-3 text-primary" />{item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-6xl space-y-6">

          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="flex rounded-lg bg-card p-1 border border-border shadow-sm">
              <button
                onClick={() => handleSystemChange("metric")}
                className={`rounded-md px-4 py-2 text-xs font-semibold ${unitSystem === "metric" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Metric (kg/cm)
              </button>
              <button
                onClick={() => handleSystemChange("imperial")}
                className={`rounded-md px-4 py-2 text-xs font-semibold ${unitSystem === "imperial" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                US Units (lbs/in)
              </button>
            </div>
            <button
              onClick={() => setActiveTab(activeTab === "calculator" ? "guide" : "calculator")}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                activeTab === "guide"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Info className="h-4 w-4" />
              {activeTab === "guide" ? "Back to Calculator" : "Measurement Guide"}
            </button>
          </div>

          {activeTab === "guide" ? (
            <MeasurementGuide setActiveTab={setActiveTab} />
          ) : (
            <>
              <div className="mb-6">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> Example Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyPreset("male", "navy")}
                        className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/10"
                      >
                        ♂ Standard Male
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("female", "navy")}
                        className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/10"
                      >
                        ♀ Standard Female
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWeight(unitSystem === "metric" ? "95" : "210");
                          setHeight(unitSystem === "metric" ? "178" : "70");
                          setWaist(unitSystem === "metric" ? "105" : "41.5");
                          setNeck(unitSystem === "metric" ? "42" : "16.5");
                          setMethod("navy");
                        }}
                        className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/10"
                      >
                        Higher BMI
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 mb-8">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="mb-4 text-sm font-semibold text-primary flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    1. Core Personal Stats
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Biological Gender
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setGender("male")}
                          className={`rounded-xl border py-2.5 text-center text-sm font-semibold ${
                            gender === "male"
                              ? "border-primary bg-primary text-white"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender("female")}
                          className={`rounded-xl border py-2.5 text-center text-sm font-semibold ${
                            gender === "female"
                              ? "border-primary bg-primary text-white"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Age <span className="text-muted-foreground">(years)</span>
                      </label>
                      <input
                        type="number"
                        min={15}
                        max={100}
                        value={age}
                        onChange={handleAgeChange}
                        onBlur={handleAgeBlur}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Total Weight <span className="text-primary font-bold">({unitSystem === "metric" ? "kg" : "lbs"})</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={weightHandler}
                        onBlur={weightBlur}
                        placeholder={unitSystem === "metric" ? "75" : "165"}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Height <span className="text-primary font-bold">({unitSystem === "metric" ? "cm" : "inches"})</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={height}
                        onChange={heightHandler}
                        onBlur={heightBlur}
                        placeholder={unitSystem === "metric" ? "175" : "69"}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="mb-4 text-sm font-semibold text-primary flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    2. Choose Estimator Method
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setMethod("navy")}
                      className={`rounded-xl border p-3 text-left ${
                        method === "navy"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground"
                      }`}
                    >
                      <div className="text-xs font-bold">U.S. Navy Tape</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">High fidelity circumference</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("bmi")}
                      className={`rounded-xl border p-3 text-left ${
                        method === "bmi"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground"
                      }`}
                    >
                      <div className="text-xs font-bold">BMI Regression</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">Uses weight, height, age</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("skinfold")}
                      className={`rounded-xl border p-3 text-left ${
                        method === "skinfold"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground"
                      }`}
                    >
                      <div className="text-xs font-bold">Caliper 3-Site</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">Jackson-Pollock skinfold</div>
                    </button>
                  </div>

                  <div className="rounded-xl bg-background p-4 border border-border">
                    {method === "navy" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-primary">Tape Measurements ({unitSystem === "metric" ? "cm" : "inches"})</span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">Waist</label>
                            <input type="number" step="0.1" value={waist} onChange={waistHandler} onBlur={waistBlur} placeholder={unitSystem === "metric" ? "88" : "34.5"} className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-bold text-foreground outline-none focus:border-primary" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">Neck</label>
                            <input type="number" step="0.1" value={neck} onChange={neckHandler} onBlur={neckBlur} placeholder={unitSystem === "metric" ? "38" : "15"} className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-bold text-foreground outline-none focus:border-primary" />
                          </div>
                          {gender === "female" && (
                            <div className="sm:col-span-2">
                              <label className="mb-1 block text-xs text-muted-foreground">Hip</label>
                              <input type="number" step="0.1" value={hip} onChange={hipHandler} onBlur={hipBlur} placeholder={unitSystem === "metric" ? "100" : "39.5"} className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-bold text-foreground outline-none focus:border-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {method === "bmi" && (
                      <div className="py-4 text-center">
                        <p className="text-xs text-muted-foreground">No extra measurements required.</p>
                      </div>
                    )}
                    {method === "skinfold" && (
                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">{gender === "male" ? "Chest" : "Triceps"}</label>
                            <input type="number" value={skinfold1} onChange={skinfoldHandler(setSkinfold1)} onBlur={skinfoldBlur(setSkinfold1, 15)} className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-bold text-foreground outline-none focus:border-primary" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">{gender === "male" ? "Abdomen" : "Suprailiac"}</label>
                            <input type="number" value={skinfold2} onChange={skinfoldHandler(setSkinfold2)} onBlur={skinfoldBlur(setSkinfold2, 20)} className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-bold text-foreground outline-none focus:border-primary" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">Thigh</label>
                            <input type="number" value={skinfold3} onChange={skinfoldHandler(setSkinfold3)} onBlur={skinfoldBlur(setSkinfold3, 18)} className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-bold text-foreground outline-none focus:border-primary" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {showWarning && (
                <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="text-xs text-amber-600">
                      <p className="font-bold">Accuracy Warning</p>
                      <p>{bmiValue > 35 ? "High BMI may affect accuracy." : "Results for <18 years old should be used with caution."}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <ResultDashboard
                  method={method}
                  calculationResult={calculationResult}
                  categoryInfo={categoryInfo}
                  unitSystem={unitSystem}
                  saveCurrentResult={saveCurrentResult}
                  savedSuccess={savedSuccess}
                  targetBodyFat={targetBodyFat}
                  setTargetBodyFat={setTargetBodyFat}
                  goalSimulator={goalSimulator}
                />
              </div>

              {history.length > 0 && (
                <div className="mt-12">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                      <History className="h-4 w-4" />
                      History
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Method</th>
                            <th className="py-2.5 px-3">Body Fat %</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {history.map(item => (
                            <tr key={item.id}>
                              <td className="py-3 px-3">{item.date}</td>
                              <td className="py-3 px-3">{item.method}</td>
                              <td className="py-3 px-3 font-bold">{item.bodyFatPercent}%</td>
                              <td className="py-3 px-3 text-right">
                                <button onClick={() => deleteEntry(item.id)} className="text-muted-foreground hover:text-rose-400">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
