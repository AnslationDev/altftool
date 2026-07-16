"use client";
import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import HowToUse from "../components/HowToUse";
import ToolFeatures from "../components/ToolFeatures";

const FORMULAS = [
  { id: "brzycki", name: "Brzycki" },
  { id: "lander", name: "Lander" },
  { id: "lombardi", name: "Lombardi" },
  { id: "mayhew", name: "Mayhew" },
  { id: "oconner", name: "O'Conner" },
  { id: "wathan", name: "Wathan" },
  { id: "adams", name: "Adams" },
];
const FORMULA_HELP = {
  brzycki: "Best for 1-10 reps. Popular default for general strength work.",
  lander: "Reliable at lower reps, often used in powerlifting contexts.",
  lombardi: "Exponential model that behaves smoothly at mixed rep ranges.",
  mayhew: "Can be useful when reps are higher (5+).",
  oconner: "Simple linear estimate for quick planning.",
  wathan: "Good for moderate reps and practical gym programming.",
  adams: "Alternative estimate model for comparison across formulas.",
};

const PRESETS = ["Bench Press", "Squat", "Deadlift"];
const EXERCISE_OPTIONS = [
  "Bench Press",
  "Incline Bench Press",
  "Decline Bench Press",
  "Dumbbell Bench Press",
  "Close-Grip Bench Press",
  "Paused Bench Press",
  "Back Squat",
  "Front Squat",
  "Box Squat",
  "Pause Squat",
  "Overhead Squat",
  "Deadlift",
  "Sumo Deadlift",
  "Romanian Deadlift",
  "Deficit Deadlift",
  "Rack Pull",
  "Snatch-Grip Deadlift",
  "Overhead Press",
  "Push Press",
  "Seated Overhead Press",
  "Dumbbell Shoulder Press",
  "Strict Press",
  "Barbell Row",
  "Pendlay Row",
  "T-Bar Row",
  "Dumbbell Row",
  "Weighted Pull-Up",
  "Weighted Chin-Up",
  "Lat Pulldown",
  "Hip Thrust",
  "Glute Bridge",
  "Leg Press",
  "Hack Squat",
  "Bulgarian Split Squat",
  "Lunge",
  "Good Morning",
  "Power Clean",
  "Hang Clean",
  "Snatch",
  "Clean and Jerk",
  "Barbell Curl",
  "EZ Bar Curl",
  "Skull Crusher",
  "Dip (Weighted)",
  "Calf Raise",
  "Other",
];
const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATES_LB = [45, 35, 25, 10, 5, 2.5];

const toKg = (v, unit) => (unit === "kg" ? v : v * 0.45359237);
const fromKg = (v, unit) => (unit === "kg" ? v : v / 0.45359237);
const round1 = (v) => Math.round(v * 10) / 10;

const calc1rm = (w, r, f) => {
  if (w <= 0 || r <= 0) return null;
  switch (f) {
    case "brzycki":
      return w * (36 / (37 - r));
    case "lander":
      return (100 * w) / (101.3 - 2.67123 * r);
    case "lombardi":
      return w * Math.pow(r, 0.1);
    case "mayhew":
      return (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r));
    case "oconner":
      return w * (1 + r / 30);
    case "wathan":
      return (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r));
    case "adams":
      return w / (1 - 0.02 * r);
    default:
      return w * (36 / (37 - r));
  }
};

const exportPngCard = (result, unit) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = "#f9fafb";
  ctx.font = "bold 56px sans-serif";
  ctx.fillText("One Rep Max Report", 60, 100);
  ctx.font = "32px sans-serif";
  ctx.fillText(`Exercise: ${result.exercise}`, 60, 190);
  ctx.fillText(`1RM: ${round1(result.oneRmDisplay)} ${unit}`, 60, 250);
  ctx.fillText(`Formula: ${result.formula}`, 60, 310);
  ctx.fillText(`Set: ${result.weightDisplay} x ${result.reps}`, 60, 370);
  ctx.fillText(`RPE ${result.rpe} | RIR ${result.rir}`, 60, 430);
  const link = document.createElement("a");
  link.download = `1rm-${result.exercise.replace(/\s+/g, "-").toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
};

export default function Index() {
  const [exercise, setExercise] = useState("");
  const [exerciseSelect, setExerciseSelect] = useState("");
  const [customExercise, setCustomExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [formula, setFormula] = useState("brzycki");
  const [unit, setUnit] = useState("kg");
  const [bodyweight, setBodyweight] = useState("");
  const [trainingAge, setTrainingAge] = useState("");
  const [preferredFormula, setPreferredFormula] = useState("brzycki");
  const [rpe, setRpe] = useState("9");
  const [rir, setRir] = useState("1");
  const [target1rm, setTarget1rm] = useState("");
  const [weeklyIncrement, setWeeklyIncrement] = useState("1");
  const [plateBar, setPlateBar] = useState(unit === "kg" ? "20" : "45");
  const [platePct, setPlatePct] = useState("85");
  const [compareMode, setCompareMode] = useState(false);
  const [activePreset, setActivePreset] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [restSeconds, setRestSeconds] = useState(0);
  const [microloading, setMicroloading] = useState(true);
  const [plateStep, setPlateStep] = useState("1.25");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("orm-all-data") || "{}");
      if (saved.history) setHistory(saved.history);
      if (saved.profile) {
        setBodyweight(saved.profile.bodyweight || "");
        setTrainingAge(saved.profile.trainingAge || "");
        setPreferredFormula(saved.profile.preferredFormula || "brzycki");
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "orm-all-data",
      JSON.stringify({
        history,
        profile: { bodyweight, trainingAge, preferredFormula },
      })
    );
  }, [history, bodyweight, trainingAge, preferredFormula]);

  useEffect(() => {
    setPlateBar(unit === "kg" ? "20" : "45");
  }, [unit]);
  useEffect(() => {
    if (!restSeconds) return;
    const t = setInterval(() => setRestSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [restSeconds]);

  const formulaTable = useMemo(() => {
    const w = Number(weight);
    const r = Number(reps);
    if (!w || !r) return [];
    const wKg = toKg(w, unit);
    return FORMULAS.map((f) => {
      const oneRmKg = calc1rm(wKg, r, f.id) || 0;
      return { name: f.name, oneRm: round1(fromKg(oneRmKg, unit)) };
    });
  }, [weight, reps, unit]);

  const bestByExercise = useMemo(() => {
    const map = {};
    history.forEach((h) => {
      if (!map[h.exercise] || h.oneRmKg > map[h.exercise].oneRmKg) map[h.exercise] = h;
    });
    return Object.values(map);
  }, [history]);

  const plan = useMemo(() => {
    if (!result) return null;
    const oneRm = result.oneRmKg;
    const level =
      oneRm < 100 ? "Conservative" : oneRm < 180 ? "Balanced" : "Aggressive";
    const deload = [
      { week: "Week 1", pct: 70 },
      { week: "Week 2", pct: 75 },
      { week: "Week 3", pct: 80 },
      { week: "Week 4 (Deload)", pct: 60 },
    ];
    return { level, deload, oneRm };
  }, [result]);

  const validateInputs = () => {
    const next = {};
    const w = Number(weight);
    const r = Number(reps);
    const rpeN = Number(rpe);
    const rirN = Number(rir);
    if (!w || w <= 0) next.weight = "Enter valid weight.";
    if (!r || r < 1 || r > 20) next.reps = "Reps must be 1 to 20.";
    if (!rpeN || rpeN < 6 || rpeN > 10) next.rpe = "RPE must be 6 to 10.";
    if (rirN < 0 || rirN > 5) next.rir = "RIR must be 0 to 5.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onCalculate = (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      setError("Please fix highlighted inputs.");
      return;
    }
    const w = Number(weight);
    const r = Number(reps);
    const rpeN = Number(rpe);
    const rirN = Number(rir);
    if (!w || !r) return setError("Enter valid weight and reps.");
    if (r < 1 || r > 20) return setError("Reps should be between 1 and 20.");
    const wKg = toKg(w, unit);
    const base = calc1rm(wKg, r, formula);
    if (!base || !Number.isFinite(base)) return setError("Could not calculate.");

    const intensityAdjust = 1 + Math.max(0, 10 - rpeN) * 0.015 + Math.max(0, rirN) * 0.02;
    const adjustedKg = base * intensityAdjust;
    const oneRmDisplay = fromKg(adjustedKg, unit);
    const row = {
      id: `${Date.now()}`,
      date: new Date().toLocaleString(),
      exercise: exercise || "Exercise",
      formula: FORMULAS.find((x) => x.id === formula)?.name || "Brzycki",
      reps: r,
      rpe: rpeN,
      rir: rirN,
      weightDisplay: w,
      oneRmDisplay,
      oneRmKg: adjustedKg,
      unit,
    };
    setError("");
    setResult(row);
    setHistory((p) => [row, ...p].slice(0, 80));
  };

  const onReset = () => {
    setExercise("");
    setExerciseSelect("");
    setCustomExercise("");
    setWeight("");
    setReps("");
    setFormula(preferredFormula);
    setRpe("9");
    setRir("1");
    setResult(null);
    setError("");
    setFieldErrors({});
    setActivePreset("");
  };

  const oneRmForTable = result ? fromKg(result.oneRmKg, unit) : 0;
  const zoneRows = [95, 90, 85, 80, 75, 70].map((p) => ({
    pct: p,
    load: round1(oneRmForTable * (p / 100)),
  }));

  const chartRows = result
    ? Array.from({ length: 12 }).map((_, i) => {
        const rp = i + 1;
        const loadKg = result.oneRmKg * (1 - rp / 30);
        return { reps: rp, load: round1(fromKg(loadKg, unit)) };
      })
    : [];

  const targetWeeks = (() => {
    if (!result || !target1rm || !weeklyIncrement) return null;
    const targetKg = toKg(Number(target1rm), unit);
    const incKg = toKg(Number(weeklyIncrement), unit);
    if (targetKg <= result.oneRmKg || incKg <= 0) return 0;
    return Math.ceil((targetKg - result.oneRmKg) / incKg);
  })();

  const plateBreakdown = (() => {
    if (!result) return [];
    const target = result.oneRmKg * (Number(platePct) / 100);
    const barKg = toKg(Number(plateBar || 0), unit);
    const sideKg = Math.max(0, (target - barKg) / 2);
    const plates = (unit === "kg" ? PLATES_KG : PLATES_LB).map((p) => toKg(p, unit));
    let rem = sideKg;
    const out = [];
    plates.forEach((pKg, i) => {
      const c = Math.floor(rem / pKg);
      if (c > 0) {
        rem -= c * pKg;
        const shown = unit === "kg" ? PLATES_KG[i] : PLATES_LB[i];
        out.push({ plate: shown, countPerSide: c });
      }
    });
    const step = toKg(Number(plateStep), unit);
    if (out.length === 0 && step > 0 && sideKg > 0) {
      out.push({ plate: Number(plateStep), countPerSide: Math.round(sideKg / step) });
    }
    return out;
  })();

  const onCopyZoneTable = async () => {
    const text = zoneRows.map((z) => `${z.pct}%: ${z.load} ${unit}`).join("\n");
    await navigator.clipboard.writeText(text);
  };

  const onExportCsv = () => {
    const header = "Date,Exercise,Formula,Weight,Reps,RPE,RIR,OneRM(Unit),Unit";
    const rows = history.map(
      (h) =>
        `${h.date},${h.exercise},${h.formula},${h.weightDisplay},${h.reps},${h.rpe},${h.rir},${round1(
          fromKg(h.oneRmKg, h.unit)
        )},${h.unit}`
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "one-rep-max-history.csv";
    a.click();
  };
  const onDeleteHistory = (id) => setHistory((p) => p.filter((x) => x.id !== id));
  const onPinHistory = (id) =>
    setHistory((p) => p.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)));
  const onClearHistory = () => {
    if (window.confirm("Clear all history?")) setHistory([]);
  };
  const onPrintSummary = () => {
    if (!result) return;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`
      <html><head><title>1RM Summary</title></head><body style="font-family:Arial;padding:24px">
      <h1>One Rep Max Summary</h1>
      <p><strong>Exercise:</strong> ${result.exercise}</p>
      <p><strong>Estimated 1RM:</strong> ${round1(result.oneRmDisplay)} ${unit}</p>
      <p><strong>Formula:</strong> ${result.formula}</p>
      <p><strong>Set:</strong> ${result.weightDisplay} x ${result.reps}</p>
      <p><strong>Effort:</strong> RPE ${result.rpe} / RIR ${result.rir}</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };
  const handleUnitChange = (nextUnit) => {
    if (nextUnit === unit) return;
    const convert = (val) => {
      if (val === "" || isNaN(Number(val))) return val;
      const kg = toKg(Number(val), unit);
      return round1(fromKg(kg, nextUnit)).toString();
    };
    setWeight(convert(weight));
    setBodyweight(convert(bodyweight));
    setTarget1rm(convert(target1rm));
    setWeeklyIncrement(convert(weeklyIncrement));
    setPlateBar(nextUnit === "kg" ? "20" : "45");
    setUnit(nextUnit);
  };

  const onShare = async () => {
    if (!result) return;
    const text = `${result.exercise} 1RM: ${round1(result.oneRmDisplay)} ${unit} (${result.formula})`;
    if (navigator.share) await navigator.share({ title: "My 1RM", text });
    else await navigator.clipboard.writeText(text);
  };

  return (
    <div className="px-4 py-6">
      <Header />
      <div className="max-w-5xl mx-auto bg-(--card) rounded-xl shadow-lg overflow-hidden py-5">
        <div className="p-6 space-y-6">
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setExerciseSelect(p);
                  setCustomExercise("");
                  setExercise(p);
                  setActivePreset(p);
                }}
                className={`px-3 py-2 rounded border text-sm transition-all ${
                  activePreset === p
                    ? "bg-(--primary) text-white border-(--primary)"
                    : "border-(--border) hover:border-(--primary) active:bg-(--primary) active:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <form onSubmit={onCalculate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                aria-label="Exercise"
                value={exerciseSelect}
                onChange={(e) => {
                  const value = e.target.value;
                  setExerciseSelect(value);
                  setActivePreset("");
                  if (value === "Other") {
                    setExercise("");
                  } else {
                    setCustomExercise("");
                    setExercise(value);
                  }
                }}
                className={selectClass(!!exerciseSelect)}
              >
                <option value="">Select Exercise</option>
                {EXERCISE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select aria-label="Unit" value={unit} onChange={(e) => handleUnitChange(e.target.value)} className={selectClass(!!unit)}>
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
              <select aria-label="Formula" value={formula} onChange={(e) => setFormula(e.target.value)} className={selectClass(!!formula)}>
                {FORMULAS.map((f) => (
                  <option value={f.id} key={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            {exerciseSelect === "Other" && (
              <input
                value={customExercise}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomExercise(value);
                  setExercise(value);
                }}
                placeholder="Enter custom exercise"
                className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background)"
              />
            )}
            <p className="text-sm text-(--muted-foreground)">{FORMULA_HELP[formula]}</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input aria-label="Weight" type="number" min="1" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={`Weight (${unit})`} className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background)" />
                {fieldErrors.weight && <p className="text-xs text-red-500 mt-1">{fieldErrors.weight}</p>}
              </div>
              <div>
                <input aria-label="Reps" type="number" min="1" max="20" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="Reps" className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background)" />
                {fieldErrors.reps && <p className="text-xs text-red-500 mt-1">{fieldErrors.reps}</p>}
              </div>
              <div>
                <input aria-label="RPE" type="number" min="6" max="10" step="0.5" value={rpe} onChange={(e) => setRpe(e.target.value)} placeholder="RPE (6-10)" className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background)" />
                {fieldErrors.rpe && <p className="text-xs text-red-500 mt-1">{fieldErrors.rpe}</p>}
              </div>
              <div>
                <input aria-label="RIR" type="number" min="0" max="5" value={rir} onChange={(e) => setRir(e.target.value)} placeholder="RIR (0-5)" className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background)" />
                {fieldErrors.rir && <p className="text-xs text-red-500 mt-1">{fieldErrors.rir}</p>}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                type="submit"
                className="px-5 py-3 rounded-lg border border-(--border) bg-(--card) text-(--foreground) font-semibold hover:border-(--primary) hover:text-(--primary) active:bg-(--primary) active:text-white focus:outline-none focus:ring-2 focus:ring-(--primary) transition-all"
              >
                Calculate 1RM
              </button>
              <button
                type="button"
                onClick={onReset}
                className="px-5 py-3 rounded-lg border border-(--border) bg-(--card) hover:border-(--primary) hover:text-(--primary) active:bg-(--primary) active:text-white focus:outline-none focus:ring-2 focus:ring-(--primary) transition-all"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setCompareMode((v) => !v)}
                className={`px-5 py-3 rounded-lg border transition-all ${
                  compareMode
                    ? "bg-(--primary) text-white border-(--primary)"
                    : "border-(--border) bg-(--card) hover:border-(--primary) hover:text-(--primary) active:bg-(--primary) active:text-white"
                }`}
              >
                {compareMode ? "Hide Compare" : "Compare Formulas"}
              </button>
              <button
                type="button"
                onClick={() => setMicroloading((v) => !v)}
                className={`px-5 py-3 rounded-lg border transition-all ${
                  microloading
                    ? "bg-(--primary) text-white border-(--primary)"
                    : "border-(--border) bg-(--card)"
                }`}
              >
                {microloading ? "Microloading: ON" : "Microloading: OFF"}
              </button>
            </div>
          </form>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center">{error}</div>}

          <div className="rounded-lg border border-(--border) p-4">
            <h3 className="font-semibold mb-3">Personal Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={bodyweight} onChange={(e) => setBodyweight(e.target.value)} placeholder={`Bodyweight (${unit})`} className="px-3 py-2 rounded border border-(--border) bg-(--background)" />
              <input value={trainingAge} onChange={(e) => setTrainingAge(e.target.value)} placeholder="Training age (years)" className="px-3 py-2 rounded border border-(--border) bg-(--background)" />
              <select value={preferredFormula} onChange={(e) => setPreferredFormula(e.target.value)} className={selectClass(!!preferredFormula)}>
                {FORMULAS.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {compareMode && formulaTable.length > 0 && (
            <div className="rounded-lg border border-(--border) p-4">
              <h3 className="font-semibold mb-3">Formula Compare Mode</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formulaTable.map((f) => (
                  <div key={f.name} className="rounded border border-(--border) p-3">
                    <p className="text-sm">{f.name}</p>
                    <p className="font-bold">{f.oneRm} {unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-lg border border-(--border) p-4 bg-(--background)">
                  <p className="text-sm">Estimated 1RM</p>
                  <p className="text-2xl font-bold">{round1(result.oneRmDisplay)} {unit}</p>
                </div>
                <div className="rounded-lg border border-(--border) p-4 bg-(--background)">
                  <p className="text-sm">Formula</p>
                  <p className="text-xl font-bold">{result.formula}</p>
                </div>
                <div className="rounded-lg border border-(--border) p-4 bg-(--background)">
                  <p className="text-sm">Effort</p>
                  <p className="text-xl font-bold">RPE {result.rpe} / RIR {result.rir}</p>
                </div>
                <div className="rounded-lg border border-(--border) p-4 bg-(--background)">
                  <p className="text-sm">BW Ratio</p>
                  <p className="text-xl font-bold">
                    {bodyweight ? round1(Number(result.oneRmDisplay) / Number(bodyweight)) : "-"}x
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-(--border) p-4">
                <h3 className="font-semibold mb-3">Training Percentages</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {zoneRows.map((z) => (
                    <div key={z.pct} className="rounded border border-(--border) p-3">
                      <p>{z.pct}%</p>
                      <p className="font-bold">{z.load} {unit}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={onCopyZoneTable} className="px-3 py-2 rounded border border-(--border) hover:border-(--primary) active:bg-(--primary) active:text-white transition-all">Copy Table</button>
                </div>
              </div>

              <div className="rounded-lg border border-(--border) p-4">
                <h3 className="font-semibold mb-3">Rep Max Chart (1-12)</h3>
                <div className="space-y-2">
                  {chartRows.map((r) => (
                    <div key={r.reps} className="flex items-center gap-2">
                      <span className="w-12 text-sm">{r.reps} rep</span>
                      <div className="h-3 bg-(--primary) rounded" style={{ width: `${Math.max(10, (r.load / chartRows[0].load) * 100)}%` }} />
                      <span className="text-sm">{r.load} {unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-(--border) p-4">
                <h3 className="font-semibold mb-3">Warm-up Planner</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[40, 55, 70, 80].map((p, idx) => (
                    <div key={p} className="rounded border border-(--border) p-3">
                      <p className="text-sm">Set {idx + 1}</p>
                      <p className="font-bold">{round1(oneRmForTable * (p / 100))} {unit}</p>
                      <p className="text-xs">{idx < 2 ? "5 reps" : "3 reps"}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {[60, 90, 120].map((s) => (
                    <button key={s} onClick={() => setRestSeconds(s)} className="px-3 py-2 rounded border border-(--border)">
                      Rest {s}s
                    </button>
                  ))}
                  <button onClick={() => setRestSeconds(0)} className="px-3 py-2 rounded border border-(--border)">Stop</button>
                  <span className="text-sm">Timer: {restSeconds}s</span>
                </div>
              </div>

              <div className="rounded-lg border border-(--border) p-4">
                <h3 className="font-semibold mb-3">Plate Calculator</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input type="number" value={plateBar} onChange={(e) => setPlateBar(e.target.value)} placeholder={`Bar (${unit})`} className="px-3 py-2 rounded border border-(--border) bg-(--background)" />
                  <select value={platePct} onChange={(e) => setPlatePct(e.target.value)} className={selectClass(!!platePct)}>
                    {[95, 90, 85, 80, 75, 70].map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <input type="number" value={plateStep} onChange={(e) => setPlateStep(e.target.value)} placeholder={`Rounding step (${unit})`} className="px-3 py-2 rounded border border-(--border) bg-(--background)" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {plateBreakdown.length ? plateBreakdown.map((p) => (
                    <div key={p.plate} className="rounded border border-(--border) p-3">
                      <p>{p.plate} {unit}</p>
                      <p className="font-bold">{p.countPerSide} / side</p>
                    </div>
                  )) : <p className="text-sm">No plates needed or invalid setup.</p>}
                </div>
              </div>

              <div className="rounded-lg border border-(--border) p-4">
                <h3 className="font-semibold mb-3">Goal Estimator</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="number" value={target1rm} onChange={(e) => setTarget1rm(e.target.value)} placeholder={`Target 1RM (${unit})`} className="px-3 py-2 rounded border border-(--border) bg-(--background)" />
                  <input type="number" value={weeklyIncrement} onChange={(e) => setWeeklyIncrement(e.target.value)} placeholder={`Weekly increment (${unit})`} className="px-3 py-2 rounded border border-(--border) bg-(--background)" />
                </div>
                <p className="mt-3 text-sm">Estimated timeline: {targetWeeks === null ? "-" : `${targetWeeks} week(s)`}</p>
                {targetWeeks !== null && targetWeeks > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Array.from({ length: Math.min(targetWeeks, 12) }).map((_, i) => (
                      <div key={i} className="rounded border border-(--border) p-2 text-sm">
                        Week {i + 1}: {round1(oneRmForTable + Number(weeklyIncrement) * (i + 1))} {unit}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-(--border) p-4">
                <h3 className="font-semibold mb-3">Export & Share</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={onExportCsv} className="px-3 py-2 rounded border border-(--border) hover:border-(--primary) active:bg-(--primary) active:text-white transition-all">Export CSV</button>
                  <button onClick={() => exportPngCard(result, unit)} className="px-3 py-2 rounded border border-(--border) hover:border-(--primary) active:bg-(--primary) active:text-white transition-all">Export PNG Card</button>
                  <button onClick={onShare} className="px-3 py-2 rounded border border-(--border) hover:border-(--primary) active:bg-(--primary) active:text-white transition-all">Share / Copy</button>
                  <button onClick={onPrintSummary} className="px-3 py-2 rounded border border-(--border)">Print Summary</button>
                </div>
              </div>
              {microloading && (
                <div className="rounded-lg border border-(--border) p-4">
                  <h3 className="font-semibold mb-2">Microloading Suggestion</h3>
                  <p className="text-sm">
                    Next session target:{" "}
                    <span className="font-bold">
                      {round1(result.weightDisplay + (unit === "kg" ? 0.5 : 1))} {unit}
                    </span>{" "}
                    for {result.reps} reps.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="rounded-lg border border-(--border) p-4">
            <h3 className="font-semibold mb-3">History</h3>
            <div className="mb-2">
              <button onClick={onClearHistory} className="px-3 py-2 rounded border border-(--border)">Clear All</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto">
              {history.length === 0 && <p className="text-sm">No history yet.</p>}
              {history.map((h) => (
                <div key={h.id} className="rounded border border-(--border) p-3 text-sm">
                  <p className="font-semibold">
                    {h.exercise} - {round1(fromKg(h.oneRmKg, h.unit))} {h.unit} {h.pinned ? "[Pinned]" : ""}
                  </p>
                  <p>{h.date} | {h.formula} | {h.weightDisplay} x {h.reps}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => onPinHistory(h.id)} className="px-2 py-1 rounded border border-(--border)">Pin</button>
                    <button onClick={() => onDeleteHistory(h.id)} className="px-2 py-1 rounded border border-(--border)">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-(--border) p-4">
            <h3 className="font-semibold mb-3">Progress Tracker (Best by Exercise)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {bestByExercise.length === 0 && <p className="text-sm">No progress data yet.</p>}
              {bestByExercise.map((b) => (
                <div key={b.exercise} className="rounded border border-(--border) p-3">
                  <p className="text-sm">{b.exercise}</p>
                  <p className="font-bold">{round1(fromKg(b.oneRmKg, unit))} {unit}</p>
                </div>
              ))}
            </div>
          </div>

          {plan && (
            <div className="rounded-lg border border-(--border) p-4">
              <h3 className="font-semibold mb-3">Deload / Week Plan Suggestion</h3>
              <p className="text-sm mb-3">Current approach: {plan.level}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {plan.deload.map((d) => (
                  <div key={d.week} className="rounded border border-(--border) p-3">
                    <p className="text-sm">{d.week}</p>
                    <p className="font-bold">{round1(fromKg(plan.oneRm * (d.pct / 100), unit))} {unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <HowToUse />
      <ToolFeatures />
    </div>
  );
}
  const selectClass = (hasValue) =>
    `w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-(--border) text-(--foreground) ${
      hasValue
        ? "border-(--border) bg-(--background)"
        : "border-(--border) bg-(--background)"
    }`;
